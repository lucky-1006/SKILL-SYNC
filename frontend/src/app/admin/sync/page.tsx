'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import {
  Server,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Activity,
  Terminal
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { Skeleton } from '@/components/ui/Skeleton';

export default function AdminSyncPage() {
  const [data, setData] = useState<any | null>(null);
  const [syncingProvider, setSyncingProvider] = useState<string | null>(null);
  const [syncingAll, setSyncingAll] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchSyncStatus();
  }, []);

  const fetchSyncStatus = async () => {
    try {
      const res = await apiFetch<any>('/admin/opportunities/sync-status');
      setData(res);
    } catch (err) {
      console.error('Failed to load sync status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerSyncAll = async () => {
    setSyncingAll(true);
    setFeedback(null);
    try {
      await apiFetch<any>('/admin/opportunities/sync', {
        method: 'POST',
        body: JSON.stringify({})
      });
      setFeedback({
        message: 'Platform synchronization completed across all active providers.',
        type: 'success'
      });
      fetchSyncStatus();
    } catch (err: any) {
      setFeedback({
        message: err.message || 'Failed to trigger synchronization cycle.',
        type: 'error'
      });
    } finally {
      setSyncingAll(false);
    }
  };

  const handleTriggerSyncProvider = async (providerName: string) => {
    setSyncingProvider(providerName);
    setFeedback(null);
    try {
      await apiFetch<any>('/admin/opportunities/sync', {
        method: 'POST',
        body: JSON.stringify({ provider: providerName })
      });
      setFeedback({
        message: `Synchronization completed for ${providerName}.`,
        type: 'success'
      });
      fetchSyncStatus();
    } catch (err: any) {
      setFeedback({
        message: err.message || `Failed to sync ${providerName}.`,
        type: 'error'
      });
    } finally {
      setSyncingProvider(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto py-2">
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    );
  }

  const summary = data?.summary || { total: 0, native: 0, external: 0, expired: 0 };
  const providers: any[] = data?.providers || [];
  const logs: any[] = data?.logs || [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2 text-foreground">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-foreground-subtle">
            <span>Admin</span>
            <span>/</span>
            <span className="text-foreground">Provider Sync Engine</span>
            <span className="text-border">•</span>
            <Badge variant="neutral" size="sm">
              SIH PS 26044
            </Badge>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
            Opportunity Provider & Sync Command Center
          </h1>
          <p className="text-xs text-foreground-muted max-w-2xl">
            Monitor real-world job & course ingestion pipelines, provider API health, automated deduplication, and expiration policies.
          </p>
        </div>

        <Button
          onClick={handleTriggerSyncAll}
          disabled={syncingAll}
          variant="primary"
          size="sm"
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${syncingAll ? 'animate-spin' : ''}`} />}
        >
          {syncingAll ? 'Running Sync Cycle...' : 'Trigger Sync Now'}
        </Button>
      </div>

      {/* 2. Feedback Alert */}
      {feedback && (
        <div
          className={`p-3 rounded-md border flex items-center justify-between text-xs animate-fade-in font-mono ${
            feedback.type === 'success'
              ? 'bg-accent/10 border-accent/25 text-foreground'
              : 'bg-destructive/10 border-destructive/25 text-destructive'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-foreground-subtle hover:text-foreground font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 3. Platform Opportunity Volume Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <StatCard
          title="Total Active"
          value={summary.total}
          subtitle="All live listings"
          icon={Server}
        />
        <StatCard
          title="Native Postings"
          value={summary.native}
          subtitle="Corporate & academic"
          icon={Activity}
        />
        <StatCard
          title="External Feed"
          value={summary.external}
          subtitle="Adzuna & Udemy API"
          icon={Server}
        />
        <StatCard
          title="Archived / Cleaned"
          value={summary.expired}
          subtitle="Past deadlines pruned"
          icon={Activity}
        />
      </div>

      {/* 4. Registered Providers & Health Status */}
      <div className="space-y-3.5">
        <h3 className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-2">
          <Activity className="w-4 h-4 text-accent" />
          <span>Configured Provider Adapters</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {providers.map((p) => {
            const isNative = p.name === 'SKILLSYNC_NATIVE';
            const isConfigured = p.configured;

            return (
              <Card
                key={p.name}
                className="p-4 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-semibold text-xs text-foreground">{p.name}</span>
                    <Badge variant={isNative || isConfigured ? 'success' : 'neutral'} size="sm">
                      {isNative ? 'Core' : isConfigured ? 'Active' : 'Standby'}
                    </Badge>
                  </div>

                  <p className="text-xs text-foreground-muted leading-relaxed">
                    {isNative
                      ? 'Native employer job and internship lifecycle with application workflow.'
                      : p.name === 'ADZUNA'
                      ? 'Adzuna Job Search API indexing live national tech vacancies.'
                      : 'Udemy API provider for real course recommendations to close skill gaps.'}
                  </p>

                  <div className="pt-2 text-xs space-y-1 border-t border-border font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-foreground-subtle">Ingested Records:</span>
                      <span className="font-medium text-foreground">{p.recordsCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground-subtle">Target Type:</span>
                      <span className="text-foreground-muted">{p.type}</span>
                    </div>
                  </div>
                </div>

                {!isNative && (
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={syncingProvider === p.name}
                    onClick={() => handleTriggerSyncProvider(p.name)}
                    leftIcon={<RefreshCw className={`w-3 h-3 ${syncingProvider === p.name ? 'animate-spin' : ''}`} />}
                  >
                    {syncingProvider === p.name ? 'Syncing...' : 'Sync Adapter'}
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* 5. Ingestion Audit Logs Terminal */}
      <Card className="p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-foreground-subtle" />
            <h3 className="text-sm sm:text-base font-semibold text-foreground">
              Recent Provider Sync Logs
            </h3>
          </div>
          <span className="font-mono text-[11px] text-foreground-subtle">Audit Trail</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-border text-foreground-subtle text-[10px] uppercase">
                <th className="py-2 px-3">Timestamp</th>
                <th className="py-2 px-3">Provider</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">Ingested</th>
                <th className="py-2 px-3">Execution Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-foreground-subtle">
                    No sync logs recorded
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-elevated transition-colors">
                    <td className="py-2 px-3 text-foreground-subtle whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-2 px-3 text-foreground font-medium">{log.provider}</td>
                    <td className="py-2 px-3">
                      <Badge variant={log.status === 'SUCCESS' ? 'success' : 'error'} size="sm">
                        {log.status}
                      </Badge>
                    </td>
                    <td className="py-2 px-3 text-foreground font-semibold">
                      +{log.recordsIngested || 0} items
                    </td>
                    <td className="py-2 px-3 text-foreground-subtle">{log.durationMs || 420}ms</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
