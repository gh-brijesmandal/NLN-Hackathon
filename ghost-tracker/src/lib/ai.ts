import type { AISettings, UserProfile, Application } from '../types';
import { loadAISettings } from './storage';

function getSettings(): AISettings | null {
  return loadAISettings();
}

function resolveAIConfig(): { apiKey: string; model: string } {
  const settings = getSettings();
  const envAnthropicKey = (import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined)?.trim();
  const envAnthropicModel = (import.meta.env.VITE_ANTHROPIC_MODEL as string | undefined)?.trim();
  const settingsAnthropicKey = settings?.provider === 'anthropic' ? settings.apiKey?.trim() : undefined;
  const settingsAnthropicModel = settings?.provider === 'anthropic' ? settings.model?.trim() : undefined;

  const apiKey = envAnthropicKey || settingsAnthropicKey;
  const model = envAnthropicModel || settingsAnthropicModel || 'claude-haiku-4-5-20251001';

  if (!apiKey) {
    throw new Error('Claude-only mode is enabled. Set VITE_ANTHROPIC_API_KEY in .env and restart npm run dev.');
  }

  return { apiKey, model };
}

async function callAI(systemPrompt: string, userPrompt: string): Promise<string> {
  const config = resolveAIConfig();
  const { apiKey, model } = config;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? 'Anthropic API error');
  return data.content[0].text;
}

export async function tailorResume(resumeText: string, jobDescription: string, profile: UserProfile): Promise<string> {
  const system = `You are an expert resume writer who specializes in tailoring resumes for specific job descriptions. 
You output clean, ATS-optimized resume content. Be specific, quantify achievements, and match keywords from the job description.`;
  const user = `Here is the candidate's resume:\n\n${resumeText}\n\nHere is the job description:\n\n${jobDescription}\n\nProfile info: ${profile.name}, ${profile.university}, ${profile.major}\nSkills: ${profile.skills.join(', ')}\nWork authorization: ${profile.workAuthorization}\n\nPlease tailor this resume to match the job description. Keep the same format but adjust bullet points, skills emphasis, and summary to match the JD. Output only the resume text.`;
  return callAI(system, user);
}

export async function generateCoverLetter(profile: UserProfile, jobTitle: string, company: string, jobDescription: string): Promise<string> {
  const system = 'You are an expert cover letter writer. Write concise, compelling cover letters that are professional and personalized.';
  const user = `Write a cover letter for:\nCandidate: ${profile.name}\nApplying for: ${jobTitle} at ${company}\nEducation: ${profile.university}, ${profile.major}, Class of ${profile.graduationYear}\nSkills: ${profile.skills.join(', ')}\nBio: ${profile.bio ?? 'N/A'}\n\nJob Description:\n${jobDescription}\n\nWrite a 3-paragraph cover letter. Be specific and natural. Do not use clichés.`;
  return callAI(system, user);
}

export async function analyzeApplication(app: Application): Promise<string> {
  const system = 'You are a job search coach who gives honest, actionable advice to students.';
  const user = `Analyze this job application and give 3 specific tips to improve chances or next steps:\nCompany: ${app.company}\nRole: ${app.role}\nStatus: ${app.status}\nDays since applied: ${app.daysSinceApplied}\nDays since activity: ${app.daysSinceActivity}\nEmail snippet: ${app.emailSnippet ?? 'none'}\n\nGive concise, numbered advice.`;
  return callAI(system, user);
}

export async function prepareInterviewQuestions(role: string, company: string): Promise<string> {
  const system = 'You are an interview coach who helps students prepare for job interviews. Give practical, specific advice.';
  const user = `Generate 10 likely interview questions for a ${role} position at ${company}. Include:\n- 3 behavioral questions\n- 3 technical/role-specific questions\n- 2 company-specific questions\n- 2 questions the candidate should ask\nFormat clearly with categories.`;
  return callAI(system, user);
}

export async function chatWithAI(messages: { role: 'user' | 'assistant'; content: string }[], profile?: UserProfile | null): Promise<string> {
  const system = `You are a helpful job search assistant for students. You help with resumes, interviews, job searching, H1B sponsorship questions, networking, and career advice. Be concise, practical, and encouraging.${profile ? `\n\nUser profile: ${profile.name}, studying ${profile.major} at ${profile.university}, graduating ${profile.graduationYear}. Work auth: ${profile.workAuthorization}. Skills: ${profile.skills.join(', ')}.` : ''}`;

  const config = resolveAIConfig();
  const { apiKey, model } = config;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1000,
      system,
      messages,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? 'Anthropic API error');
  return data.content[0].text;
}
