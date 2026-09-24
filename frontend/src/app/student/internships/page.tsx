'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import {
  Briefcase,
  Sparkles,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Building2,
  X,
  Check,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  BookOpen,
  ArrowRight,
  Layers,
  Globe2,
  Send
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';

export default function InternshipsPage() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [selectedOpp, setSelectedOpp] = useState<any | null>(null);
  const [gapModalOpp, setGapModalOpp] = useState<any | null>(null);
  const [gapDetails, setGapDetails] = useState<any | null>(null);
  const [gapLoading, setGapLoading] = useState<boolean>(false);
  const [applyModalOpp, setApplyModalOpp] = useState<any | null>(null);
  const [applyNote, setApplyNote] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [applySuccess, setApplySuccess] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [workModeFilter, setWorkModeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchOpportunities();
  }, [typeFilter, sourceFilter, workModeFilter]);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter === 'SAVED') {
        params.set('savedOnly', 'true');
      } else if (typeFilter !== 'ALL') {
        params.set('type', typeFilter);
      }

      if (sourceFilter !== 'ALL') {
        params.set('sourceType', sourceFilter);
      }

      if (workModeFilter !== 'ALL') {
        params.set('workMode', workModeFilter);
      }

      const endpoint = `/opportunities${params.toString() ? `?${params.toString()}` : ''}`;
      const data = await apiFetch<any[]>(endpoint);
      setOpportunities(data || []);
    } catch (err) {
      console.error('Failed to fetch opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async (opp: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const isCurrentlySaved = opp.isSaved;

    setOpportunities((prev) =>
      prev.map((o) => (o.id === opp.id ? { ...o, isSaved: !isCurrentlySaved } : o))
    );

    try {
      if (isCurrentlySaved) {
        await apiFetch(`/opportunities/${opp.id}/save`, { method: 'DELETE' });
      } else {
        await apiFetch(`/opportunities/${opp.id}/save`, { method: 'POST' });
      }
    } catch (err) {
      console.error('Failed to toggle save opportunity:', err);
      setOpportunities((prev) =>
        prev.map((o) => (o.id === opp.id ? { ...o, isSaved: isCurrentlySaved } : o))
      );
    }
  };

  const handleOpenSkillGap = async (opp: any) => {
    setGapModalOpp(opp);
    setGapLoading(true);
    try {
      const data = await apiFetch<any>(`/opportunities/${opp.id}/skill-gap`);
      setGapDetails(data);
    } catch (err) {
      console.error('Failed to load skill gap report:', err);
    } finally {
      setGapLoading(false);
    }
  };

  const handleApply = async () => {
    if (!applyModalOpp || submitting) return;
    setSubmitting(true);

    try {
      await apiFetch('/applications', {
        method: 'POST',
        body: JSON.stringify({
          opportunityId: applyModalOpp.id,
          notes: applyNote,
          matchPercentage: applyModalOpp.matchScore?.overallScore || 85.0,
          matchExplanation: applyModalOpp.matchScore
        })
      });

      setApplySuccess(applyModalOpp.title);
      setApplyModalOpp(null);
      setApplyNote('');
    } catch (err: any) {
      alert(err.message || 'Application failed');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = opportunities.filter((opp) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      opp.title.toLowerCase().includes(q) ||
      opp.companyName.toLowerCase().includes(q) ||
      opp.description.toLowerCase().includes(q) ||
      (opp.normalizedSkills || []).some((s: string) => s.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2 text-foreground">
      {/* 1. Technical Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-foreground-subtle">
            <span>Student</span>
            <span>/</span>
            <span className="text-foreground">Opportunities</span>
            <span className="text-border">•</span>
            <Badge variant="success" size="sm">
              Semantic Matching
            </Badge>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
            Internships, Jobs & Skill Mapping
          </h1>
          <p className="text-xs text-foreground-muted max-w-2xl">
            Discover verified openings matched against your profile with explainable multi-factor scoring and targeted remedies.
          </p>
        </div>

        <div className="px-3 py-1.5 bg-surface-elevated rounded-md border border-border flex items-center gap-2 shrink-0 self-start md:self-auto text-xs font-mono">
          <Briefcase className="w-3.5 h-3.5 text-accent" />
          <span>{opportunities.length} Available Listings</span>
        </div>
      </div>

      {/* 2. Success Alert */}
      {applySuccess && (
        <div className="p-3 rounded-md bg-accent/10 border border-accent/25 flex items-center justify-between text-xs animate-fade-in font-mono">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-accent shrink-0" />
            <span>Application submitted for <strong className="font-semibold text-foreground">{applySuccess}</strong></span>
          </div>
          <button
            onClick={() => setApplySuccess(null)}
            className="text-foreground-subtle hover:text-foreground font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 3. Search & Filter Bar */}
      <Card className="p-4 space-y-3">
        {/* Type Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-border pb-3">
          {[
            { id: 'ALL', label: 'All Listings', icon: Layers },
            { id: 'INTERNSHIP', label: 'Internships', icon: Briefcase },
            { id: 'JOB', label: 'Jobs', icon: Globe2 },
            { id: 'COURSE', label: 'Courses & Training', icon: BookOpen },
            { id: 'SAVED', label: 'Saved Bookmarks', icon: Bookmark }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = typeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setTypeFilter(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-[4px] text-xs font-medium transition-all select-none border ${
                  isActive
                    ? 'bg-surface-elevated text-accent border-accent/40 font-semibold'
                    : 'bg-surface hover:bg-surface-hover text-foreground-muted border-border'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Query Input & Secondary Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          <div className="sm:col-span-6 relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-foreground-subtle" />
            <input
              type="text"
              placeholder="Search by role, company, or competency..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-base pl-8"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="input-base"
            >
              <option value="ALL">Provider: All Sources</option>
              <option value="NATIVE">Native Industry</option>
              <option value="EXTERNAL">External Ingested</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={workModeFilter}
              onChange={(e) => setWorkModeFilter(e.target.value)}
              className="input-base"
            >
              <option value="ALL">Work Mode: Any</option>
              <option value="REMOTE">Remote</option>
              <option value="HYBRID">Hybrid</option>
              <option value="ON_SITE">On-Site</option>
            </select>
          </div>
        </div>
      </Card>

      {/* 4. Opportunities Listing */}
      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-36 w-full" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No matching opportunities found"
            description="Try modifying search keywords or clearing filters to view all active industry postings."
            actionLabel="Reset Filters"
            onAction={() => {
              setTypeFilter('ALL');
              setSourceFilter('ALL');
              setWorkModeFilter('ALL');
              setSearchQuery('');
            }}
          />
        ) : (
          filtered.map((opp) => {
            const match = opp.matchScore;
            const score = match?.overallScore || 80;
            const isExternal = opp.sourceType === 'EXTERNAL';

            return (
              <Card
                key={opp.id}
                className="p-4 sm:p-5 hover:border-border-strong transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4 group"
              >
                {/* Left details */}
                <div className="space-y-2.5 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
                    <span className="px-1.5 py-0.2 rounded bg-surface-elevated text-foreground-subtle border border-border text-[10px] uppercase">
                      {opp.type.replace(/_/g, ' ')}
                    </span>

                    {isExternal ? (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-elevated text-foreground-muted border border-border flex items-center gap-1">
                        <Globe2 className="w-3 h-3" />
                        {opp.source}
                      </span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-accent/10 text-accent border border-accent/25 flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        Native Partner
                      </span>
                    )}

                    <span className="text-[10px] text-foreground-subtle px-1.5 py-0.2 rounded border border-border">
                      {opp.workMode}
                    </span>

                    <span className="text-[10px] text-foreground-subtle flex items-center gap-1 ml-1">
                      <Clock className="w-3 h-3" />
                      Deadline: {opp.deadline}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-semibold text-sm sm:text-base text-foreground leading-snug">
                      {opp.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-foreground-muted mt-0.5">
                      <span className="flex items-center gap-1 text-foreground">
                        <Building2 className="w-3.5 h-3.5 text-foreground-subtle" />
                        {opp.companyName}
                      </span>
                      <span className="flex items-center gap-1 text-foreground-subtle">
                        <MapPin className="w-3.5 h-3.5" />
                        {opp.location}
                      </span>
                      <span className="font-mono font-medium text-accent">
                        {opp.stipendOrSalary}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-foreground-muted leading-relaxed line-clamp-2 max-w-3xl">
                    {opp.description}
                  </p>

                  {/* Skills badges */}
                  <div className="flex flex-wrap items-center gap-1 pt-0.5">
                    <span className="text-[10px] font-mono uppercase text-foreground-subtle mr-1">
                      Skills:
                    </span>
                    {opp.requiredSkills?.map((s: any) => {
                      const isMatched = match?.matchedSkills?.some((m: string) =>
                        m.toLowerCase().includes((s.skillName || '').toLowerCase())
                      );
                      return (
                        <span
                          key={s.skillName}
                          className={`text-[10px] font-mono px-1.5 py-0.2 rounded flex items-center gap-1 border ${
                            isMatched
                              ? 'bg-accent/10 text-accent border-accent/25'
                              : 'bg-surface-elevated text-foreground-subtle border-border'
                          }`}
                        >
                          {isMatched ? (
                            <CheckCircle2 className="w-3 h-3 text-accent" />
                          ) : (
                            <AlertCircle className="w-3 h-3 text-foreground-subtle" />
                          )}
                          {s.skillName}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Right match score & Actions */}
                <div className="flex flex-col items-start lg:items-end justify-between gap-3 shrink-0 border-t lg:border-t-0 lg:border-l border-border pt-3 lg:pt-0 lg:pl-6">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleToggleSave(opp, e)}
                      title={opp.isSaved ? 'Remove bookmark' : 'Bookmark opportunity'}
                      className="p-1.5 rounded-md border border-border text-foreground-subtle hover:text-foreground hover:bg-surface-elevated transition-colors"
                    >
                      {opp.isSaved ? (
                        <BookmarkCheck className="w-3.5 h-3.5 text-accent" />
                      ) : (
                        <Bookmark className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-elevated border border-border text-xs font-mono">
                      <Sparkles className="w-3 h-3 text-accent" />
                      <span className="font-bold text-accent">{score}%</span>
                      <span className="text-foreground-subtle text-[10px]">Match</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedOpp(opp)}
                    >
                      Details
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenSkillGap(opp)}
                    >
                      Skill Gap
                    </Button>

                    {isExternal ? (
                      <a
                        href={opp.applicationUrl || opp.sourceUrl || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button size="sm" variant="secondary">
                          <span>{opp.source}</span>
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                      </a>
                    ) : (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => setApplyModalOpp(opp)}
                      >
                        Apply Now
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* 5. Opportunity Details Modal */}
      {selectedOpp && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 space-y-4 shadow-elevation border border-border animate-fade-in text-xs">
            <div className="flex items-start justify-between pb-2 border-b border-border">
              <div>
                <span className="text-[10px] font-mono text-accent uppercase block">
                  {selectedOpp.type} • {selectedOpp.sourceType === 'EXTERNAL' ? selectedOpp.source : 'Native Partner'}
                </span>
                <h2 className="text-base sm:text-lg font-semibold text-foreground mt-0.5">{selectedOpp.title}</h2>
                <p className="text-xs text-foreground-subtle">
                  {selectedOpp.companyName} • {selectedOpp.location}
                </p>
              </div>
              <button
                onClick={() => setSelectedOpp(null)}
                className="p-1 text-foreground-subtle hover:text-foreground hover:bg-surface-elevated rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-surface-elevated p-3 rounded-md border border-border font-mono">
              <div>
                <span className="text-foreground-subtle text-[10px] block">Compensation</span>
                <span className="font-semibold text-foreground">{selectedOpp.stipendOrSalary}</span>
              </div>
              <div>
                <span className="text-foreground-subtle text-[10px] block">Duration</span>
                <span className="font-semibold text-foreground">{selectedOpp.duration}</span>
              </div>
              <div>
                <span className="text-foreground-subtle text-[10px] block">Work Mode</span>
                <span className="font-semibold text-foreground">{selectedOpp.workMode}</span>
              </div>
              <div>
                <span className="text-foreground-subtle text-[10px] block">Deadline</span>
                <span className="font-semibold text-foreground">{selectedOpp.deadline}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <h4 className="text-[10px] font-mono uppercase text-foreground-subtle">Role Description</h4>
              <p className="text-xs text-foreground-muted leading-relaxed whitespace-pre-line">
                {selectedOpp.description}
              </p>
            </div>

            <div className="space-y-1.5">
              <h4 className="text-[10px] font-mono uppercase text-foreground-subtle">Skill Prerequisites</h4>
              <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                {selectedOpp.requiredSkills?.map((s: any) => (
                  <span
                    key={s.skillName}
                    className="px-2 py-0.5 bg-surface-elevated text-foreground border border-border rounded"
                  >
                    {s.skillName} (Benchmark: {s.minScore || 60}%)
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setSelectedOpp(null)}>
                Close
              </Button>
              {selectedOpp.sourceType === 'EXTERNAL' ? (
                <a
                  href={selectedOpp.applicationUrl || selectedOpp.sourceUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="sm" variant="secondary">
                    Apply on {selectedOpp.source}
                    <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </a>
              ) : (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    const opp = selectedOpp;
                    setSelectedOpp(null);
                    setApplyModalOpp(opp);
                  }}
                >
                  Apply Now
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. Skill Gap Modal */}
      {gapModalOpp && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 space-y-4 shadow-elevation border border-border animate-fade-in text-xs">
            <div className="flex items-start justify-between pb-2 border-b border-border">
              <div>
                <div className="flex items-center gap-1 text-[10px] font-mono text-accent">
                  <Sparkles className="w-3 h-3" />
                  <span>Skill Gap & Recommended Course Bridge</span>
                </div>
                <h2 className="text-base font-semibold text-foreground mt-0.5">{gapModalOpp.title}</h2>
                <p className="text-xs text-foreground-subtle">{gapModalOpp.companyName}</p>
              </div>
              <button
                onClick={() => setGapModalOpp(null)}
                className="p-1 text-foreground-subtle hover:text-foreground hover:bg-surface-elevated rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {gapLoading ? (
              <div className="py-8 text-center text-foreground-subtle font-mono">
                Evaluating competency delta vs role benchmarks...
              </div>
            ) : gapDetails ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-[10px] font-mono uppercase text-foreground-subtle">
                    Competency Breakdown
                  </h4>
                  <div className="space-y-1.5">
                    {gapDetails.gaps?.map((item: any) => (
                      <div
                        key={item.skillName}
                        className="p-2.5 rounded-md bg-surface-elevated border border-border flex items-center justify-between"
                      >
                        <div>
                          <div className="text-xs font-medium text-foreground">{item.skillName}</div>
                          <div className="text-[10px] font-mono text-foreground-subtle">
                            Your: {item.studentScore}% • Target: {item.targetScore}%
                          </div>
                        </div>
                        <Badge
                          variant={
                            item.status === 'MET'
                              ? 'success'
                              : item.status === 'CRITICAL_GAP'
                              ? 'error'
                              : 'warning'
                          }
                          size="sm"
                        >
                          {item.status === 'MET' ? 'Competency Met' : `Gap: -${item.gap}%`}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[10px] font-mono uppercase text-foreground-subtle">
                    Prescribed Course Remedies
                  </h4>
                  {gapDetails.recommendedLearning?.length > 0 ? (
                    <div className="space-y-2">
                      {gapDetails.recommendedLearning.map((rec: any) => (
                        <div
                          key={rec.id}
                          className="p-3 rounded-md bg-surface-elevated border border-border flex items-center justify-between gap-3"
                        >
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-mono text-accent block">
                              Target: {rec.targetSkill}
                            </span>
                            <h5 className="text-xs font-medium text-foreground">{rec.title}</h5>
                            <p className="text-[10px] text-foreground-subtle font-mono">
                              {rec.provider} • {rec.duration || 'Self-paced'}
                            </p>
                          </div>
                          {rec.url ? (
                            <a href={rec.url} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" variant="secondary" className="shrink-0">
                                <span>Start</span>
                                <ArrowRight className="w-3 h-3 ml-1" />
                              </Button>
                            </a>
                          ) : (
                            <Button size="sm" variant="secondary" className="shrink-0">
                              <span>Start</span>
                              <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-foreground-muted">
                      You meet all prerequisites for this position.
                    </p>
                  )}
                </div>
              </div>
            ) : null}

            <div className="pt-3 border-t border-border flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setGapModalOpp(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Application Submission Modal */}
      {applyModalOpp && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-lg max-w-md w-full p-5 space-y-3.5 shadow-elevation border border-border animate-fade-in text-xs">
            <div className="flex items-start justify-between pb-2 border-b border-border">
              <div>
                <span className="text-[10px] font-mono uppercase text-accent block">
                  Native Industry Submission
                </span>
                <h2 className="text-sm sm:text-base font-semibold text-foreground mt-0.5">{applyModalOpp.title}</h2>
                <p className="text-xs text-foreground-subtle">{applyModalOpp.companyName}</p>
              </div>
              <button
                onClick={() => setApplyModalOpp(null)}
                className="p-1 text-foreground-subtle hover:text-foreground hover:bg-surface-elevated rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-2.5 rounded-md bg-accent/10 border border-accent/25 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-accent shrink-0" />
              <div className="text-[11px] text-foreground font-mono">
                AI compatibility score: <strong className="font-semibold text-accent">{applyModalOpp.matchScore?.overallScore || 85}%</strong>. Verified transcripts and credentials will be forwarded.
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground block">
                Candidate Statement / Notes:
              </label>
              <textarea
                rows={4}
                value={applyNote}
                onChange={(e) => setApplyNote(e.target.value)}
                placeholder="Briefly state your technical background and coursework relevant to this opening..."
                className="input-base"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-border">
              <Button variant="ghost" size="sm" onClick={() => setApplyModalOpp(null)} disabled={submitting}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleApply}
                disabled={submitting}
                rightIcon={<Send className="w-3.5 h-3.5" />}
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
