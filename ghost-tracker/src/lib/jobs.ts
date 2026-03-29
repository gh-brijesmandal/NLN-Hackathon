import type {
  JobSuggestion,
  H1BCompany,
  UserProfile,
  RedditPost,
} from "../types";
import communityPosts from "../data/communityPosts.json";
import h1bCompaniesRaw from "../data/H1B_Company.json";

// ---------------------------------------------------------------------------
// Dummy job dataset
// ---------------------------------------------------------------------------
const DUMMY_JOBS = [
  {
    id: "1",
    title: "Software Engineer — Backend",
    company: "Stripe",
    location: "Remote",
    type: "Full-time",
    url: "https://stripe.com/jobs",
    salary: "$150k–$190k",
    sponsorsH1B: true,
    tags: "node typescript python distributed-systems payments backend api",
    description: "Build and scale the infrastructure powering global payments.",
    postedDaysAgo: 2,
  },
  {
    id: "2",
    title: "Frontend Engineer",
    company: "Vercel",
    location: "Remote",
    type: "Full-time",
    url: "https://vercel.com/careers",
    salary: "$140k–$175k",
    sponsorsH1B: true,
    tags: "react nextjs typescript frontend dx ui performance",
    description:
      "Improve the developer experience for millions of Next.js users.",
    postedDaysAgo: 4,
  },
  {
    id: "3",
    title: "Full Stack Engineer",
    company: "Notion",
    location: "Remote",
    type: "Full-time",
    url: "https://notion.so/careers",
    salary: "$135k–$170k",
    sponsorsH1B: true,
    tags: "react typescript node postgres fullstack product",
    description: "Build features used by millions of individuals and teams.",
    postedDaysAgo: 6,
  },
  {
    id: "4",
    title: "Software Engineer — AI Integrations",
    company: "Anthropic",
    location: "San Francisco, CA",
    type: "Full-time",
    url: "https://anthropic.com/careers",
    salary: "$170k–$220k",
    sponsorsH1B: true,
    tags: "python typescript ai llm api integrations backend ml",
    description:
      "Work on integrations that bring Claude to developers worldwide.",
    postedDaysAgo: 1,
  },
  {
    id: "5",
    title: "Embedded Systems Engineer",
    company: "Waymo",
    location: "Mountain View, CA",
    type: "Full-time",
    url: "https://waymo.com/careers",
    salary: "$160k–$200k",
    sponsorsH1B: true,
    tags: "c cpp embedded rtos linux autonomous robotics firmware sensors",
    description: "Develop embedded systems for self-driving vehicles.",
    postedDaysAgo: 5,
  },
  {
    id: "6",
    title: "Robotics Software Engineer",
    company: "Boston Dynamics",
    location: "Waltham, MA",
    type: "Full-time",
    url: "https://bostondynamics.com/careers",
    salary: "$145k–$185k",
    sponsorsH1B: true,
    tags: "ros2 c++ python robotics control-systems perception autonomy",
    description: "Build software for next-generation legged robots.",
    postedDaysAgo: 7,
  },
  {
    id: "7",
    title: "Systems Software Engineer",
    company: "NVIDIA",
    location: "Santa Clara, CA",
    type: "Full-time",
    url: "https://nvidia.com/en-us/about-nvidia/careers",
    salary: "$165k–$210k",
    sponsorsH1B: true,
    tags: "c cpp cuda gpu systems linux kernel drivers parallel",
    description: "Build high-performance software for GPU infrastructure.",
    postedDaysAgo: 3,
  },
  {
    id: "8",
    title: "Firmware Engineer",
    company: "Apple",
    location: "Cupertino, CA",
    type: "Full-time",
    url: "https://apple.com/careers",
    salary: "$155k–$195k",
    sponsorsH1B: true,
    tags: "c embedded firmware esp32 stm32 ble wireless rtos arm",
    description:
      "Develop firmware for Apple's next-generation hardware products.",
    postedDaysAgo: 8,
  },
  {
    id: "9",
    title: "Backend Engineer — Infrastructure",
    company: "Cloudflare",
    location: "Remote",
    type: "Full-time",
    url: "https://cloudflare.com/careers",
    salary: "$130k–$165k",
    sponsorsH1B: true,
    tags: "go rust distributed-systems networking backend edge infrastructure",
    description: "Scale the network that powers millions of websites.",
    postedDaysAgo: 5,
  },
  {
    id: "10",
    title: "ML Engineer",
    company: "Databricks",
    location: "San Francisco, CA",
    type: "Full-time",
    url: "https://databricks.com/careers",
    salary: "$155k–$200k",
    sponsorsH1B: true,
    tags: "python pytorch tensorflow spark ml data pipelines mlops",
    description: "Build ML infrastructure and tooling at scale.",
    postedDaysAgo: 9,
  },
  {
    id: "11",
    title: "React Native Engineer",
    company: "Airbnb",
    location: "Remote",
    type: "Full-time",
    url: "https://airbnb.com/careers",
    salary: "$140k–$175k",
    sponsorsH1B: true,
    tags: "react react-native typescript mobile frontend javascript",
    description:
      "Build cross-platform mobile experiences for guests and hosts.",
    postedDaysAgo: 11,
  },
  {
    id: "12",
    title: "DevOps Engineer",
    company: "HashiCorp",
    location: "Remote",
    type: "Full-time",
    url: "https://hashicorp.com/careers",
    salary: "$130k–$165k",
    sponsorsH1B: true,
    tags: "terraform kubernetes docker aws devops ci-cd infrastructure",
    description: "Build and maintain cloud infrastructure tooling.",
    postedDaysAgo: 4,
  },
  {
    id: "13",
    title: "Data Engineer",
    company: "Snowflake",
    location: "Remote",
    type: "Full-time",
    url: "https://snowflake.com/careers",
    salary: "$140k–$180k",
    sponsorsH1B: true,
    tags: "sql python spark data pipelines etl warehouse analytics",
    description: "Design and build scalable data pipelines.",
    postedDaysAgo: 6,
  },
  {
    id: "14",
    title: "Software Engineer — Autonomy",
    company: "Cruise",
    location: "San Francisco, CA",
    type: "Full-time",
    url: "https://getcruise.com/careers",
    salary: "$160k–$205k",
    sponsorsH1B: true,
    tags: "c++ python ros2 autonomy perception robotics lidar planning",
    description: "Build software for autonomous vehicle systems.",
    postedDaysAgo: 10,
  },
  {
    id: "15",
    title: "Product Engineer",
    company: "Linear",
    location: "Remote",
    type: "Full-time",
    url: "https://linear.app/jobs",
    salary: "$135k–$170k",
    sponsorsH1B: false,
    tags: "react typescript product fullstack frontend design-systems",
    description: "Shape the core product experience used by engineering teams.",
    postedDaysAgo: 3,
  },
  {
    id: "16",
    title: "Security Engineer",
    company: "Okta",
    location: "Remote",
    type: "Full-time",
    url: "https://okta.com/company/careers",
    salary: "$145k–$185k",
    sponsorsH1B: true,
    tags: "security identity oauth saml zero-trust cloud backend",
    description: "Build secure identity infrastructure at scale.",
    postedDaysAgo: 7,
  },
  {
    id: "17",
    title: "iOS Engineer",
    company: "Figma",
    location: "Remote / San Francisco",
    type: "Full-time",
    url: "https://figma.com/careers",
    salary: "$145k–$185k",
    sponsorsH1B: true,
    tags: "swift ios mobile apple xcode uikit swiftui",
    description: "Build Figma's iOS application used by designers worldwide.",
    postedDaysAgo: 5,
  },
  {
    id: "18",
    title: "Site Reliability Engineer",
    company: "GitHub",
    location: "Remote",
    type: "Full-time",
    url: "https://github.com/about/careers",
    salary: "$140k–$175k",
    sponsorsH1B: true,
    tags: "sre kubernetes linux reliability observability monitoring devops",
    description: "Keep GitHub reliable for millions of developers.",
    postedDaysAgo: 8,
  },
  {
    id: "19",
    title: "Software Engineer — Compiler",
    company: "AMD",
    location: "Austin, TX",
    type: "Full-time",
    url: "https://amd.com/en/corporate/careers",
    salary: "$150k–$190k",
    sponsorsH1B: true,
    tags: "c++ compilers llvm gpu systems low-level optimization semiconductor",
    description: "Build GPU compiler toolchains for next-gen hardware.",
    postedDaysAgo: 12,
  },
  {
    id: "20",
    title: "Full Stack Engineer — Fintech",
    company: "Stripe",
    location: "Remote",
    type: "Full-time",
    url: "https://stripe.com/jobs",
    salary: "$145k–$185k",
    sponsorsH1B: true,
    tags: "react node typescript postgres fullstack payments api fintech",
    description: "Build financial products used by businesses worldwide.",
    postedDaysAgo: 2,
  },
];

// ---------------------------------------------------------------------------
// fetchJobSuggestions — scores dummy jobs against the user profile
// ---------------------------------------------------------------------------
export async function fetchJobSuggestions(
  profile: UserProfile,
): Promise<JobSuggestion[]> {
  const scored: JobSuggestion[] = DUMMY_JOBS.map((job) => ({
    id: job.id,
    title: job.title,
    company: job.company,
    location: job.location,
    type: job.type,
    url: job.url,
    source: "Mock" as const,
    postedDate: daysAgoToISO(job.postedDaysAgo),
    salary: job.salary,
    sponsorsH1B: job.sponsorsH1B,
    matchScore: calcMatchScore(job, profile),
    description: job.description,
  }));

  return scored.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
}

function daysAgoToISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

// ---------------------------------------------------------------------------
// Match Score Engine — 100 pts across 5 weighted categories
//   1. Skills match         — up to 35 pts
//   2. Role / title match   — up to 25 pts
//   3. Location match       — up to 15 pts
//   4. Work authorization   — up to 15 pts
//   5. Profile completeness — up to 10 pts
// Clamped to [10, 99]
// ---------------------------------------------------------------------------
function calcMatchScore(
  job: { title: string; tags: string; location: string; sponsorsH1B: boolean },
  profile: UserProfile,
): number {
  const jobText = `${job.title} ${job.tags}`.toLowerCase();
  const jobTitle = job.title.toLowerCase();
  const jobLoc = job.location.toLowerCase();
  let score = 0;

  // 1. Skills (up to 35)
  if (profile.skills.length > 0) {
    const matched = profile.skills.filter((s) =>
      jobText.includes(s.toLowerCase()),
    );
    score += Math.round((matched.length / profile.skills.length) * 35);
  }

  // 2. Role (up to 25)
  if (profile.targetRoles.length > 0) {
    let roleScore = 0;
    for (const role of profile.targetRoles) {
      const r = role.toLowerCase();
      if (jobTitle.includes(r)) {
        roleScore = 25;
        break;
      } else if (jobText.includes(r)) {
        roleScore = Math.max(roleScore, 12);
      }
    }
    score += roleScore;
  }

  // 3. Location (up to 15)
  const isRemote =
    jobLoc.includes("remote") || jobLoc === "" || jobLoc === "worldwide";
  if (isRemote) {
    score += 12;
  } else if (profile.targetLocations?.length > 0) {
    const matched = profile.targetLocations.some(
      (loc) =>
        jobLoc.includes(loc.toLowerCase()) ||
        loc.toLowerCase().includes(jobLoc),
    );
    score += matched ? 15 : 0;
  } else {
    score += 8;
  }

  // 4. Work authorization (up to 15)
  const auth = profile.workAuthorization ?? "other";
  const noSponsorSignals = [
    "no sponsorship",
    "must be authorized",
    "us citizen",
    "citizens only",
    "no visa",
    "permanent resident",
  ];
  const refusesSponsorship = noSponsorSignals.some((s) => jobText.includes(s));

  if (auth === "citizen" || auth === "gc") {
    score += 15;
  } else if (auth === "h1b_needed") {
    score += refusesSponsorship ? 0 : job.sponsorsH1B ? 15 : 8;
  } else if (auth === "opt" || auth === "stem_opt") {
    score += refusesSponsorship ? 3 : 12;
  } else {
    score += 8;
  }

  // 5. Profile completeness (up to 10)
  let completeness = 0;
  if (profile.skills.length >= 3) completeness += 3;
  if (profile.targetRoles.length >= 1) completeness += 3;
  if (profile.bio && profile.bio.length > 30) completeness += 2;
  if (profile.university) completeness += 1;
  if (profile.resumeText && profile.resumeText.length > 100) completeness += 1;
  score += completeness;

  return Math.min(Math.max(score, 10), 99);
}

// ---------------------------------------------------------------------------
// H1B data
// ---------------------------------------------------------------------------
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
      const petitions = Math.max(
        0,
        Math.round(Number(row["Petitions (2024-25 Est.)"] ?? 0)),
      );
      const website = `https://www.google.com/search?q=${encodeURIComponent(`${employer} official website`)}`;
      return {
        employer,
        approvals: petitions,
        year: 2025,
        industry,
        website,
      } as H1BCompany;
    })
    .filter((c): c is H1BCompany => c !== null);
}

// ---------------------------------------------------------------------------
// Community posts
// ---------------------------------------------------------------------------
export function fetchRedditPosts(): RedditPost[] {
  try {
    if (!Array.isArray(communityPosts)) {
      console.error("[fetchRedditPosts] communityPosts.json is not an array.");
      return [];
    }
    return communityPosts as RedditPost[];
  } catch (e) {
    console.error("[fetchRedditPosts] failed:", e);
    return [];
  }
}
