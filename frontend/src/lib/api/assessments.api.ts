import { apiFetch } from './client';

export const assessmentsApi = {
  getAll: () => apiFetch<any[]>('/skills/assessments'),

  getById: (id: string) => apiFetch<any>(`/skills/assessments/${id}`),

  submit: (id: string, answers: Record<string, any>) =>
    apiFetch<any>(`/skills/assessments/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers })
    })
};
