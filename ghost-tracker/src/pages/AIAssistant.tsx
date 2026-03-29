import { useState, useEffect, useRef } from 'react';
import { Bot, Send, Trash2, Sparkles, AlertCircle } from 'lucide-react';
import { chatWithAI } from '../lib/ai';
import { loadProfile, loadAISettings } from '../lib/storage';
import type { UserProfile } from '../types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const STARTERS = [
  'Help me prepare for a software engineering interview at Amazon',
  'What should I put in my resume summary?',
  'I got a rejection email — what should I do?',
  'How do I negotiate my salary offer?',
  'What questions should I ask at the end of an interview?',
  'How do I follow up after submitting an application?',
];

export function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [hasKey, setHasKey] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setProfile(loadProfile());
    setHasKey(!!loadAISettings()?.apiKey);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput('');
    setError('');
    const newMessages: Message[] = [...messages, { role: 'user', content }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const reply = await chatWithAI(newMessages, profile);
      setMessages(m => [...m, { role: 'assistant', content: reply }]);
    } catch (e: any) {
      setError(e.message ?? 'AI error');
      setMessages(m => m.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-0px)] md:h-screen animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-8 py-4 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <Bot size={20} className="text-accent" />
          <div>
            <h1 className="font-display font-semibold text-text-primary text-base sm:text-xl">AI Job Assistant</h1>
            <p className="font-mono text-[10px] text-text-muted">Uses your own API key — stored locally, never on our servers.</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={() => setMessages([])} className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border text-text-muted rounded-lg hover:text-danger font-mono text-xs transition-colors">
            <Trash2 size={12} /> Clear
          </button>
        )}
      </div>

      {/* No key warning */}
      {!hasKey && (
        <div className="mx-4 sm:mx-8 mt-4 p-4 bg-danger/8 border border-danger/20 rounded-xl flex items-start gap-3 flex-shrink-0">
          <AlertCircle size={15} className="text-danger flex-shrink-0 mt-0.5" />
          <div className="font-mono text-xs text-danger/80">
            No AI API key found. <a href="/settings" className="underline text-danger">Add your key in Settings → AI Model</a> to use this feature. Supports OpenAI, Anthropic, Gemini, and Groq (free).
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-[300px] text-center gap-5">
            <div className="size-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center animate-float">
              <Bot size={32} className="text-accent" />
            </div>
            <div>
              <div className="font-display font-semibold text-text-primary text-lg mb-1">Your Job Search AI</div>
              <div className="font-mono text-xs text-text-muted max-w-xs">Ask anything about resumes, interviews, negotiations, H1B, networking, and more.</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {STARTERS.map(s => (
                <button key={s} onClick={() => send(s)}
                  className="text-left px-3 py-2.5 bg-surface border border-border rounded-xl font-mono text-xs text-text-muted hover:border-accent/30 hover:text-text-secondary transition-all leading-relaxed">
                  <Sparkles size={10} className="inline mr-1.5 text-accent" />{s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="size-7 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot size={14} className="text-accent" />
              </div>
            )}
            <div className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl font-mono text-xs leading-relaxed whitespace-pre-wrap ${
              msg.role === 'user'
                ? 'bg-accent/15 border border-accent/25 text-text-primary rounded-tr-sm'
                : 'bg-surface border border-border text-text-secondary rounded-tl-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="size-7 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Bot size={14} className="text-accent" />
            </div>
            <div className="px-4 py-3 bg-surface border border-border rounded-2xl rounded-tl-sm">
              <div className="flex gap-1.5 items-center h-4">
                <div className="size-1.5 rounded-full bg-accent/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="size-1.5 rounded-full bg-accent/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="size-1.5 rounded-full bg-accent/60 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-danger/8 border border-danger/20 rounded-xl font-mono text-xs text-danger">{error}</div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 sm:px-8 pb-4 pt-2 border-t border-border flex-shrink-0">
        <div className="flex gap-3 items-end bg-surface border border-border rounded-2xl px-4 py-3 focus-within:border-accent/40 transition-colors">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about resumes, interviews, H1B, salary…"
            rows={1}
            style={{ maxHeight: 120 }}
            className="flex-1 bg-transparent font-mono text-sm text-text-primary placeholder-text-muted focus:outline-none resize-none"
          />
          <button onClick={() => send()} disabled={!input.trim() || loading}
            className="flex items-center justify-center size-8 bg-accent rounded-lg text-bg hover:bg-accent/90 transition-all disabled:opacity-40 flex-shrink-0">
            <Send size={15} />
          </button>
        </div>
        <div className="font-mono text-[10px] text-text-muted mt-1.5 text-center">Press Enter to send · Shift+Enter for newline</div>
      </div>
    </div>
  );
}
