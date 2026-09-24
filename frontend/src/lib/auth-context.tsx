'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '@skillsync/shared';
import { apiFetch } from './api';
import { useRouter } from 'next/navigation';

export interface AuthContextType {
  user: any | null;
  role: UserRole;
  token: string | null;
  isLoading: boolean;
  switchRole: (role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const savedToken = localStorage.getItem('skillsync_token');
    const savedRole = localStorage.getItem('skillsync_role') as UserRole;

    if (savedToken) {
      setToken(savedToken);
      if (savedRole) setRole(savedRole);
      // fetch profile
      apiFetch<any>('/auth/me')
        .then((userData) => {
          setUser(userData);
          setRole(userData.role as UserRole);
        })
        .catch(() => {
          // fallback to demo switch
          switchRole(savedRole || UserRole.STUDENT);
        })
        .finally(() => setIsLoading(false));
    } else {
      // Default to student demo
      switchRole(UserRole.STUDENT).finally(() => setIsLoading(false));
    }
  }, []);

  const switchRole = async (targetRole: UserRole) => {
    setIsLoading(true);
    try {
      const res = await apiFetch<any>('/auth/demo-switch', {
        method: 'POST',
        body: JSON.stringify({ role: targetRole })
      });

      localStorage.setItem('skillsync_token', res.token);
      localStorage.setItem('skillsync_role', targetRole);
      setToken(res.token);
      setUser(res.user);
      setRole(targetRole);

      // Route to destination dashboard
      if (targetRole === UserRole.STUDENT) {
        router.push('/student/dashboard');
      } else if (targetRole === UserRole.ACADEMICIAN) {
        router.push('/academician/dashboard');
      } else if (targetRole === UserRole.INDUSTRY) {
        router.push('/industry/dashboard');
      } else if (targetRole === UserRole.INSTITUTION) {
        router.push('/institution/dashboard');
      } else if (targetRole === UserRole.ADMIN) {
        router.push('/institution/analytics');
      }
    } catch (err) {
      console.error('Switch role failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('skillsync_token');
    localStorage.removeItem('skillsync_role');
    setUser(null);
    setToken(null);
    setRole(UserRole.STUDENT);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, role, token, isLoading, switchRole, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
