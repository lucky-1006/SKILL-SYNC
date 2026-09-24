'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@skillsync/shared';
import {
  GraduationCap,
  School,
  Building2,
  Briefcase,
  ShieldCheck,
  Sparkles,
  Loader2
} from 'lucide-react';

export function StakeholderSwitcher() {
  const { role, switchRole, isLoading } = useAuth();

  const roles = [
    {
      id: UserRole.STUDENT,
      label: 'Student',
      persona: 'Swastik Singh (AIIA CSE)',
      icon: GraduationCap,
    },
    {
      id: UserRole.ACADEMICIAN,
      label: 'Academician',
      persona: 'Dr. Priya Nambiar (AIIA)',
      icon: School,
    },
    {
      id: UserRole.INDUSTRY,
      label: 'Industry',
      persona: 'Rajesh Menon (TCS Bio-IT)',
      icon: Building2,
    },
    {
      id: UserRole.INSTITUTION,
      label: 'Institution',
      persona: 'Dean Dr. Malhotra (AIIA)',
      icon: Briefcase,
    },
    {
      id: UserRole.ADMIN,
      label: 'Admin',
      persona: 'System Oversight',
      icon: ShieldCheck,
    }
  ];

  return (
    <div className="bg-surface border-b border-border text-foreground px-4 py-1.5 text-xs sticky top-0 z-50 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
        {/* Left Indicator */}
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
          </span>
          <div className="flex items-center gap-1.5 font-medium tracking-tight text-foreground text-xs">
            <Sparkles className="w-3 h-3 text-accent shrink-0" />
            <span className="font-semibold">SIH PS 26044</span>
            <span className="text-foreground-subtle hidden sm:inline">/ Persona Switcher</span>
          </div>
          <span className="hidden md:inline-block text-[11px] text-foreground-subtle border-l border-border pl-2">
            Simulate live stakeholder workflows:
          </span>
        </div>

        {/* Right Segmented Control */}
        <div className="flex items-center gap-1 bg-surface-elevated p-0.5 rounded-md border border-border">
          {roles.map((r) => {
            const Icon = r.icon;
            const isActive = role === r.id;

            return (
              <button
                key={r.id}
                disabled={isLoading}
                onClick={() => switchRole(r.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-[11px] font-medium transition-all duration-150 select-none ${
                  isActive
                    ? 'bg-surface text-foreground border border-border-strong font-semibold shadow-xs'
                    : 'text-foreground-muted hover:text-foreground hover:bg-surface-hover'
                }`}
                title={`Switch persona to ${r.persona}`}
              >
                {isLoading && isActive ? (
                  <Loader2 className="w-3 h-3 animate-spin text-accent" />
                ) : (
                  <Icon className={`w-3 h-3 shrink-0 ${isActive ? 'text-accent' : 'text-foreground-subtle'}`} />
                )}
                <span>{r.label}</span>
                {isActive && (
                  <span className="text-[10px] text-foreground-subtle hidden lg:inline font-normal">
                    ({r.persona.split(' ')[0]})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
