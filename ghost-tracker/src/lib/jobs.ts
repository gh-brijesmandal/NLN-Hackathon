import type {
  JobSuggestion,
  H1BCompany,
  UserProfile,
  RedditPost,
} from "../types";
import communityPosts from "../data/communityPosts.json";
import h1bCompaniesRaw from "../data/H1B_Company.json";

// Fetch jobs from Remotive API (no auth needed, CORS ok)
export async function fetchJobSuggestions(
  profile: UserProfile,
): Promise<JobSuggestion[]> {
  const roles =
    profile.targetRoles.length > 0
      ? profile.targetRoles
      : ["software engineer"];

  try {
    const res = await fetch(
      `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(roles[0])}&limit=20`,
    );
    if (!res.ok) throw new Error("Remotive API error");
    const data = await res.json();

    return (data.jobs ?? []).slice(0, 20).map(
      (job: any): JobSuggestion => ({
        id: String(job.id),
        title: job.title,
        company: job.company_name,
        location: job.candidate_required_location || "Remote",
        type: job.job_type || "Full-time",
        url: job.url,
        source: "Remotive",
        postedDate: job.publication_date,
        salary: job.salary || "",
        sponsorsH1B: false,
        matchScore: calcMatchScore(job, profile),
        description:
          job.description?.replace(/<[^>]+>/g, "").slice(0, 300) + "...",
      }),
    );
  } catch {
    return getMockJobs(profile);
  }
}

function calcMatchScore(job: any, profile: UserProfile): number {
  const text = `${job.title} ${job.description ?? ""}`.toLowerCase();
  let score = 50;
  profile.skills.forEach((skill) => {
    if (text.includes(skill.toLowerCase())) score += 5;
  });
  profile.targetRoles.forEach((role) => {
    if (text.includes(role.toLowerCase())) score += 10;
  });
  return Math.min(score, 99);
}

// H1B sponsorship data — curated list of known sponsors
export async function fetchH1BCompanies(query: string): Promise<H1BCompany[]> {
  const all = getH1BList();
  if (!query.trim()) return all.slice(0, 50);
  const q = query.toLowerCase();
  return all
    .filter(
      (c) =>
        c.employer.toLowerCase().includes(q) ||
        (c.industry ?? "").toLowerCase().includes(q),
    )
    .slice(0, 50);
}

function getH1BList(): H1BCompany[] {
  const rows = Array.isArray(h1bCompaniesRaw)
    ? (h1bCompaniesRaw as Array<Record<string, unknown>>)
    : [];

  return rows
    .map((row) => {
      const employer = String(row["Company Name"] ?? "").trim();
      if (!employer) return null;

      const industry = String(row["Industry"] ?? "Other")
        .replace(/\//g, " / ")
        .replace(/\s+/g, " ")
        .trim();

      const petitionsValue = Number(row["Petitions (2024-25 Est.)"] ?? 0);

      const petitions = Number.isFinite(petitionsValue)
        ? Math.max(0, Math.round(petitionsValue))
        : 0;

      const website = `https://www.google.com/search?q=${encodeURIComponent(
        `${employer} official website`,
      )}`;

      return {
        employer,
        approvals: petitions,
        year: 2025,
        industry,
        website,
      } as H1BCompany;
    })
    .filter((company): company is H1BCompany => company !== null);
}

// Returns community posts from static JSON
export function fetchRedditPosts(): RedditPost[] {
  try {
    // communityPosts.json must be a root-level array: [{id, title, url, score, numComments, selftext, createdAt}, ...]
    if (!Array.isArray(communityPosts)) {
      console.error(
        "[fetchRedditPosts] communityPosts.json is not an array — check the file structure.",
      );
      return [];
    }
    return communityPosts as RedditPost[];
  } catch (e) {
    console.error("[fetchRedditPosts] failed:", e);
    return [];
  }
}

function getMockJobs(profile: UserProfile): JobSuggestion[] {
  const roles =
    profile.targetRoles.length > 0
      ? profile.targetRoles
      : ["Software Engineer"];
  return [
    {
      id: "1",
      title: roles[0] || "Software Engineer",
      company: "Stripe",
      location: "Remote",
      type: "Full-time",
      url: "https://stripe.com/jobs",
      source: "Mock",
      postedDate: new Date().toISOString(),
      salary: "$130k-$160k",
      sponsorsH1B: true,
      matchScore: 92,
      description: "Full-stack engineering role at Stripe.",
    },
    {
      id: "2",
      title: roles[0] || "Software Engineer",
      company: "Cloudflare",
      location: "Remote / Austin TX",
      type: "Full-time",
      url: "https://cloudflare.com/careers",
      source: "Mock",
      postedDate: new Date().toISOString(),
      salary: "$120k-$150k",
      sponsorsH1B: true,
      matchScore: 85,
      description: "Backend engineering role focused on edge infrastructure.",
    },
    {
      id: "3",
      title: "Data Engineer",
      company: "Databricks",
      location: "San Francisco, CA",
      type: "Full-time",
      url: "https://databricks.com/company/careers",
      source: "Mock",
      postedDate: new Date().toISOString(),
      salary: "$140k-$180k",
      sponsorsH1B: true,
      matchScore: 78,
      description: "Data engineering role building large-scale pipelines.",
    },
  ];
}
