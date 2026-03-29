import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import type { AuthState } from '../types';
import { fetchUserProfile } from '../lib/gmail.ts';
import { loadAuthSession, saveAuthSession, clearAuthSession } from '../lib/storage';

interface AuthContextValue {
  auth: AuthState;
  signIn: () => void;
  signOut: () => void;
  isDemoMode: boolean;
  isSigningIn: boolean;
  enterDemoMode: () => void;
  oauthClientIdConfigured: boolean;
  googleScriptLoaded: boolean;
  oauthError: string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined)?.trim();

const SCOPES = [
  'openid',
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const oauthClientIdConfigured = Boolean(CLIENT_ID);
  const persistedSession = loadAuthSession();
  const [auth, setAuth] = useState<AuthState>(() => persistedSession?.auth ?? DEFAULT_AUTH_STATE);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => persistedSession?.isDemoMode ?? false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const signInLockRef = useRef(false);
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(
    Boolean((window as any).google?.accounts?.oauth2)
  );
  const [oauthError, setOauthError] = useState<string | null>(null);

  const finishSignIn = useCallback(() => {
    signInLockRef.current = false;
    setIsSigningIn(false);
  }, []);

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
      saveAuthSession(nextAuth, false);
      setIsDemoMode(false);
      setOauthError(null);
    } catch (e) {
      console.error('Failed to fetch profile:', e);
      setOauthError(
        e instanceof Error
          ? e.message
          : 'Google sign-in succeeded, but profile fetch failed. Please try again.'
      );
    } finally {
      finishSignIn();
    }
  }, [finishSignIn]);

  useEffect(() => {
    if (googleScriptLoaded) return;

    let attempts = 0;
    const maxAttempts = 50;

    const intervalId = window.setInterval(() => {
      if ((window as any).google?.accounts?.oauth2) {
        setGoogleScriptLoaded(true);
        window.clearInterval(intervalId);
        return;
      }

      attempts += 1;
      if (attempts >= maxAttempts) {
        window.clearInterval(intervalId);
      }
    }, 200);

    return () => window.clearInterval(intervalId);
  }, [googleScriptLoaded]);

  const signIn = useCallback(() => {
    if (signInLockRef.current || isSigningIn) return;

    signInLockRef.current = true;
    setIsSigningIn(true);

    setOauthError(null);

    if (!oauthClientIdConfigured) {
      setOauthError('Google OAuth is not configured. Add VITE_GOOGLE_CLIENT_ID to your .env file.');
      finishSignIn();
      return;
    }

    if (!googleScriptLoaded) {
      setOauthError('Google Sign-In is still loading. Please wait a moment and try again.');
      finishSignIn();
      return;
    }

    // Use Google Identity Services token flow
    const tokenClient = (window as any).google?.accounts?.oauth2?.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: async (response: { access_token?: string; error?: string; expires_in?: number }) => {
        if (response.error) {
          console.error('OAuth error:', response.error);
          setOauthError(`Google OAuth error: ${response.error}`);
          finishSignIn();
          return;
        }

        if (!response.access_token) {
          setOauthError('Google OAuth did not return an access token. Please try again.');
          finishSignIn();
          return;
        }

        await handleCredentialResponse(response.access_token);
      },
      error_callback: (response: { type?: string }) => {
        if (response.type === 'popup_failed_to_open' || response.type === 'popup_closed') {
          setOauthError(
            'Google popup was blocked or closed. Allow popups for localhost and try again, or use demo mode.'
          );
        } else {
          const reason = response.type ? ` (${response.type})` : '';
          setOauthError(`Google Sign-In failed${reason}. Please try again.`);
        }
        finishSignIn();
      },
    });

    if (tokenClient) {
      // Safety valve in case no callback is delivered (e.g. popup blocked by browser policy).
      window.setTimeout(() => {
        finishSignIn();
      }, 20000);
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      setOauthError('Google Identity Services is unavailable right now. Please refresh and try again.');
      finishSignIn();
    }
  }, [finishSignIn, googleScriptLoaded, handleCredentialResponse, isSigningIn, oauthClientIdConfigured]);

  const signOut = useCallback(() => {
    if (auth.accessToken && (window as any).google?.accounts?.oauth2) {
      (window as any).google.accounts.oauth2.revoke(auth.accessToken);
    }
    clearAuthSession();
    setAuth(DEFAULT_AUTH_STATE);
    setIsDemoMode(false);
    finishSignIn();
    setOauthError(null);
  }, [auth.accessToken, finishSignIn]);

  const enterDemoMode = useCallback(() => {
    clearAuthSession();
    const nextAuth: AuthState = {
      isAuthenticated: true,
      accessToken: null,
      userEmail: 'demo@example.com',
      userName: 'Demo User',
      userAvatar: null,
      scannedAt: new Date().toISOString(),
    };

    setIsDemoMode(true);
    setOauthError(null);
    setAuth(nextAuth);
    saveAuthSession(nextAuth, true);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        auth,
        signIn,
        isDemoMode,
        isSigningIn,
        signOut,
        enterDemoMode,
        oauthClientIdConfigured,
        googleScriptLoaded,
        oauthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
