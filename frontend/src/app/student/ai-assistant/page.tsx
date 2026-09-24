'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import {
  Bot,
  FileCheck2,
  Video,
  Send,
  Sparkles,
  Award,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  BrainCircuit,
  MessageSquare,
  Layers,
  Cpu,
  Database,
  Network,
  Activity,
  Sliders,
  ShieldCheck,
  Check,
  Zap,
  Info,
  ChevronRight,
  Terminal
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { FormattedMessage } from '@/components/ui/FormattedMessage';

export default function AIAssistantPage() {
  const [activeTab, setActiveTab] = useState<'CHAT' | 'RESUME' | 'INTERVIEW' | 'ARCHITECTURE'>('CHAT');

  // Multi-Model Telemetry state
  const [telemetry, setTelemetry] = useState<any | null>(null);
  const [placementPrediction, setPlacementPrediction] = useState<any | null>(null);

  // Chat state
  const [chatMessages, setChatMessages] = useState<
    { sender: 'user' | 'ai'; text: string; modelUsed?: string; sources?: any[] }[]
  >([
    {
      sender: 'ai',
      text: 'Hello Swastik! I am your SkillSync AI Career & Collaboration Assistant, powered by live Groq LPU Inference and Google Gemini Cloud with Multi-Stage RAG. How can I assist your career progression today?',
      modelUsed: 'Groq & Gemini Cloud (Live Inference)'
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Resume state
  const [resumeText, setResumeText] = useState(
    `Swastik Singh - B.Tech CSE (3rd Year), All India Institute of Ayurveda & Technology. CGPA: 8.7
Skills: Python, Scikit-Learn, SQL, Git, Ayush Health Standards, FastAPI.
Projects:
- AyurScan: Machine learning botanical classifier using PyTorch and FastAPI.
- HealthGraph RAG: Classical text search knowledge base using embeddings.
Experience:
- Intern at TCS Bio-IT developing biomedical datasets and preprocessing pipelines.`
  );
  const [resumeResult, setResumeResult] = useState<any | null>(null);
  const [resumeLoading, setResumeLoading] = useState(false);

  // Interview state
  const [interviewQuestions, setInterviewQuestions] = useState<any[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [interviewEval, setInterviewEval] = useState<any | null>(null);
  const [interviewLoading, setInterviewLoading] = useState(false);

  useEffect(() => {
    // Fetch telemetry and placement prediction
    apiFetch<any>('/ai/orchestrator/status')
      .then((data) => setTelemetry(data))
      .catch(() => {});

    apiFetch<any>('/ai/placement-predict', {
      method: 'POST',
      body: JSON.stringify({ skillScoreAvg: 78, cgpa: 8.7 })
    })
      .then((data) => setPlacementPrediction(data))
      .catch(() => {});
  }, []);

  // Chat submit via Multi-Stage RAG
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || chatLoading) return;

    const userText = inputQuery;
    setInputQuery('');
    setChatMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setChatLoading(true);

    try {
      const res = await apiFetch<any>('/ai/assistant', {
        method: 'POST',
        body: JSON.stringify({ query: userText })
      });
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: res.reply,
          modelUsed: res.modelUsed,
          sources: res.retrievedSources
        }
      ]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'I encountered an issue processing your query. Please try again.' }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Resume submit
  const handleResumeAnalyze = async () => {
    if (!resumeText.trim() || resumeLoading) return;
    setResumeLoading(true);

    try {
      const res = await apiFetch<any>('/ai/resume-analyzer', {
        method: 'POST',
        body: JSON.stringify({ resumeText, targetRole: 'AI & Machine Learning Engineer' })
      });
      setResumeResult(res);
    } catch (err) {
      console.error('Resume analysis failed:', err);
    } finally {
      setResumeLoading(false);
    }
  };

  // Start interview
  const handleStartInterview = async () => {
    setInterviewLoading(true);
    try {
      const res = await apiFetch<any>('/ai/mock-interview/generate', {
        method: 'POST',
        body: JSON.stringify({ targetRole: 'AI & Machine Learning Engineer' })
      });
      setInterviewQuestions(res.questions || []);
      setCurrentQIndex(0);
      setUserAnswer('');
      setInterviewEval(null);
    } catch (err) {
      console.error('Failed to generate interview questions:', err);
    } finally {
      setInterviewLoading(false);
    }
  };

  // Evaluate interview answer
  const handleEvaluateAnswer = async () => {
    if (!userAnswer.trim() || interviewLoading) return;
    setInterviewLoading(true);

    try {
      const q = interviewQuestions[currentQIndex];
      const res = await apiFetch<any>('/ai/mock-interview/evaluate', {
        method: 'POST',
        body: JSON.stringify({
          questionId: q.id,
          questionText: q.question,
          answer: userAnswer
        })
      });
      setInterviewEval(res);
    } catch (err) {
      console.error('Answer evaluation failed:', err);
    } finally {
      setInterviewLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[11px] text-accent font-medium">AI ORCHESTRATION</span>
            <span className="text-foreground-muted text-xs">•</span>
            <span className="text-xs text-foreground-muted">Multi-Model Cognitive Suite</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
            AI Intelligence Suite
          </h1>
          <p className="text-xs text-foreground-muted mt-0.5">
            Groq Cloud LPU inference paired with dense semantic vectors, cross-encoder reranking, and predictive analytics.
          </p>
        </div>

        <div className="flex items-center gap-2.5 p-2.5 bg-surface rounded-lg border border-border shrink-0">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <div className="space-y-0.5">
            <span className="font-mono text-[10px] text-foreground-muted block uppercase">Engines Online</span>
            <span className="font-mono text-xs font-medium text-foreground">Groq LPU + Gemini 1.5</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-surface rounded-lg border border-border overflow-x-auto">
        <button
          onClick={() => setActiveTab('CHAT')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap ${
            activeTab === 'CHAT'
              ? 'bg-surface-elevated text-foreground border border-border shadow-xs'
              : 'text-foreground-muted hover:text-foreground'
          }`}
        >
          <Bot className="w-3.5 h-3.5 text-accent" />
          AI Counselor (RAG)
        </button>
        <button
          onClick={() => setActiveTab('ARCHITECTURE')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap ${
            activeTab === 'ARCHITECTURE'
              ? 'bg-surface-elevated text-foreground border border-border shadow-xs'
              : 'text-foreground-muted hover:text-foreground'
          }`}
        >
          <Network className="w-3.5 h-3.5 text-accent" />
          Model Architecture & Telemetry
        </button>
        <button
          onClick={() => setActiveTab('RESUME')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap ${
            activeTab === 'RESUME'
              ? 'bg-surface-elevated text-foreground border border-border shadow-xs'
              : 'text-foreground-muted hover:text-foreground'
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5 text-accent" />
          Document AI & ATS Scanner
        </button>
        <button
          onClick={() => setActiveTab('INTERVIEW')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap ${
            activeTab === 'INTERVIEW'
              ? 'bg-surface-elevated text-foreground border border-border shadow-xs'
              : 'text-foreground-muted hover:text-foreground'
          }`}
        >
          <Video className="w-3.5 h-3.5 text-accent" />
          Mock Interview Simulator
        </button>
      </div>

      {/* TAB 1: Chatbot with Groq & RAG Citations */}
      {activeTab === 'CHAT' && (
        <Card className="flex flex-col h-[560px] overflow-hidden">
          {/* Chat Messages */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 font-mono text-xs">
            {chatMessages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 leading-relaxed max-w-2xl ${
                  m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`w-7 h-7 rounded flex items-center justify-center shrink-0 font-mono text-[11px] font-bold ${
                    m.sender === 'user'
                      ? 'bg-accent text-background'
                      : 'bg-surface-elevated text-accent border border-border'
                  }`}
                >
                  {m.sender === 'user' ? 'ME' : <Bot className="w-4 h-4" />}
                </div>
                <div
                  className={`p-3.5 rounded-lg space-y-2 ${
                    m.sender === 'user'
                      ? 'bg-accent/15 text-foreground border border-accent/30 font-sans'
                      : 'bg-surface border border-border text-foreground font-sans'
                  }`}
                >
                  {m.modelUsed && (
                    <div className="flex items-center gap-1 text-[10px] font-mono text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20 w-fit">
                      <Zap className="w-3 h-3 text-accent" />
                      {m.modelUsed}
                    </div>
                  )}

                  <div className="text-xs leading-relaxed">
                    <FormattedMessage content={m.text} isUser={m.sender === 'user'} />
                  </div>

                  {/* RAG Retrieved Sources */}
                  {m.sources && m.sources.length > 0 && (
                    <div className="pt-2 border-t border-border text-[11px] font-mono text-foreground-muted space-y-1">
                      <span className="font-semibold block text-foreground uppercase tracking-wider text-[10px]">
                        RAG Retrieved Sources:
                      </span>
                      {m.sources.map((s: any) => (
                        <div key={s.id} className="flex items-center justify-between bg-surface-elevated p-1.5 rounded border border-border">
                          <span className="text-foreground">{s.title}</span>
                          <span className="text-accent font-semibold ml-2">{s.relevanceScore}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex gap-3 text-xs max-w-md">
                <div className="w-7 h-7 rounded bg-surface-elevated border border-border text-accent flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 animate-pulse" />
                </div>
                <div className="p-3 bg-surface rounded-lg text-foreground-muted border border-border flex items-center gap-2 font-mono text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
                  Groq LPU executing RAG vector search & natural reasoning...
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-4 py-2 bg-surface-elevated border-t border-border flex items-center gap-2 overflow-x-auto text-xs">
            <span className="font-mono text-[10px] text-foreground-muted uppercase tracking-wider shrink-0">Prompts:</span>
            {[
              'What skills should I prioritize for ML Engineer?',
              'What are the Ayush NAMASTE terminology standards?',
              'Why did I match 92% for TCS Bio-IT?',
              'Explain the mandatory 6-month internship credits'
            ].map((prompt) => (
              <button
                key={prompt}
                onClick={() => setInputQuery(prompt)}
                className="px-2.5 py-1 bg-surface border border-border hover:border-accent hover:text-accent rounded text-foreground-muted whitespace-nowrap text-[11px] transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleChatSubmit} className="p-3 bg-surface border-t border-border flex gap-2">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask anything (routed to Groq LPU with domain RAG context)..."
              className="input-base flex-1 text-xs"
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={chatLoading}
              className="shrink-0"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              Send
            </Button>
          </form>
        </Card>
      )}

      {/* TAB 2: Multi-Model Architecture & Telemetry */}
      {activeTab === 'ARCHITECTURE' && (
        <div className="space-y-6">
          {/* Visual Architecture Topology */}
          <div className="p-6 bg-surface-elevated rounded-lg border border-border space-y-4">
            <div>
              <span className="font-mono text-[11px] font-medium text-accent flex items-center gap-1.5">
                <Network className="w-3.5 h-3.5" />
                MULTI-MODEL DISPATCH TOPOLOGY
              </span>
              <h3 className="text-base font-semibold text-foreground mt-1">
                Central AI Orchestrator & Workload Routing
              </h3>
              <p className="text-xs text-foreground-muted mt-0.5">
                Each cognitive workload is dispatched to the optimal model architecture for accuracy, latency, and explainability.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
              <div className="p-3 rounded-lg bg-surface border border-border space-y-1.5">
                <span className="font-mono text-[10px] text-accent uppercase block">Model 1: Reasoning</span>
                <h4 className="font-medium text-xs text-foreground">Groq Cloud LPU</h4>
                <p className="text-[11px] text-foreground-muted leading-tight">
                  llama-3.3-70b-versatile for chat & career guidance.
                </p>
                <span className="font-mono text-[10px] text-foreground-muted block pt-1">
                  Latency: ~380ms
                </span>
              </div>

              <div className="p-3 rounded-lg bg-surface border border-border space-y-1.5">
                <span className="font-mono text-[10px] text-accent uppercase block">Model 2: Embeddings</span>
                <h4 className="font-medium text-xs text-foreground">Dense Vectors</h4>
                <p className="text-[11px] text-foreground-muted leading-tight">
                  384-dimensional embeddings for profiles & vacancies.
                </p>
                <span className="font-mono text-[10px] text-foreground-muted block pt-1">
                  Cosine Match
                </span>
              </div>

              <div className="p-3 rounded-lg bg-surface border border-border space-y-1.5">
                <span className="font-mono text-[10px] text-accent uppercase block">Model 3: Reranker</span>
                <h4 className="font-medium text-xs text-foreground">Cross-Encoder</h4>
                <p className="text-[11px] text-foreground-muted leading-tight">
                  Refines Top-50 vector matches to Top-10 verified candidates.
                </p>
                <span className="font-mono text-[10px] text-foreground-muted block pt-1">
                  Two-Stage RAG
                </span>
              </div>

              <div className="p-3 rounded-lg bg-surface border border-border space-y-1.5">
                <span className="font-mono text-[10px] text-accent uppercase block">Model 4: Predictive</span>
                <h4 className="font-medium text-xs text-foreground">Placement ML</h4>
                <p className="text-[11px] text-foreground-muted leading-tight">
                  Supervised 7-feature logistic probability predictor.
                </p>
                <span className="font-mono text-[10px] text-foreground-muted block pt-1">
                  Deterministic
                </span>
              </div>

              <div className="p-3 rounded-lg bg-surface border border-border space-y-1.5">
                <span className="font-mono text-[10px] text-accent uppercase block">Model 5: Parser</span>
                <h4 className="font-medium text-xs text-foreground">Document AI</h4>
                <p className="text-[11px] text-foreground-muted leading-tight">
                  Tokenizes resumes & certificates into structured JSON.
                </p>
                <span className="font-mono text-[10px] text-foreground-muted block pt-1">
                  Token Parser
                </span>
              </div>
            </div>
          </div>

          {/* Model 4 Classical ML Widget: Placement Probability Predictor */}
          {placementPrediction && (
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="w-4 h-4 text-accent" />
                      <span className="font-mono text-[11px] text-accent uppercase">MODEL 4 CLASSICAL ML</span>
                    </div>
                    <CardTitle>Placement Probability & Readiness</CardTitle>
                    <CardDescription>
                      Calculated using multi-factor supervised logistic regression based on historical institutional placement outcomes.
                    </CardDescription>
                  </div>
                  <div className="p-3 bg-surface-elevated rounded-lg border border-border text-center shrink-0 min-w-[140px]">
                    <span className="font-mono text-[10px] uppercase text-foreground-muted block">
                      Placement Probability
                    </span>
                    <span className="font-mono text-2xl font-semibold text-accent mt-0.5 block">
                      {placementPrediction.placementProbabilityPercentage}%
                    </span>
                    <span className="font-mono text-[11px] text-foreground-muted block mt-0.5">
                      Tier: {placementPrediction.readinessTier?.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 7-Feature Decomposition */}
                <div className="space-y-2">
                  <span className="font-mono text-[11px] text-foreground-muted block uppercase">
                    7-Feature Contribution Decomposition:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {placementPrediction.featureWeights?.map((f: any) => (
                      <div key={f.feature} className="p-2.5 bg-surface rounded-lg border border-border flex items-center justify-between">
                        <div>
                          <span className="font-medium text-foreground block">{f.feature}</span>
                          <span className="font-mono text-[10px] text-foreground-muted">Score: {f.studentValue}% • Weight: {f.weight}</span>
                        </div>
                        <span className="font-mono text-xs font-semibold text-accent">+{f.contribution}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Highest Lever Improvement */}
                {placementPrediction.highestLeverImprovement && (
                  <div className="p-3 bg-surface-elevated rounded-lg border border-border text-xs space-y-1">
                    <span className="font-mono text-[11px] text-accent flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Optimal Readiness Lever:
                    </span>
                    <p className="text-foreground-muted leading-relaxed text-xs">
                      {placementPrediction.highestLeverImprovement.recommendedAction}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* TAB 3: Document AI & ATS Scanner */}
      {activeTab === 'RESUME' && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-accent" />
                <CardTitle>Document AI Parser & ATS Scanner</CardTitle>
              </div>
              <CardDescription>
                Model 5 extracts tokens and structured entities; Model 1 (Groq) refactors bullet points with quantified achievements.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                rows={6}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="input-base w-full font-mono text-xs leading-relaxed"
              />

              <Button
                variant="primary"
                size="sm"
                onClick={handleResumeAnalyze}
                disabled={resumeLoading}
              >
                {resumeLoading ? 'Parsing & Evaluating...' : 'Run Document AI & ATS Analysis'}
              </Button>
            </CardContent>
          </Card>

          {resumeResult && (
            <Card className="animate-in fade-in">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="font-mono text-[10px] uppercase text-foreground-muted">Benchmark Role</span>
                    <CardTitle className="text-base">{resumeResult.targetRole}</CardTitle>
                  </div>
                  <div className="p-3 bg-surface-elevated rounded-lg border border-border text-center shrink-0 min-w-[120px]">
                    <span className="font-mono text-[10px] uppercase text-foreground-muted block">
                      ATS Score
                    </span>
                    <span className="font-mono text-2xl font-semibold text-accent mt-0.5 block">
                      {resumeResult.atsScore}/100
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Document AI Parsed Entities */}
                {resumeResult.parsedDocumentInfo && (
                  <div className="p-3 bg-surface rounded-lg border border-border text-xs space-y-1.5">
                    <span className="font-mono text-[11px] text-foreground-muted block uppercase">
                      Model 5 Extracted Entities:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {resumeResult.parsedDocumentInfo.extractedSkills?.map((sk: string) => (
                        <span key={sk} className="px-2 py-0.5 rounded bg-surface-elevated border border-border text-foreground text-[10px] font-mono">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strengths vs Missing */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-surface rounded-lg border border-border space-y-1.5">
                    <span className="font-mono text-[11px] text-accent block flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Detected Keywords & Strengths:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {resumeResult.strengths?.map((s: string) => (
                        <span key={s} className="px-2 py-0.5 rounded bg-accent/10 text-accent border border-accent/20 text-[10px] font-mono">
                          ✓ {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-surface rounded-lg border border-border space-y-1.5">
                    <span className="font-mono text-[11px] text-warning block flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Missing High-Impact Keywords:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {resumeResult.missingCriticalKeywords?.map((m: string) => (
                        <span key={m} className="px-2 py-0.5 rounded bg-warning/10 text-warning border border-warning/20 text-[10px] font-mono">
                          ⚠ {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Groq Bullet Point Suggestions */}
                <div className="space-y-2 text-xs">
                  <h5 className="font-medium text-foreground">Groq LLM Quantified Bullet Point Suggestions:</h5>
                  {resumeResult.bulletPointSuggestions?.map((item: any, idx: number) => (
                    <div key={idx} className="p-3 bg-surface rounded-lg border border-border space-y-1">
                      <p className="text-foreground-muted line-through text-xs font-mono">"{item.before}"</p>
                      <p className="font-medium text-accent text-xs font-mono">→ "{item.after}"</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* TAB 4: Groq Mock Interview Simulator */}
      {activeTab === 'INTERVIEW' && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-accent" />
                  <CardTitle>Mock Technical Interview</CardTitle>
                </div>
                <CardDescription>
                  Evaluated in real-time by Groq Cloud LPU inference across technical depth, system design, and communication.
                </CardDescription>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={handleStartInterview}
                disabled={interviewLoading}
              >
                {interviewLoading ? 'Generating...' : 'Start Session'}
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {interviewQuestions.length > 0 ? (
              <div className="space-y-4">
                <div className="p-3.5 bg-surface rounded-lg border border-border space-y-1.5">
                  <span className="font-mono text-[10px] text-accent uppercase">
                    Question {currentQIndex + 1} of {interviewQuestions.length} • {interviewQuestions[currentQIndex].category}
                  </span>
                  <h4 className="font-medium text-sm text-foreground leading-relaxed">
                    {interviewQuestions[currentQIndex].question}
                  </h4>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground block">
                    Structured technical response:
                  </label>
                  <textarea
                    rows={4}
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Explain methodologies, mathematical trade-offs, and system design considerations..."
                    className="input-base w-full text-xs"
                  />
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleEvaluateAnswer}
                  disabled={interviewLoading}
                >
                  {interviewLoading ? 'Evaluating...' : 'Submit for Groq Evaluation'}
                </Button>

                {interviewEval && (
                  <div className="p-4 bg-surface-elevated rounded-lg border border-border space-y-2.5 animate-in fade-in">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="font-mono text-[11px] uppercase text-accent font-semibold">
                        Rating: {interviewEval.overallRating}
                      </span>
                      <div className="flex gap-3 text-xs font-mono">
                        <span className="text-accent">
                          Tech: {interviewEval.technicalScore}/100
                        </span>
                        <span className="text-foreground">
                          Comm: {interviewEval.communicationScore}/100
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-foreground-muted leading-relaxed">
                      <FormattedMessage content={interviewEval.feedback} />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10 bg-surface rounded-lg border border-border">
                <Video className="w-8 h-8 text-foreground-muted mx-auto mb-2 opacity-50" />
                <p className="text-xs text-foreground-muted">
                  Click "Start Session" to generate technical interview questions for AI & Machine Learning Engineer.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
