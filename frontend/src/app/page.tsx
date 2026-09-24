'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@skillsync/shared';
import {
  GraduationCap,
  School,
  Building2,
  Briefcase,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  CheckCircle2,
  BrainCircuit,
  Bot,
  Layers,
  ChevronRight,
  Search,
  Check,
  Terminal,
  Activity,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function HomePage() {
  const { switchRole } = useAuth();

  const lifecycleStages = [
    { step: '01', title: 'Assess', desc: 'Timed skill evaluation' },
    { step: '02', title: 'Taxonomy', desc: 'Competency profiling' },
    { step: '03', title: 'Gap Analysis', desc: 'Delta vs benchmarks' },
    { step: '04', title: 'Roadmap', desc: '6-month milestones' },
    { step: '05', title: 'Match', desc: '92% semantic matching' },
    { step: '06', title: 'Workspace', desc: 'Active project delivery' },
    { step: '07', title: 'Mentorship', desc: 'Faculty & corporate R&D' },
    { step: '08', title: 'Placement', desc: 'Cryptographic credentials' },
  ];

  return (
    <div className="space-y-12 max-w-6xl mx-auto py-4">
      {/* 1. Hero Section - Supabase Developer Minimalist */}
      <section className="relative overflow-hidden rounded-lg bg-surface-elevated border border-border p-6 sm:p-12">
        {/* Subtle background grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-surface border border-border text-foreground-muted font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-accent" />
              <span>SIH PS 26044 • Ministry of Ayush / AIIA</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground leading-[1.15]">
              Bridge academic skills to <br />
              <span className="text-accent">
                industry opportunities.
              </span>
            </h1>

            <p className="text-foreground-muted text-xs sm:text-sm leading-relaxed max-w-xl">
              An intelligent platform connecting students, academicians, institutions and enterprises through deterministic skill intelligence, structured internships, and cryptographic placement credentials.
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => switchRole(UserRole.STUDENT)}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                className="font-medium"
              >
                Launch Student Portal
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => switchRole(UserRole.INSTITUTION)}
                className="font-medium"
              >
                Institutional Overview
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-3 text-xs text-foreground-muted border-t border-border font-mono text-[11px]">
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-accent" />
                <span>Multi-Model AI Dispatch</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-accent" />
                <span>5 Role-Based Portals</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-accent" />
                <span>ERP Connector Ready</span>
              </div>
            </div>
          </div>

          {/* Technical Telemetry Card Preview */}
          <div className="lg:col-span-5">
            <div className="bg-surface border border-border rounded-lg p-4 font-mono text-xs space-y-3.5 shadow-sm">
              <div className="flex items-center justify-between pb-2.5 border-b border-border text-[11px] text-foreground-muted">
                <div className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-accent" />
                  <span>inference_telemetry.json</span>
                </div>
                <span className="text-accent font-semibold">92% MATCH</span>
              </div>

              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-foreground-muted">Target Benchmark</span>
                  <span className="font-semibold text-foreground">AI / Bio-IT Research Intern</span>
                </div>

                <div className="p-2.5 bg-surface-elevated rounded border border-border space-y-1.5">
                  <div className="flex justify-between text-[10px] text-foreground-muted">
                    <span>Semantic Vector Fit</span>
                    <span className="text-accent font-semibold">0.924 COSINE</span>
                  </div>
                  <div className="w-full bg-surface h-1.5 rounded-full overflow-hidden">
                    <div className="bg-accent h-full w-[92%]" />
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent border border-accent/20">
                      Python 90%
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent border border-accent/20">
                      PyTorch 84%
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface border border-border text-foreground-muted">
                      Docker 60%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs pt-1">
                  <div className="p-2 rounded bg-surface-elevated border border-border">
                    <p className="text-[10px] text-foreground-muted uppercase">Readiness Index</p>
                    <p className="text-sm font-semibold text-foreground mt-0.5">82.4%</p>
                  </div>
                  <div className="p-2 rounded bg-surface-elevated border border-border">
                    <p className="text-[10px] text-foreground-muted uppercase">Verified Credentials</p>
                    <p className="text-sm font-semibold text-accent mt-0.5">14 Badges</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Closed-Loop Lifecycle */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Closed-Loop Talent Architecture
          </h2>
          <p className="text-xs text-foreground-muted mt-0.5">
            PS 26044 structured flow from initial assessment to verified placement.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {lifecycleStages.map((stage) => (
            <div
              key={stage.step}
              className="p-3 rounded-lg bg-surface border border-border hover:border-border-strong transition-colors flex flex-col justify-between text-left space-y-2"
            >
              <span className="font-mono text-[10px] text-accent font-semibold">{stage.step}</span>
              <div>
                <h4 className="text-xs font-medium text-foreground leading-tight">{stage.title}</h4>
                <p className="text-[10px] text-foreground-muted mt-0.5 leading-snug">{stage.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Specialized Stakeholder Portals */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Role-Tailored Stakeholder Portals
          </h2>
          <p className="text-xs text-foreground-muted mt-0.5">
            Select a portal to explore specialized workflows built for higher education stakeholders.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Student */}
          <div
            onClick={() => switchRole(UserRole.STUDENT)}
            className="p-4 rounded-lg bg-surface border border-border hover:border-border-strong hover:bg-surface-elevated transition-colors cursor-pointer flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="w-8 h-8 rounded bg-surface-elevated border border-border flex items-center justify-center text-accent">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-medium text-xs text-foreground group-hover:text-accent transition-colors">
                  Student Portal
                </h3>
                <p className="text-xs text-foreground-muted mt-1 leading-relaxed">
                  Timed technical assessments, skill taxonomy radar, AI gap engine, 6-month roadmaps, and matched internships.
                </p>
              </div>
            </div>
            <div className="flex items-center text-[11px] font-medium text-accent gap-1 pt-2 border-t border-border">
              Launch Portal <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Academician */}
          <div
            onClick={() => switchRole(UserRole.ACADEMICIAN)}
            className="p-4 rounded-lg bg-surface border border-border hover:border-border-strong hover:bg-surface-elevated transition-colors cursor-pointer flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="w-8 h-8 rounded bg-surface-elevated border border-border flex items-center justify-center text-accent">
                <School className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-medium text-xs text-foreground group-hover:text-accent transition-colors">
                  Academician Portal
                </h3>
                <p className="text-xs text-foreground-muted mt-1 leading-relaxed">
                  Faculty internships, industry sabbaticals, AICTE/Ayush FDPs, joint research grant proposals, and student mentorship.
                </p>
              </div>
            </div>
            <div className="flex items-center text-[11px] font-medium text-accent gap-1 pt-2 border-t border-border">
              Launch Portal <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Industry */}
          <div
            onClick={() => switchRole(UserRole.INDUSTRY)}
            className="p-4 rounded-lg bg-surface border border-border hover:border-border-strong hover:bg-surface-elevated transition-colors cursor-pointer flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="w-8 h-8 rounded bg-surface-elevated border border-border flex items-center justify-center text-accent">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-medium text-xs text-foreground group-hover:text-accent transition-colors">
                  Industry Portal
                </h3>
                <p className="text-xs text-foreground-muted mt-1 leading-relaxed">
                  Candidate compatibility threshold search, candidate recruitment pipelines, and active intern task tracking.
                </p>
              </div>
            </div>
            <div className="flex items-center text-[11px] font-medium text-accent gap-1 pt-2 border-t border-border">
              Launch Portal <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Institution */}
          <div
            onClick={() => switchRole(UserRole.INSTITUTION)}
            className="p-4 rounded-lg bg-surface border border-border hover:border-border-strong hover:bg-surface-elevated transition-colors cursor-pointer flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="w-8 h-8 rounded bg-surface-elevated border border-border flex items-center justify-center text-accent">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-medium text-xs text-foreground group-hover:text-accent transition-colors">
                  Institution Portal
                </h3>
                <p className="text-xs text-foreground-muted mt-1 leading-relaxed">
                  Institutional Readiness Index, departmental competency analytics, curriculum gap signals, and ERP connectors.
                </p>
              </div>
            </div>
            <div className="flex items-center text-[11px] font-medium text-accent gap-1 pt-2 border-t border-border">
              Launch Portal <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Multi-Model AI Engine Architecture */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-accent" />
            <CardTitle>Central Multi-Model AI Architecture</CardTitle>
          </div>
          <CardDescription>
            SkillSync routes each cognitive task to its optimal model category rather than relying on generic prompts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-surface border border-border space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-accent uppercase">Engine 01</span>
                <Bot className="w-3.5 h-3.5 text-foreground-muted" />
              </div>
              <h4 className="font-medium text-xs text-foreground">LLM Reasoning Engine</h4>
              <p className="text-xs text-foreground-muted leading-relaxed">
                Powered by Groq Cloud LPU (llama-3.3-70b-versatile) for milestone roadmaps, interview simulation, and explainable advice.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-surface border border-border space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-accent uppercase">Engine 02</span>
                <Layers className="w-3.5 h-3.5 text-foreground-muted" />
              </div>
              <h4 className="font-medium text-xs text-foreground">Dense Semantic Vectors</h4>
              <p className="text-xs text-foreground-muted leading-relaxed">
                384-dimensional cosine embeddings with cross-encoder reranking for explainable 92% internship compatibility matching.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-surface border border-border space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-accent uppercase">Engine 03</span>
                <TrendingUp className="w-3.5 h-3.5 text-foreground-muted" />
              </div>
              <h4 className="font-medium text-xs text-foreground">Supervised Predictive ML</h4>
              <p className="text-xs text-foreground-muted leading-relaxed">
                7-feature logistic placement probability model and time-series skill demand forecasting across industry sectors.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
