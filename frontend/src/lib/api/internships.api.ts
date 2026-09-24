import { apiFetch } from './client';

export const internshipsApi = {
  getOpportunities: (category?: string) =>
    apiFetch<any[]>(category ? `/opportunities?category=${category}` : '/opportunities'),

  getOpportunityById: (id: string) => apiFetch<any>(`/opportunities/${id}`),

  apply: (application: { opportunityId: string; coverLetter?: string; resumeUrl?: string }) =>
    apiFetch<any>('/applications', {
      method: 'POST',
      body: JSON.stringify(application)
    }),

  getStudentApplications: () => apiFetch<any[]>('/applications/student'),

  getIndustryApplications: () => apiFetch<any[]>('/applications/industry'),

  updateStatus: (applicationId: string, status: string) =>
    apiFetch<any>(`/applications/${applicationId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    })
};
