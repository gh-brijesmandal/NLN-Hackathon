import { useState, useCallback, useEffect, useRef } from 'react';
import type { Application, ScanState } from '../types';
import { fetchApplications, ensureClaudeScannerReady } from '../lib/gmail.ts';
import { MOCK_APPLICATIONS } from '../lib/mockData';
import { saveApplications, loadApplications, saveLastScanned, loadGhostDays } from '../lib/storage';

export function useApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [scan, setScan] = useState<ScanState>({ isScanning: false, progress: 0, total: 0, currentLabel: '' });
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scanInFlightRef = useRef(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = loadApplications();
    if (stored.length > 0) {
      setApplications(stored);
      setHasLoaded(true);
    }
  }, []);

  const scanInbox = useCallback(async (accessToken: string | null, isDemoMode: boolean) => {
    if (scanInFlightRef.current) {
      return;
    }

    scanInFlightRef.current = true;
    setScan({ isScanning: true, progress: 0, total: 3, currentLabel: 'Connecting…' });
    setError(null);
    try {
      if (isDemoMode) {
        setScan(s => ({ ...s, progress: 1, currentLabel: 'Searching for application emails…' }));
        await delay(800);
        setScan(s => ({ ...s, progress: 2, currentLabel: 'Analyzing responses…' }));
        await delay(800);
        setScan(s => ({ ...s, progress: 3, currentLabel: 'Checking ghosting status…' }));
        await delay(600);
        setApplications(MOCK_APPLICATIONS);
        saveApplications(MOCK_APPLICATIONS);
        setError('Demo mode is active. Gmail and Claude are not called in demo mode. Sign in with Google to run real Claude parsing.');
      } else if (!accessToken) {
        await ensureClaudeScannerReady(true);
        setError('No Google access token found. Sign out and sign in again, then re-scan to call Claude parsing.');
      } else {
        await ensureClaudeScannerReady(true);
        setScan(s => ({ ...s, progress: 1, currentLabel: 'Searching for application emails…' }));
        const apps = await fetchApplications(accessToken);
        if (apps.length === 0) {
          setError('No application emails matched yet. Try re-scanning after checking recent inbox confirmations and Gmail permissions.');
        }
        setScan(s => ({ ...s, progress: 2, currentLabel: 'Analyzing responses…' }));
        await delay(400);
        setScan(s => ({ ...s, progress: 3, currentLabel: 'Done!' }));
        setApplications(apps);
        saveApplications(apps);
      }
      saveLastScanned(new Date().toISOString());
      setHasLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan inbox');
      setHasLoaded(true);
    } finally {
      scanInFlightRef.current = false;
      setScan(s => ({ ...s, isScanning: false }));
    }
  }, []);

  const addApplication = useCallback((app: Omit<Application, 'id' | 'daysSinceApplied' | 'daysSinceActivity' | 'isGhosted'>) => {
    const ghostDays = loadGhostDays();
    const now = new Date();
    const applied = new Date(app.appliedDate);
    const lastActivity = new Date(app.lastActivityDate);
    const daysSinceApplied = Math.floor((now.getTime() - applied.getTime()) / 86400000);
    const daysSinceActivity = Math.floor((now.getTime() - lastActivity.getTime()) / 86400000);
    const isGhosted = daysSinceActivity >= ghostDays;
    const newApp: Application = {
      ...app,
      id: crypto.randomUUID(),
      daysSinceApplied,
      daysSinceActivity,
      isGhosted,
    };
    setApplications(prev => {
      const next = [newApp, ...prev];
      saveApplications(next);
      return next;
    });
  }, []);

  const updateApplication = useCallback((id: string, updates: Partial<Application>) => {
    setApplications(prev => {
      const next = prev.map(a => a.id === id ? { ...a, ...updates } : a);
      saveApplications(next);
      return next;
    });
  }, []);

  const deleteApplication = useCallback((id: string) => {
    setApplications(prev => {
      const next = prev.filter(a => a.id !== id);
      saveApplications(next);
      return next;
    });
  }, []);

  const stats = {
    total: applications.length,
    active: applications.filter(a => ['applied', 'screening', 'interviewing'].includes(a.status)).length,
    ghosted: applications.filter(a => a.status === 'ghosted').length,
    offers: applications.filter(a => a.status === 'offer').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    responseRate: applications.length > 0
      ? Math.round((applications.filter(a => !['applied', 'ghosted'].includes(a.status)).length / applications.length) * 100)
      : 0,
  };

  return { applications, scan, hasLoaded, error, scanInbox, stats, addApplication, updateApplication, deleteApplication };
}

function delay(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }
