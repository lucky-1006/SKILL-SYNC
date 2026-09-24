'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import {
  School,
  Briefcase,
  Layers,
  Award,
  BookOpen,
  Send,
  Sparkles,
  Users,
  CheckCircle2,
  Calendar,
  Building2,
  ArrowRight,
  FileText,
  X,
  Plus
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { Skeleton } from '@/components/ui/Skeleton';

export default function AcademicianDashboard() {
  const [data, setData] = useState<any | null>(null);
  const [fdps, setFdps] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [showProposalModal, setShowProposalModal] = useState<boolean>(false);
  const [proposalTitle, setProposalTitle] = useState<string>('');
  const [proposalFocus, setProposalFocus] = useState<string>('');
  const [partnerCompany, setPartnerCompany] = useState<string>('TCS Bio-IT & Life Sciences R&D');
  const [funding, setFunding] = useState<string>('₹30,00,000');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([
      apiFetch<any>('/academicians/dashboard').catch(() => null),
      apiFetch<any[]>('/opportunities?type=FDP').catch(() => []),
      apiFetch<any[]>('/collaboration/research').catch(() => [])
    ])
      .then(([dash, fdpList, propList]) => {
        setData(dash);
        setFdps(fdpList);
        setProposals(propList);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleProposalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalTitle || submitting) return;
    setSubmitting(true);

    try {
      await apiFetch('/academicians/proposals', {
        method: 'POST',
        body: JSON.stringify({
          title: proposalTitle,
          focusArea: proposalFocus,
          partnerIndustryName: partnerCompany,
          fundingExpected: funding,
          objectives: ['Conduct joint in-vitro and computational validation', 'Co-author high-impact research publication']
        })
      });

      setShowProposalModal(false);
      setProposalTitle('');
      setProposalFocus('');
      const updated = await apiFetch<any[]>('/collaboration/research');
      setProposals(updated || []);
    } catch (err) {
      console.error('Failed to submit proposal:', err);
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

  const prof = data?.profile;

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2 text-foreground">
      {/* 1. Header with Faculty Profile & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-foreground-subtle">
            <span>Academician</span>
            <span>/</span>
            <span className="text-foreground">Faculty Dashboard</span>
            <span className="text-border">•</span>
            <Badge variant="neutral" size="sm">
              14 Years Research
            </Badge>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
            {prof?.name || 'Dr. Priya Nambiar'}
          </h1>
          <p className="text-xs text-foreground-muted">
            {prof?.designation || 'Associate Professor & Research Lead'} • {prof?.department} • {prof?.institutionName || 'All India Institute of Ayurveda, New Delhi'}
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {prof?.specializations?.map((spec: string) => (
              <span key={spec} className="px-2 py-0.5 rounded bg-surface-elevated text-foreground-subtle text-[10px] font-mono border border-border">
                {spec}
              </span>
            ))}
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowProposalModal(true)}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Submit Research Proposal
        </Button>
      </div>

      {/* 2. KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatCard
          title="Joint Research Grants"
          value={proposals.length || 2}
          subtitle="Active corporate proposals"
          icon={Layers}
          trend={{ value: 1, isPositive: true }}
        />
        <StatCard
          title="Publications / Patents"
          value={`${prof?.publicationsCount || 22} / ${prof?.patentsCount || 3}`}
          subtitle="Scopus & PubMed indexed"
          icon={BookOpen}
        />
        <StatCard
          title="National FDPs"
          value={fdps.length || 3}
          subtitle="AICTE & Ayush accredited"
          icon={Award}
        />
        <StatCard
          title="Student Mentees"
          value={8}
          subtitle="Final year capstone projects"
          icon={Users}
        />
      </div>

      {/* 3. Sabbaticals & FDP Opportunities */}
      <div className="space-y-3.5">
        <h3 className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-2">
          <School className="w-4 h-4 text-accent" />
          <span>Industry Faculty Internships, Sabbaticals & FDPs</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="success" size="sm">
                  Industry Sabbatical
                </Badge>
                <span className="text-[11px] font-mono text-accent font-medium">
                  ₹75,000 / mo
                </span>
              </div>
              <h4 className="font-semibold text-sm text-foreground">
                Faculty Sabbatical in Healthcare AI & Computational Biology
              </h4>
              <p className="text-xs text-foreground-muted leading-relaxed">
                TCS Research Labs & IIT Delhi • 2-Month sponsored sabbatical with an honorarium for joint research and clinical translation.
              </p>
            </div>
            <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
              <span className="text-[11px] text-foreground-subtle">Duration: 2 Months</span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => alert('Application submitted for Industry Faculty Sabbatical!')}
              >
                Apply for Fellowship
              </Button>
            </div>
          </Card>

          <Card className="p-4 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="neutral" size="sm">
                  National FDP
                </Badge>
                <span className="text-[11px] font-mono text-foreground-subtle">
                  Accredited
                </span>
              </div>
              <h4 className="font-semibold text-sm text-foreground">
                National FDP on Generative AI & Digital Health Interoperability
              </h4>
              <p className="text-xs text-foreground-muted leading-relaxed">
                Ministry of Ayush & AIIA • 1-Week accredited Faculty Development Program on FHIR standards and curricula modernization.
              </p>
            </div>
            <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
              <span className="text-[11px] text-foreground-subtle">1-Week Intensive</span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => alert('Successfully registered for National FDP!')}
              >
                Register Free
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* 4. Active Joint Research Proposals */}
      <Card className="p-4 sm:p-5 space-y-3.5">
        <div>
          <h3 className="font-semibold text-sm sm:text-base text-foreground flex items-center gap-2">
            <Layers className="w-4 h-4 text-accent" />
            <span>Active Joint Industry–Academia Research Proposals</span>
          </h3>
          <p className="text-xs text-foreground-muted">
            Collaborative grant proposals submitted to corporate partners for co-development, patents, and laboratory trials.
          </p>
        </div>

        <div className="divide-y divide-border">
          {proposals.map((prop) => (
            <div key={prop.id} className="py-3 space-y-1 text-xs first:pt-1">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-foreground text-xs sm:text-sm">{prop.title}</h4>
                <Badge variant="success" size="sm">
                  {prop.status}
                </Badge>
              </div>
              <p className="text-foreground-muted text-[11px]">
                Industry Partner: <span className="text-foreground font-medium">{prop.partnerIndustryName}</span> • Expected Grant: <span className="text-accent font-mono font-medium">{prop.fundingExpected}</span> • Duration: {prop.durationMonths} Months
              </p>
              <p className="text-foreground-subtle text-[11px]">Focus: {prop.focusArea}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Submit Proposal Modal */}
      {showProposalModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleProposalSubmit}
            className="bg-surface rounded-lg max-w-lg w-full p-5 shadow-elevation border border-border space-y-4 animate-fade-in text-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-accent" />
                <span>Submit Industry Research Proposal</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowProposalModal(false)}
                className="p-1 text-foreground-subtle hover:text-foreground hover:bg-surface-elevated rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-medium text-foreground block mb-1">Proposal Title:</label>
                <input
                  type="text"
                  required
                  value={proposalTitle}
                  onChange={(e) => setProposalTitle(e.target.value)}
                  placeholder="e.g. Deep Learning for Botanical Adulteration Detection"
                  className="input-base"
                />
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">Focus Area & Scope:</label>
                <textarea
                  rows={3}
                  required
                  value={proposalFocus}
                  onChange={(e) => setProposalFocus(e.target.value)}
                  placeholder="Detail scientific objectives and computational validation benchmarks..."
                  className="input-base"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-foreground block mb-1">Partner Organization:</label>
                  <input
                    type="text"
                    value={partnerCompany}
                    onChange={(e) => setPartnerCompany(e.target.value)}
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="font-medium text-foreground block mb-1">Expected Grant (INR):</label>
                  <input
                    type="text"
                    value={funding}
                    onChange={(e) => setFunding(e.target.value)}
                    className="input-base"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowProposalModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Proposal'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
