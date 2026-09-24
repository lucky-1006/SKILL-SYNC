import { apiFetch } from './client';

export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    apiFetch<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),

  demoSwitch: (role: string) =>
    apiFetch<{ token: string; user: any }>('/auth/demo-switch', {
      method: 'POST',
      body: JSON.stringify({ role })
    }),

  getCurrentUser: () =>
    apiFetch<{ user: any }>('/auth/me')
};
