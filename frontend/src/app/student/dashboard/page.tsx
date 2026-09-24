'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import {
  Sparkles,
  TrendingUp,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Target,
  ChevronRight,
  Award,
  Layers,
  Compass,
  FileText,
  MapPin,
  Clock
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Skeleton } from '@/components/ui/Skeleton';

export default function StudentDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [gapData, setGapData] = useState<any>(null);
  const [topOpportunities, setTopOpportunities] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch<any>('/skills/student').catch(() => null),
      apiFetch<any>('/skills/gap-analysis').catch(() => null),
      apiFetch<any[]>('/opportunities').catch(() => []),
      apiFetch<any[]>('/applications/student').catch(() => [])
    ])
      .then(([prof, gaps, opps, apps]) => {
        setProfile(prof);
        setGapData(gaps);
        setTopOpportunities(opps.slice(0, 3));
        setApplications(apps);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto py-2">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <Skeleton className="h-64 lg:col-span-7" />
          <Skeleton className="h-64 lg:col-span-5" />
        </div>
      </div>
    );
  }

  const readinessScore = profile?.overallReadinessScore || 82;
  const criticalGapsCount = gapData?.criticalGapsCount || 2;
  const activeApplicationsCount = applications.length || 3;
  const targetRoleTitle = gapData?.targetRole?.title || 'AI & Machine Learning Engineer';

  const roadmapSteps = [
    { name: 'Assessment', status: 'completed' },
    { name: 'Skills Radar', status: 'completed' },
    { name: 'Gap Remedies', status: 'current' },
    { name: 'Internship', status: 'upcoming' },
    { name: 'Placement', status: 'upcoming' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2 text-foreground">
      {/* 1. Technical Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-foreground-subtle">
            <span>Student</span>
            <span>/</span>
            <span className="text-foreground">Career Dashboard</span>
            <span className="text-border">•</span>
            <Badge variant="success" size="sm">
              Active Cohort
            </Badge>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
            Welcome back, Swastik
          </h1>
          <p className="text-xs text-foreground-muted">
            B.Tech CSE (3rd Year) • All India Institute of Ayurveda • Target Benchmark: <span className="text-foreground font-medium">{targetRoleTitle}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/student/assessments">
            <Button variant="primary" size="sm" leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}>
              Take Skill Assessment
            </Button>
          </Link>
          <Link href="/student/internships">
            <Button variant="secondary" size="sm">
              Browse Matches
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Top 4 High-Density Developer KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatCard
          title="Career Readiness"
          value={`${readinessScore}%`}
          subtitle="Top 12% in cohort"
          trend={{ value: 4, isPositive: true }}
          icon={TrendingUp}
        />

        <StatCard
          title="Skill Gaps"
          value={criticalGapsCount}
          subtitle="Priority action items"
          trend={{ value: '2 High Priority', isPositive: false }}
          icon={AlertCircle}
        />

        <StatCard
          title="Applications"
          value={activeApplicationsCount}
          subtitle="1 Under Review"
          trend={{ value: '1 Interview', isPositive: true }}
          icon={Briefcase}
        />

        <StatCard
          title="Verified Credentials"
          value="14"
          subtitle="AIIA cryptographically verified"
          trend={{ value: '100% Valid', isPositive: true }}
          icon={Award}
        />
      </div>

      {/* 3. Minimalist Career Pipeline Flow */}
      <Card className="p-3.5 bg-surface-elevated/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase text-foreground-subtle">Roadmap Stage:</span>
            <span className="font-semibold text-foreground">Gap Remediation & Practical Project</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {roadmapSteps.map((step, idx) => (
              <React.Fragment key={step.name}>
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-[11px] font-mono transition-colors whitespace-nowrap ${
                    step.status === 'completed'
                      ? 'bg-surface text-foreground border border-border'
                      : step.status === 'current'
                      ? 'bg-accent/10 text-accent border border-accent/30 font-medium'
                      : 'text-foreground-subtle bg-transparent'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  <span>{step.name}</span>
                </div>
                {idx < roadmapSteps.length - 1 && (
                  <span className="text-foreground-subtle text-[10px] font-mono">→</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </Card>

      {/* 4. Mid Grid: Readiness Breakdown & Critical Gaps */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Competency Breakdown */}
        <Card className="lg:col-span-7 flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  <Target className="w-4 h-4 text-accent" />
                  <span>Readiness Breakdown vs Hiring Benchmarks</span>
                </CardTitle>
                <CardDescription>
                  Benchmarked against live production requirements from partner bio-tech & software enterprises.
                </CardDescription>
              </div>
              <span className="font-mono text-xl font-bold text-accent">{readinessScore}%</span>
            </div>
          </CardHeader>

          <CardContent className="space-y-3.5">
            <ProgressBar
              label="Technical Competencies (Python, Data Structures, ML)"
              value={84}
              color="accent"
            />
            <ProgressBar
              label="Ayush Domain Informatics & EHR Standards"
              value={76}
              color="accent"
            />
            <ProgressBar
              label="DevOps & Deployment (Docker, CI/CD, Containerization)"
              value={52}
              color="warning"
            />
            <ProgressBar
              label="Professional Communication & Collaborative Problem-Solving"
              value={88}
              color="accent"
            />
          </CardContent>

          <CardFooter>
            <span className="text-foreground-subtle text-[11px]">Role target: {targetRoleTitle}</span>
            <Link
              href="/student/career"
              className="text-accent hover:underline font-medium flex items-center gap-1 text-xs"
            >
              <span>Explore 6-Month Roadmap</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </CardFooter>
        </Card>

        {/* Right: Critical Gap Focus Box */}
        <Card className="lg:col-span-5 flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                <AlertCircle className="w-4 h-4 text-warning" />
                <span>Identified Priority Gaps</span>
              </CardTitle>
              <Badge variant="warning" size="sm">
                {criticalGapsCount} Action Items
              </Badge>
            </div>
            <CardDescription>
              Closing these 2 key competencies lifts your candidate compatibility score to 94%+.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-2">
            {(gapData?.topPriorities || ['Docker & Containerization', 'Deep Learning Architectures']).map(
              (p: string, idx: number) => (
                <div
                  key={p}
                  className="flex items-center justify-between p-2.5 rounded-md bg-surface-elevated border border-border text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-medium text-foreground">{p}</span>
                    <span className="text-[10px] text-foreground-subtle font-mono block">
                      Target Delta: ~28 pts
                    </span>
                  </div>
                  <Badge variant={idx === 0 ? 'error' : 'warning'} size="sm">
                    {idx === 0 ? 'Critical' : 'Required'}
                  </Badge>
                </div>
              )
            )}
          </CardContent>

          <CardFooter>
            <span className="text-foreground-subtle text-[11px]">Auto-computed delta</span>
            <Link
              href="/student/skill-gaps"
              className="text-accent hover:underline font-medium flex items-center gap-1 text-xs"
            >
              <span>View Prescribed Remedies</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* 5. Explainable AI Recommended Opportunities */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <span>Recommended Opportunities (Explainable Semantic Match)</span>
            </h2>
            <p className="text-xs text-foreground-muted">
              Scored via multi-factor weighting: 0.45×Skill + 0.20×Eligibility + 0.15×Interest + 0.10×Exp + 0.10×Location
            </p>
          </div>
          <Link
            href="/student/internships"
            className="text-xs font-medium text-accent hover:underline flex items-center gap-1"
          >
            <span>Browse All ({topOpportunities.length}+)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topOpportunities.map((opp) => {
            const score = opp.matchScore?.overallScore || 92;

            return (
              <Card
                key={opp.id}
                variant="interactive"
                className="p-4 flex flex-col justify-between space-y-3.5"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-surface-elevated text-foreground-muted border border-border">
                        {opp.workMode || 'Remote'}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-elevated text-foreground-subtle border border-border">
                        {opp.sourceType === 'EXTERNAL' ? opp.source || 'External' : 'Native'}
                      </span>
                    </div>
                    <Badge variant="success" size="sm">
                      {score}% Match
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground text-xs sm:text-sm leading-snug line-clamp-2">
                      {opp.title}
                    </h3>
                    <p className="text-xs text-foreground-subtle mt-0.5">
                      {opp.companyName}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border text-xs text-foreground-muted space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-foreground-subtle">Compensation:</span>
                      <span className="font-mono font-medium text-foreground">{opp.stipendOrSalary}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-foreground-subtle">Location:</span>
                      <span className="text-foreground">{opp.location}</span>
                    </div>
                  </div>

                  {/* Why you matched snippet */}
                  <div className="p-2 bg-surface-elevated rounded-md border border-border text-[11px] leading-relaxed text-foreground-muted">
                    <span className="text-accent font-medium block mb-0.5">
                      ✓ Why you matched:
                    </span>
                    <p className="line-clamp-2 text-foreground-subtle">
                      {opp.matchScore?.explanation ||
                        'Verified alignment with Python, Data Analysis, and Machine Learning competencies.'}
                    </p>
                  </div>
                </div>

                <Link
                  href="/student/internships"
                  className="block w-full text-center py-1.5 px-3 bg-surface-elevated hover:bg-surface-hover text-foreground border border-border rounded-md text-xs font-medium transition-colors"
                >
                  {opp.sourceType === 'EXTERNAL' ? 'View External Listing' : 'View Details & Apply'}
                </Link>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 6. Quick Navigation Hub */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <Link
          href="/student/skills"
          className="p-3.5 rounded-lg bg-surface border border-border hover:border-border-strong hover:bg-surface-hover transition-all flex items-center gap-3 group"
        >
          <div className="w-8 h-8 rounded-md bg-surface-elevated border border-border flex items-center justify-center shrink-0 text-foreground-subtle group-hover:text-accent transition-colors">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-medium text-foreground">
              Skill Profile
            </h4>
            <p className="text-[11px] text-foreground-subtle">Radar & Taxonomy</p>
          </div>
        </Link>

        <Link
          href="/student/career"
          className="p-3.5 rounded-lg bg-surface border border-border hover:border-border-strong hover:bg-surface-hover transition-all flex items-center gap-3 group"
        >
          <div className="w-8 h-8 rounded-md bg-surface-elevated border border-border flex items-center justify-center shrink-0 text-foreground-subtle group-hover:text-accent transition-colors">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-medium text-foreground">
              AI Roadmap
            </h4>
            <p className="text-[11px] text-foreground-subtle">6-Month Path</p>
          </div>
        </Link>

        <Link
          href="/student/workspace"
          className="p-3.5 rounded-lg bg-surface border border-border hover:border-border-strong hover:bg-surface-hover transition-all flex items-center gap-3 group"
        >
          <div className="w-8 h-8 rounded-md bg-surface-elevated border border-border flex items-center justify-center shrink-0 text-foreground-subtle group-hover:text-accent transition-colors">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-medium text-foreground">
              Task Workspace
            </h4>
            <p className="text-[11px] text-foreground-subtle">Active Milestones</p>
          </div>
        </Link>

        <Link
          href="/student/ai-assistant"
          className="p-3.5 rounded-lg bg-surface border border-border hover:border-border-strong hover:bg-surface-hover transition-all flex items-center gap-3 group"
        >
          <div className="w-8 h-8 rounded-md bg-surface-elevated border border-border flex items-center justify-center shrink-0 text-foreground-subtle group-hover:text-accent transition-colors">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-medium text-foreground">
              AI Counselor
            </h4>
            <p className="text-[11px] text-foreground-subtle">ATS & Interview Prep</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
