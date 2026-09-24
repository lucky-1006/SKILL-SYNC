import { apiFetch } from './client';

export const aiApi = {
  getOrchestratorStatus: () => apiFetch<any>('/ai/orchestrator/status'),

  queryAssistant: (query: string, role?: string) =>
    apiFetch<any>('/ai/assistant', {
      method: 'POST',
      body: JSON.stringify({ query, role })
    }),

  predictPlacement: (features?: any) =>
    apiFetch<any>('/ai/placement-predict', {
      method: 'POST',
      body: JSON.stringify(features || {})
    }),

  analyzeResume: (resumeText: string, role?: string) =>
    apiFetch<any>('/ai/resume-analyzer', {
      method: 'POST',
      body: JSON.stringify({ resumeText, role })
    }),

  generateMockInterview: (targetRole: string) =>
    apiFetch<any>('/ai/mock-interview/generate', {
      method: 'POST',
      body: JSON.stringify({ targetRole })
    }),

  evaluateMockInterview: (questionId: string, answer: string) =>
    apiFetch<any>('/ai/mock-interview/evaluate', {
      method: 'POST',
      body: JSON.stringify({ questionId, answer })
    }),

  forecastDemand: (skills: any[]) =>
    apiFetch<any>('/ai/demand-forecast', {
      method: 'POST',
      body: JSON.stringify({ skills })
    })
};
