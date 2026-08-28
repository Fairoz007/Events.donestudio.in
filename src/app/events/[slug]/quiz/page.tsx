"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import confetti from "canvas-confetti";
import {
  Clock,
  Zap,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { soundFx } from "@/lib/sounds";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

export default function OnamQuizPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "onam-2026";
  const { isSignedIn } = useAuth();

  const quiz = useQuery(api.quizzes.getQuizBySlug, { slug: "onam-trivia-2026" });
  const questions = useQuery(
    api.quizzes.getQuizQuestionsForPlayer,
    quiz?._id ? { quizId: quiz._id } : "skip"
  );
  const activeSession = useQuery(
    api.quizzes.getUserActiveSession,
    quiz?._id && isSignedIn ? { quizId: quiz._id } : "skip"
  );

  const startSessionMutation = useMutation(api.quizzes.startQuizSession);
  const submitAnswerMutation = useMutation(api.quizzes.submitAnswer);

  const [manualSessionId, setManualSessionId] = useState<Id<"quizSessions"> | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [lastAnswerResult, setLastAnswerResult] = useState<{
    isCorrect: boolean;
    correctOptionIndex: number;
    explanation: string;
    pointsAwarded: number;
  } | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currentSessionId = manualSessionId ?? (activeSession && !activeSession.isCompleted ? activeSession._id : null);
  const currentQuestionIndex = activeSession?.currentQuestionIndex ?? 0;
  const currentQ = questions?.[currentQuestionIndex];
  const isCompleted = activeSession?.isCompleted ?? false;
  const isPlaying = !!currentSessionId && !isCompleted && !lastAnswerResult;

  // Countdown timer for current question
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentQuestionIndex, isPlaying]);

  // Start Quiz
  const handleStartQuiz = async () => {
    if (!quiz || !isSignedIn) return;
    setErrorMsg(null);
    soundFx.playClick();
    try {
      const session = await startSessionMutation({ quizId: quiz._id });
      if (session) {
        setManualSessionId(session._id);
        setLastAnswerResult(null);
        setSelectedOption(null);
        setTimeLeft(15);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to start quiz session";
      setErrorMsg(message);
    }
  };

  // Submit Answer
  const handleSelectOption = async (optionIndex: number) => {
    if (!currentSessionId || submitting || lastAnswerResult) return;

    setSelectedOption(optionIndex);
    setSubmitting(true);
    soundFx.playClick();

    try {
      const res = await submitAnswerMutation({
        sessionId: currentSessionId,
        questionIndex: currentQuestionIndex,
        selectedOption: optionIndex,
      });

      setLastAnswerResult({
        isCorrect: res.isCorrect,
        correctOptionIndex: res.correctOptionIndex,
        explanation: res.explanation,
        pointsAwarded: res.pointsAwarded,
      });

      if (res.isCorrect) {
        soundFx.playVictory();
      } else {
        soundFx.playDefeat();
      }

      if (res.isCompleted) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#f59e0b", "#10b981", "#38bdf8"],
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error submitting answer";
      setErrorMsg(message);
    } finally {
      setSubmitting(false);
    }
  };

  // Move to next question
  const handleNextQuestion = () => {
    soundFx.playClick();
    setLastAnswerResult(null);
    setSelectedOption(null);
    setTimeLeft(15);
  };

  // RENDER: Intro / Registration Check
  if (!currentSessionId || (!isPlaying && !lastAnswerResult && !isCompleted)) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
        <Link
          href={`/events/${slug}`}
          onClick={() => soundFx.playClick()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Onam 2026 Hub
        </Link>

        <div className="p-8 sm:p-12 rounded-3xl glass-panel-gold border border-amber-500/30 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-4xl mx-auto">
            🧠
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white">
              {quiz?.title || "Onam Cultural Quiz Arena"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              {quiz?.description || "Test your knowledge on King Mahabali folklore, Onasadya delicacies, Vallamkali boat races, and Kerala heritage."}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center justify-center gap-2 max-w-md mx-auto">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quiz Perks Ribbon */}
          <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto text-left">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-sm font-black text-amber-400">{questions?.length || 10} Questions</div>
              <div className="text-[10px] text-slate-400">Folklore & Culture</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-sm font-black text-emerald-400">15s Timer</div>
              <div className="text-[10px] text-slate-400">Speed Bonus Points</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-sm font-black text-sky-400">+1,500 XP</div>
              <div className="text-[10px] text-slate-400">Max Possible XP</div>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={handleStartQuiz}
              disabled={!isSignedIn || !quiz}
              className="px-8 py-4 rounded-2xl font-black text-sm bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:brightness-110 shadow-xl shadow-amber-500/20 transition-all hover:scale-105"
            >
              {isSignedIn ? "Start Cultural Quiz Now 🚀" : "Sign in to Play Quiz"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // RENDER: Completed Screen
  if (isCompleted) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-8 animate-in zoom-in-95">
        <div className="p-8 sm:p-12 rounded-3xl glass-panel-gold border border-amber-500/40 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-4xl mx-auto">
            🏆
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl font-black text-white">Quiz Completed!</h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Congratulations! Your score is securely verified and posted to the global Quiz Leaderboard.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 max-w-sm mx-auto space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase">Final Verified Score</div>
            <div className="text-4xl sm:text-5xl font-black text-amber-400">
              {activeSession?.score || 0} <span className="text-lg text-slate-300">XP</span>
            </div>
            <div className="text-xs text-emerald-400 font-bold">
              {activeSession?.correctAnswers || 0} / {questions?.length || 10} Correct Answers
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link
              href="/leaderboards"
              onClick={() => soundFx.playClick()}
              className="px-6 py-3 rounded-xl font-bold text-xs bg-amber-500 text-slate-950 hover:brightness-110 shadow-lg shadow-amber-500/20"
            >
              View Global Leaderboard →
            </Link>
            <Link
              href={`/events/${slug}`}
              onClick={() => soundFx.playClick()}
              className="px-6 py-3 rounded-xl font-bold text-xs bg-slate-800 text-white hover:bg-slate-700"
            >
              Back to Arena Hub
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // RENDER: Question & Answer Flow
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between glass-panel px-5 py-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400">
            Question <strong className="text-white">{currentQuestionIndex + 1}</strong> of {questions?.length || 10}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
            <Zap className="w-4 h-4 fill-amber-400" />
            <span>{activeSession?.score || 0} XP</span>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span className={timeLeft <= 5 ? "text-rose-400 animate-pulse font-mono" : "text-white font-mono"}>
              {timeLeft}s
            </span>
          </div>
        </div>
      </div>

      {/* Question Card */}
      {currentQ && (
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-slate-800 space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
              {currentQ.difficulty} · +{currentQ.points} Base XP
            </span>
            <h3 className="text-lg sm:text-xl font-black text-white leading-snug">
              {currentQ.question}
            </h3>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 gap-3">
            {currentQ.options.map((opt, idx) => {
              let optStyle = "glass-panel border-slate-800 text-slate-200 hover:border-amber-500/50 hover:bg-slate-800/40";

              if (lastAnswerResult) {
                if (idx === lastAnswerResult.correctOptionIndex) {
                  optStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-200 font-bold";
                } else if (idx === selectedOption && !lastAnswerResult.isCorrect) {
                  optStyle = "bg-rose-500/20 border-rose-500 text-rose-200";
                } else {
                  optStyle = "opacity-40 border-slate-800 text-slate-500";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={submitting || !!lastAnswerResult}
                  className={`p-4 rounded-2xl border text-left text-xs sm:text-sm font-semibold transition-all flex items-center justify-between ${optStyle}`}
                >
                  <span>{opt}</span>
                  {lastAnswerResult && idx === lastAnswerResult.correctOptionIndex && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  )}
                  {lastAnswerResult && idx === selectedOption && !lastAnswerResult.isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Answer Explanation & Next Button */}
          {lastAnswerResult && (
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${lastAnswerResult.isCorrect ? "text-emerald-400" : "text-rose-400"}`}>
                  {lastAnswerResult.isCorrect ? `✓ Correct! +${lastAnswerResult.pointsAwarded} XP awarded` : "✗ Incorrect answer"}
                </span>
                <button
                  onClick={handleNextQuestion}
                  className="px-5 py-2 rounded-xl text-xs font-black bg-amber-500 text-slate-950 hover:brightness-110 shadow-md"
                >
                  Next Question →
                </button>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {lastAnswerResult.explanation}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
