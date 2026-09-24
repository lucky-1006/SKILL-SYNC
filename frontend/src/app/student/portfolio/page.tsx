'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Github,
  Share2,
  Check,
  Building2,
  QrCode,
  Lock,
  Code2,
  GraduationCap,
  Copy,
  Terminal,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function StudentPortfolioPage() {
  const [portfolio, setPortfolio] = useState<any | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [verifyCode, setVerifyCode] = useState<string>('');
  const [verifyResult, setVerifyResult] = useState<any | null>(null);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    apiFetch<any>('/portfolio/student')
      .then((data) => setPortfolio(data))
      .catch(() => setPortfolio(null))
      .finally(() => setLoading(false));
  }, []);

  const handleCopyLink = () => {
    if (!portfolio) return;
    navigator.clipboard.writeText(portfolio.publicShareableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyCode) return;
    setVerifying(true);

    try {
      const res = await apiFetch<any>(`/portfolio/verify/${verifyCode.trim()}`);
      setVerifyResult(res);
    } catch (err) {
      setVerifyResult({ valid: false, message: 'Invalid or unregistered certificate code.' });
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[360px] bg-surface rounded-lg border border-border p-8">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs font-mono text-foreground-muted">Validating cryptographic credentials...</span>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="text-center py-16 bg-surface rounded-lg border border-border p-8">
        <p className="text-xs text-foreground-muted">Student digital portfolio could not be loaded.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Portfolio Card Header - Technical Supabase Passport */}
      <div className="bg-surface-elevated rounded-lg border border-border p-6 md:p-8 relative overflow-hidden">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-16 h-16 rounded-lg bg-surface border border-border flex items-center justify-center font-mono font-bold text-xl text-accent shrink-0">
              {portfolio.fullName.slice(0, 2).toUpperCase()}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">{portfolio.fullName}</h1>
                <Badge variant="success" size="sm" className="gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                  Verified Profile
                </Badge>
              </div>
              <p className="text-xs text-foreground-muted">{portfolio.headline}</p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-foreground-muted pt-1">
                <span>{portfolio.institutionName}</span>
                <span>•</span>
                <span>{portfolio.branch}</span>
                <span>•</span>
                <span className="font-mono text-foreground">CGPA: {portfolio.cgpa}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-2.5 shrink-0">
            <div className="font-mono text-[11px] text-foreground-muted px-2.5 py-1 rounded bg-surface border border-border flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-accent" />
              #AIIA-2026-VAL
            </div>
            <Button
              onClick={handleCopyLink}
              variant="primary"
              size="sm"
              className="font-medium"
            >
              {copied ? <Check className="w-3.5 h-3.5 mr-1.5" /> : <Share2 className="w-3.5 h-3.5 mr-1.5" />}
              {copied ? 'Link Copied' : 'Share Transcript'}
            </Button>
          </div>
        </div>
      </div>

      {/* Verified Skills Section */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-accent" />
            <CardTitle>Verified Competency Ledger</CardTitle>
          </div>
          <CardDescription>
            Audited through faculty assessments and proctored technical evaluations with recorded verification scores.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {portfolio.skills?.map((s: any) => (
              <div
                key={s.skillId}
                className="p-3 rounded-lg bg-surface border border-border hover:border-border-strong transition-colors flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <span className="font-medium text-xs text-foreground block">{s.skillName}</span>
                  <span className="text-[10px] text-foreground-muted flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-accent" />
                    {s.verified ? 'Faculty Endorsed' : 'Exam Tested'}
                  </span>
                </div>
                <span className="font-mono text-xs font-semibold text-accent px-1.5 py-0.5 rounded bg-surface-elevated border border-border">
                  {s.score}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Verified Projects Showcase */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-accent" />
            <CardTitle>Verified Project Deliverables</CardTitle>
          </div>
          <CardDescription>
            Production codebases and research implementations validated by faculty and corporate mentors.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {portfolio.projects?.map((proj: any) => (
              <div
                key={proj.id}
                className="p-4 rounded-lg bg-surface border border-border hover:border-border-strong transition-colors flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-medium text-xs text-foreground">
                      {proj.title}
                    </h4>
                    {proj.verifiedByMentor && (
                      <Badge variant="success" size="sm" className="font-mono text-[10px]">
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-foreground-muted leading-relaxed">{proj.description}</p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {proj.skillsUsed?.map((sk: string) => (
                      <span
                        key={sk}
                        className="px-2 py-0.5 bg-surface-elevated border border-border text-foreground-muted rounded text-[10px] font-mono"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {proj.githubUrl && (
                  <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                    <a
                      href={proj.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-foreground-muted hover:text-foreground font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <Github className="w-3.5 h-3.5" />
                      Repository
                    </a>
                    {proj.liveDemoUrl && (
                      <a
                        href={proj.liveDemoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-accent hover:underline font-medium flex items-center gap-1 transition-colors"
                      >
                        Live Demo <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Verified Certificates & Live Verification Engine */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-accent" />
            <CardTitle>Institutional Credentials</CardTitle>
          </div>
          <CardDescription>
            Secured with unique cryptographic identifiers verifiable across accredited institutions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2.5">
            {portfolio.certificates?.map((cert: any) => (
              <div
                key={cert.id}
                className="p-3.5 rounded-lg bg-surface border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <h4 className="font-medium text-xs text-foreground">{cert.title}</h4>
                  <p className="text-foreground-muted text-xs">
                    Conferred by: <strong className="text-foreground font-medium">{cert.issuingOrganization}</strong> • Issue Date: {cert.issueDate}
                  </p>
                  <span className="font-mono text-[11px] text-accent block pt-0.5">
                    Hash: {cert.verificationCode}
                  </span>
                </div>
                <Badge variant="success" size="sm" className="font-mono text-[10px] self-start sm:self-center">
                  {cert.verificationStatus}
                </Badge>
              </div>
            ))}
          </div>

          {/* Public Verifier Form */}
          <div className="p-4 rounded-lg bg-surface-elevated border border-border space-y-3">
            <div className="flex items-center gap-2 text-foreground font-medium text-xs">
              <Lock className="w-3.5 h-3.5 text-accent" />
              Public Verification Engine
            </div>
            <p className="text-xs text-foreground-muted leading-relaxed">
              Recruiters or academic evaluators can enter any student credential hash to verify institutional authenticity against the central registry.
            </p>

            <form onSubmit={handleVerifyCode} className="flex flex-col sm:flex-row gap-2 pt-1">
              <input
                type="text"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                placeholder="e.g. SKILLSYNC-AIIA-2026-ML-98214"
                className="input-base flex-1 font-mono text-xs"
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={verifying}
                className="shrink-0"
              >
                {verifying ? 'Verifying...' : 'Verify Hash'}
              </Button>
            </form>

            {verifyResult && (
              <div
                className={`p-3 rounded-md text-xs border animate-in fade-in font-mono ${
                  verifyResult.valid
                    ? 'bg-accent/10 border-accent/30 text-accent'
                    : 'bg-destructive/10 border-destructive/30 text-destructive'
                }`}
              >
                {verifyResult.valid ? (
                  <div>
                    <p className="font-semibold">✓ Cryptographically Verified Credential</p>
                    <p className="text-[11px] mt-1 text-foreground">
                      Conferred to <strong>{verifyResult.studentName}</strong> ({verifyResult.institution}) by {verifyResult.issuingOrganization}.
                    </p>
                  </div>
                ) : (
                  <p className="font-medium">{verifyResult.message}</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
