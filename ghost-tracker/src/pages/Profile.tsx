import { useState, useEffect, useRef } from 'react';
import { User, Plus, X, Upload, Save, Check } from 'lucide-react';
import { loadProfile, saveProfile } from '../lib/storage';
import type { UserProfile } from '../types';

const DEFAULT_PROFILE: UserProfile = {
  name: '', email: '', phone: '', location: '', linkedin: '', github: '',
  portfolio: '', university: '', major: '', graduationYear: '', gpa: '',
  skills: [], bio: '', targetRoles: [], targetLocations: [],
  workAuthorization: 'h1b_needed', resumeText: '', resumeFileName: '',
};

const WORK_AUTH_OPTIONS = [
  { value: 'citizen', label: 'US Citizen' },
  { value: 'gc', label: 'Green Card' },
  { value: 'h1b_needed', label: 'Need H1B Sponsorship' },
  { value: 'opt', label: 'OPT (F-1)' },
  { value: 'stem_opt', label: 'STEM OPT' },
  { value: 'other', label: 'Other' },
];

export function Profile() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [saved, setSaved] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const p = loadProfile();
    if (p) setProfile(p);
  }, []);

  const set = (key: keyof UserProfile, val: any) => setProfile(p => ({ ...p, [key]: val }));

  const handleSave = () => {
    saveProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      set('skills', [...profile.skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const addRole = () => {
    if (newRole.trim() && !profile.targetRoles.includes(newRole.trim())) {
      set('targetRoles', [...profile.targetRoles, newRole.trim()]);
      setNewRole('');
    }
  };

  const addLocation = () => {
    if (newLocation.trim() && !profile.targetLocations.includes(newLocation.trim())) {
      set('targetLocations', [...profile.targetLocations, newLocation.trim()]);
      setNewLocation('');
    }
  };

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      set('resumeFileName', file.name);
      set('resumeText', reader.result as string);
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-4 sm:p-8 max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <User size={20} className="text-accent" />
          <h1 className="font-display font-semibold text-2xl sm:text-3xl text-text-primary">My Profile</h1>
        </div>
        <p className="font-mono text-xs text-text-muted">Stored locally in your browser — never sent to any server.</p>
      </div>

      <div className="space-y-5">
        {/* Basic Info */}
        <section className="bg-surface border border-border rounded-2xl p-5">
          <div className="font-mono text-xs text-text-muted uppercase tracking-widest mb-4">Basic Info</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {([['name','Full Name'], ['email','Email'], ['phone','Phone'], ['location','Current Location'], ['linkedin','LinkedIn URL'], ['github','GitHub URL'], ['portfolio','Portfolio URL']] as const).map(([key, label]) => (
              <div key={key} className={key === 'linkedin' || key === 'github' || key === 'portfolio' ? 'sm:col-span-2' : ''}>
                <label className="block font-mono text-xs text-text-muted mb-1.5">{label}</label>
                <input
                  type="text"
                  value={(profile[key] as string) ?? ''}
                  onChange={e => set(key, e.target.value)}
                  className="w-full px-3 py-2 bg-bg border border-border rounded-lg font-mono text-sm text-text-primary focus:outline-none focus:border-accent/50 transition-colors"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Education */}
        <section className="bg-surface border border-border rounded-2xl p-5">
          <div className="font-mono text-xs text-text-muted uppercase tracking-widest mb-4">Education</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {([['university','University'], ['major','Major / Degree'], ['graduationYear','Graduation Year'], ['gpa','GPA (optional)']] as const).map(([key, label]) => (
              <div key={key}>
                <label className="block font-mono text-xs text-text-muted mb-1.5">{label}</label>
                <input
                  type="text"
                  value={(profile[key] as string) ?? ''}
                  onChange={e => set(key, e.target.value)}
                  className="w-full px-3 py-2 bg-bg border border-border rounded-lg font-mono text-sm text-text-primary focus:outline-none focus:border-accent/50 transition-colors"
                />
              </div>
            ))}
          </div>
          <div className="mt-4">
            <label className="block font-mono text-xs text-text-muted mb-1.5">Work Authorization</label>
            <select
              value={profile.workAuthorization}
              onChange={e => set('workAuthorization', e.target.value as UserProfile['workAuthorization'])}
              className="w-full px-3 py-2 bg-bg border border-border rounded-lg font-mono text-sm text-text-primary focus:outline-none focus:border-accent/50 transition-colors"
            >
              {WORK_AUTH_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </section>

        {/* Bio */}
        <section className="bg-surface border border-border rounded-2xl p-5">
          <div className="font-mono text-xs text-text-muted uppercase tracking-widest mb-4">Professional Summary</div>
          <textarea
            value={profile.bio ?? ''}
            onChange={e => set('bio', e.target.value)}
            rows={3}
            placeholder="A brief summary of your background, skills, and goals..."
            className="w-full px-3 py-2 bg-bg border border-border rounded-lg font-mono text-sm text-text-primary focus:outline-none focus:border-accent/50 transition-colors resize-none"
          />
        </section>

        {/* Skills */}
        <section className="bg-surface border border-border rounded-2xl p-5">
          <div className="font-mono text-xs text-text-muted uppercase tracking-widest mb-4">Skills</div>
          <div className="flex flex-wrap gap-2 mb-3">
            {profile.skills.map(skill => (
              <span key={skill} className="flex items-center gap-1.5 px-2.5 py-1 bg-accent/10 border border-accent/20 text-accent rounded-full font-mono text-xs">
                {skill}
                <button onClick={() => set('skills', profile.skills.filter(s => s !== skill))}><X size={10} /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text" value={newSkill} onChange={e => setNewSkill(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addSkill()}
              placeholder="Add a skill (e.g. React, Python, SQL)"
              className="flex-1 px-3 py-2 bg-bg border border-border rounded-lg font-mono text-sm text-text-primary focus:outline-none focus:border-accent/50 transition-colors"
            />
            <button onClick={addSkill} className="px-3 py-2 bg-accent/10 border border-accent/20 text-accent rounded-lg hover:bg-accent/20 transition-colors">
              <Plus size={16} />
            </button>
          </div>
        </section>

        {/* Target Roles & Locations */}
        <section className="bg-surface border border-border rounded-2xl p-5">
          <div className="font-mono text-xs text-text-muted uppercase tracking-widest mb-4">Job Preferences</div>
          <div className="space-y-4">
            <div>
              <label className="block font-mono text-xs text-text-muted mb-2">Target Roles</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {profile.targetRoles.map(r => (
                  <span key={r} className="flex items-center gap-1.5 px-2.5 py-1 bg-border text-text-secondary rounded-full font-mono text-xs">
                    {r}<button onClick={() => set('targetRoles', profile.targetRoles.filter(x => x !== r))}><X size={10} /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="text" value={newRole} onChange={e => setNewRole(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addRole()}
                  placeholder="e.g. Software Engineer, Data Analyst"
                  className="flex-1 px-3 py-2 bg-bg border border-border rounded-lg font-mono text-sm text-text-primary focus:outline-none focus:border-accent/50 transition-colors"
                />
                <button onClick={addRole} className="px-3 py-2 bg-border text-text-secondary rounded-lg hover:text-text-primary transition-colors"><Plus size={16} /></button>
              </div>
            </div>
            <div>
              <label className="block font-mono text-xs text-text-muted mb-2">Target Locations</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {profile.targetLocations.map(l => (
                  <span key={l} className="flex items-center gap-1.5 px-2.5 py-1 bg-border text-text-secondary rounded-full font-mono text-xs">
                    {l}<button onClick={() => set('targetLocations', profile.targetLocations.filter(x => x !== l))}><X size={10} /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="text" value={newLocation} onChange={e => setNewLocation(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addLocation()}
                  placeholder="e.g. New York, Remote, San Francisco"
                  className="flex-1 px-3 py-2 bg-bg border border-border rounded-lg font-mono text-sm text-text-primary focus:outline-none focus:border-accent/50 transition-colors"
                />
                <button onClick={addLocation} className="px-3 py-2 bg-border text-text-secondary rounded-lg hover:text-text-primary transition-colors"><Plus size={16} /></button>
              </div>
            </div>
          </div>
        </section>

        {/* Resume Upload */}
        <section className="bg-surface border border-border rounded-2xl p-5">
          <div className="font-mono text-xs text-text-muted uppercase tracking-widest mb-4">Resume</div>
          <p className="font-mono text-xs text-text-muted mb-3">Upload your base resume (text/plain). Used for AI-powered tailoring.</p>
          <input ref={fileRef} type="file" accept=".txt,.md" onChange={handleResumeUpload} className="hidden" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <button onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-border border border-muted text-text-secondary rounded-lg hover:text-text-primary hover:border-accent/30 transition-all font-mono text-xs">
              <Upload size={14} />Upload Resume (.txt)
            </button>
            {profile.resumeFileName && (
              <span className="font-mono text-xs text-accent">✓ {profile.resumeFileName}</span>
            )}
          </div>
          {profile.resumeText && (
            <textarea
              value={profile.resumeText}
              onChange={e => set('resumeText', e.target.value)}
              rows={6}
              className="mt-3 w-full px-3 py-2 bg-bg border border-border rounded-lg font-mono text-xs text-text-secondary focus:outline-none focus:border-accent/50 transition-colors resize-none"
            />
          )}
        </section>

        {/* Save */}
        <button onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all ${saved ? 'bg-accent/20 text-accent border border-accent/30' : 'bg-accent text-bg hover:bg-accent/90'}`}>
          {saved ? <><Check size={15} /> Saved!</> : <><Save size={15} /> Save Profile</>}
        </button>
      </div>
    </div>
  );
}
