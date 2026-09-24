'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import {
  Building2,
  Users,
  Briefcase,
  Plus,
  FileCheck2,
  TrendingUp,
  FolderKanban,
  Sparkles,
  ArrowRight,
  X
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { Skeleton } from '@/components/ui/Skeleton';

export default function IndustryDashboard() {
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [showPostModal, setShowPostModal] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [type, setType] = useState<string>('INTERNSHIP');
  const [workMode, setWorkMode] = useState<string>('HYBRID');
  const [stipend, setStipend] = useState<string>('₹30,000 / month');
  const [location, setLocation] = useState<string>('Bengaluru / Hybrid');
  const [duration, setDuration] = useState<string>('6 Months');
  const [openings, setOpenings] = useState<number>(3);
  const [skills, setSkills] = useState<string>('Python, Machine Learning, SQL');
  const [description, setDescription] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    apiFetch<any>('/industry/analytics')
      .then((data) => setAnalytics(data))
      .catch(() => setAnalytics(null))
      .finally(() => setLoading(false));
  }, []);

  const handleCreatePosting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || submitting) return;
    setSubmitting(true);

    try {
      const requiredSkills = skills.split(',').map((s) => ({
        skillName: s.trim(),
        minScore: 65,
        isMandatory: true
      }));

      await apiFetch('/opportunities', {
        method: 'POST',
        body: JSON.stringify({
          title,
          type,
          workMode,
          companyName: 'TCS Bio-IT & Life Sciences R&D',
          stipendOrSalary: stipend,
          location,
          duration,
          openings,
          description: description || 'Exciting role collaborating on healthcare AI data pipelines.',
          requiredSkills
        })
      });

      setShowPostModal(false);
      setTitle('');
      setDescription('');
      alert('Opportunity created successfully! Matching candidates have been notified.');
    } catch (err) {
      console.error('Failed to post opportunity:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto py-2">
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      </div>
    );
  }

  const summary = analytics?.summary;
  const funnelData = analytics?.conversionFunnel || [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2 text-foreground">
      {/* 1. Header with Recruiter Profile & Primary Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-foreground-subtle">
            <span>Industry</span>
            <span>/</span>
            <span className="text-foreground">Recruiter Dashboard</span>
            <span className="text-border">•</span>
            <span className="text-foreground-muted">TCS Bio-IT & Life Sciences</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
            Rajesh Menon
          </h1>
          <p className="text-xs text-foreground-muted max-w-xl">
            Principal Scientist & Campus Hiring Lead • Lead Evaluator for AIIA Health-AI & Bio-Informatics Cohorts
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/industry/candidates">
            <Button variant="secondary" size="sm">
              AI Talent Search
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowPostModal(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Post Opportunity
          </Button>
        </div>
      </div>

      {/* 2. Recruiter High-Density KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatCard
          title="Active Postings"
          value={summary?.totalPostings || 5}
          subtitle="Live on national portal"
          icon={Briefcase}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Applications"
          value={summary?.totalApplicants || 142}
          subtitle="Screened candidates"
          icon={Users}
          trend={{ value: 24, isPositive: true }}
        />
        <StatCard
          title="Avg Candidate Fit"
          value={`${summary?.averageCandidateMatchScore || 87.4}%`}
          subtitle="Skill compatibility"
          icon={Sparkles}
          trend={{ value: 5.2, isPositive: true }}
        />
        <StatCard
          title="Active Interns"
          value={summary?.activeInterns || 24}
          subtitle="Supervised interns"
          icon={FolderKanban}
        />
      </div>

      {/* 3. Conversion Funnel Analytics */}
      <Card className="p-4 sm:p-5 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent" />
              <span>Recruitment Conversion Funnel</span>
            </h3>
            <p className="text-xs text-foreground-muted">
              Pipeline conversion metrics from verified applications to signed internship offers.
            </p>
          </div>
          <Link
            href="/industry/recruitment"
            className="text-xs font-medium text-accent hover:underline flex items-center gap-1"
          >
            <span>Manage Pipeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="h-60 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 25, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--foreground-subtle))' }} />
              <YAxis dataKey="stage" type="category" width={130} tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--surface))',
                  borderRadius: '6px',
                  border: '1px solid hsl(var(--border))',
                  color: 'hsl(var(--foreground))',
                  fontSize: '11px',
                  fontFamily: 'monospace'
                }}
              />
              <Bar dataKey="count" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 4. Quick Access Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <Link
          href="/industry/candidates"
          className="p-4 rounded-lg bg-surface border border-border hover:border-border-strong hover:bg-surface-hover transition-all flex flex-col justify-between space-y-2.5 group"
        >
          <div className="w-8 h-8 rounded-md bg-surface-elevated border border-border flex items-center justify-center shrink-0 text-foreground-subtle group-hover:text-accent transition-colors">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-foreground">
              AI Candidate Talent Sourcing
            </h4>
            <p className="text-xs text-foreground-muted mt-1 leading-relaxed">
              Query 4,000+ candidates with granular filters by verified skill scores, department, and CGPA cutoffs.
            </p>
          </div>
          <span className="text-[11px] font-medium text-accent flex items-center gap-1">
            Search Talent <ArrowRight className="w-3 h-3" />
          </span>
        </Link>

        <Link
          href="/industry/recruitment"
          className="p-4 rounded-lg bg-surface border border-border hover:border-border-strong hover:bg-surface-hover transition-all flex flex-col justify-between space-y-2.5 group"
        >
          <div className="w-8 h-8 rounded-md bg-surface-elevated border border-border flex items-center justify-center shrink-0 text-foreground-subtle group-hover:text-accent transition-colors">
            <FileCheck2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-foreground">
              Recruitment Stage Pipeline
            </h4>
            <p className="text-xs text-foreground-muted mt-1 leading-relaxed">
              Transition candidates across Shortlisted, Google Meet Technical Interview, and Extended Offer states.
            </p>
          </div>
          <span className="text-[11px] font-medium text-accent flex items-center gap-1">
            View Stages <ArrowRight className="w-3 h-3" />
          </span>
        </Link>

        <Link
          href="/student/workspace"
          className="p-4 rounded-lg bg-surface border border-border hover:border-border-strong hover:bg-surface-hover transition-all flex flex-col justify-between space-y-2.5 group"
        >
          <div className="w-8 h-8 rounded-md bg-surface-elevated border border-border flex items-center justify-center shrink-0 text-foreground-subtle group-hover:text-accent transition-colors">
            <FolderKanban className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-foreground">
              Active Intern Oversight
            </h4>
            <p className="text-xs text-foreground-muted mt-1 leading-relaxed">
              Review deliverables, evaluate weekly progress logs, and assign feedback to ongoing student cohorts.
            </p>
          </div>
          <span className="text-[11px] font-medium text-accent flex items-center gap-1">
            Open Workspace <ArrowRight className="w-3 h-3" />
          </span>
        </Link>
      </div>

      {/* Post Opportunity Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreatePosting}
            className="bg-surface rounded-lg max-w-lg w-full p-5 shadow-elevation border border-border space-y-3.5 animate-fade-in text-xs max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-border">
              <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5 text-accent" />
                <span>Post New Opportunity</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowPostModal(false)}
                className="p-1 text-foreground-subtle hover:text-foreground hover:bg-surface-elevated rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-medium text-foreground block mb-1">Role Title:</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. AI Bio-Informatics Research Intern"
                  className="input-base"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-foreground block mb-1">Opportunity Type:</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="input-base"
                  >
                    <option value="INTERNSHIP">Internship</option>
                    <option value="JOB">Full-Time Job</option>
                    <option value="FACULTY_INTERNSHIP">Faculty Sabbatical</option>
                  </select>
                </div>
                <div>
                  <label className="font-medium text-foreground block mb-1">Work Mode:</label>
                  <select
                    value={workMode}
                    onChange={(e) => setWorkMode(e.target.value)}
                    className="input-base"
                  >
                    <option value="REMOTE">Remote</option>
                    <option value="HYBRID">Hybrid</option>
                    <option value="ON_SITE">On-Site</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-foreground block mb-1">Stipend / Salary:</label>
                  <input
                    type="text"
                    value={stipend}
                    onChange={(e) => setStipend(e.target.value)}
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="font-medium text-foreground block mb-1">Location:</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="input-base"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">Required Skills (Comma separated):</label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="Python, Machine Learning, Docker"
                  className="input-base"
                />
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">Description & Deliverables:</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Overview of project milestones and candidate expectations..."
                  className="input-base"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPostModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={submitting}
              >
                {submitting ? 'Publishing...' : 'Publish Listing'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
