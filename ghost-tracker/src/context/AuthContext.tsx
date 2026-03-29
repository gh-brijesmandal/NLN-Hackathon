import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { AuthState } from '../types';
import { fetchUserProfile } from '../lib/gmail';
import { loadAuthSession, saveAuthSession, clearAuthSession } from '../lib/storage';

interface AuthContextValue {
  auth: AuthState;
  signIn: () => void;
  signOut: () => void;
  isDemoMode: boolean;
  enterDemoMode: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
].join(' ');

const DEFAULT_AUTH_STATE: AuthState = {
  isAuthenticated: false,
  accessToken: null,
  userEmail: null,
  userName: null,
  userAvatar: null,
  scannedAt: null,
};

function getInitialAuthState(): AuthState {
  const saved = loadAuthSession();
  return saved?.auth ?? DEFAULT_AUTH_STATE;
}

function getInitialDemoMode(): boolean {
  const saved = loadAuthSession();
  return saved?.isDemoMode ?? false;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(getInitialAuthState);
  const [isDemoMode, setIsDemoMode] = useState(getInitialDemoMode);

  const handleCredentialResponse = useCallback(async (token: string) => {
    try {
      const profile = await fetchUserProfile(token);
      const nextAuth: AuthState = {
        isAuthenticated: true,
        accessToken: token,
        userEmail: profile.email,
        userName: profile.name,
        userAvatar: profile.picture,
        scannedAt: new Date().toISOString(),
      };
      setAuth(nextAuth);
      setIsDemoMode(false);
      saveAuthSession(nextAuth, false);
    } catch (e) {
      console.error('Failed to fetch profile:', e);
    }
  }, []);

  const signIn = useCallback(() => {
    if (!CLIENT_ID) {
      console.warn('No VITE_GOOGLE_CLIENT_ID set — entering demo mode');
      setIsDemoMode(true);
      return;
    }

    // Use Google Identity Services token flow
    const tokenClient = (window as any).google?.accounts?.oauth2?.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (response: { access_token: string; error?: string }) => {
        if (response.error) {
          console.error('OAuth error:', response.error);
          return;
        }
        handleCredentialResponse(response.access_token);
      },
    });

    if (tokenClient) {
      tokenClient.requestAccessToken();
    } else {
      console.warn('Google Identity Services not loaded — entering demo mode');
      setIsDemoMode(true);
    }
  }, [handleCredentialResponse]);

  const signOut = useCallback(() => {
    if (auth.accessToken && (window as any).google?.accounts?.oauth2) {
      (window as any).google.accounts.oauth2.revoke(auth.accessToken);
    }
    setAuth(DEFAULT_AUTH_STATE);
    setIsDemoMode(false);
    clearAuthSession();
  }, [auth.accessToken]);

  const enterDemoMode = useCallback(() => {
    const nextAuth: AuthState = {
      isAuthenticated: true,
      accessToken: null,
      userEmail: 'demo@example.com',
      userName: 'Demo User',
      userAvatar: null,
      scannedAt: new Date().toISOString(),
    };
    setIsDemoMode(true);
    setAuth(nextAuth);
    saveAuthSession(nextAuth, true);
  }, []);

  // If no CLIENT_ID, auto-enter demo mode after a tick
  useEffect(() => {
    if (!CLIENT_ID) {
      // don't auto-enter, let user click
    }
  }, []);

  return (
    <AuthContext.Provider value={{ auth, signIn, isDemoMode, signOut, enterDemoMode }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
