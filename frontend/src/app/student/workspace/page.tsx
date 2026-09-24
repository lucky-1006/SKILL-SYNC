'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  Send,
  FileText,
  UserCheck,
  Plus,
  X,
  Building2,
  Calendar
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';

export default function InternshipWorkspacePage() {
  const [workspace, setWorkspace] = useState<any | null>(null);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [deliverableUrl, setDeliverableUrl] = useState<string>('');
  const [studentNotes, setStudentNotes] = useState<string>('');
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [reportSummary, setReportSummary] = useState<string>('');
  const [reportHours, setReportHours] = useState<number>(36);
  const [reportLearnings, setReportLearnings] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    fetchWorkspace();
  }, []);

  const fetchWorkspace = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<any>('/workspace/active');
      setWorkspace(data);
    } catch (err) {
      console.error('Failed to load workspace:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskSubmit = async () => {
    if (!selectedTask || submitting) return;
    setSubmitting(true);

    try {
      await apiFetch(`/workspace/tasks/${selectedTask.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'SUBMITTED',
          deliverableUrl,
          studentNotes
        })
      });

      setSelectedTask(null);
      setDeliverableUrl('');
      setStudentNotes('');
      fetchWorkspace();
    } catch (err) {
      console.error('Failed to submit task:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace || submitting) return;
    setSubmitting(true);

    try {
      await apiFetch('/workspace/reports', {
        method: 'POST',
        body: JSON.stringify({
          workspaceId: workspace.id,
          weekNumber: (workspace.weeklyReports?.length || 0) + 1,
          hoursWorked: reportHours,
          summary: reportSummary,
          keyLearnings: reportLearnings.split(',').map((s) => s.trim())
        })
      });

      setShowReportModal(false);
      setReportSummary('');
      setReportLearnings('');
      fetchWorkspace();
    } catch (err) {
      console.error('Failed to submit report:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto py-2">
        <Skeleton className="h-28 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <EmptyState
        title="No Active Internship Workspace"
        description="Workspaces are automatically provisioned once an industry recruiter confirms your selection and maps your corporate supervisor."
        icon={<FolderKanban className="w-6 h-6 text-foreground-subtle" />}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2 text-foreground">
      {/* 1. Header & Workspace Metadata */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-foreground-subtle">
            <span>Student</span>
            <span>/</span>
            <span className="text-foreground">Internship Workspace</span>
            <span className="text-border">•</span>
            <Badge variant="success" size="sm">
              Active Sprint
            </Badge>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
            {workspace.opportunityTitle}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs text-foreground-muted">
            <span className="flex items-center gap-1 text-foreground font-medium">
              <Building2 className="w-3.5 h-3.5 text-accent" />
              {workspace.companyName}
            </span>
            <span className="flex items-center gap-1 text-foreground-subtle">
              <UserCheck className="w-3.5 h-3.5" />
              Supervisor: <span className="text-foreground font-medium ml-1">{workspace.mentorName}</span> ({workspace.mentorEmail})
            </span>
            <span className="text-foreground-subtle flex items-center gap-1 font-mono text-[11px]">
              <Calendar className="w-3.5 h-3.5" />
              {workspace.startDate} — {workspace.endDate}
            </span>
          </div>
        </div>

        <div className="px-4 py-2 bg-surface-elevated rounded-md border border-border text-center shrink-0 min-w-[140px] text-xs font-mono">
          <span className="text-[10px] uppercase text-foreground-subtle block">
            Attendance Rate
          </span>
          <span className="text-xl font-bold text-accent mt-0.5 block">
            {workspace.attendanceRate}%
          </span>
          <span className="text-[10px] text-foreground-subtle block">
            Verified
          </span>
        </div>
      </div>

      {/* 2. Task Milestones Section */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-accent" />
              <span>Project Milestones & Deliverables</span>
            </h2>
            <p className="text-xs text-foreground-muted">
              Structured sprint deliverables assigned by your corporate supervisor. Submit URLs or technical artifacts for evaluation.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {workspace.tasks.map((task: any) => {
            const isApproved = task.status === 'APPROVED';
            const isInProgress = task.status === 'IN_PROGRESS';
            const isSubmitted = task.status === 'SUBMITTED';

            return (
              <Card
                key={task.id}
                className="p-4 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <Badge
                      variant={
                        isApproved
                          ? 'success'
                          : isSubmitted
                          ? 'primary'
                          : isInProgress
                          ? 'warning'
                          : 'neutral'
                      }
                      size="sm"
                    >
                      {task.status.replace(/_/g, ' ')}
                    </Badge>
                    <span className="text-[10px] font-mono text-foreground-subtle flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Due: {task.dueDate}
                    </span>
                  </div>

                  <h3 className="font-semibold text-sm text-foreground leading-snug">
                    {task.title}
                  </h3>
                  <p className="text-xs text-foreground-muted leading-relaxed">{task.description}</p>

                  {task.grade && (
                    <div className="p-2.5 bg-surface-elevated rounded-md border border-border text-xs flex items-center justify-between font-mono">
                      <span className="text-foreground">Grade: <strong className="text-accent">{task.grade}</strong></span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                    </div>
                  )}

                  {task.mentorFeedback && (
                    <div className="p-2.5 bg-surface-elevated rounded-md border border-border text-[11px] text-foreground-muted italic">
                      <span className="font-medium text-foreground not-italic block mb-0.5">Feedback:</span>
                      "{task.mentorFeedback}"
                    </div>
                  )}
                </div>

                {!isApproved && (
                  <Button
                    variant={isSubmitted ? 'outline' : 'primary'}
                    size="sm"
                    onClick={() => setSelectedTask(task)}
                    className="w-full"
                  >
                    {isSubmitted ? 'Update Submission' : 'Submit Deliverable'}
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* 3. Weekly Progress Reports */}
      <Card className="p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-accent" />
              <span>Weekly Progress Logbooks</span>
            </h3>
            <p className="text-xs text-foreground-muted">
              Verified timesheets and activity logs co-signed by corporate and faculty guides.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowReportModal(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Submit Weekly Log
          </Button>
        </div>

        <div className="space-y-3">
          {workspace.weeklyReports.map((r: any) => (
            <div
              key={r.id}
              className="p-3.5 bg-surface-elevated rounded-md border border-border space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Week {r.weekNumber} Activity ({r.hoursWorked}h Logged)
                </span>
                <Badge variant="success" size="sm">
                  Mentor {r.mentorStatus}
                </Badge>
              </div>

              <p className="text-foreground-muted leading-relaxed">{r.summary}</p>

              <div className="flex flex-wrap gap-1 pt-0.5">
                {r.keyLearnings.map((k: string) => (
                  <span
                    key={k}
                    className="px-2 py-0.5 rounded bg-surface text-foreground-subtle text-[11px] font-mono border border-border"
                  >
                    • {k}
                  </span>
                ))}
              </div>

              {r.mentorComments && (
                <div className="p-2.5 bg-surface rounded border border-border text-[11px] text-foreground-muted">
                  <strong className="text-foreground font-medium">Remarks:</strong> {r.mentorComments}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Task Submission Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-lg max-w-lg w-full p-5 space-y-3.5 shadow-elevation border border-border animate-fade-in text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="font-semibold text-sm text-foreground">
                Submit Deliverable: {selectedTask.title}
              </h3>
              <button
                onClick={() => setSelectedTask(null)}
                className="p-1 text-foreground-subtle hover:text-foreground hover:bg-surface-elevated rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-foreground-muted leading-relaxed">{selectedTask.description}</p>

            <div className="space-y-3">
              <div>
                <label className="font-medium text-foreground block mb-1">
                  Deliverable URL (GitHub repo, doc, or cloud artifact):
                </label>
                <input
                  type="url"
                  value={deliverableUrl}
                  onChange={(e) => setDeliverableUrl(e.target.value)}
                  placeholder="https://github.com/organization/project-name"
                  className="input-base"
                />
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">
                  Implementation Summary Notes:
                </label>
                <textarea
                  rows={3}
                  value={studentNotes}
                  onChange={(e) => setStudentNotes(e.target.value)}
                  placeholder="Describe your architecture, test suites, and documentation..."
                  className="input-base"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTask(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={submitting}
                onClick={handleTaskSubmit}
              >
                {submitting ? 'Submitting...' : 'Submit Deliverable'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleReportSubmit}
            className="bg-surface rounded-lg max-w-lg w-full p-5 space-y-3.5 shadow-elevation border border-border animate-fade-in text-xs"
          >
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="font-semibold text-sm text-foreground">
                Submit Weekly Progress Log
              </h3>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="p-1 text-foreground-subtle hover:text-foreground hover:bg-surface-elevated rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-medium text-foreground block mb-1">
                  Hours Worked This Week:
                </label>
                <input
                  type="number"
                  value={reportHours}
                  onChange={(e) => setReportHours(Number(e.target.value))}
                  className="input-base"
                />
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">
                  Summary of Completed Deliverables:
                </label>
                <textarea
                  rows={3}
                  required
                  value={reportSummary}
                  onChange={(e) => setReportSummary(e.target.value)}
                  placeholder="Summarize tasks completed, merged pull requests, and benchmarks verified..."
                  className="input-base"
                />
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">
                  Key Learnings (comma separated):
                </label>
                <input
                  type="text"
                  value={reportLearnings}
                  onChange={(e) => setReportLearnings(e.target.value)}
                  placeholder="Vector embeddings, FHIR standards, PyTorch"
                  className="input-base"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => setShowReportModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Log'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
