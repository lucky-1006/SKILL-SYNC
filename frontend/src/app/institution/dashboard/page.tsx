'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import {
  Briefcase,
  Users,
  GraduationCap,
  Building2,
  Database,
  BarChart3,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { Skeleton } from '@/components/ui/Skeleton';

export default function InstitutionDashboard() {
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    apiFetch<any>('/institution/analytics')
      .then((data) => setAnalytics(data))
      .catch(() => setAnalytics(null))
      .finally(() => setLoading(false));
  }, []);

  const handleSyncERP = async () => {
    setSyncing(true);
    try {
      const res = await apiFetch<any>('/institution/sync-erp', {
        method: 'POST',
        body: JSON.stringify({
          sourceSystem: 'AIIA_CENTRAL_SIS_ORACLE_ERP',
          institutionCode: 'aiia-delhi-campus'
        })
      });
      setSyncMessage(res.message);
    } catch (err) {
      console.error('ERP sync failed:', err);
    } finally {
      setSyncing(false);
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

  const summary = analytics?.summary;

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2 text-foreground">
      {/* 1. Header with Dean Profile & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-foreground-subtle">
            <span>Institution</span>
            <span>/</span>
            <span className="text-foreground">Overview</span>
            <span className="text-border">•</span>
            <span className="text-foreground-muted">NAAC A++ Accredited</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
            Dr. Vikram Malhotra
          </h1>
          <p className="text-xs text-foreground-muted max-w-xl">
            Dean of Academic Affairs & Training Placement Cell • {analytics?.institutionName || 'All India Institute of Ayurveda & Technology'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/institution/analytics">
            <Button variant="secondary" size="sm" leftIcon={<BarChart3 className="w-3.5 h-3.5" />}>
              Skill Gap Analytics
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSyncERP}
            disabled={syncing}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />}
          >
            {syncing ? 'Syncing...' : 'Sync University ERP'}
          </Button>
        </div>
      </div>

      {/* Sync Status Banner */}
      {syncMessage && (
        <div className="p-3 bg-accent/10 border border-accent/25 rounded-md flex items-center justify-between text-xs text-foreground animate-fade-in font-mono">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0" />
            <span>{syncMessage}</span>
          </div>
          <button
            onClick={() => setSyncMessage(null)}
            className="text-foreground-subtle hover:text-foreground font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. Institutional KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatCard
          title="Total Enrolled Students"
          value={summary?.totalStudents?.toLocaleString() || '4,250'}
          subtitle={`${summary?.assessmentRatePercentage || 89}% Assessed`}
          icon={GraduationCap}
          trend={{ value: 8.5, isPositive: true }}
        />
        <StatCard
          title="Overall Placement Rate"
          value={`${summary?.overallPlacementRatePercentage || 76}%`}
          subtitle={`${summary?.placedStudents?.toLocaleString() || '2,890'} Offers Extended`}
          icon={Briefcase}
          trend={{ value: 14.2, isPositive: true }}
        />
        <StatCard
          title="Internships Secured"
          value={summary?.internshipsSecured?.toLocaleString() || '1,240'}
          subtitle="Active industry workspaces"
          icon={Users}
          trend={{ value: 19.1, isPositive: true }}
        />
        <StatCard
          title="Corporate MoUs"
          value={summary?.industryPartnershipsCount || 38}
          subtitle="TCS, Biocon, Ayush & more"
          icon={Building2}
        />
      </div>

      {/* 3. ERP Database Integration Console */}
      <Card className="p-5 space-y-4 bg-surface-elevated/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-accent">
              <Database className="w-3.5 h-3.5" />
              <span>Campus ERP & SIS Connectors</span>
            </div>
            <h3 className="font-semibold text-sm sm:text-base text-foreground mt-0.5">
              Automated Campus ERP & Student Information System (SIS) Synchronization
            </h3>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSyncERP}
            disabled={syncing}
          >
            Trigger Real-time Sync
          </Button>
        </div>

        <p className="text-xs text-foreground-muted leading-relaxed max-w-3xl">
          SkillSync interfaces directly with institutional relational databases to synchronize student records, verified academic transcripts, semester CGPA records, and graduation rosters via REST connectors.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 bg-surface rounded-md border border-border">
            <span className="text-foreground-subtle text-[10px] uppercase block">Source Database</span>
            <span className="font-medium text-foreground text-xs mt-0.5 block">Oracle Campus ERP / SIS</span>
          </div>
          <div className="p-3 bg-surface rounded-md border border-border">
            <span className="text-foreground-subtle text-[10px] uppercase block">Last Audit</span>
            <span className="font-medium text-accent text-xs mt-0.5 block">✓ 2,450 Records (0 Errors)</span>
          </div>
          <div className="p-3 bg-surface rounded-md border border-border">
            <span className="text-foreground-subtle text-[10px] uppercase block">Cron Schedule</span>
            <span className="font-medium text-foreground text-xs mt-0.5 block">Daily Sync at 02:00 IST</span>
          </div>
        </div>
      </Card>

      {/* 4. Quick Access Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/institution/analytics"
          className="p-4 rounded-lg bg-surface border border-border hover:border-border-strong hover:bg-surface-hover transition-all flex flex-col justify-between space-y-2.5 group"
        >
          <div className="w-8 h-8 rounded-md bg-surface-elevated border border-border flex items-center justify-center shrink-0 text-foreground-subtle group-hover:text-accent transition-colors">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-foreground">
              Department Readiness & Industry Demand Trends
            </h4>
            <p className="text-xs text-foreground-muted mt-1 leading-relaxed">
              Analyze comparative departmental readiness indices, nationwide industry skill shortages, and curriculum adaptation recommendations.
            </p>
          </div>
          <span className="text-[11px] font-medium text-accent flex items-center gap-1">
            View Analytics <ArrowRight className="w-3 h-3" />
          </span>
        </Link>

        <Link
          href="/student/portfolio"
          className="p-4 rounded-lg bg-surface border border-border hover:border-border-strong hover:bg-surface-hover transition-all flex flex-col justify-between space-y-2.5 group"
        >
          <div className="w-8 h-8 rounded-md bg-surface-elevated border border-border flex items-center justify-center shrink-0 text-foreground-subtle group-hover:text-accent transition-colors">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-foreground">
              Verified Digital Credential Endorsement
            </h4>
            <p className="text-xs text-foreground-muted mt-1 leading-relaxed">
              Review student-submitted practical skills, verify academic transcripts, and digitally sign tamper-proof graduation certificates.
            </p>
          </div>
          <span className="text-[11px] font-medium text-accent flex items-center gap-1">
            Verify Credentials <ArrowRight className="w-3 h-3" />
          </span>
        </Link>
      </div>
    </div>
  );
}
