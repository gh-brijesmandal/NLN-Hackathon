import { useState, useCallback } from 'react';
import type { Application, ScanState } from '../types';
import { fetchApplications } from '../lib/gmail';
import { MOCK_APPLICATIONS } from '../lib/mockData';

export function useApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [scan, setScan] = useState<ScanState>({
    isScanning: false,
    progress: 0,
    total: 0,
    currentLabel: '',
  });
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scanInbox = useCallback(async (accessToken: string | null, isDemoMode: boolean) => {
    setScan({ isScanning: true, progress: 0, total: 3, currentLabel: 'Connecting to Gmail…' });
    setError(null);

    try {
      if (isDemoMode || !accessToken) {
        // Simulate scanning with mock data
        setScan(s => ({ ...s, progress: 1, currentLabel: 'Searching for application emails…' }));
        await delay(800);
        setScan(s => ({ ...s, progress: 2, currentLabel: 'Analyzing responses…' }));
        await delay(800);
        setScan(s => ({ ...s, progress: 3, currentLabel: 'Checking ghosting status…' }));
        await delay(600);
        setApplications(MOCK_APPLICATIONS);
      } else {
        setScan(s => ({ ...s, progress: 1, currentLabel: 'Searching for application emails…' }));
        const apps = await fetchApplications(accessToken);
        setScan(s => ({ ...s, progress: 2, currentLabel: 'Analyzing responses…' }));
        await delay(400);
        setScan(s => ({ ...s, progress: 3, currentLabel: 'Done!' }));
        setApplications(apps);
      }

      setHasLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan inbox');
    } finally {
      setScan(s => ({ ...s, isScanning: false }));
    }
  }, []);

  const stats = {
    total: applications.length,
    active: applications.filter(a => ['applied', 'screening', 'interviewing'].includes(a.status)).length,
    ghosted: applications.filter(a => a.status === 'ghosted').length,
    offers: applications.filter(a => a.status === 'offer').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    responseRate: applications.length > 0
      ? Math.round(
          (applications.filter(a => !['applied', 'ghosted'].includes(a.status)).length /
            applications.length) *
            100
        )
      : 0,
  };

  return { applications, scan, hasLoaded, error, scanInbox, stats };
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
