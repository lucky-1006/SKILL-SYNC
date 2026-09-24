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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import {
  Award,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Layers
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';

export default function StudentSkillsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    apiFetch<any>('/skills/student')
      .then((data) => setProfile(data))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto py-2">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      </div>
    );
  }

  const skills: any[] = profile?.skills || [];
  const filteredSkills =
    selectedCategory === 'ALL'
      ? skills
      : skills.filter((s) => s.category === selectedCategory);

  const radarData = skills.slice(0, 6).map((s) => ({
    subject: s.skillName,
    score: s.score,
    fullMark: 100
  }));

  const categories = [
    'ALL',
    'PROGRAMMING',
    'AI_ML',
    'DATA_SCIENCE',
    'AYUSH_HEALTH_TECH',
    'SOFT_SKILLS'
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2 text-foreground">
      {/* 1. Technical Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-foreground-subtle">
            <span>Student</span>
            <span>/</span>
            <span className="text-foreground">Skill Profile</span>
            <span className="text-border">•</span>
            <Badge variant="success" size="sm">
              Level 4 Verified
            </Badge>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
            Student Skill Profile & Verified Competencies
          </h1>
          <p className="text-xs text-foreground-muted max-w-xl">
            Multi-dimensional evaluation backed by university transcripts, faculty endorsements, and timed automated assessments.
          </p>
        </div>

        <div className="px-3 py-2 bg-surface-elevated rounded-md border border-border text-left sm:text-right shrink-0 text-xs font-mono">
          <span className="text-[10px] uppercase text-foreground-subtle block">
            Readiness Index
          </span>
          <span className="text-xl font-bold text-accent">
            {profile?.overallReadinessScore || 82}%
          </span>
        </div>
      </div>

      {/* 2. Visual Analytics: Radar & Bar Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Core Competency Radar */}
        <Card className="p-4 sm:p-5">
          <div className="mb-3">
            <CardTitle>
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>Core Competency Radar</span>
            </CardTitle>
            <CardDescription>
              Balance across software engineering, health informatics, and analytical domains.
            </CardDescription>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--foreground-muted))', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="hsl(var(--border))" />
                <Radar
                  name="Proficiency"
                  dataKey="score"
                  stroke="hsl(var(--accent))"
                  fill="hsl(var(--accent))"
                  fillOpacity={0.2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Bar Chart Proficiency */}
        <Card className="p-4 sm:p-5">
          <div className="mb-3">
            <CardTitle>
              <TrendingUp className="w-3.5 h-3.5 text-accent" />
              <span>Proficiency Benchmarks (%)</span>
            </CardTitle>
            <CardDescription>
              Ranked scores across evaluated technical and domain competencies.
            </CardDescription>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skills.slice(0, 6)} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: 'hsl(var(--foreground-subtle))' }} />
                <YAxis dataKey="skillName" type="category" width={110} tick={{ fontSize: 10, fill: 'hsl(var(--foreground))' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--surface))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '6px',
                    fontSize: '11px',
                    color: 'hsl(var(--foreground))',
                    fontFamily: 'monospace'
                  }}
                />
                <Bar dataKey="score" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* 3. Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-2.5 py-1 rounded-[4px] text-[11px] font-mono whitespace-nowrap transition-all select-none border ${
              selectedCategory === cat
                ? 'bg-surface-elevated text-accent border-accent/40 font-medium'
                : 'bg-surface hover:bg-surface-hover text-foreground-muted border-border'
            }`}
          >
            {cat.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* 4. Skills Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredSkills.map((s) => (
          <Card
            key={s.skillId}
            className="p-3.5 sm:p-4 flex items-center justify-between hover:border-border-strong transition-colors"
          >
            <div className="space-y-1 flex-1 pr-3">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-xs sm:text-sm text-foreground">{s.skillName}</h4>
                {s.verified && (
                  <Badge variant="success" size="sm">
                    <ShieldCheck className="w-3 h-3 mr-0.5" />
                    Verified
                  </Badge>
                )}
              </div>
              <span className="text-[10px] font-mono text-foreground-subtle block">
                {s.category.replace(/_/g, ' ')}
              </span>
              {s.verifiedBy && (
                <p className="text-[11px] text-foreground-muted italic">
                  Endorsed: {s.verifiedBy}
                </p>
              )}
            </div>

            <div className="text-right shrink-0 w-20">
              <span className="text-base font-bold font-mono text-foreground">{s.score}%</span>
              <div className="w-full bg-surface-elevated border border-border rounded-full h-1.5 mt-1 overflow-hidden">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-300"
                  style={{ width: `${s.score}%` }}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
