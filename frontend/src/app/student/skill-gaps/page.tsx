'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import {
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Target,
  ChevronRight,
  Layers,
  BookOpen
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { Skeleton } from '@/components/ui/Skeleton';

export default function SkillGapPage() {
  const [careerRoles, setCareerRoles] = useState<any[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [gapData, setGapData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    apiFetch<any[]>('/career/roles')
      .then((roles) => {
        setCareerRoles(roles || []);
        if (roles && roles.length > 0) {
          setSelectedRoleId(roles[0].id);
          fetchGaps(roles[0].id);
        }
      })
      .catch(() => setLoading(false));
  }, []);

  const fetchGaps = async (roleId: string) => {
    setLoading(true);
    try {
      const data = await apiFetch<any>(`/skills/gap-analysis?roleId=${roleId}`);
      setGapData(data);
    } catch (err) {
      console.error('Failed to fetch gap analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (roleId: string) => {
    setSelectedRoleId(roleId);
    fetchGaps(roleId);
  };

  if (loading && !gapData) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto py-2">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const targetRole = gapData?.targetRole;
  const gaps: any[] = gapData?.gaps || [];
  const readinessPercentage = gapData?.overallReadinessPercentage || 74;
  const criticalGapsCount = gapData?.criticalGapsCount || 0;

  const metSkills = gaps.filter((g) => g.status === 'MET');
  const criticalSkills = gaps.filter((g) => g.status === 'CRITICAL_GAP');
  const minorSkills = gaps.filter((g) => g.status !== 'MET' && g.status !== 'CRITICAL_GAP');

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2 text-foreground">
      {/* 1. Technical Header & Role Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-foreground-subtle">
            <span>Student</span>
            <span>/</span>
            <span className="text-foreground">Skill Gap Engine</span>
            <span className="text-border">•</span>
            <Badge variant="ai" size="sm">
              Deterministic + AI
            </Badge>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
            Skill Gap Analyzer & Industry Benchmarks
          </h1>
          <p className="text-xs text-foreground-muted max-w-xl">
            Compares your verified competencies against industry hiring benchmarks to prescribe actionable learning remedies.
          </p>
        </div>

        <div className="shrink-0 space-y-1">
          <label className="text-[10px] uppercase font-mono text-foreground-subtle block">
            Target Benchmark Role:
          </label>
          <select
            value={selectedRoleId}
            onChange={(e) => handleRoleChange(e.target.value)}
            className="input-base text-xs font-medium"
          >
            {careerRoles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title} ({r.avgSalary})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Top 3 Metric Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Role Readiness"
          value={`${readinessPercentage}%`}
          subtitle="Hiring threshold: 75%+"
          trend={{ value: 'Within Range', isPositive: readinessPercentage >= 75 }}
          icon={Target}
        />

        <StatCard
          title="Critical Gaps"
          value={criticalGapsCount}
          subtitle="Shortfall > 20% vs benchmark"
          trend={{ value: 'Action Required', isPositive: false }}
          icon={AlertCircle}
        />

        <StatCard
          title="Demand Index"
          value={`${targetRole?.industryDemandPercentage || 92}%`}
          subtitle={`Avg: ${targetRole?.avgSalary || '₹10-18 LPA'}`}
          trend={{ value: 'High Growth', isPositive: true }}
          icon={TrendingUp}
        />
      </div>

      {/* 3. Three-column Summary: Strong vs Gaps vs Actionable */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 space-y-2.5">
          <div className="flex items-center justify-between pb-1 border-b border-border">
            <span className="text-xs font-mono font-medium text-accent">Strong Skills</span>
            <span className="font-mono text-[10px] text-foreground-subtle">{metSkills.length} Verified</span>
          </div>
          <div className="space-y-1.5 text-xs">
            {metSkills.map((s) => (
              <div key={s.skillId} className="flex items-center justify-between">
                <span className="text-foreground">✓ {s.skillName}</span>
                <span className="font-mono text-[11px] text-foreground-subtle">{s.studentScore}%</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 space-y-2.5">
          <div className="flex items-center justify-between pb-1 border-b border-border">
            <span className="text-xs font-mono font-medium text-warning">Needs Improvement</span>
            <span className="font-mono text-[10px] text-foreground-subtle">{minorSkills.length} In Progress</span>
          </div>
          <div className="space-y-1.5 text-xs">
            {minorSkills.map((s) => (
              <div key={s.skillId} className="flex items-center justify-between">
                <span className="text-foreground">△ {s.skillName}</span>
                <span className="font-mono text-[11px] text-warning font-medium">-{s.gap}%</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 space-y-2.5">
          <div className="flex items-center justify-between pb-1 border-b border-border">
            <span className="text-xs font-mono font-medium text-destructive">Critical Shortfalls</span>
            <span className="font-mono text-[10px] text-foreground-subtle">{criticalSkills.length} High Priority</span>
          </div>
          <div className="space-y-1.5 text-xs">
            {criticalSkills.map((s) => (
              <div key={s.skillId} className="flex items-center justify-between">
                <span className="text-foreground">○ {s.skillName}</span>
                <span className="font-mono text-[11px] text-destructive font-medium">-{s.gap}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 4. Comprehensive Skill Gaps Breakdown Table */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm text-foreground">
              Competency Shortfall Matrix vs {targetRole?.title}
            </h3>
            <p className="text-xs text-foreground-muted">
              Calculated by delta subtraction from required production hiring threshold.
            </p>
          </div>

          <Link
            href="/student/career"
            className="text-xs font-medium text-accent hover:underline flex items-center gap-1"
          >
            <span>View 6-Month Roadmap</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-border">
          {gaps.map((item) => (
            <div key={item.skillId} className="p-4 hover:bg-surface-hover/50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 max-w-md">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-xs sm:text-sm text-foreground">{item.skillName}</h4>
                    {item.status === 'MET' ? (
                      <Badge variant="success" size="sm">
                        Target Met
                      </Badge>
                    ) : item.status === 'CRITICAL_GAP' ? (
                      <Badge variant="error" size="sm">
                        Critical (-{item.gap}%)
                      </Badge>
                    ) : (
                      <Badge variant="warning" size="sm">
                        Delta (-{item.gap}%)
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-foreground-muted leading-relaxed">
                    {item.recommendedAction}
                  </p>
                </div>

                {/* Score Comparison Bars */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right font-mono">
                    <span className="text-[10px] text-foreground-subtle block">Score</span>
                    <span className="text-sm font-bold text-foreground">{item.studentScore}%</span>
                  </div>

                  <div className="w-28">
                    <div className="flex justify-between text-[10px] text-foreground-subtle mb-1 font-mono">
                      <span>Target</span>
                      <span>{item.requiredScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-surface-elevated border border-border rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          item.status === 'MET' ? 'bg-accent' : 'bg-destructive'
                        }`}
                        style={{ width: `${Math.min(100, item.studentScore)}%` }}
                      />
                    </div>
                  </div>

                  <Link href="/student/assessments">
                    <Button variant="secondary" size="sm">
                      Retest
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
