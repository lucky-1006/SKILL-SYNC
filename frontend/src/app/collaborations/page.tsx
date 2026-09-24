'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import {
  Sparkles,
  Users,
  Trophy,
  Layers,
  Calendar,
  CheckCircle2,
  Building2,
  BookOpen,
  ArrowRight,
  Check,
  Award,
  Zap,
  Clock,
  Terminal
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function CollaborationsHubPage() {
  const [mentors, setMentors] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([
      apiFetch<any[]>('/collaboration/mentorship').catch(() => []),
      apiFetch<any[]>('/collaboration/challenges').catch(() => []),
      apiFetch<any[]>('/collaboration/research').catch(() => [])
    ])
      .then(([m, c, p]) => {
        setMentors(m);
        setChallenges(c);
        setProposals(p);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleBookSlot = async (slotId: string, time: string, mentorName: string) => {
    try {
      await apiFetch('/collaboration/mentorship/book', {
        method: 'POST',
        body: JSON.stringify({ slotId, selectedTime: time })
      });
      setBookingSuccess(`1-on-1 session confirmed with ${mentorName} for ${time}`);
    } catch (err) {
      console.error('Booking failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[360px] bg-surface rounded-lg border border-border p-8">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs font-mono text-foreground-muted">Connecting to national collaboration grid...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[11px] text-accent font-medium">NATIONAL ECOSYSTEM</span>
            <span className="text-foreground-muted text-xs">•</span>
            <span className="text-xs text-foreground-muted">Academia–Industry Convergence</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
            Collaboration & Mentorship Hub
          </h1>
          <p className="text-xs text-foreground-muted mt-0.5">
            Institutional bridge connecting students and faculty with corporate research mentors, innovation tracks, and co-funded R&D.
          </p>
        </div>

        <div className="flex items-center gap-3 p-2.5 bg-surface rounded-lg border border-border shrink-0">
          <div className="w-7 h-7 rounded bg-surface-elevated border border-border flex items-center justify-center text-accent">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <div className="font-mono text-[10px] text-foreground-muted uppercase">Grand Challenges</div>
            <div className="font-mono text-xs font-semibold text-foreground">{challenges.length} Live Tracks</div>
          </div>
        </div>
      </div>

      {bookingSuccess && (
        <div className="p-3 bg-accent/10 border border-accent/25 rounded-lg flex items-center justify-between text-xs text-accent font-mono animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
            <span>{bookingSuccess}</span>
          </div>
          <button onClick={() => setBookingSuccess(null)} className="text-foreground-muted hover:text-foreground text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* 1. 1-on-1 Industry Mentorship Program */}
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-accent" />
            1-on-1 Corporate Mentorship Program
          </h2>
          <p className="text-xs text-foreground-muted mt-0.5">
            Book technical guidance sessions with principal architects and engineering leaders from partner enterprises.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mentors.map((m) => (
            <div
              key={m.id}
              className="bg-surface p-5 rounded-lg border border-border hover:border-border-strong transition-colors flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" size="sm" className="font-mono text-[10px]">
                    {m.companyName}
                  </Badge>
                  <span className="font-mono text-[10px] text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                    {m.currentMenteesCount}/{m.maxMentees} Active Mentees
                  </span>
                </div>

                <div>
                  <h3 className="font-medium text-sm text-foreground">
                    {m.mentorName}
                  </h3>
                  <p className="text-xs text-accent font-mono mt-0.5">{m.mentorTitle}</p>
                </div>

                <p className="text-xs text-foreground-muted leading-relaxed">{m.bio}</p>

                <div className="flex flex-wrap gap-1 pt-1">
                  {m.expertiseAreas?.map((ex: string) => (
                    <span
                      key={ex}
                      className="px-2 py-0.5 rounded bg-surface-elevated border border-border text-foreground-muted text-[10px] font-mono"
                    >
                      {ex}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-border space-y-2">
                <span className="font-mono text-[10px] uppercase text-foreground-muted block">
                  Available Slots:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {m.availableSlots?.map((slot: string) => (
                    <button
                      key={slot}
                      onClick={() => handleBookSlot(m.id, slot, m.mentorName)}
                      className="px-2.5 py-1 bg-surface-elevated hover:bg-accent hover:text-background rounded text-xs font-mono text-foreground border border-border hover:border-accent transition-colors"
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. SIH & National Innovation Challenges */}
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Trophy className="w-4 h-4 text-accent" />
            National Industry Innovation Challenges
          </h2>
          <p className="text-xs text-foreground-muted mt-0.5">
            Real corporate problem statements with incubation support, cash grants, and direct pre-placement interview (PPI) fast tracks.
          </p>
        </div>

        <div className="space-y-3">
          {challenges.map((ch) => (
            <div
              key={ch.id}
              className="bg-surface p-5 rounded-lg border border-border hover:border-border-strong transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="neutral" size="sm" className="font-mono text-[10px]">
                    Grand Challenge
                  </Badge>
                  <span className="text-xs text-foreground-muted font-mono">{ch.domain}</span>
                </div>
                <h3 className="font-medium text-sm text-foreground leading-snug">{ch.title}</h3>
                <p className="text-xs text-foreground-muted leading-relaxed max-w-3xl">{ch.problemStatement}</p>
                <div className="text-xs text-foreground-muted flex flex-wrap items-center gap-3 pt-0.5 font-mono text-[11px]">
                  <span>Sponsor: <strong className="text-foreground font-normal">{ch.industryName}</strong></span>
                  <span>•</span>
                  <span>Deadline: <strong className="text-foreground font-normal">{ch.submissionDeadline}</strong></span>
                  <span>•</span>
                  <span>Registered: <strong className="text-foreground font-normal">{ch.registeredTeamsCount} teams</strong></span>
                </div>
              </div>

              <div className="shrink-0 lg:text-right space-y-1.5 pt-3 lg:pt-0 border-t lg:border-t-0 border-border">
                <span className="font-mono text-[10px] uppercase text-foreground-muted block">
                  Prize Pool & Grant
                </span>
                <span className="font-mono text-lg font-semibold text-accent block">{ch.prizePool}</span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => alert(`Registered team for ${ch.title}!`)}
                  className="font-medium"
                >
                  Register Team
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Joint Academician-Industry Research Proposals */}
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Layers className="w-4 h-4 text-accent" />
            Active Academician–Industry Research Consortia
          </h2>
          <p className="text-xs text-foreground-muted mt-0.5">
            Co-funded translational research partnerships bridging university faculty researchers and corporate life sciences labs.
          </p>
        </div>

        <div className="space-y-2.5">
          {proposals.map((prop) => (
            <div
              key={prop.id}
              className="bg-surface p-4 rounded-lg border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-border-strong transition-colors"
            >
              <div className="space-y-1">
                <h4 className="font-medium text-xs text-foreground">{prop.title}</h4>
                <p className="text-foreground-muted text-xs">
                  Lead Faculty: <strong className="text-foreground font-medium">{prop.leadFacultyName}</strong> ({prop.institutionName}) ↔ Partner: <strong className="text-foreground font-medium">{prop.partnerIndustryName}</strong>
                </p>
                <p className="text-accent font-mono text-[11px]">Domain: {prop.focusArea}</p>
              </div>
              <div className="shrink-0 sm:text-right">
                <span className="font-mono text-xs font-semibold text-foreground block">{prop.fundingExpected}</span>
                <Badge variant="success" size="sm" className="font-mono text-[10px] mt-1">
                  {prop.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
