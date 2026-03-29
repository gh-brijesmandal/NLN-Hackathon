import { useState, useEffect } from 'react';
import { FileText, Sparkles, Copy, Check, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { loadProfile } from '../lib/storage';
import { tailorResume, generateCoverLetter } from '../lib/ai';
import type { UserProfile } from '../types';

export function ResumeBuilder() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState('');
  const [mode, setMode] = useState<'resume' | 'cover'>('resume');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showTips, setShowTips] = useState(false);

  useEffect(() => { setProfile(loadProfile()); }, []);

  const handleGenerate = async () => {
    if (!profile) return setError('Please fill out your profile first.');
    if (!jobDescription.trim()) return setError('Please paste a job description.');
    if (mode === 'resume' && !profile.resumeText) return setError('Please upload your resume text in Profile first.');
    setError(''); setLoading(true); setResult('');
    try {
      const out = mode === 'resume'
        ? await tailorResume(profile.resumeText!, jobDescription, profile)
        : await generateCoverLetter(profile, jobTitle, company, jobDescription);
      setResult(out);
    } catch (e: any) {
      setError(e.message ?? 'AI error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const noProfile = !profile?.name;
  const noResume = !profile?.resumeText;

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto animate-fade-in">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <FileText size={20} className="text-accent" />
          <h1 className="font-display font-semibold text-2xl sm:text-3xl text-text-primary">Resume Helper</h1>
        </div>
        <p className="font-mono text-xs text-text-muted">AI tailors your resume or writes a cover letter for each job. Your data never leaves your browser.</p>
      </div>

      {(noProfile || noResume) && (
        <div className="mb-5 p-4 bg-danger/8 border border-danger/20 rounded-xl flex items-start gap-3">
          <AlertCircle size={16} className="text-danger mt-0.5 flex-shrink-0" />
          <div className="font-mono text-xs text-danger/80">
            {noProfile ? 'Complete your profile first.' : 'Upload your resume text in Profile → Resume section.'}{' '}
            <a href="/profile" className="underline text-danger">Go to Profile →</a>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Left: Input */}
        <div className="space-y-4">
          {/* Mode toggle */}
          <div className="flex rounded-xl overflow-hidden border border-border">
            {(['resume', 'cover'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 py-2.5 font-mono text-xs font-medium transition-all ${mode === m ? 'bg-accent/15 text-accent' : 'text-text-muted hover:text-text-secondary bg-surface'}`}>
                {m === 'resume' ? '📄 Tailor Resume' : '✉️ Cover Letter'}
              </button>
            ))}
          </div>

          {/* Job info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-xs text-text-muted mb-1.5">Job Title</label>
              <input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)}
                placeholder="e.g. Software Engineer"
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg font-mono text-sm text-text-primary focus:outline-none focus:border-accent/50 transition-colors" />
            </div>
            <div>
              <label className="block font-mono text-xs text-text-muted mb-1.5">Company</label>
              <input type="text" value={company} onChange={e => setCompany(e.target.value)}
                placeholder="e.g. Google"
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg font-mono text-sm text-text-primary focus:outline-none focus:border-accent/50 transition-colors" />
            </div>
          </div>

          <div>
            <label className="block font-mono text-xs text-text-muted mb-1.5">Job Description</label>
            <textarea value={jobDescription} onChange={e => setJobDescription(e.target.value)}
              rows={10} placeholder="Paste the full job description here..."
              className="w-full px-3 py-2 bg-surface border border-border rounded-lg font-mono text-xs text-text-primary focus:outline-none focus:border-accent/50 transition-colors resize-none" />
          </div>

          {error && (
            <div className="p-3 bg-danger/8 border border-danger/20 rounded-lg font-mono text-xs text-danger">{error}</div>
          )}

          <button onClick={handleGenerate} disabled={loading || noProfile}
            className="flex items-center justify-center gap-2 w-full py-3 bg-accent text-bg font-semibold text-sm rounded-xl hover:bg-accent/90 transition-all disabled:opacity-50">
            <Sparkles size={15} className={loading ? 'animate-pulse' : ''} />
            {loading ? 'Generating with AI…' : `Generate ${mode === 'resume' ? 'Tailored Resume' : 'Cover Letter'}`}
          </button>

          {/* Tips */}
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <button onClick={() => setShowTips(!showTips)}
              className="flex items-center justify-between w-full px-4 py-3 font-mono text-xs text-text-muted hover:text-text-secondary transition-colors">
              <span>💡 Tips for best results</span>
              {showTips ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
            {showTips && (
              <div className="px-4 pb-4 space-y-2 font-mono text-xs text-text-muted">
                <p>• Paste the full JD including requirements and responsibilities.</p>
                <p>• Your resume in Profile should be plain text (no tables/columns).</p>
                <p>• Include job title + company for more targeted output.</p>
                <p>• Use Groq (free) or OpenAI GPT-4o-mini for fast results.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Output */}
        <div className="bg-surface border border-border rounded-2xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-3 border-b border-border">
            <span className="font-mono text-xs text-text-muted">Output</span>
            {result && (
              <button onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-border text-text-secondary rounded-lg hover:text-text-primary font-mono text-xs transition-colors">
                {copied ? <><Check size={12} />Copied!</> : <><Copy size={12} />Copy</>}
              </button>
            )}
          </div>
          <div className="flex-1 p-5 overflow-y-auto min-h-[300px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                <div className="size-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                <div className="font-mono text-xs text-text-muted">AI is working on it…</div>
              </div>
            ) : result ? (
              <pre className="whitespace-pre-wrap font-mono text-xs text-text-secondary leading-relaxed">{result}</pre>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
                <FileText size={32} className="text-text-muted" />
                <div className="font-mono text-xs text-text-muted">Your AI-tailored output will appear here</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
