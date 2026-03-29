import { useState, useEffect } from "react";
import {
  HelpCircle,
  ExternalLink,
  RefreshCw,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import { fetchRedditPosts } from "../lib/jobs";
import type { RedditPost } from "../types";

const SUBREDDITS = [
  { id: "internships", label: "Internships" },
  { id: "full-time", label: "Full Time Jobs" },
  { id: "Engineering", label: "Engineering" },
  { id: "careerguidance", label: "Career Guidance" },
];

const STATIC_TIPS = [
  {
    category: "Resume",
    tip: 'Use action verbs and quantify achievements (e.g. "Improved API latency by 40%").',
  },
  {
    category: "Resume",
    tip: "Tailor keywords from the JD — many companies use ATS to filter applicants.",
  },
  {
    category: "Resume",
    tip: "Keep it 1 page as a student/new grad. Use a clean single-column format.",
  },
  {
    category: "Networking",
    tip: "LinkedIn outreach: connect with alumni at target companies — warm leads have 5x higher response.",
  },
  {
    category: "Networking",
    tip: "Attend virtual career fairs. Many companies give referrals to fair attendees directly.",
  },
  {
    category: "Interviews",
    tip: "Use the STAR method for behavioral questions: Situation, Task, Action, Result.",
  },
  {
    category: "Interviews",
    tip: "Practice Leetcode medium difficulty problems for 30 min/day for 4–6 weeks before SDE interviews.",
  },
  {
    category: "Interviews",
    tip: "Research the company's recent news, products, and culture before any interview.",
  },
  {
    category: "Applications",
    tip: "Apply within 24–48 hours of a job posting — early applicants have much higher callback rates.",
  },
  {
    category: "Applications",
    tip: "Apply to 10–20 jobs per week minimum in a tough market. Track everything in this app.",
  },
  {
    category: "H1B / OPT",
    tip: "Apply for OPT at least 90 days before your graduation date to avoid gaps.",
  },
  {
    category: "H1B / OPT",
    tip: "Use the H1B Explorer in this app to find companies with strong H1B sponsorship history.",
  },
  {
    category: "Salary",
    tip: "Use Levels.fyi and Glassdoor for benchmarking compensation — always negotiate.",
  },
  {
    category: "Salary",
    tip: "Get competing offers if possible. They are your strongest negotiation leverage.",
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  Resume: "bg-accent/10 text-accent border-accent/20",
  Networking: "bg-ghost/10 text-warn border-warn/20",
  Interviews: "bg-danger/10 text-danger border-danger/20",
  Applications: "bg-accent/10 text-accent border-accent/20",
  "H1B / OPT": "bg-ghost/10 text-warn border-warn/20",
  Salary: "bg-danger/10 text-danger border-danger/20",
};

export function JobHelp() {
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [subreddit, setSubreddit] = useState("cscareerquestions");
  const [catFilter, setCatFilter] = useState("All");

  const loadPosts = async (sub: string) => {
    setLoading(true);
    try {
      setPosts(await fetchRedditPosts(sub, 12));
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts(subreddit);
  }, []);

  const categories = [
    "All",
    ...Array.from(new Set(STATIC_TIPS.map((t) => t.category))),
  ];
  const filteredTips =
    catFilter === "All"
      ? STATIC_TIPS
      : STATIC_TIPS.filter((t) => t.category === catFilter);

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto animate-fade-in">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <HelpCircle size={20} className="text-accent" />
          <h1 className="font-display font-semibold text-2xl sm:text-3xl text-text-primary">
            Job Help & Tips
          </h1>
        </div>
        <p className="font-mono text-xs text-text-muted">
          Curated advice and live community posts to level up your job search.
        </p>
      </div>

      {/* Static tips */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-text-primary text-sm">
            Quick Tips
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCatFilter(c)}
                className={`px-2.5 py-1 rounded-full font-mono text-[10px] border transition-all ${catFilter === c ? "bg-accent/15 border-accent/30 text-accent" : "bg-surface border-border text-text-muted hover:border-muted"}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {filteredTips.map((t, i) => (
            <div
              key={i}
              className="bg-surface border border-border rounded-xl p-4"
            >
              <span
                className={`inline-block px-2 py-0.5 rounded-full border font-mono text-[10px] mb-2 ${CATEGORY_COLORS[t.category] ?? "bg-border text-text-muted border-border"}`}
              >
                {t.category}
              </span>
              <p className="font-mono text-xs text-text-secondary leading-relaxed">
                {t.tip}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Reddit section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="font-semibold text-text-primary text-sm flex items-center gap-2">
            <MessageSquare size={15} className="text-accent" /> Community
            Discussions
          </h2>
          <div className="flex items-center gap-2">
            <select
              value={subreddit}
              onChange={(e) => {
                setSubreddit(e.target.value);
                loadPosts(e.target.value);
              }}
              className="bg-surface border border-border rounded-lg px-3 py-1.5 font-mono text-xs text-text-secondary focus:outline-none focus:border-accent/40"
            >
              {SUBREDDITS.map((s) => (
                <option key={s.id} value={s.id}>
                  r/{s.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => loadPosts(subreddit)}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border text-text-muted rounded-lg hover:text-text-primary font-mono text-xs transition-colors disabled:opacity-50"
            >
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-surface border border-border rounded-xl p-4 animate-pulse"
              >
                <div className="h-3 bg-border rounded w-3/4 mb-2" />
                <div className="h-2 bg-border rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-10">
            <div className="font-mono text-xs text-text-muted">
              Could not load posts. Sites may be rate-limiting.
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {posts.map((post) => (
              <a
                key={post.id}
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-surface border border-border rounded-xl p-4 hover:border-muted transition-colors group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-text-primary text-sm group-hover:text-accent transition-colors leading-snug mb-1.5">
                      {post.title}
                    </div>
                    {post.selftext && (
                      <p className="font-mono text-xs text-text-muted leading-relaxed line-clamp-2">
                        {post.selftext}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 font-mono text-[10px] text-text-muted">
                        <TrendingUp size={10} /> {post.score.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1 font-mono text-[10px] text-text-muted">
                        <MessageSquare size={10} /> {post.numComments}
                      </span>
                      <span className="font-mono text-[10px] text-text-muted">
                        r/{post.subreddit}
                      </span>
                    </div>
                  </div>
                  <ExternalLink
                    size={13}
                    className="text-text-muted group-hover:text-accent transition-colors flex-shrink-0 mt-0.5"
                  />
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
