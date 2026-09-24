'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@skillsync/shared';
import {
  LayoutDashboard,
  CheckSquare,
  BarChart3,
  TrendingUp,
  MapPin,
  Briefcase,
  FileCheck2,
  FolderKanban,
  Award,
  Bot,
  School,
  Building2,
  Users,
  Search,
  PlusCircle,
  Database,
  Sparkles,
  Layers,
  Server,
  ExternalLink
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface NavSection {
  title?: string;
  items: {
    href: string;
    label: string;
    icon: any;
    isAi?: boolean;
    badge?: string;
  }[];
}

export function Sidebar() {
  const pathname = usePathname();
  const { role } = useAuth();

  const getNavSections = (): NavSection[] => {
    switch (role) {
      case UserRole.ACADEMICIAN:
        return [
          {
            title: 'Overview',
            items: [
              { href: '/academician/dashboard', label: 'Faculty Dashboard', icon: LayoutDashboard },
            ]
          },
          {
            title: 'Opportunities',
            items: [
              { href: '/student/internships?type=FACULTY_INTERNSHIP', label: 'Faculty Internships', icon: Briefcase },
              { href: '/student/internships?type=FDP', label: 'FDPs & Bootcamps', icon: School },
            ]
          },
          {
            title: 'Collaboration',
            items: [
              { href: '/collaborations', label: 'Research Proposals', icon: Layers },
              { href: '/collaborations', label: 'Student Mentorship', icon: Users },
            ]
          }
        ];
      case UserRole.INDUSTRY:
        return [
          {
            title: 'Overview',
            items: [
              { href: '/industry/dashboard', label: 'Recruiter Dashboard', icon: LayoutDashboard },
            ]
          },
          {
            title: 'Talent & Hiring',
            items: [
              { href: '/industry/candidates', label: 'AI Talent Search', icon: Search, isAi: true },
              { href: '/industry/recruitment', label: 'Candidate Pipeline', icon: FileCheck2 },
              { href: '/industry/dashboard#post', label: 'Post Opportunity', icon: PlusCircle },
              { href: '/student/workspace', label: 'Interns Workspace', icon: FolderKanban },
            ]
          },
          {
            title: 'Ecosystem',
            items: [
              { href: '/collaborations', label: 'Innovation Challenges', icon: Sparkles },
            ]
          }
        ];
      case UserRole.INSTITUTION:
      case UserRole.ADMIN:
        return [
          {
            title: 'Overview',
            items: [
              { href: '/institution/dashboard', label: 'Institution Overview', icon: LayoutDashboard },
              { href: '/institution/analytics', label: 'Skill Gap Analytics', icon: BarChart3 },
            ]
          },
          {
            title: 'System & Verification',
            items: [
              { href: '/admin/sync', label: 'Provider Sync Engine', icon: Server },
              { href: '/institution/dashboard#erp', label: 'University ERP Sync', icon: Database },
              { href: '/student/portfolio', label: 'Credential Audit', icon: Award },
              { href: '/collaborations', label: 'Industry MoUs', icon: Building2 },
            ]
          }
        ];

      case UserRole.STUDENT:
      default:
        return [
          {
            title: 'Overview',
            items: [
              { href: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
            ]
          },
          {
            title: 'Skill Development',
            items: [
              { href: '/student/skills', label: 'Skill Profile & Radar', icon: BarChart3 },
              { href: '/student/skill-gaps', label: 'Skill Gap Engine', icon: TrendingUp },
              { href: '/student/assessments', label: 'Assessments', icon: CheckSquare },
              { href: '/student/career', label: 'Career Roadmap', icon: MapPin },
            ]
          },
          {
            title: 'Opportunities & Work',
            items: [
              { href: '/student/internships', label: 'Internships & Jobs', icon: Briefcase, badge: '92%' },
              { href: '/student/workspace', label: 'Milestone Workspace', icon: FolderKanban },
              { href: '/student/applications', label: 'Applications', icon: FileCheck2 },
              { href: '/student/portfolio', label: 'Digital Credentials', icon: Award },
              { href: '/student/ai-assistant', label: 'AI Career Counselor', icon: Bot, isAi: true },
            ]
          }
        ];
    }
  };

  const sections = getNavSections();

  return (
    <aside className="w-60 shrink-0 hidden md:flex flex-col justify-between bg-surface border-r border-border min-h-[calc(100vh-85px)] p-3 select-none text-xs">
      <div className="space-y-4">
        {/* Workspace Context Tag */}
        <div className="px-2.5 py-1.5 rounded-md bg-surface-elevated border border-border flex items-center justify-between">
          <span className="text-[11px] font-medium text-foreground-muted capitalize">
            {role?.toLowerCase()} workspace
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
        </div>

        {/* Categorized Nav Sections */}
        <div className="space-y-4">
          {sections.map((sec, idx) => (
            <div key={sec.title || idx} className="space-y-1">
              {sec.title && (
                <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-foreground-subtle">
                  {sec.title}
                </div>
              )}
              <nav className="space-y-0.5">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/student/dashboard' &&
                     item.href !== '/academician/dashboard' &&
                     item.href !== '/industry/dashboard' &&
                     item.href !== '/institution/dashboard' &&
                     pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-md font-medium transition-all duration-150 group ${
                        isActive
                          ? 'bg-surface-elevated text-accent border border-border shadow-xs'
                          : 'text-foreground-muted hover:bg-surface-hover hover:text-foreground border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive ? 'text-accent' : 'text-foreground-subtle group-hover:text-foreground'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-accent/10 text-accent border border-accent/20">
                          {item.badge}
                        </span>
                      )}
                      {item.isAi && !isActive && (
                        <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-surface-elevated text-foreground-subtle border border-border">
                          AI
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info Box */}
      <div className="pt-4 space-y-2 border-t border-border">
        <Link
          href="/collaborations"
          className="flex items-center justify-between p-2.5 rounded-md bg-surface-elevated hover:bg-surface-hover border border-border text-[11px] text-foreground-muted group transition-all"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span className="group-hover:text-foreground">Collaboration Hub</span>
          </div>
          <ExternalLink className="w-3 h-3 text-foreground-subtle group-hover:text-foreground" />
        </Link>

        <div className="px-1 text-[10px] text-foreground-subtle font-mono flex items-center justify-between">
          <span>SIH 2026 PS 26044</span>
          <span>v2.0</span>
        </div>
      </div>
    </aside>
  );
}
