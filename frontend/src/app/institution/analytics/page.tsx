'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  AlertCircle,
  Sparkles,
  Building2,
  Users,
  GraduationCap
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

export default function InstitutionAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    apiFetch<any>('/institution/analytics')
      .then((data) => setAnalytics(data))
      .catch(() => setAnalytics(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto py-2">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-72 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  const deptData = analytics?.departmentReadiness || [];
  const skillGaps = analytics?.mostCommonSkillGaps || [];
  const demandTrends = analytics?.inDemandIndustrySkills || [];
  const funnelData = analytics?.monthlyPlacementFunnel || [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2 text-foreground">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-foreground-subtle">
            <span>Institution</span>
            <span>/</span>
            <span className="text-foreground">Skill Gap Analytics</span>
            <span className="text-border">•</span>
            <Badge variant="neutral" size="sm">
              Cross-Department Telemetry
            </Badge>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
            Curricular Gap Analytics & Market Demand Trends
          </h1>
          <p className="text-xs text-foreground-muted max-w-2xl">
            Granular telemetry comparing branch readiness against nationwide employer demand vectors and curriculum shortfalls.
          </p>
        </div>

        <div className="px-3 py-1.5 bg-surface-elevated rounded-md border border-border flex items-center gap-2 shrink-0 self-start md:self-auto text-xs font-mono">
          <GraduationCap className="w-3.5 h-3.5 text-accent" />
          <span>Audited: <strong className="text-foreground">{deptData.length} Departments</strong></span>
        </div>
      </div>

      {/* 2. Department Readiness Comparison Chart */}
      <Card className="p-4 sm:p-5 space-y-3.5">
        <div>
          <h3 className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-accent" />
            <span>Department Readiness & Placement Rates (%)</span>
          </h3>
          <p className="text-xs text-foreground-muted">
            Comparative student readiness indices vs final placement conversion across university branches.
          </p>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deptData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="department" tick={{ fontSize: 10, fill: 'hsl(var(--foreground-subtle))' }} interval={0} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'hsl(var(--foreground-subtle))' }} />
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
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: '8px' }} />
              <Bar dataKey="avgReadinessScore" name="Avg Readiness Score (%)" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="placementRate" name="Placement Rate (%)" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 3. Two-Column Analytics: Skill Gaps & Industry Demand */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Most Common Skill Gaps */}
        <Card className="p-4 sm:p-5 space-y-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-destructive">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Curricular Gaps</span>
            </div>
            <h4 className="font-semibold text-sm sm:text-base text-foreground mt-0.5">
              Top Competency Shortfalls
            </h4>
            <p className="text-xs text-foreground-muted">
              Key areas where students show the highest shortfall against industry hiring benchmarks.
            </p>
          </div>

          <div className="space-y-2.5 pt-1">
            {skillGaps.map((gap: any) => (
              <div key={gap.skillName} className="p-3 bg-surface-elevated rounded-md border border-border text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">{gap.skillName}</span>
                  <span className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-destructive/10 text-destructive border border-destructive/25 font-semibold">
                    {gap.percentageGap}% Gap
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-foreground-subtle font-mono">
                  <span>Avg: {gap.studentAverageScore}%</span>
                  <span>Target: {gap.industryBenchmark}%</span>
                  <span>Impacted: {gap.affectedStudentsCount}</span>
                </div>
                <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden border border-border">
                  <div
                    className="h-full bg-destructive rounded-full"
                    style={{ width: `${gap.percentageGap}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Industry Demand Intelligence */}
        <Card className="p-4 sm:p-5 space-y-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-accent">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Market Signals</span>
            </div>
            <h4 className="font-semibold text-sm sm:text-base text-foreground mt-0.5">
              In-Demand Industry Skills
            </h4>
            <p className="text-xs text-foreground-muted">
              Extracted from corporate opportunity requisitions and hiring postings.
            </p>
          </div>

          <div className="space-y-2.5 pt-1">
            {demandTrends.map((trend: any) => (
              <div key={trend.skillName} className="p-3 bg-surface-elevated rounded-md border border-border text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">{trend.skillName}</span>
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="text-accent text-[10px] bg-accent/10 px-1.5 py-0.2 rounded border border-accent/20">
                      +{trend.growthQuarterOverQuarter}% QoQ
                    </span>
                    <span className="text-foreground-muted text-[10px] px-1.5 py-0.2 rounded bg-surface border border-border">
                      {trend.demandPercentage}% Demand
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {trend.primaryRoles.map((role: string) => (
                    <span
                      key={role}
                      className="px-1.5 py-0.2 rounded bg-surface border border-border text-foreground-subtle text-[10px]"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 4. Monthly Placement Progression Chart */}
      <Card className="p-4 sm:p-5 space-y-3.5">
        <div>
          <h3 className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent" />
            <span>Monthly Placement Progression Funnel</span>
          </h3>
          <p className="text-xs text-foreground-muted">
            Tracking application volume, shortlisting ratios, interviews conducted, and final offer acceptances.
          </p>
        </div>

        <div className="h-60 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={funnelData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--foreground-subtle))' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--foreground-subtle))' }} />
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
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: '8px' }} />
              <Line type="monotone" dataKey="applications" name="Applications" stroke="hsl(var(--foreground-subtle))" strokeWidth={1.5} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="shortlisted" name="Shortlisted" stroke="#60a5fa" strokeWidth={1.5} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="interviews" name="Interviews" stroke="#818cf8" strokeWidth={1.5} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="offers" name="Offers Accepted" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
