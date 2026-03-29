// All data is stored in localStorage — nothing goes to any server

import type { AuthState } from '../types';

const KEYS = {
  PROFILE: 'jt_profile',
  APPLICATIONS: 'jt_applications',
  AI_SETTINGS: 'jt_ai_settings',
  EMAIL_SETTINGS: 'jt_email_settings',
  GHOST_DAYS: 'jt_ghost_days',
  LAST_SCANNED: 'jt_last_scanned',
};

const AUTH_COOKIE_KEY = 'jt_auth_session';
const DEFAULT_AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60;

interface CookieAuthPayload {
  accessToken: string;
  userEmail: string | null;
  userName: string | null;
  userAvatar: string | null;
  scannedAt: string | null;
  expiresAt: number;
}

function getCookieValue(name: string): string | null {
  const encodedName = `${encodeURIComponent(name)}=`;
  const parts = document.cookie.split(';');

  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.startsWith(encodedName)) {
      return decodeURIComponent(trimmed.slice(encodedName.length));
    }
  }

  return null;
}

function setCookieValue(name: string, value: string, maxAgeSeconds: number) {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Max-Age=${Math.max(0, Math.floor(maxAgeSeconds))}; Path=/; SameSite=Lax${secure}`;
}

export function saveAuthSessionCookie(auth: AuthState, maxAgeSeconds = DEFAULT_AUTH_COOKIE_MAX_AGE_SECONDS) {
  if (!auth.isAuthenticated || !auth.accessToken) {
    clearAuthSessionCookie();
    return;
  }

  const payload: CookieAuthPayload = {
    accessToken: auth.accessToken,
    userEmail: auth.userEmail,
    userName: auth.userName,
    userAvatar: auth.userAvatar,
    scannedAt: auth.scannedAt,
    expiresAt: Date.now() + maxAgeSeconds * 1000,
  };

  setCookieValue(AUTH_COOKIE_KEY, JSON.stringify(payload), maxAgeSeconds);
}

export function loadAuthSessionCookie(): AuthState | null {
  const raw = getCookieValue(AUTH_COOKIE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<CookieAuthPayload>;
    if (!parsed || typeof parsed.accessToken !== 'string' || !parsed.accessToken) {
      clearAuthSessionCookie();
      return null;
    }

    if (typeof parsed.expiresAt !== 'number' || Date.now() > parsed.expiresAt) {
      clearAuthSessionCookie();
      return null;
    }

    return {
      isAuthenticated: true,
      accessToken: parsed.accessToken,
      userEmail: parsed.userEmail ?? null,
      userName: parsed.userName ?? null,
      userAvatar: parsed.userAvatar ?? null,
      scannedAt: parsed.scannedAt ?? null,
    };
  } catch {
    clearAuthSessionCookie();
    return null;
  }
}

export function clearAuthSessionCookie() {
  setCookieValue(AUTH_COOKIE_KEY, '', 0);
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

export function clearAllData() {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k));
}
