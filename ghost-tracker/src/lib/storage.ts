import type { AuthState } from '../types';

// All data is stored in localStorage — nothing goes to any server

const KEYS = {
  PROFILE: 'jt_profile',
  APPLICATIONS: 'jt_applications',
  AI_SETTINGS: 'jt_ai_settings',
  EMAIL_SETTINGS: 'jt_email_settings',
  GHOST_DAYS: 'jt_ghost_days',
  LAST_SCANNED: 'jt_last_scanned',
  AUTH_SESSION: 'jt_auth_session',
};

interface StoredAuthSession {
  auth: AuthState;
  isDemoMode: boolean;
}

export function saveProfile(data: object) {
  localStorage.setItem(KEYS.PROFILE, JSON.stringify(data));
}
export function loadProfile() {
  try { return JSON.parse(localStorage.getItem(KEYS.PROFILE) ?? 'null'); } catch { return null; }
}

export function saveApplications(data: object[]) {
  localStorage.setItem(KEYS.APPLICATIONS, JSON.stringify(data));
}
export function loadApplications(): any[] {
  try { return JSON.parse(localStorage.getItem(KEYS.APPLICATIONS) ?? '[]'); } catch { return []; }
}

export function saveAISettings(data: object) {
  localStorage.setItem(KEYS.AI_SETTINGS, JSON.stringify(data));
}
export function loadAISettings() {
  try { return JSON.parse(localStorage.getItem(KEYS.AI_SETTINGS) ?? 'null'); } catch { return null; }
}

export function saveEmailSettings(data: object) {
  localStorage.setItem(KEYS.EMAIL_SETTINGS, JSON.stringify(data));
}
export function loadEmailSettings() {
  try { return JSON.parse(localStorage.getItem(KEYS.EMAIL_SETTINGS) ?? 'null'); } catch { return null; }
}

export function saveGhostDays(days: number) {
  localStorage.setItem(KEYS.GHOST_DAYS, String(days));
}
export function loadGhostDays(): number {
  return parseInt(localStorage.getItem(KEYS.GHOST_DAYS) ?? '30', 10);
}

export function saveLastScanned(date: string) {
  localStorage.setItem(KEYS.LAST_SCANNED, date);
}
export function loadLastScanned(): string | null {
  return localStorage.getItem(KEYS.LAST_SCANNED);
}

export function saveAuthSession(auth: AuthState, isDemoMode: boolean) {
  const data: StoredAuthSession = { auth, isDemoMode };
  localStorage.setItem(KEYS.AUTH_SESSION, JSON.stringify(data));
}

export function loadAuthSession(): StoredAuthSession | null {
  try {
    return JSON.parse(localStorage.getItem(KEYS.AUTH_SESSION) ?? 'null');
  } catch {
    return null;
  }
}

export function clearAuthSession() {
  localStorage.removeItem(KEYS.AUTH_SESSION);
}

export function clearAllData() {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k));
}
