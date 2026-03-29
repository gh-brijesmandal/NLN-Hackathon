export type ApplicationStatus =
  | 'applied'
  | 'screening'
  | 'interviewing'
  | 'offer'
  | 'rejected'
  | 'ghosted'
  | 'withdrawn';

export interface Application {
  id: string;
  company: string;
  role: string;
  appliedDate: string;
  lastActivityDate: string;
  status: ApplicationStatus;
  emailThreadId?: string;
  emailSnippet?: string;
  domain?: string;
  ghostedAt?: string;
  daysSinceApplied: number;
  daysSinceActivity: number;
  isGhosted: boolean;
  location?: string;
  salary?: string;
  notes?: string;
  jobUrl?: string;
  statusHistory?: { status: ApplicationStatus; date: string; note?: string }[];
}

export interface GmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  internalDate: string;
  payload: {
    headers: Array<{ name: string; value: string }>;
    parts?: Array<{ mimeType: string; body: { data?: string } }>;
    body?: { data?: string };
  };
}

export interface GmailThread {
  id: string;
  messages: GmailMessage[];
}

export interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  userEmail: string | null;
  userName: string | null;
  userAvatar: string | null;
  scannedAt: string | null;
}

export interface ScanState {
  isScanning: boolean;
  progress: number;
  total: number;
  currentLabel: string;
}

export interface StatsSnapshot {
  total: number;
  active: number;
  ghosted: number;
  offers: number;
  rejected: number;
  responseRate: number;
}

export interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  university?: string;
  major?: string;
  graduationYear?: string;
  gpa?: string;
  skills: string[];
  bio?: string;
  targetRoles: string[];
  targetLocations: string[];
  workAuthorization: 'citizen' | 'gc' | 'h1b_needed' | 'opt' | 'stem_opt' | 'other';
  resumeText?: string;
  resumeFileName?: string;
}

export interface JobSuggestion {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  url: string;
  source: string;
  postedDate?: string;
  salary?: string;
  sponsorsH1B?: boolean;
  matchScore?: number;
  description?: string;
}

export interface H1BCompany {
  employer: string;
  approvals: number;
  denials: number;
  year: number;
  industry?: string;
}

export interface AISettings {
  provider: 'openai' | 'anthropic' | 'gemini' | 'groq';
  apiKey: string;
  model: string;
}

export interface RedditPost {
  id: string;
  title: string;
  url: string;
  subreddit: string;
  score: number;
  numComments: number;
  selftext?: string;
  createdAt: string;
}
