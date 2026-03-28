import type { Application, SkillGap, InterviewNote } from '../types';

export const mockApplications: Application[] = [
  {
    id: '1', company: 'Google', role: 'SWE Intern — L3', stage: 'applied',
    status: 'ghosted', appliedDate: '2025-03-10', daysAgo: 18,
    color: '#6bc5ff', bgColor: 'rgba(107,197,255,0.15)', letter: 'G',
    jobDescription: 'We are looking for a Software Engineer Intern with strong knowledge of distributed systems, Go or C++, Kubernetes, system design principles, and experience with large-scale infrastructure.',
    rejectionEmail: 'Thank you for applying to Google. After careful consideration, we have decided to move forward with other candidates whose experience more closely aligns with our current team needs. We encourage you to apply again in the future.',
    skillGaps: ['Distributed Systems', 'Go', 'Kubernetes'],
  },
  {
    id: '2', company: 'Netflix', role: 'Backend Intern', stage: 'applied',
    status: 'rejected', appliedDate: '2025-03-19', daysAgo: 9,
    color: '#ff6b6b', bgColor: 'rgba(255,107,107,0.15)', letter: 'N',
    jobDescription: 'Backend Engineering Intern with experience in Java/Kotlin microservices, distributed systems, and cloud infrastructure at scale.',
    rejectionEmail: 'We appreciate your interest in Netflix. We were impressed by your background but found that other candidates had more specialized backend experience at scale. Best of luck in your search.',
    skillGaps: ['Java/Kotlin', 'Microservices', 'System Design'],
  },
  {
    id: '3', company: 'Stripe', role: 'Full Stack Intern', stage: 'applied',
    status: 'pending', appliedDate: '2025-03-25', daysAgo: 3,
    color: '#c8f55a', bgColor: 'rgba(200,245,90,0.15)', letter: 'S',
  },
  {
    id: '4', company: 'Anthropic', role: 'AI Safety Intern', stage: 'interviewed',
    status: 'interview', appliedDate: '2025-03-23', daysAgo: 5,
    color: '#44cc88', bgColor: 'rgba(68,204,136,0.15)', letter: 'A',
  },
  {
    id: '5', company: 'Figma', role: 'Frontend Intern', stage: 'applied',
    status: 'ghosted', appliedDate: '2025-03-07', daysAgo: 21,
    color: '#ff6b6b', bgColor: 'rgba(255,107,107,0.15)', letter: 'F',
    skillGaps: ['React Advanced', 'WebGL', 'System Design'],
  },
  {
    id: '6', company: 'OpenAI', role: 'Research Intern', stage: 'applied',
    status: 'rejected', appliedDate: '2025-03-16', daysAgo: 12,
    color: '#c8f55a', bgColor: 'rgba(200,245,90,0.15)', letter: 'O',
    skillGaps: ['PyTorch', 'CUDA', 'Research Publications'],
  },
  {
    id: '7', company: 'Coinbase', role: 'Blockchain Intern', stage: 'applied',
    status: 'pending', appliedDate: '2025-03-26', daysAgo: 2,
    color: '#6bc5ff', bgColor: 'rgba(107,197,255,0.15)', letter: 'C',
  },
];

export const mockSkillGaps: SkillGap[] = [
  { name: 'System Design', count: 5, type: 'resume' },
  { name: 'Kubernetes', count: 4, type: 'resume' },
  { name: 'Go / Rust', count: 3, type: 'depth' },
  { name: 'Distributed Systems', count: 3, type: 'depth' },
  { name: 'Docker', count: 3, type: 'resume' },
  { name: 'Communication', count: 2, type: 'soft' },
  { name: 'SQL Optimization', count: 2, type: 'depth' },
  { name: 'AWS', count: 1, type: 'depth' },
  { name: 'Culture Fit', count: 1, type: 'soft' },
];

export const mockInterviewNotes: InterviewNote[] = [
  {
    id: '1', applicationId: '4', date: '2025-03-25',
    content: 'First round with team lead. Went well overall. Strong on ML basics.',
    stumbledOn: 'Constitutional AI specifics and RLHF fine-tuning details',
  },
];
