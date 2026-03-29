import type { Application, ApplicationStatus, GmailMessage } from '../types';
import { loadAISettings } from './storage';

const GMAIL_API = 'https://gmail.googleapis.com/gmail/v1';
const USERINFO_ENDPOINTS = [
  'https://www.googleapis.com/oauth2/v2/userinfo',
  'https://www.googleapis.com/userinfo/v2/me',
];
const PEOPLE_ME_ENDPOINT = 'https://people.googleapis.com/v1/people/me?personFields=photos';

const LOOKBACK_DAYS = 30;
const MAX_CANDIDATE_MESSAGES = 60;
const METADATA_CONCURRENCY = 5;
const METADATA_BATCH_DELAY_MS = 250;
const CLAUDE_BATCH_SIZE = 8;
const CLAUDE_BATCH_DELAY_MS = 600;
const CLAUDE_SNIPPET_MAX_CHARS = 260;
const CLAUDE_MAX_RETRIES = 2;
const MAX_RETRY_DELAY_MS = 10000;
const GHOSTED_DAYS = 30;

const METADATA_HEADERS_QUERY = [
  'metadataHeaders=From',
  'metadataHeaders=Subject',
  'metadataHeaders=Date',
  'metadataHeaders=To',
  'metadataHeaders=Reply-To',
].join('&');

const REJECTION_KEYWORDS = ['regret to inform', 'not moving forward', 'rejection', 'declined', 'unsuccessful'];
const OFFER_KEYWORDS = ['offer letter', 'we are pleased to offer', 'compensation package', 'official offer'];
const INTERVIEW_KEYWORDS = ['interview', 'interviewer', 'availability', 'schedule a call', 'technical interview'];
const SCREENING_KEYWORDS = ['assessment', 'take-home', 'coding challenge', 'screening', 'next steps'];

type JsonRecord = Record<string, unknown>;

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function parseRetryAfterMs(retryAfter: string | null): number | null {
  if (!retryAfter) return null;

  const asSeconds = Number(retryAfter);
  if (Number.isFinite(asSeconds) && asSeconds > 0) {
    return Math.min(asSeconds * 1000, MAX_RETRY_DELAY_MS);
  }

  const asDate = Date.parse(retryAfter);
  if (!Number.isNaN(asDate)) {
    const delta = asDate - Date.now();
    if (delta > 0) {
      return Math.min(delta, MAX_RETRY_DELAY_MS);
    }
  }

  return null;
}

async function fetchJsonWithRetry<T>(
  url: string,
  init?: RequestInit,
  maxRetries = 2
): Promise<{ response: Response; data: T | unknown }> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      const response = await fetch(url, init);
      const text = await response.text();
      const data = text ? tryParseJson(text) : null;

      if (response.ok) {
        return { response, data: (data ?? {}) as T };
      }

      const shouldRetry = response.status === 429 || response.status >= 500;
      if (shouldRetry && attempt < maxRetries) {
        const retryDelay = parseRetryAfterMs(response.headers.get('retry-after'))
          ?? Math.min(1000 * (attempt + 1), MAX_RETRY_DELAY_MS);
        await sleep(retryDelay);
        continue;
      }

      return { response, data: data ?? text };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Network request failed.');
      if (attempt < maxRetries) {
        await sleep(Math.min(1000 * (attempt + 1), MAX_RETRY_DELAY_MS));
        continue;
      }
      throw lastError;
    }
  }

  throw lastError ?? new Error('Network request failed.');
}

function tryParseJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

function extractErrorMessage(data: unknown): string {
  if (!data || typeof data !== 'object') return '';
  const root = data as JsonRecord;
  const errorValue = root.error;

  if (typeof errorValue === 'string') {
    return errorValue;
  }

  if (errorValue && typeof errorValue === 'object') {
    const nested = errorValue as JsonRecord;
    const message = nested.message;
    if (typeof message === 'string') {
      return message;
    }
  }

  const message = root.message;
  return typeof message === 'string' ? message : '';
}

function buildGoogleApiError(operation: string, status: number, data: unknown): Error {
  const details = extractErrorMessage(data);
  return new Error(
    `${operation} failed (${status})${details ? `: ${details}` : ''}. Check Google auth scopes and token validity.`
  );
}

function buildApplicationQueries(afterDate: number): string[] {
  return [
    `after:${afterDate} ("thanks for applying" OR "application received" OR "application for") -category:promotions`,
    `after:${afterDate} (subject:(application OR interview OR assessment OR offer OR recruiter) OR "next steps") -category:promotions`,
    `after:${afterDate} (interview OR assessment OR recruiter OR offer OR rejection) -category:promotions`,
  ];
}

function extractHeader(msg: GmailMessage, name: string): string {
  const target = name.toLowerCase();
  const header = msg.payload.headers.find(h => h.name.toLowerCase() === target);
  return header?.value?.trim() ?? '';
}

function compactForClaude(value: string, maxChars: number): string {
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxChars) return normalized;
  return `${normalized.slice(0, maxChars)}...`;
}

function parseDomain(from: string): string {
  const emailMatch = from.match(/<([^>]+)>/) ?? from.match(/([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/i);
  const email = emailMatch?.[1] ?? '';
  const atIndex = email.indexOf('@');
  if (atIndex === -1) return 'unknown';

  const domain = email.slice(atIndex + 1).toLowerCase();
  return domain || 'unknown';
}

function parseCompanyFromEmail(from: string): string {
  const cleanedName = from
    .replace(/<[^>]*>/g, '')
    .replace(/['"]/g, '')
    .trim();

  if (cleanedName) {
    const normalized = cleanedName
      .replace(/\b(careers?|jobs?|talent|hiring|recruiting|team)\b/gi, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
    if (normalized) return normalized;
  }

  const domain = parseDomain(from);
  if (domain === 'unknown') return 'Unknown company';

  const parts = domain.split('.');
  const base = parts.length >= 2 ? parts[parts.length - 2] : parts[0];
  if (!base) return 'Unknown company';

  return base
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, ch => ch.toUpperCase());
}

function snippetContains(snippet: string, keywords: string[]): boolean {
  return keywords.some(keyword => snippet.includes(keyword));
}

function resolveClaudeScannerConfig(): { apiKey: string; model: string } {
  const settingsRaw = loadAISettings() as { provider?: string; apiKey?: string; model?: string } | null;
  const envKey = (import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined)?.trim();
  const envModel = (import.meta.env.VITE_ANTHROPIC_MODEL as string | undefined)?.trim();

  const settingsKey = settingsRaw?.provider === 'anthropic' ? settingsRaw.apiKey?.trim() : undefined;
  const settingsModel = settingsRaw?.provider === 'anthropic' ? settingsRaw.model?.trim() : undefined;

  const apiKey = envKey || settingsKey;
  const model = envModel || settingsModel || 'claude-haiku-4-5-20251001';

  if (!apiKey) {
    throw new Error('Claude-only mode is enabled. Set VITE_ANTHROPIC_API_KEY or add an Anthropic key in Settings.');
  }

  return { apiKey, model };
}

async function validateClaudeAccess(): Promise<void> {
  const { apiKey, model } = resolveClaudeScannerConfig();

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: 16,
      system: 'Reply with OK.',
      messages: [{ role: 'user', content: 'OK' }],
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    const details = extractErrorMessage(data);
    throw new Error(
      `Claude connectivity check failed (${response.status})${details ? `: ${details}` : ''}.`
    );
  }
}

export async function ensureClaudeScannerReady(forceCheck = false): Promise<void> {
  if (forceCheck) {
    await validateClaudeAccess();
    return;
  }

  resolveClaudeScannerConfig();
}

function extractJsonPayload(text: string): unknown | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const withoutFence = trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

  if (!withoutFence) return null;

  const direct = tryParseJson(withoutFence);
  if (direct && typeof direct === 'object') return direct;

  const candidates = withoutFence.match(/\[[\s\S]*\]|\{[\s\S]*\}/g) ?? [];
  for (const candidate of candidates) {
    const parsed = tryParseJson(candidate);
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
  }

  return null;
}

function extractIdsFromStructuredPayload(payload: unknown, validIds: Set<string>): string[] {
  const normalizedRows = (Array.isArray(payload)
    ? payload
    : (payload && typeof payload === 'object' && Array.isArray((payload as JsonRecord).ids)
      ? (payload as JsonRecord).ids
      : [])) as unknown[];

  const ids: string[] = [];
  for (const row of normalizedRows) {
    if (typeof row === 'string') {
      if (validIds.has(row)) ids.push(row);
      continue;
    }

    if (row && typeof row === 'object') {
      const value = (row as JsonRecord).id;
      if (typeof value === 'string' && validIds.has(value)) {
        ids.push(value);
      }
    }
  }

  return [...new Set(ids)];
}

function extractIdsFromClaudeText(
  text: string,
  validIds: Set<string>
): { ids: string[]; parsed: boolean } {
  const payload = extractJsonPayload(text);
  if (!payload) {
    return { ids: [], parsed: false };
  }

  const ids = extractIdsFromStructuredPayload(payload, validIds);
  return { ids, parsed: true };
}

function normalizeExtractedText(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || /^null$/i.test(trimmed) || /^n\/a$/i.test(trimmed)) return null;
  return trimmed;
}

function extractDetailsFromStructuredPayload(
  payload: unknown,
  validBatchIds: Set<string>
): Array<{ id: string; company?: string; position?: string }> {
  const asArray = (Array.isArray(payload)
    ? payload
    : (payload && typeof payload === 'object' && Array.isArray((payload as JsonRecord).items)
      ? (payload as JsonRecord).items
      : [])) as unknown[];

  const rows: Array<{ id: string; company?: string; position?: string } | null> = asArray
    .map((item: unknown) => {
      if (!item || typeof item !== 'object') return null;
      const row = item as JsonRecord;

      const id = normalizeExtractedText(row.id);
      if (!id || !validBatchIds.has(id)) return null;

      const company = normalizeExtractedText(row.company);
      const position = normalizeExtractedText(row.position ?? row.role ?? row.jobTitle);

      return { id, company: company ?? undefined, position: position ?? undefined };
    });

  return rows.filter((item): item is { id: string; company?: string; position?: string } => item !== null);
}

async function classifyApplicationMessagesWithClaude(messages: GmailMessage[]): Promise<Set<string>> {
  const { apiKey, model } = resolveClaudeScannerConfig();
  const selectedIds = new Set<string>();
  let parseFailures = 0;
  let batchesProcessed = 0;

  for (let i = 0; i < messages.length; i += CLAUDE_BATCH_SIZE) {
    const batch = messages.slice(i, i + CLAUDE_BATCH_SIZE);
    batchesProcessed += 1;

    const batchPayload = batch.map(msg => ({
      id: msg.id,
      subject: compactForClaude(extractHeader(msg, 'Subject'), 120),
      from: compactForClaude(extractHeader(msg, 'From'), 120),
      snippet: compactForClaude(msg.snippet ?? '', CLAUDE_SNIPPET_MAX_CHARS),
    }));

    const system = [
      'You classify job-related emails.',
      'Return ONLY JSON array of ids that are application confirmations or updates for a specific role or company.',
      'Include receipt, interview, assessment, recruiter follow-up, rejection, or offer updates tied to an application.',
      'Exclude newsletters, job alerts, marketing, and unrelated emails.',
      'Output format: ["id1", "id2"] and nothing else.',
    ].join(' ');

    const user = `Emails to classify:\n${JSON.stringify(batchPayload)}`;
    let completed = false;

    for (let attempt = 0; attempt <= CLAUDE_MAX_RETRIES; attempt += 1) {
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
          },
          body: JSON.stringify({
            model,
            max_tokens: 256,
            system,
            messages: [{ role: 'user', content: user }],
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          if (response.status === 429 && attempt < CLAUDE_MAX_RETRIES) {
            const retryDelay = parseRetryAfterMs(response.headers.get('retry-after'))
              ?? Math.min(3000 * (attempt + 1), MAX_RETRY_DELAY_MS);
            await sleep(retryDelay);
            continue;
          }

          const details = extractErrorMessage(data);
          throw new Error(
            `Claude parsing failed (${response.status})${details ? `: ${details}` : ''}. Check your Anthropic key, credits, and network access.`
          );
        }

        const contentText = (data?.content?.[0]?.text ?? '') as string;
        const validBatchIds = new Set(batch.map(item => item.id));
        const extracted = extractIdsFromClaudeText(contentText, validBatchIds);

        if (!extracted.parsed) {
          parseFailures += 1;
          completed = true;
          break;
        }

        for (const id of extracted.ids) {
          selectedIds.add(id);
        }

        completed = true;
        break;
      } catch (error) {
        if (attempt < CLAUDE_MAX_RETRIES) {
          await sleep(Math.min(2000 * (attempt + 1), MAX_RETRY_DELAY_MS));
          continue;
        }

        if (error instanceof Error) {
          throw error;
        }
        throw new Error('Claude parsing request failed. Check browser network access and try again.');
      }
    }

    if (!completed) {
      parseFailures += 1;
    }

    if (i + CLAUDE_BATCH_SIZE < messages.length) {
      await sleep(CLAUDE_BATCH_DELAY_MS);
    }
  }

  if (batchesProcessed > 0 && parseFailures === batchesProcessed) {
    throw new Error(
      'Claude responded with an unexpected format for all email batches. Check model output format or reduce prompt customizations.'
    );
  }

  return selectedIds;
}

async function extractApplicationDetailsWithClaude(
  messages: GmailMessage[]
): Promise<Map<string, { company?: string; position?: string }>> {
  const { apiKey, model } = resolveClaudeScannerConfig();
  const detailsByMessageId = new Map<string, { company?: string; position?: string }>();

  for (let i = 0; i < messages.length; i += CLAUDE_BATCH_SIZE) {
    const batch = messages.slice(i, i + CLAUDE_BATCH_SIZE);
    const batchPayload = batch.map(msg => ({
      id: msg.id,
      subject: compactForClaude(extractHeader(msg, 'Subject'), 120),
      from: compactForClaude(extractHeader(msg, 'From'), 120),
      snippet: compactForClaude(msg.snippet ?? '', CLAUDE_SNIPPET_MAX_CHARS),
    }));

    const system = [
      'Extract company and position from job-application related emails.',
      'Return ONLY JSON.',
      'Output format: [{"id":"...","company":"...","position":"..."}]',
      'Use the same id values from input.',
      'If company or position is unclear, use null for that field.',
      'Do not invent details.',
    ].join(' ');

    const user = `Extract details for these emails:\n${JSON.stringify(batchPayload)}`;

    let extractedThisBatch = false;
    for (let attempt = 0; attempt <= CLAUDE_MAX_RETRIES; attempt += 1) {
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
          },
          body: JSON.stringify({
            model,
            max_tokens: 320,
            system,
            messages: [{ role: 'user', content: user }],
          }),
        });

        if (!response.ok) {
          if (response.status === 429 && attempt < CLAUDE_MAX_RETRIES) {
            const retryDelay = parseRetryAfterMs(response.headers.get('retry-after'))
              ?? Math.min(3000 * (attempt + 1), MAX_RETRY_DELAY_MS);
            await sleep(retryDelay);
            continue;
          }
          break;
        }

        const data = await response.json();
        const contentText = (data?.content?.[0]?.text ?? '') as string;
        const payload = extractJsonPayload(contentText);
        if (!payload) break;

        const validBatchIds = new Set(batch.map(item => item.id));
        const extractedRows = extractDetailsFromStructuredPayload(payload, validBatchIds);

        for (const row of extractedRows) {
          const existing = detailsByMessageId.get(row.id) ?? {};
          detailsByMessageId.set(row.id, {
            company: row.company ?? existing.company,
            position: row.position ?? existing.position,
          });
        }

        extractedThisBatch = true;
        break;
      } catch {
        if (attempt < CLAUDE_MAX_RETRIES) {
          await sleep(Math.min(2000 * (attempt + 1), MAX_RETRY_DELAY_MS));
          continue;
        }
        break;
      }
    }

    if (!extractedThisBatch) {
      // Keep heuristic fallback when extraction call fails.
    }

    if (i + CLAUDE_BATCH_SIZE < messages.length) {
      await sleep(CLAUDE_BATCH_DELAY_MS);
    }
  }

  return detailsByMessageId;
}

function selectThreadDetails(
  messages: GmailMessage[],
  extractedDetails: Map<string, { company?: string; position?: string }>
): { company?: string; position?: string } {
  let company: string | undefined;
  let position: string | undefined;

  for (const msg of messages) {
    const details = extractedDetails.get(msg.id);
    if (!company && details?.company) {
      company = details.company;
    }
    if (!position && details?.position) {
      position = details.position;
    }
    if (company && position) break;
  }

  return { company, position };
}

function determineStatus(messages: GmailMessage[], appliedDate: Date): ApplicationStatus {
  const allSnippets = messages
    .map(m => (typeof m.snippet === 'string' ? m.snippet.toLowerCase() : ''))
    .join(' ');
  const daysSince = Math.floor((Date.now() - appliedDate.getTime()) / (1000 * 60 * 60 * 24));

  if (snippetContains(allSnippets, REJECTION_KEYWORDS)) return 'rejected';
  if (snippetContains(allSnippets, OFFER_KEYWORDS)) return 'offer';
  if (snippetContains(allSnippets, INTERVIEW_KEYWORDS)) return 'interviewing';
  if (snippetContains(allSnippets, SCREENING_KEYWORDS)) return 'screening';
  if (daysSince >= GHOSTED_DAYS && messages.length <= 1) return 'ghosted';

  return 'applied';
}

function hasHeaders(msg: unknown): msg is GmailMessage {
  if (!msg || typeof msg !== 'object') return false;

  const candidate = msg as Partial<GmailMessage>;
  const payload = candidate.payload as { headers?: unknown } | undefined;

  return Boolean(
    candidate.id
    && candidate.threadId
    && candidate.internalDate
    && payload
    && Array.isArray(payload.headers)
  );
}

export async function fetchApplications(accessToken: string): Promise<Application[]> {
  await validateClaudeAccess();

  const headers = { Authorization: `Bearer ${accessToken}` };

  const lookbackDate = new Date();
  lookbackDate.setDate(lookbackDate.getDate() - LOOKBACK_DAYS);
  const afterDate = Math.floor(lookbackDate.getTime() / 1000);

  const candidateMap = new Map<string, { id: string; threadId: string }>();
  const searchQueries = buildApplicationQueries(afterDate);

  for (const rawQuery of searchQueries) {
    const query = encodeURIComponent(rawQuery);
    const { response, data } = await fetchJsonWithRetry<{ messages?: Array<{ id: string; threadId: string }> }>(
      `${GMAIL_API}/users/me/messages?q=${query}&maxResults=${MAX_CANDIDATE_MESSAGES}`,
      { headers },
      3
    );

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw buildGoogleApiError('Gmail inbox scan', response.status, data);
      }
      continue;
    }

    const rows = Array.isArray((data as JsonRecord).messages)
      ? ((data as JsonRecord).messages as Array<{ id: string; threadId: string }>)
      : [];

    for (const message of rows) {
      candidateMap.set(message.id, message);
    }

    if (candidateMap.size >= MAX_CANDIDATE_MESSAGES) {
      break;
    }
  }

  if (candidateMap.size === 0) {
    const { response, data } = await fetchJsonWithRetry<{ messages?: Array<{ id: string; threadId: string }> }>(
      `${GMAIL_API}/users/me/messages?labelIds=INBOX&maxResults=${MAX_CANDIDATE_MESSAGES}`,
      { headers },
      2
    );

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw buildGoogleApiError('Gmail fallback inbox scan', response.status, data);
      }
    } else {
      const rows = Array.isArray((data as JsonRecord).messages)
        ? ((data as JsonRecord).messages as Array<{ id: string; threadId: string }>)
        : [];

      for (const message of rows) {
        candidateMap.set(message.id, message);
      }
    }
  }

  const candidateMessages = [...candidateMap.values()].slice(0, MAX_CANDIDATE_MESSAGES);
  if (candidateMessages.length === 0) {
    throw new Error(
      `No emails were found in the last ${LOOKBACK_DAYS} days to send to Claude. Expand LOOKBACK_DAYS or wait for newer inbox activity.`
    );
  }

  const detailResponses: Array<{ response: Response; data: GmailMessage | unknown } | null> = [];

  for (let i = 0; i < candidateMessages.length; i += METADATA_CONCURRENCY) {
    const batch = candidateMessages.slice(i, i + METADATA_CONCURRENCY);
    const batchResponses = await Promise.all(
      batch.map(async ({ id }) => {
        try {
          const metadataUrl = `${GMAIL_API}/users/me/messages/${id}?format=metadata&${METADATA_HEADERS_QUERY}`;
          const metadataResult = await fetchJsonWithRetry<GmailMessage>(metadataUrl, { headers }, 4);

          if (!metadataResult.response.ok && ![401, 403, 429].includes(metadataResult.response.status)) {
            const fullUrl = `${GMAIL_API}/users/me/messages/${id}?format=full`;
            const fullResult = await fetchJsonWithRetry<GmailMessage>(fullUrl, { headers }, 2);
            return { response: fullResult.response, data: fullResult.data };
          }

          return { response: metadataResult.response, data: metadataResult.data };
        } catch {
          return null;
        }
      })
    );

    detailResponses.push(...batchResponses);

    if (i + METADATA_CONCURRENCY < candidateMessages.length) {
      await sleep(METADATA_BATCH_DELAY_MS);
    }
  }

  const permissionFailure = detailResponses.find(
    item => item && !item.response.ok && (item.response.status === 401 || item.response.status === 403)
  );

  const failedStatusCounts = detailResponses.reduce((acc, item) => {
    if (!item || item.response.ok) return acc;
    const status = item.response.status;
    acc.set(status, (acc.get(status) ?? 0) + 1);
    return acc;
  }, new Map<number, number>());

  const rateLimitedCount = detailResponses.filter(
    item => item && !item.response.ok && item.response.status === 429
  ).length;

  if (permissionFailure) {
    throw buildGoogleApiError(
      'Gmail message metadata access',
      permissionFailure.response.status,
      permissionFailure.data
    );
  }

  const messageDetails = detailResponses
    .filter(item => item && item.response.ok)
    .map(item => item?.data)
    .filter(hasHeaders);

  if (messageDetails.length === 0) {
    if (rateLimitedCount > 0) {
      throw new Error('Gmail is rate limiting requests right now (429). Please wait 30-60 seconds and scan again.');
    }

    if (failedStatusCounts.size > 0) {
      const statusSummary = [...failedStatusCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([status, count]) => `${status} x${count}`)
        .join(', ');

      throw new Error(
        `Gmail found candidates but metadata fetch failed for all of them (${statusSummary}).`
      );
    }

    throw new Error(
      `Gmail returned candidates, but none had readable metadata in the last ${LOOKBACK_DAYS} days.`
    );
  }

  const claudeMatches = await classifyApplicationMessagesWithClaude(messageDetails);
  const likelyApplicationMessages = messageDetails.filter(msg => claudeMatches.has(msg.id));

  if (likelyApplicationMessages.length === 0) {
    throw new Error(
      `Claude scanned ${messageDetails.length} email candidates but found 0 application matches. Check that your confirmation emails are in Gmail inbox/all mail and include application-related wording.`
    );
  }

  const threadMap = new Map<string, GmailMessage[]>();
  for (const msg of likelyApplicationMessages) {
    const existing = threadMap.get(msg.threadId) ?? [];
    threadMap.set(msg.threadId, [...existing, msg]);
  }

  const extractedDetailsByMessage = await extractApplicationDetailsWithClaude(likelyApplicationMessages);

  const seen = new Set<string>();
  const applications: Application[] = [];

  for (const [threadId, messages] of threadMap.entries()) {
    const sorted = [...messages].sort((a, b) => Number(a.internalDate) - Number(b.internalDate));
    const first = sorted[0];
    const lastMsg = sorted[sorted.length - 1];
    const extracted = selectThreadDetails(sorted, extractedDetailsByMessage);

    const subject = extractHeader(first, 'Subject');
    const from = extractHeader(first, 'From');
    const company = extracted.company ?? parseCompanyFromEmail(from);
    const domain = parseDomain(from);
    const appliedDate = new Date(Number(first.internalDate));
    const lastActivityDate = new Date(Number(lastMsg.internalDate));

    const key = `${domain}-${subject.slice(0, 30).toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const status = determineStatus(sorted, appliedDate);
    const daysSinceApplied = Math.floor((Date.now() - appliedDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysSinceActivity = Math.floor((Date.now() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24));

    applications.push({
      id: threadId,
      company,
      role: ((extracted.position ?? subject.replace(/^(re:|fwd?:|fw:)\s*/gi, '').trim()) || first.snippet || 'Unknown role').slice(0, 180),
      appliedDate: appliedDate.toISOString(),
      lastActivityDate: lastActivityDate.toISOString(),
      status,
      emailThreadId: threadId,
      emailSnippet: first.snippet,
      domain,
      daysSinceApplied,
      daysSinceActivity,
      isGhosted: status === 'ghosted',
      ghostedAt: status === 'ghosted'
        ? new Date(appliedDate.getTime() + GHOSTED_DAYS * 24 * 60 * 60 * 1000).toISOString()
        : undefined,
    });
  }

  return applications.sort(
    (a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime()
  );
}

export async function fetchUserProfile(accessToken: string): Promise<{ email: string; name: string; picture: string }> {
  let lastError: Error | null = null;
  let fallbackProfile: { email?: string; name?: string; picture?: string } | null = null;

  for (const endpoint of USERINFO_ENDPOINTS) {
    try {
      const { response, data } = await fetchJsonWithRetry<{
        email?: string;
        name?: string;
        picture?: string;
        pictureUrl?: string;
        avatar_url?: string;
      }>(endpoint, { headers: { Authorization: `Bearer ${accessToken}` } }, 1);

      if (!response.ok) {
        lastError = buildGoogleApiError('Google profile lookup', response.status, data);
        continue;
      }

      const profile = data as {
        email?: string;
        name?: string;
        picture?: string;
        pictureUrl?: string;
        avatar_url?: string;
      };

      const resolvedPicture = profile.picture ?? profile.pictureUrl ?? profile.avatar_url ?? '';

      if (!fallbackProfile) {
        fallbackProfile = {
          email: profile.email,
          name: profile.name,
          picture: resolvedPicture,
        };
      }

      if (!profile.email) {
        lastError = new Error('Google profile lookup returned incomplete data. Please try again.');
        continue;
      }

      return {
        email: profile.email,
        name: profile.name ?? profile.email,
        picture: resolvedPicture,
      };
    } catch (error) {
      lastError = error instanceof Error
        ? error
        : new Error('Google profile lookup failed. Please try again.');
    }
  }

  if (fallbackProfile?.email) {
    let fallbackPicture = fallbackProfile.picture ?? '';

    if (!fallbackPicture) {
      try {
        const { response, data } = await fetchJsonWithRetry<{ photos?: Array<{ url?: string; default?: boolean }> }>(
          PEOPLE_ME_ENDPOINT,
          { headers: { Authorization: `Bearer ${accessToken}` } },
          1
        );

        if (response.ok) {
          const root = data as { photos?: Array<{ url?: string; default?: boolean }> };
          const photos = Array.isArray(root.photos) ? root.photos : [];
          fallbackPicture = photos.find(photo => Boolean(photo?.url) && !photo.default)?.url
            ?? photos.find(photo => Boolean(photo?.url))?.url
            ?? '';
        }
      } catch {
        // Ignore fallback failures and return profile with available fields.
      }
    }

    return {
      email: fallbackProfile.email,
      name: fallbackProfile.name ?? fallbackProfile.email,
      picture: fallbackPicture,
    };
  }

  throw lastError ?? new Error('Google profile lookup failed. Please try again.');
}
