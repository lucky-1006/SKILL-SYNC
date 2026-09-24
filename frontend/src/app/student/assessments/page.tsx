'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import {
  CheckSquare,
  Clock,
  Award,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  X,
  Play,
  Sparkles
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [activeAssessment, setActiveAssessment] = useState<any | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState<number>(900); // 15 mins
  const [result, setResult] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    apiFetch<any[]>('/skills/assessments')
      .then((data) => setAssessments(data || []))
      .catch(() => setAssessments([]))
      .finally(() => setLoading(false));
  }, []);

  // Timer effect during active test
  useEffect(() => {
    if (!activeAssessment || result) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeAssessment, result]);

  const startTest = async (assessmentId: string) => {
    try {
      const data = await apiFetch<any>(`/skills/assessments/${assessmentId}`);
      setActiveAssessment(data);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setTimeLeft(data.durationMinutes * 60);
      setResult(null);
    } catch (err) {
      console.error('Failed to start test:', err);
    }
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleSubmit = async () => {
    if (!activeAssessment || submitting) return;
    setSubmitting(true);

    const answers = Object.entries(selectedAnswers).map(([qId, optIdx]) => ({
      questionId: qId,
      selectedOptionIndex: optIdx
    }));

    try {
      const res = await apiFetch<any>(`/skills/assessments/${activeAssessment.id}/submit`, {
        method: 'POST',
        body: JSON.stringify({
          assessmentId: activeAssessment.id,
          answers,
          timeSpentSeconds: activeAssessment.durationMinutes * 60 - timeLeft
        })
      });
      setResult(res);
    } catch (err) {
      console.error('Failed to submit assessment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto py-2">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2 text-foreground">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-foreground-subtle">
            <span>Student</span>
            <span>/</span>
            <span className="text-foreground">Skill Assessments</span>
            <span className="text-border">•</span>
            <Badge variant="neutral" size="sm">
              Standardized Bank
            </Badge>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
            Skill Assessments & Certification Tests
          </h1>
          <p className="text-xs text-foreground-muted max-w-xl">
            Complete timed evaluations to update verified competency scores and unlock high-match enterprise internships.
          </p>
        </div>

        <div className="px-3 py-1.5 bg-surface-elevated rounded-md border border-border text-left sm:text-right shrink-0 text-xs font-mono">
          <span className="text-[10px] uppercase text-foreground-subtle block">
            Available Modules
          </span>
          <span className="text-sm font-bold text-foreground">
            {assessments.length} Active Tests
          </span>
        </div>
      </div>

      {/* Active Test Screen Modal */}
      {activeAssessment && !result && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 shadow-elevation border border-border animate-fade-in text-xs space-y-4">
            {/* Top Bar: Progress & Timer */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <span className="text-[10px] font-mono text-accent uppercase">
                  {activeAssessment.category?.replace(/_/g, ' ')}
                </span>
                <h3 className="font-semibold text-sm sm:text-base text-foreground mt-0.5">
                  {activeAssessment.title}
                </h3>
                <span className="text-[11px] text-foreground-subtle font-mono">
                  Question {currentQuestionIndex + 1} of {activeAssessment.questions.length}
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-surface-elevated text-accent border border-border px-2.5 py-1 rounded font-mono text-xs font-semibold">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTime(timeLeft)}</span>
              </div>
            </div>

            {/* Current Question */}
            {activeAssessment.questions && activeAssessment.questions[currentQuestionIndex] && (
              <div className="space-y-3">
                <p className="text-xs sm:text-sm font-medium text-foreground leading-relaxed">
                  {activeAssessment.questions[currentQuestionIndex].text}
                </p>

                {activeAssessment.questions[currentQuestionIndex].codeSnippet && (
                  <pre className="p-3 bg-surface-elevated text-accent font-mono text-[11px] rounded-md overflow-x-auto border border-border">
                    {activeAssessment.questions[currentQuestionIndex].codeSnippet}
                  </pre>
                )}

                {/* Options */}
                <div className="space-y-1.5 pt-1">
                  {activeAssessment.questions[currentQuestionIndex].options.map(
                    (opt: string, idx: number) => {
                      const qId = activeAssessment.questions[currentQuestionIndex].id;
                      const isSelected = selectedAnswers[qId] === idx;
                      return (
                        <div
                          key={idx}
                          onClick={() => handleSelectOption(qId, idx)}
                          className={`p-3 rounded-md text-xs cursor-pointer border transition-colors flex items-center gap-2.5 ${
                            isSelected
                              ? 'bg-accent/10 border-accent/40 font-medium text-foreground'
                              : 'bg-surface-elevated/40 hover:bg-surface-elevated border-border text-foreground-muted hover:text-foreground'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded flex items-center justify-center font-mono text-[10px] font-semibold shrink-0 border ${
                              isSelected
                                ? 'bg-accent text-background border-accent'
                                : 'bg-surface border-border text-foreground-subtle'
                            }`}
                          >
                            {String.fromCharCode(65 + idx)}
                          </div>
                          <span>{opt}</span>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            )}

            {/* Navigation & Submit */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <Button
                variant="secondary"
                size="sm"
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
              >
                Previous
              </Button>

              <div className="flex items-center gap-2">
                {currentQuestionIndex < activeAssessment.questions.length - 1 ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                  >
                    Next Question
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    isLoading={submitting}
                    onClick={handleSubmit}
                  >
                    Submit Assessment
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Result Screen Modal */}
      {result && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-lg max-w-lg w-full p-5 shadow-elevation border border-border animate-fade-in text-xs space-y-4">
            <div className="text-center space-y-2 pb-3 border-b border-border">
              <Badge variant="success" size="sm">
                Assessment Complete
              </Badge>
              <h3 className="font-semibold text-base text-foreground">
                Evaluation Results
              </h3>
              <div className="font-mono text-3xl font-bold text-accent">
                {result.score}%
              </div>
              <p className="text-xs text-foreground-muted">
                {result.passed ? 'Demonstrates mastery of core benchmarks.' : 'Needs further review of identified topics.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 bg-surface-elevated rounded border border-border">
                <span className="text-foreground-subtle text-[10px] block">Correct Answers</span>
                <span className="font-semibold text-foreground text-sm">{result.correctCount} / {result.totalQuestions}</span>
              </div>
              <div className="p-2.5 bg-surface-elevated rounded border border-border">
                <span className="text-foreground-subtle text-[10px] block">Time Spent</span>
                <span className="font-semibold text-foreground text-sm">{Math.round((result.timeSpentSeconds || 320) / 60)} mins</span>
              </div>
            </div>

            <div className="pt-2 border-t border-border flex justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setResult(null);
                  setActiveAssessment(null);
                }}
              >
                Return to Dashboard
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Assessment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assessments.map((a) => (
          <Card
            key={a.id}
            className="p-4 sm:p-5 flex flex-col justify-between space-y-3.5 hover:border-border-strong transition-colors"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-accent uppercase">
                  {a.category?.replace(/_/g, ' ')}
                </span>
                <Badge variant="neutral" size="sm">
                  {a.difficulty || 'Intermediate'}
                </Badge>
              </div>

              <h3 className="font-semibold text-sm sm:text-base text-foreground">
                {a.title}
              </h3>
              <p className="text-xs text-foreground-muted leading-relaxed">
                {a.description}
              </p>

              <div className="flex items-center gap-4 text-[11px] font-mono text-foreground-subtle pt-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {a.durationMinutes} mins
                </span>
                <span className="flex items-center gap-1">
                  <CheckSquare className="w-3 h-3" />
                  {a.questionCount || a.questions?.length || 10} Questions
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between">
              <span className="text-[10px] font-mono text-foreground-subtle">
                Pass mark: 70%
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={() => startTest(a.id)}
                leftIcon={<Play className="w-3 h-3" />}
              >
                Start Evaluation
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
