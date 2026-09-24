'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import {
  FileCheck2,
  Calendar,
  Video,
  Building2,
  ArrowRight,
  Sparkles,
  Briefcase
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';

export default function StudentApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    apiFetch<any[]>('/applications/student')
      .then((data) => setApplications(data || []))
      .catch(() => setApplications([]))
      .finally(() => setLoading(false));
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE_INTERNSHIP':
        return <Badge variant="success" size="sm">Active Internship</Badge>;
      case 'INTERVIEW_SCHEDULED':
        return <Badge variant="primary" size="sm">Interview Scheduled</Badge>;
      case 'SHORTLISTED':
        return <Badge variant="ai" size="sm">Shortlisted</Badge>;
      case 'SELECTED':
      case 'OFFER_EXTENDED':
        return <Badge variant="success" size="sm">Offer Extended</Badge>;
      case 'REJECTED':
        return <Badge variant="error" size="sm">Archived</Badge>;
      case 'APPLIED':
      default:
        return <Badge variant="neutral" size="sm">Under Review</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto py-2">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-44 w-full" />
        <Skeleton className="h-44 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2 text-foreground">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-foreground-subtle">
            <span>Student</span>
            <span>/</span>
            <span className="text-foreground">Applications</span>
            <span className="text-border">•</span>
            <Badge variant="neutral" size="sm">
              ATS Tracker
            </Badge>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
            Applications & Interview Progression Tracker
          </h1>
          <p className="text-xs text-foreground-muted max-w-2xl">
            Track real-time candidate status across automated pre-screening, shortlisting, technical rounds, and offer stages.
          </p>
        </div>

        <div className="px-3 py-1.5 bg-surface-elevated rounded-md border border-border flex items-center gap-2 shrink-0 self-start md:self-auto text-xs font-mono">
          <Briefcase className="w-3.5 h-3.5 text-accent" />
          <span>{applications.length} Submissions</span>
        </div>
      </div>

      {applications.length === 0 ? (
        <EmptyState
          title="No applications submitted yet"
          description="Browse vetted industry internships and full-time postings matched to your verified skills profile."
          actionLabel="Explore Matched Opportunities"
          onAction={() => {
            window.location.href = '/student/internships';
          }}
        />
      ) : (
        <div className="space-y-3.5">
          {applications.map((app) => (
            <Card
              key={app.id}
              className="p-4 sm:p-5 space-y-4 hover:border-border-strong transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-foreground-subtle">
                    <span>Ref: {app.id.slice(0, 8)}</span>
                    <span>•</span>
                    <span>SkillSync AIIA</span>
                  </div>
                  <h3 className="font-semibold text-sm sm:text-base text-foreground">{app.opportunityTitle}</h3>
                  <div className="text-xs text-foreground-muted flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-foreground-subtle" />
                    <span>{app.companyName}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <div className="px-2 py-0.5 rounded bg-accent/10 text-accent border border-accent/25 font-mono text-xs font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>{app.matchPercentage}% Compatibility</span>
                  </div>
                  {getStatusBadge(app.status)}
                </div>
              </div>

              {/* Progress Pipeline Visualization */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-xs font-mono">
                {[
                  { stage: 'Stage 1', label: '1. Applied', active: ['APPLIED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'ACTIVE_INTERNSHIP', 'SELECTED', 'OFFER_EXTENDED'].includes(app.status) },
                  { stage: 'Stage 2', label: '2. Shortlisted', active: ['SHORTLISTED', 'INTERVIEW_SCHEDULED', 'ACTIVE_INTERNSHIP', 'SELECTED', 'OFFER_EXTENDED'].includes(app.status) },
                  { stage: 'Stage 3', label: '3. Interview', active: ['INTERVIEW_SCHEDULED', 'ACTIVE_INTERNSHIP', 'SELECTED', 'OFFER_EXTENDED'].includes(app.status) },
                  { stage: 'Stage 4', label: '4. Offer / Placed', active: ['ACTIVE_INTERNSHIP', 'SELECTED', 'OFFER_EXTENDED'].includes(app.status) }
                ].map((st) => (
                  <div
                    key={st.stage}
                    className={`p-2 rounded border text-xs transition-colors ${
                      st.active
                        ? 'bg-surface-elevated text-accent border-accent/30 font-medium'
                        : 'bg-surface text-foreground-subtle border-border'
                    }`}
                  >
                    <span className="text-[10px] text-foreground-subtle block">{st.stage}</span>
                    <span className="text-[11px] mt-0.5 block">{st.label}</span>
                  </div>
                ))}
              </div>

              {/* Interview Box if Scheduled */}
              {app.interviewDate && (
                <div className="p-3 bg-surface-elevated rounded-md border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-accent shrink-0" />
                    <div>
                      <span className="font-medium text-foreground block">Interview Scheduled</span>
                      <span className="text-foreground-muted text-[11px] font-mono">Time: {app.interviewDate}</span>
                    </div>
                  </div>
                  {app.interviewMeetingLink && (
                    <a
                      href={app.interviewMeetingLink}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button size="sm" variant="primary" leftIcon={<Video className="w-3 h-3" />}>
                        Join Meeting
                      </Button>
                    </a>
                  )}
                </div>
              )}

              {/* Active Workspace Banner */}
              {app.status === 'ACTIVE_INTERNSHIP' && (
                <div className="p-3 bg-accent/10 border border-accent/25 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-semibold text-foreground block">Active Internship Workspace Online</span>
                    <span className="text-foreground-muted text-[11px]">
                      Access weekly milestones, task submissions, and supervisor feedback.
                    </span>
                  </div>
                  <Link href="/student/workspace">
                    <Button size="sm" variant="primary" rightIcon={<ArrowRight className="w-3 h-3" />}>
                      Enter Workspace
                    </Button>
                  </Link>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
