'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import {
  CheckCircle2,
  BookOpen,
  Award,
  ArrowRight,
  Compass
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';

export default function CareerRoadmapPage() {
  const [careerRoles, setCareerRoles] = useState<any[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [roadmap, setRoadmap] = useState<any | null>(null);
  const [completedMonths, setCompletedMonths] = useState<Record<number, boolean>>({
    1: true,
    2: true
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    apiFetch<any[]>('/career/roles')
      .then((roles) => {
        setCareerRoles(roles || []);
        if (roles && roles.length > 0) {
          setSelectedRoleId(roles[0].id);
          fetchRoadmap(roles[0].id);
        }
      })
      .catch(() => setLoading(false));
  }, []);

  const fetchRoadmap = async (roleId: string) => {
    setLoading(true);
    try {
      const data = await apiFetch<any>(`/career/roadmap/${roleId}`);
      setRoadmap(data);
    } catch (err) {
      console.error('Failed to fetch roadmap:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (roleId: string) => {
    setSelectedRoleId(roleId);
    fetchRoadmap(roleId);
  };

  const toggleMonth = (monthNum: number) => {
    setCompletedMonths((prev) => ({
      ...prev,
      [monthNum]: !prev[monthNum]
    }));
  };

  if (loading && !roadmap) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto py-2">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-44 w-full" />
        <Skeleton className="h-44 w-full" />
      </div>
    );
  }

  const months: any[] = roadmap?.months || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2 text-foreground">
      {/* 1. Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-foreground-subtle">
            <span>Student</span>
            <span>/</span>
            <span className="text-foreground">Career Roadmap</span>
            <span className="text-border">•</span>
            <Badge variant="ai" size="sm">
              6-Month Synthesis
            </Badge>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
            Personalized Career Learning Roadmap
          </h1>
          <p className="text-xs text-foreground-muted max-w-xl">
            Customized milestone sequence with verified courses, practical deliverables, and technical evaluations.
          </p>
        </div>

        <div className="shrink-0 space-y-1">
          <label className="text-[10px] uppercase font-mono text-foreground-subtle block">
            Target Career Path:
          </label>
          <select
            value={selectedRoleId}
            onChange={(e) => handleRoleChange(e.target.value)}
            className="input-base text-xs font-medium"
          >
            {careerRoles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Month-by-Month Minimalist Timeline */}
      <div className="space-y-4 relative before:absolute before:inset-0 before:left-4 before:w-px before:bg-border">
        {months.map((m) => {
          const isDone = completedMonths[m.monthNumber];

          return (
            <div key={m.monthNumber} className="relative flex items-start gap-4 group">
              {/* Step indicator */}
              <button
                onClick={() => toggleMonth(m.monthNumber)}
                className={`w-8 h-8 rounded-md flex items-center justify-center font-mono font-medium text-xs shrink-0 z-10 transition-colors border ${
                  isDone
                    ? 'bg-accent/10 text-accent border-accent/40'
                    : 'bg-surface text-foreground-muted border-border hover:border-border-strong hover:text-foreground'
                }`}
                title="Toggle milestone completion"
              >
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : `M${m.monthNumber}`}
              </button>

              {/* Month Content Card */}
              <Card className="flex-1 p-4 sm:p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-elevated text-foreground-muted border border-border">
                      Month {m.monthNumber} • {m.focusArea}
                    </span>
                    <h3 className="font-semibold text-sm sm:text-base text-foreground mt-1">{m.title}</h3>
                  </div>
                  <Badge variant={isDone ? 'success' : 'neutral'} size="sm">
                    {isDone ? 'Completed' : 'In Progress'}
                  </Badge>
                </div>

                {/* Skills to acquire */}
                <div className="flex flex-wrap gap-1">
                  {m.skillsToAcquire.map((skill: string) => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 rounded bg-surface-elevated text-foreground-subtle border border-border text-[11px] font-mono"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Courses & Deliverables */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                  {/* Courses */}
                  <div className="p-3 bg-surface-elevated rounded-md border border-border space-y-1.5">
                    <span className="font-medium text-foreground flex items-center gap-1.5 text-xs">
                      <BookOpen className="w-3.5 h-3.5 text-accent" />
                      <span>Curated Learning Units</span>
                    </span>
                    <ul className="space-y-1 text-foreground-muted text-[11px]">
                      {m.recommendedCourses?.map((c: any, i: number) => {
                        const title = typeof c === 'string' ? c : (c.title || c.name || 'Course');
                        const provider = typeof c === 'object' ? (c.provider || c.platform) : null;
                        const duration = typeof c === 'object' ? c.duration : null;

                        return (
                          <li key={i} className="flex items-center justify-between gap-2">
                            <span className="truncate max-w-[200px]" title={title}>
                              {title}
                            </span>
                            <div className="flex items-center gap-1 shrink-0 font-mono text-[10px]">
                              {provider && (
                                <span className="text-foreground-subtle px-1 py-0.2 bg-surface rounded border border-border">
                                  {provider}
                                </span>
                              )}
                              {duration && (
                                <span className="text-accent px-1 py-0.2 bg-accent/10 rounded">
                                  {duration}
                                </span>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Practical Deliverable */}
                  <div className="p-3 bg-surface-elevated rounded-md border border-border space-y-1.5">
                    <span className="font-medium text-foreground flex items-center gap-1.5 text-xs">
                      <Award className="w-3.5 h-3.5 text-accent" />
                      <span>Practical Deliverable</span>
                    </span>
                    <div className="text-foreground-muted text-[11px] leading-relaxed">
                      {typeof m.practicalProject === 'object' && m.practicalProject !== null ? (
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">{m.practicalProject.title}</p>
                          <p className="text-foreground-subtle text-[11px]">{m.practicalProject.description}</p>
                          {Array.isArray(m.practicalProject.deliverables) && (
                            <div className="flex flex-wrap gap-1 mt-1 font-mono text-[10px]">
                              {m.practicalProject.deliverables.map((del: string, di: number) => (
                                <span key={di} className="px-1.5 py-0.2 bg-surface text-accent border border-border rounded">
                                  ✓ {del}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p>{typeof m.projectDeliverable === 'string' ? m.projectDeliverable : 'Complete hands-on containerized workflow and push to verified portfolio.'}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Milestone Evaluation Link */}
                <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-foreground-subtle text-[11px]">Evaluation Milestone:</span>
                  <Link
                    href="/student/assessments"
                    className="font-medium text-accent hover:underline flex items-center gap-1 text-xs"
                  >
                    <span>Take Month {m.monthNumber} Assessment</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
