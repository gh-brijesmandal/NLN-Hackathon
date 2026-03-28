import { createContext, useContext, useState, type ReactNode } from 'react';
import { mockApplications, mockInterviewNotes } from '../lib/mockData';
import type { Application, InterviewNote } from '../types';

interface AppStore {
  applications: Application[];
  notes: InterviewNote[];
  apiKey: string;
  setApiKey: (k: string) => void;
  addApplication: (app: Application) => void;
  addNote: (note: InterviewNote) => void;
}

const StoreContext = createContext<AppStore | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [applications, setApplications] = useState<Application[]>(mockApplications);
  const [notes, setNotes] = useState<InterviewNote[]>(mockInterviewNotes);
  const [apiKey, setApiKey] = useState<string>('');

  return (
    <StoreContext.Provider value={{
      applications, notes, apiKey, setApiKey,
      addApplication: (app) => setApplications(prev => [app, ...prev]),
      addNote: (note) => setNotes(prev => [note, ...prev]),
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
