export type AppStatus = 'pending' | 'ghosted' | 'rejected' | 'interview' | 'offer';
export type AppStage = 'applied' | 'interviewed' | 'final_round' | 'offer';

export interface Application {
  id: string;
  company: string;
  role: string;
  stage: AppStage;
  status: AppStatus;
  appliedDate: string;
  daysAgo: number;
  color: string;
  bgColor: string;
  letter: string;
  rejectionEmail?: string;
  jobDescription?: string;
  notes?: string;
  skillGaps?: string[];
}

export interface SkillGap {
  name: string;
  count: number;
  type: 'resume' | 'depth' | 'soft';
}

export interface AnalysisResult {
  technical_gaps: string[];
  soft_skill_flags: string[];
  top_cert_recommendation: string;
  next_move: string;
  ghosting_risk: number;
}

export interface InterviewNote {
  id: string;
  applicationId: string;
  date: string;
  content: string;
  stumbledOn?: string;
}
