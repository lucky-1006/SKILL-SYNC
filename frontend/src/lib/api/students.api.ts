import { apiFetch } from './client';

export const studentsApi = {
  getSkills: () => apiFetch<any>('/skills/student'),

  getSkillGaps: (roleId?: string) =>
    apiFetch<any>(roleId ? `/skills/gap-analysis?roleId=${roleId}` : '/skills/gap-analysis'),

  getPortfolio: () => apiFetch<any>('/portfolio/student'),

  verifyPortfolio: (code: string) => apiFetch<any>(`/portfolio/verify/${code}`),

  getCareerRoles: () => apiFetch<any[]>('/career/roles'),

  getCareerRoadmap: (roleId: string) => apiFetch<any>(`/career/roadmap/${roleId}`),

  getActiveWorkspace: () => apiFetch<any>('/workspace/active'),

  updateTaskStatus: (taskId: string, status: string) =>
    apiFetch<any>(`/workspace/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }),

  submitReport: (report: { title: string; content: string; hoursSpent: number }) =>
    apiFetch<any>('/workspace/reports', {
      method: 'POST',
      body: JSON.stringify(report)
    })
};
