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
  appliedDate: string;      // ISO date string
  lastActivityDate: string; // ISO date string
  status: ApplicationStatus;
  emailThreadId?: string;
  emailSnippet?: string;
  domain?: string;
  ghostedAt?: string;       // ISO date string when ghosted label was applied
  daysSinceApplied: number;
  daysSinceActivity: number;
  isGhosted: boolean;
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
