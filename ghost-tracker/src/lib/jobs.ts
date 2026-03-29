import type { JobSuggestion, H1BCompany, UserProfile } from '../types';

// Fetch jobs from Remotive API (no auth needed, CORS ok)
export async function fetchJobSuggestions(profile: UserProfile): Promise<JobSuggestion[]> {
  const roles = profile.targetRoles.length > 0 ? profile.targetRoles : ['software engineer'];
  const query = roles[0].replace(/\s+/g, '+');
  
  try {
    const res = await fetch(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent(roles[0])}&limit=20`);
    if (!res.ok) throw new Error('Remotive API error');
    const data = await res.json();
    
    return (data.jobs ?? []).slice(0, 20).map((job: any, idx: number): JobSuggestion => ({
      id: String(job.id),
      title: job.title,
      company: job.company_name,
      location: job.candidate_required_location || 'Remote',
      type: job.job_type || 'Full-time',
      url: job.url,
      source: 'Remotive',
      postedDate: job.publication_date,
      salary: job.salary || '',
      sponsorsH1B: false,
      matchScore: calcMatchScore(job, profile),
      description: job.description?.replace(/<[^>]+>/g, '').slice(0, 300) + '...',
    }));
  } catch {
    return getMockJobs(profile);
  }
}

function calcMatchScore(job: any, profile: UserProfile): number {
  const text = `${job.title} ${job.description ?? ''}`.toLowerCase();
  let score = 50;
  profile.skills.forEach(skill => { if (text.includes(skill.toLowerCase())) score += 5; });
  profile.targetRoles.forEach(role => { if (text.includes(role.toLowerCase())) score += 10; });
  return Math.min(score, 99);
}

// H1B sponsorship data — curated list of known sponsors
export async function fetchH1BCompanies(query: string): Promise<H1BCompany[]> {
  const all = getH1BList();
  if (!query.trim()) return all.slice(0, 50);
  const q = query.toLowerCase();
  return all.filter(c => c.employer.toLowerCase().includes(q)).slice(0, 50);
}

function getH1BList(): H1BCompany[] {
  return [
    { employer: 'Amazon', approvals: 18000, denials: 400, year: 2023, industry: 'Tech' },
    { employer: 'Google', approvals: 14000, denials: 200, year: 2023, industry: 'Tech' },
    { employer: 'Microsoft', approvals: 12000, denials: 300, year: 2023, industry: 'Tech' },
    { employer: 'Meta', approvals: 6000, denials: 150, year: 2023, industry: 'Tech' },
    { employer: 'Apple', approvals: 5000, denials: 100, year: 2023, industry: 'Tech' },
    { employer: 'Infosys', approvals: 22000, denials: 800, year: 2023, industry: 'IT Services' },
    { employer: 'Tata Consultancy Services', approvals: 20000, denials: 700, year: 2023, industry: 'IT Services' },
    { employer: 'Wipro', approvals: 10000, denials: 400, year: 2023, industry: 'IT Services' },
    { employer: 'IBM', approvals: 8000, denials: 300, year: 2023, industry: 'Tech' },
    { employer: 'Cognizant', approvals: 15000, denials: 600, year: 2023, industry: 'IT Services' },
    { employer: 'Deloitte', approvals: 3000, denials: 200, year: 2023, industry: 'Consulting' },
    { employer: 'Accenture', approvals: 5000, denials: 250, year: 2023, industry: 'Consulting' },
    { employer: 'Salesforce', approvals: 2500, denials: 80, year: 2023, industry: 'Tech' },
    { employer: 'Oracle', approvals: 4000, denials: 150, year: 2023, industry: 'Tech' },
    { employer: 'Intel', approvals: 3000, denials: 100, year: 2023, industry: 'Semiconductor' },
    { employer: 'Qualcomm', approvals: 2000, denials: 70, year: 2023, industry: 'Semiconductor' },
    { employer: 'Netflix', approvals: 800, denials: 30, year: 2023, industry: 'Tech' },
    { employer: 'Uber', approvals: 1500, denials: 60, year: 2023, industry: 'Tech' },
    { employer: 'Airbnb', approvals: 700, denials: 20, year: 2023, industry: 'Tech' },
    { employer: 'Stripe', approvals: 900, denials: 25, year: 2023, industry: 'Fintech' },
    { employer: 'Databricks', approvals: 600, denials: 15, year: 2023, industry: 'Tech' },
    { employer: 'Snowflake', approvals: 700, denials: 20, year: 2023, industry: 'Tech' },
    { employer: 'Adobe', approvals: 3500, denials: 120, year: 2023, industry: 'Tech' },
    { employer: 'ServiceNow', approvals: 1200, denials: 40, year: 2023, industry: 'Tech' },
    { employer: 'Palantir', approvals: 500, denials: 15, year: 2023, industry: 'Tech' },
    { employer: 'Twitter / X', approvals: 600, denials: 20, year: 2023, industry: 'Tech' },
    { employer: 'LinkedIn', approvals: 2000, denials: 70, year: 2023, industry: 'Tech' },
    { employer: 'Nvidia', approvals: 2500, denials: 80, year: 2023, industry: 'Semiconductor' },
    { employer: 'AMD', approvals: 1800, denials: 60, year: 2023, industry: 'Semiconductor' },
    { employer: 'Cisco', approvals: 4000, denials: 150, year: 2023, industry: 'Networking' },
    { employer: 'Goldman Sachs', approvals: 2000, denials: 100, year: 2023, industry: 'Finance' },
    { employer: 'JPMorgan Chase', approvals: 2500, denials: 120, year: 2023, industry: 'Finance' },
    { employer: 'Morgan Stanley', approvals: 1500, denials: 80, year: 2023, industry: 'Finance' },
    { employer: 'McKinsey', approvals: 800, denials: 30, year: 2023, industry: 'Consulting' },
    { employer: 'Boston Consulting Group', approvals: 600, denials: 20, year: 2023, industry: 'Consulting' },
    { employer: 'Capital One', approvals: 1200, denials: 50, year: 2023, industry: 'Fintech' },
    { employer: 'Visa', approvals: 1500, denials: 60, year: 2023, industry: 'Fintech' },
    { employer: 'PayPal', approvals: 1800, denials: 70, year: 2023, industry: 'Fintech' },
    { employer: 'Block (Square)', approvals: 600, denials: 20, year: 2023, industry: 'Fintech' },
    { employer: 'Lyft', approvals: 800, denials: 30, year: 2023, industry: 'Tech' },
    { employer: 'Spotify', approvals: 500, denials: 15, year: 2023, industry: 'Tech' },
    { employer: 'Pinterest', approvals: 400, denials: 10, year: 2023, industry: 'Tech' },
    { employer: 'Twilio', approvals: 500, denials: 15, year: 2023, industry: 'Tech' },
    { employer: 'Cloudflare', approvals: 400, denials: 10, year: 2023, industry: 'Tech' },
    { employer: 'HubSpot', approvals: 350, denials: 10, year: 2023, industry: 'Tech' },
    { employer: 'Workday', approvals: 1200, denials: 40, year: 2023, industry: 'Tech' },
    { employer: 'Zoom', approvals: 700, denials: 20, year: 2023, industry: 'Tech' },
    { employer: 'Atlassian', approvals: 600, denials: 20, year: 2023, industry: 'Tech' },
    { employer: 'GitHub', approvals: 300, denials: 8, year: 2023, industry: 'Tech' },
    { employer: 'Shopify', approvals: 400, denials: 12, year: 2023, industry: 'Tech' },
  ];
}

// Fetch job tips from Reddit (via public JSON API)
export async function fetchRedditPosts(subreddit: string = 'cscareerquestions', limit: number = 10) {
  try {
    const res = await fetch(
      `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}`,
      { headers: { 'User-Agent': 'JobTracker/1.0' } }
    );
    if (!res.ok) throw new Error('Reddit API error');
    const data = await res.json();
    return data.data.children.map((c: any) => ({
      id: c.data.id,
      title: c.data.title,
      url: `https://reddit.com${c.data.permalink}`,
      subreddit: c.data.subreddit,
      score: c.data.score,
      numComments: c.data.num_comments,
      selftext: c.data.selftext?.slice(0, 200),
      createdAt: new Date(c.data.created_utc * 1000).toISOString(),
    }));
  } catch {
    return [];
  }
}

function getMockJobs(profile: UserProfile): JobSuggestion[] {
  const roles = profile.targetRoles.length > 0 ? profile.targetRoles : ['Software Engineer'];
  return [
    { id: '1', title: roles[0] || 'Software Engineer', company: 'Stripe', location: 'Remote', type: 'Full-time', url: 'https://stripe.com/jobs', source: 'Mock', postedDate: new Date().toISOString(), salary: '$130k-$160k', sponsorsH1B: true, matchScore: 92 },
    { id: '2', title: roles[0] || 'Software Engineer', company: 'Cloudflare', location: 'Remote / Austin TX', type: 'Full-time', url: 'https://cloudflare.com/careers', source: 'Mock', postedDate: new Date().toISOString(), salary: '$120k-$150k', sponsorsH1B: true, matchScore: 85 },
    { id: '3', title: 'Data Engineer', company: 'Databricks', location: 'San Francisco, CA', type: 'Full-time', url: 'https://databricks.com/company/careers', source: 'Mock', postedDate: new Date().toISOString(), salary: '$140k-$180k', sponsorsH1B: true, matchScore: 78 },
  ];
}
