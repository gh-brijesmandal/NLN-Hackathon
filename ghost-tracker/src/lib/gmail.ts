import type { Application, GmailMessage, ApplicationStatus } from '../types';

const GMAIL_API = 'https://gmail.googleapis.com/gmail/v1';
const GHOSTED_DAYS = 30;

// Keywords that indicate a job application confirmation
const APPLICATION_KEYWORDS = [
  'application received',
  'thank you for applying',
  'thanks for applying',
  'thank you for your application',
  'thanks for your application',
  'we received your application',
  'application submitted',
  'your application for',
  'successfully applied',
  'application confirmation',
  'we have received your application',
  'your resume has been received',
  'application acknowledged',
];

// Keywords that indicate a rejection
const REJECTION_KEYWORDS = [
  'we will not be moving forward',
  'not moving forward',
  'decided to move forward with other',
  'went with another candidate',
  'position has been filled',
  'not a match',
  'not the right fit',
  'unfortunately',
  'after careful consideration',
  'we have decided not',
  'not selected',
  'regret to inform',
  'no longer being considered',
];

// Keywords that indicate a positive response (interview, offer)
const POSITIVE_KEYWORDS = [
  'interview',
  'schedule a call',
  'schedule time',
  'phone screen',
  'want to connect',
  'move forward',
  'next steps',
  'offer',
  'pleased to offer',
  'congratulations',
  'background check',
  'reference check',
];

function extractHeader(msg: GmailMessage, name: string): string {
  return (
    msg.payload.headers.find(h => h.name.toLowerCase() === name.toLowerCase())
      ?.value ?? ''
  );
}

function parseCompanyFromEmail(fromHeader: string): string {
  // "Recruiting Team <careers@stripe.com>" → "Stripe"
  const emailMatch = fromHeader.match(/<(.+?)>/);
  const email = emailMatch ? emailMatch[1] : fromHeader;
  const domain = email.split('@')[1] ?? '';
  const company = domain.split('.')[0] ?? 'Unknown';
  return company.charAt(0).toUpperCase() + company.slice(1);
}

function parseDomain(fromHeader: string): string {
  const emailMatch = fromHeader.match(/<(.+?)>/);
  const email = emailMatch ? emailMatch[1] : fromHeader;
  return email.split('@')[1] ?? '';
}

function snippetContains(snippet: string, keywords: string[]): boolean {
  const lower = snippet.toLowerCase();
  return keywords.some(kw => lower.includes(kw));
}

function determineStatus(
  messages: GmailMessage[],
  appliedDate: Date
): ApplicationStatus {
  const allSnippets = messages.map(m => m.snippet.toLowerCase()).join(' ');
  const daysSince = Math.floor(
    (Date.now() - appliedDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (snippetContains(allSnippets, REJECTION_KEYWORDS)) return 'rejected';

  if (snippetContains(allSnippets, ['offer', 'pleased to offer', 'congratulations']))
    return 'offer';

  if (
    snippetContains(allSnippets, [
      'interview',
      'background check',
      'reference check',
    ])
  )
    return 'interviewing';

  if (snippetContains(allSnippets, ['phone screen', 'schedule a call', 'schedule time', 'want to connect']))
    return 'screening';

  if (daysSince >= GHOSTED_DAYS && messages.length <= 1) return 'ghosted';

  return 'applied';
}

export async function fetchApplications(
  accessToken: string
): Promise<Application[]> {
  const headers = { Authorization: `Bearer ${accessToken}` };

  // Build query — only search from today onwards for new users, include past 6 months for existing
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const afterDate = Math.floor(sixMonthsAgo.getTime() / 1000);

  const query = encodeURIComponent(
    `(${APPLICATION_KEYWORDS.slice(0, 5).join(' OR ')}) after:${afterDate}`
  );

  const listRes = await fetch(
    `${GMAIL_API}/users/me/messages?q=${query}&maxResults=100`,
    { headers }
  );
  const listData = await listRes.json();

  if (!listData.messages) return [];

  // Fetch each message detail
  const messageDetails: GmailMessage[] = await Promise.all(
    (listData.messages as Array<{ id: string; threadId: string }>).map(
      async ({ id }) => {
        const res = await fetch(
          `${GMAIL_API}/users/me/messages/${id}?format=metadata&metadataHeaders=From,Subject,To,Date`,
          { headers }
        );
        return res.json();
      }
    )
  );

  // Group by threadId to get full conversation context
  const threadMap = new Map<string, GmailMessage[]>();
  for (const msg of messageDetails) {
    const existing = threadMap.get(msg.threadId) ?? [];
    threadMap.set(msg.threadId, [...existing, msg]);
  }

  // For each thread that has a matching application, build an Application object
  const seen = new Set<string>(); // dedupe by domain+subject
  const applications: Application[] = [];

  for (const [threadId, messages] of threadMap.entries()) {
    const first = messages.sort(
      (a, b) => Number(a.internalDate) - Number(b.internalDate)
    )[0];

    const subject = extractHeader(first, 'Subject');
    const from = extractHeader(first, 'From');
    const dateStr = extractHeader(first, 'Date');

    const company = parseCompanyFromEmail(from);
    const domain = parseDomain(from);
    const appliedDate = new Date(Number(first.internalDate));
    const lastMsg = messages[messages.length - 1];
    const lastActivityDate = new Date(Number(lastMsg.internalDate));

    // Dedupe by company + rough role
    const key = `${domain}-${subject.slice(0, 30)}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const status = determineStatus(messages, appliedDate);
    const daysSinceApplied = Math.floor(
      (Date.now() - appliedDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const daysSinceActivity = Math.floor(
      (Date.now() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    applications.push({
      id: threadId,
      company,
      role: subject.replace(/^(re:|fwd?:|fw:)\s*/gi, '').trim(),
      appliedDate: appliedDate.toISOString(),
      lastActivityDate: lastActivityDate.toISOString(),
      status,
      emailThreadId: threadId,
      emailSnippet: first.snippet,
      domain,
      daysSinceApplied,
      daysSinceActivity,
      isGhosted: status === 'ghosted',
      ghostedAt:
        status === 'ghosted'
          ? new Date(
              appliedDate.getTime() + GHOSTED_DAYS * 24 * 60 * 60 * 1000
            ).toISOString()
          : undefined,
    });
  }

  return applications.sort(
    (a, b) =>
      new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime()
  );
}

export async function fetchUserProfile(accessToken: string) {
  const res = await fetch(
    'https://www.googleapis.com/oauth2/v2/userinfo',
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  return res.json() as Promise<{
    email: string;
    name: string;
    picture: string;
  }>;
}
