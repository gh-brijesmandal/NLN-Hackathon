import { useState } from 'react';
import type { AnalysisResult } from '../types';

export function useRejectionParser() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function analyze(jd: string, rejection: string, resume: string, apiKey: string) {
    setLoading(true);
    setResult(null);
    setError(null);

    const prompt = `You are a Senior Technical Recruiter and Career Strategist performing a comparative audit.

Job Description:
${jd}

Rejection Email:
${rejection}

${resume ? `Candidate Resume Summary:\n${resume}` : ''}

Task:
1. Identify 2-4 specific technical skills mentioned in the JD that are likely absent or weak based on the rejection.
2. Identify any soft skill or culture signals in the rejection tone (e.g., "culture fit", "communication", "seniority level").
3. Recommend one specific certification or project to address the top gap.
4. Give one sentence of brutal, direct next-step advice.
5. Estimate ghosting risk 0.0–1.0 based on the tone (generic templates = higher risk).

Return ONLY a JSON object, no markdown, no backticks:
{
  "technical_gaps": ["skill1", "skill2"],
  "soft_skill_flags": ["flag1"],
  "top_cert_recommendation": "string",
  "next_move": "one sentence",
  "ghosting_risk": 0.75
}`;

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
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err?.error?.message || `API error ${response.status}`);
      }

      const data = await response.json();
      const text = data.content
        .map((b: { type: string; text?: string }) => (b.type === 'text' ? b.text : ''))
        .join('');

      const clean = text.replace(/```json|```/g, '').trim();
      const parsed: AnalysisResult = JSON.parse(clean);
      setResult(parsed);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return { analyze, loading, result, error, reset: () => { setResult(null); setError(null); } };
}
