'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import {
  FileCheck2,
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  AlertCircle,
  Building2,
  Users,
  X,
  ArrowRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function RecruitmentPipelinePage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [interviewDate, setInterviewDate] = useState<string>('2026-09-26 15:00 IST');
  const [meetingLink, setMeetingLink] = useState<string>('https://meet.google.com/xyz-skillsync-interview');
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<any[]>('/applications/industry');
      setApplications(data || []);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appId: string, newStatus: string) => {
    try {
      await apiFetch(`/applications/${appId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      fetchApplications();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleConfirmSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    try {
      await apiFetch(`/applications/${selectedApp.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'INTERVIEW_SCHEDULED',
          interviewDate,
          interviewMeetingLink: meetingLink
        })
      });

      setShowScheduleModal(false);
      setSelectedApp(null);
      fetchApplications();
    } catch (err) {
      console.error('Failed to schedule interview:', err);
    }
  };

  const columns = [
    { id: 'APPLIED', title: 'Applications' },
    { id: 'SHORTLISTED', title: 'Shortlisted' },
    { id: 'INTERVIEW_SCHEDULED', title: 'Interviewing' },
    { id: 'ACTIVE_INTERNSHIP', title: 'Placed & Onboarded' }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2 text-foreground">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-foreground-subtle">
            <span>Industry</span>
            <span>/</span>
            <span className="text-foreground">Recruitment Pipeline</span>
            <span className="text-border">•</span>
            <Badge variant="neutral" size="sm">
              Kanban Engine
            </Badge>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
            Candidate Pipeline & Stage Manager
          </h1>
          <p className="text-xs text-foreground-muted max-w-2xl">
            Streamline candidate selection through automated pre-screening, AI compatibility ratings, and interview coordination.
          </p>
        </div>

        <div className="px-3 py-1.5 bg-surface-elevated rounded-md border border-border flex items-center gap-2 shrink-0 self-start md:self-auto text-xs font-mono">
          <Users className="w-3.5 h-3.5 text-accent" />
          <span>Active Pipeline: <strong className="text-foreground">{applications.length} Candidates</strong></span>
        </div>
      </div>

      {/* 2. Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
        {columns.map((col) => {
          const appsInCol = applications.filter((a) => a.status === col.id);
          return (
            <div
              key={col.id}
              className="bg-surface-elevated/40 rounded-lg p-3 border border-border flex flex-col min-h-[500px]"
            >
              <div className="flex items-center justify-between pb-2 border-b border-border mb-2.5">
                <h3 className="font-mono text-[11px] uppercase tracking-wider text-foreground-muted font-medium">
                  {col.title}
                </h3>
                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-surface border border-border text-foreground-subtle">
                  {appsInCol.length}
                </span>
              </div>

              <div className="space-y-2.5 flex-1 overflow-y-auto">
                {appsInCol.length === 0 ? (
                  <div className="text-center py-10 text-xs text-foreground-subtle">
                    No candidates
                  </div>
                ) : (
                  appsInCol.map((app) => (
                    <div
                      key={app.id}
                      className="bg-surface p-3 rounded-md border border-border hover:border-border-strong transition-colors space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground text-xs">{app.candidateName}</span>
                        <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-accent/10 text-accent border border-accent/25">
                          {app.matchPercentage}% Fit
                        </span>
                      </div>

                      <p className="text-[11px] text-foreground-subtle line-clamp-1">
                        {app.candidateBranch} • CGPA: <span className="font-mono text-foreground">{app.candidateCgpa}</span>
                      </p>

                      <div className="text-[11px] text-foreground-subtle">
                        Role: <span className="text-foreground-muted">{app.opportunityTitle}</span>
                      </div>

                      {app.interviewDate && (
                        <div className="p-2 bg-surface-elevated rounded border border-border text-[10px] text-foreground-muted flex items-center gap-1.5 font-mono">
                          <Calendar className="w-3 h-3 text-accent shrink-0" />
                          <span className="truncate">{app.interviewDate}</span>
                        </div>
                      )}

                      {/* Stage advancement actions */}
                      <div className="pt-2 border-t border-border flex flex-col gap-1">
                        {col.id === 'APPLIED' && (
                          <button
                            onClick={() => handleUpdateStatus(app.id, 'SHORTLISTED')}
                            className="w-full py-1 px-2 rounded bg-surface-elevated hover:bg-surface-hover text-foreground text-[11px] font-medium transition-colors border border-border flex items-center justify-center gap-1"
                          >
                            <span>Shortlist Candidate</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                        {col.id === 'SHORTLISTED' && (
                          <button
                            onClick={() => {
                              setSelectedApp(app);
                              setShowScheduleModal(true);
                            }}
                            className="w-full py-1 px-2 rounded bg-accent/10 hover:bg-accent/20 text-accent text-[11px] font-medium transition-colors border border-accent/30 flex items-center justify-center gap-1"
                          >
                            <Calendar className="w-3 h-3" />
                            <span>Schedule Interview</span>
                          </button>
                        )}
                        {col.id === 'INTERVIEW_SCHEDULED' && (
                          <button
                            onClick={() => handleUpdateStatus(app.id, 'ACTIVE_INTERNSHIP')}
                            className="w-full py-1 px-2 rounded bg-accent text-background hover:bg-accent-hover text-[11px] font-medium transition-colors flex items-center justify-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Extend Offer</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Schedule Interview Modal */}
      {showScheduleModal && selectedApp && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmSchedule}
            className="bg-surface rounded-lg max-w-md w-full p-5 shadow-elevation border border-border space-y-3.5 animate-fade-in text-xs"
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-border">
              <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-accent" />
                <span>Schedule Technical Interview</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="p-1 text-foreground-subtle hover:text-foreground hover:bg-surface-elevated rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-2.5 bg-surface-elevated rounded-md border border-border text-xs">
              <p className="text-foreground">
                Candidate: <strong className="font-medium">{selectedApp.candidateName}</strong>
              </p>
              <p className="text-[11px] text-foreground-subtle mt-0.5">Target: {selectedApp.opportunityTitle}</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-medium text-foreground block mb-1">
                  Interview Date & Time:
                </label>
                <input
                  type="text"
                  required
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="input-base"
                />
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">
                  Meeting Link:
                </label>
                <input
                  type="url"
                  required
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="input-base"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowScheduleModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
              >
                Confirm & Invite
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
