'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Building2,
  Mail
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';

export default function CandidateSearchPage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [skillsFilter, setSkillsFilter] = useState<string>('Python, Machine Learning, SQL');
  const [minMatch, setMinMatch] = useState<number>(70);
  const [minCgpa, setMinCgpa] = useState<number>(7.0);
  const [loading, setLoading] = useState<boolean>(true);
  const [shortlisted, setShortlisted] = useState<Record<string, boolean>>({});

  useEffect(() => {
    searchCandidates();
  }, [minMatch, minCgpa]);

  const searchCandidates = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<any[]>(
        `/industry/candidates?skills=${encodeURIComponent(
          skillsFilter
        )}&minMatch=${minMatch}&minCgpa=${minCgpa}`
      );
      setCandidates(data || []);
    } catch (err) {
      console.error('Candidate search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleShortlist = (id: string, name: string) => {
    setShortlisted((prev) => ({ ...prev, [id]: true }));
    alert(`Candidate ${name} has been added to your Shortlisted Pipeline!`);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2 text-foreground">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-foreground-subtle">
            <span>Industry</span>
            <span>/</span>
            <span className="text-foreground">AI Talent Search</span>
            <span className="text-border">•</span>
            <Badge variant="success" size="sm">
              Semantic Sourcing
            </Badge>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
            Candidate Talent Sourcing & Skill Matching
          </h1>
          <p className="text-xs text-foreground-muted max-w-2xl">
            Query university student cohorts filtered by verified assessments, branch, and multi-skill competency ratings.
          </p>
        </div>

        <div className="px-3 py-1.5 bg-surface-elevated rounded-md border border-border flex items-center gap-2.5 shrink-0 self-start md:self-auto text-xs">
          <Users className="w-3.5 h-3.5 text-accent" />
          <span className="font-mono font-medium text-foreground">{candidates.length} Matched</span>
        </div>
      </div>

      {/* 2. Compact Filter Controls */}
      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2 space-y-1">
            <label className="text-xs font-medium text-foreground block">
              Required Target Competencies:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={skillsFilter}
                onChange={(e) => setSkillsFilter(e.target.value)}
                placeholder="Python, Machine Learning, SQL, FHIR Standards"
                className="input-base"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={searchCandidates}
                leftIcon={<Search className="w-3.5 h-3.5" />}
              >
                Search
              </Button>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-foreground-muted">Min Compatibility:</span>
              <span className="font-mono font-semibold text-accent">{minMatch}%+</span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={minMatch}
              onChange={(e) => setMinMatch(Number(e.target.value))}
              className="w-full accent-accent h-1.5 bg-surface-elevated rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-foreground-subtle font-mono">
              <span>50%</span>
              <span>75%</span>
              <span>95%</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 3. Candidates List */}
      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        ) : candidates.length === 0 ? (
          <EmptyState
            title="No candidates meet the criteria"
            description={`Try adjusting the minimum compatibility threshold below ${minMatch}% or using broader skill terms.`}
            actionLabel="Reset Threshold"
            onAction={() => setMinMatch(60)}
          />
        ) : (
          candidates.map((cand) => (
            <Card
              key={cand.id}
              className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 group"
            >
              <div className="space-y-2.5 flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-md bg-surface-elevated border border-border text-foreground font-mono font-bold text-xs flex items-center justify-center shrink-0">
                    {cand.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-sm sm:text-base text-foreground">
                        {cand.name}
                      </h3>
                      <Badge variant="success" size="sm">
                        <ShieldCheck className="w-3 h-3 mr-1" />
                        {cand.verifiedSkillsCount} Verified
                      </Badge>
                    </div>
                    <p className="text-xs text-foreground-subtle mt-0.5">
                      {cand.institutionName} • {cand.branch} • Year {cand.currentYear} • CGPA: <span className="font-mono text-foreground font-medium">{cand.cgpa}</span>
                    </p>
                  </div>
                </div>

                <p className="text-xs text-foreground-muted italic pl-1">
                  "{cand.headline || 'Aspiring AI & Data Engineer'}"
                </p>

                {/* Verified Skills */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-mono uppercase text-foreground-subtle mr-1">
                    Skills:
                  </span>
                  {cand.matchedSkills?.map((ms: any) => (
                    <span
                      key={ms.name}
                      className="px-2 py-0.5 rounded bg-accent/10 text-accent border border-accent/20 text-[11px] font-mono flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {ms.name} ({ms.score}%)
                    </span>
                  ))}
                  {cand.missingSkills?.map((ms: string) => (
                    <span
                      key={ms}
                      className="px-2 py-0.5 rounded bg-surface-elevated text-foreground-subtle border border-border text-[11px] font-mono"
                    >
                      {ms}
                    </span>
                  ))}
                </div>
              </div>

              {/* Match Score & Actions */}
              <div className="flex flex-col items-start md:items-end justify-between gap-3 shrink-0 border-t md:border-t-0 md:border-l border-border pt-3 md:pt-0 md:pl-6">
                <div className="md:text-right">
                  <span className="text-[10px] font-mono uppercase text-foreground-subtle block">
                    AI Match
                  </span>
                  <span className="text-xl sm:text-2xl font-mono font-bold text-accent">
                    {cand.matchPercentage}%
                  </span>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <a
                    href={`mailto:${cand.email}`}
                    className="px-3 py-1.5 bg-surface-elevated hover:bg-surface-hover text-foreground border border-border rounded-md text-xs font-medium transition-colors flex items-center gap-1.5"
                  >
                    <Mail className="w-3 h-3" />
                    Email
                  </a>
                  <Button
                    variant={shortlisted[cand.id] ? 'outline' : 'primary'}
                    size="sm"
                    disabled={shortlisted[cand.id]}
                    onClick={() => handleShortlist(cand.id, cand.name)}
                  >
                    {shortlisted[cand.id] ? 'Shortlisted ✓' : 'Shortlist'}
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
