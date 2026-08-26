"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
  Sparkles,
  Trophy,
  HelpCircle,
  Clock,
  Zap,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Award,
  Flame,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { soundFx } from "@/lib/sounds";

interface QuestionItem {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  points: number;
  difficulty: "easy" | "medium" | "hard";
}

const ONAM_QUESTIONS: QuestionItem[] = [
  {
    id: 1,
    question: "According to Kerala legend, which mythical King visits his beloved subjects during Onam?",
    options: ["King Mahabali (Maveli)", "King Harishchandra", "King Vikramaditya", "King Ashoka"],
    correctIndex: 0,
    explanation: "King Mahabali was celebrated for his generosity, equity, and righteousness, and Onam honors his annual visit from the netherworld (Pathalam).",
    points: 100,
    difficulty: "easy",
  },
  {
    id: 2,
    question: "What is the famous traditional floral carpet created during the ten days of Onam called?",
    options: ["Kolam", "Rangoli", "Pookalam", "Alpona"],
    correctIndex: 2,
    explanation: "Pookalam ('Poo' meaning flower and 'Kalam' meaning decorative floor pattern) is laid out with fresh petals in sacred circular geometry.",
    points: 100,
    difficulty: "easy",
  },
  {
    id: 3,
    question: "Which sacred avatar of Lord Vishnu is associated with the story of King Mahabali?",
    options: ["Matsya", "Kurma", "Narasimha", "Vamana"],
    correctIndex: 3,
    explanation: "Vamana, the dwarf Brahmin incarnation, visited King Mahabali and asked for three paces of land.",
    points: 100,
    difficulty: "easy",
  },
  {
    id: 4,
    question: "What is the traditional snake boat race held on the Pampa River during the Onam season called?",
    options: ["Aranmula Uthrattathi Vallamkali", "Nehru Trophy", "Chambakulam Moolam", "Kumarakom Race"],
    correctIndex: 0,
    explanation: "The Aranmula Uthrattathi Vallamkali is the oldest and most revered traditional boat festival held on the sacred Pampa river.",
    points: 100,
    difficulty: "medium",
  },
  {
    id: 5,
    question: "How many traditional vegetarian delicacies are typically served on a banana leaf during Onasadya?",
    options: ["9 to 11", "24 to 28 or more", "15 to 18", "Exactly 10"],
    correctIndex: 1,
    explanation: "A grand Onasadya typically features 24 to 28+ distinct delicacies including Parippu, Sambar, Aviyal, Olan, Thoran, Kalan, and Payasam.",
    points: 100,
    difficulty: "medium",
  },
  {
    id: 6,
    question: "Which energetic folk art form featuring painted tiger body artwork is celebrated in Thrissur during Onam?",
    options: ["Kathakali", "Pulikali (Kaduvakali)", "Theyyam", "Kalaripayattu"],
    correctIndex: 1,
    explanation: "Pulikali (Tiger Dance) is a vibrant street performance where artists paint their bodies like tigers and leopards to the rhythmic beats of traditional drums.",
    points: 100,
    difficulty: "easy",
  },
  {
    id: 7,
    question: "On which Malayalam calendar day does the grand finale of Onam fall in the month of Chingam?",
    options: ["Atham", "Chithira", "Uthradam", "Thiruvonam"],
    correctIndex: 3,
    explanation: "Atham marks Day 1 of Onam celebrations, while Thiruvonam is the auspicious 10th day marking the peak of the festival.",
    points: 100,
    difficulty: "medium",
  },
  {
    id: 8,
    question: "What is the traditional sweet dessert pudding served at the end of Onasadya?",
    options: ["Payasam (Pradhaman)", "Unniyappam", "Neyyappam", "Kozhukatta"],
    correctIndex: 0,
    explanation: "Ada Pradhaman and Palada Payasam are Kerala's quintessential festival desserts made with jaggery/milk, rice flakes, and coconut milk.",
    points: 100,
    difficulty: "easy",
  },
  {
    id: 9,
    question: "What is the traditional off-white handloom attire with golden zari border worn during Onam called?",
    options: ["Kasavu Mundu / Saree", "Kanjeevaram", "Chanderi", "Paithani"],
    correctIndex: 0,
    explanation: "Kasavu is Kerala's iconic cotton fabric woven with pure golden metallic thread borders (zari).",
    points: 100,
    difficulty: "medium",
  },
  {
    id: 10,
    question: "What is the pyramid-like clay installation placed at the center of the Pookalam representing Lord Vamana called?",
    options: ["Thrikkakara Appan (Onathappan)", "Nilavilakku", "Uruli", "Kavadi"],
    correctIndex: 0,
    explanation: "Thrikkakara Appan (Onathappan) is a pyramid-shaped clay figurine representing Lord Vamana and King Mahabali placed with reverence in courtyards.",
    points: 100,
    difficulty: "hard",
  },
];

export default function OnamQuizPage() {
  const { user, isSignedIn, updateUserPoints } = useAuth();

  const [gameState, setGameState] = useState<"intro" | "playing" | "answered" | "completed">("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [correctCount, setCorrectCount] = useState(0);

  const currentQ = ONAM_QUESTIONS[currentIndex];

  // Question Countdown Timer
  useEffect(() => {
    if (gameState !== "playing") return;

    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  const handleStartQuiz = () => {
    soundFx.playClick();
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setCorrectCount(0);
    setSelectedOption(null);
    setTimeLeft(15);
    setGameState("playing");
  };

  const handleSelectOption = (index: number) => {
    if (gameState !== "playing") return;

    setSelectedOption(index);
    const isCorrect = index === currentQ.correctIndex;

    let pointsAwarded = 0;
    if (isCorrect) {
      soundFx.playQuizCorrect();
      const speedBonus = Math.max(0, timeLeft * 3);
      const streakBonus = Math.min((streak + 1) * 20, 100);
      pointsAwarded = currentQ.points + speedBonus + streakBonus;

      setScore((prev) => prev + pointsAwarded);
      setStreak((prev) => prev + 1);
      setCorrectCount((prev) => prev + 1);
    } else {
      soundFx.playQuizIncorrect();
      setStreak(0);
    }

    setGameState("answered");
  };

  const handleTimeout = () => {
    soundFx.playQuizIncorrect();
    setSelectedOption(-1); // Timed out
    setStreak(0);
    setGameState("answered");
  };

  const handleNextQuestion = () => {
    soundFx.playClick();
    if (currentIndex + 1 < ONAM_QUESTIONS.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setTimeLeft(15);
      setGameState("playing");
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setGameState("completed");
    soundFx.playVictory();
    updateUserPoints(score, "Onam Cultural Quiz High Score");

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#f59e0b", "#10b981", "#ef4444"],
    });
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <Link
          href="/events/onam-2026"
          onClick={() => soundFx.playClick()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Onam 2026 Hub
        </Link>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
          <span>🎯</span> Cultural Knowledge Quiz
        </span>
      </div>

      {/* 1. INTRO STATE */}
      {gameState === "intro" && (
        <div className="rounded-3xl glass-panel-gold p-8 sm:p-12 text-center space-y-8 border border-amber-500/30">
          <div className="space-y-3 max-w-xl mx-auto">
            <div className="text-5xl">🎯</div>
            <h1 className="text-3xl sm:text-5xl font-black text-white">
              ONAM CULTURAL <span className="gold-gradient-text">TRIVIA</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              10 fast-paced questions celebrating King Mahabali, Onasadya delicacies, Vallamkali boat races, and ancient traditions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto text-left">
            <div className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-1">
              <Clock className="w-5 h-5 text-amber-400" />
              <div className="text-xs font-bold text-white">15s per Question</div>
              <div className="text-[11px] text-slate-400">Answer fast for speed bonus XP</div>
            </div>

            <div className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-1">
              <Flame className="w-5 h-5 text-orange-400" />
              <div className="text-xs font-bold text-white">Streak Multipliers</div>
              <div className="text-[11px] text-slate-400">Stack consecutive correct answers</div>
            </div>

            <div className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-1">
              <Trophy className="w-5 h-5 text-emerald-400" />
              <div className="text-xs font-bold text-white">Up to 1,500 XP</div>
              <div className="text-[11px] text-slate-400">Climb global quiz leaderboards</div>
            </div>
          </div>

          <button
            onClick={handleStartQuiz}
            className="px-10 py-4 rounded-2xl font-black text-base bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 hover:brightness-110 shadow-xl shadow-amber-500/30 transition-all hover:scale-105"
          >
            START QUIZ CHALLENGE
          </button>
        </div>
      )}

      {/* 2. PLAYING / ANSWERED STATE */}
      {(gameState === "playing" || gameState === "answered") && (
        <div className="rounded-3xl glass-panel p-6 sm:p-10 space-y-8 border border-amber-500/20">
          {/* Progress Header */}
          <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-400">
                Question <strong className="text-amber-400">{currentIndex + 1}</strong> / {ONAM_QUESTIONS.length}
              </span>
              {streak > 1 && (
                <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-extrabold flex items-center gap-1 border border-orange-500/30">
                  <Flame className="w-3 h-3 fill-orange-400" /> {streak}x Streak
                </span>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 font-bold text-amber-400">
                <Zap className="w-4 h-4 fill-amber-400" /> {score} XP
              </div>

              {/* 15s Countdown Ring */}
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-mono font-black text-sm border-2 ${
                  timeLeft > 5
                    ? "border-amber-400 text-amber-400 bg-amber-500/10"
                    : "border-rose-500 text-rose-400 bg-rose-500/10 animate-pulse"
                }`}
              >
                {timeLeft}
              </div>
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-2 text-center sm:text-left">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              {currentQ.difficulty.toUpperCase()} • +{currentQ.points} PTS
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-snug">
              {currentQ.question}
            </h2>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentQ.correctIndex;
              const hasAnswered = gameState === "answered";

              let btnStyle = "bg-slate-900/80 border-slate-800 text-slate-200 hover:border-amber-500/40 hover:bg-slate-850";

              if (hasAnswered) {
                if (isCorrect) {
                  btnStyle = "bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold shadow-lg shadow-emerald-500/20";
                } else if (isSelected && !isCorrect) {
                  btnStyle = "bg-rose-950/80 border-rose-500 text-rose-300 font-bold";
                } else {
                  btnStyle = "bg-slate-950/60 border-slate-850 text-slate-500 opacity-60";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={hasAnswered}
                  className={`p-4 rounded-2xl border text-left text-xs sm:text-sm font-semibold flex items-center justify-between transition-all ${btnStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-400">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                  </div>

                  {hasAnswered && isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  )}
                  {hasAnswered && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation & Next Question */}
          {gameState === "answered" && (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 animate-in fade-in">
              <div className="space-y-1">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Explanation & Folklore
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {currentQ.explanation}
                </p>
              </div>

              <button
                onClick={handleNextQuestion}
                className="w-full py-3 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:brightness-110 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
              >
                {currentIndex + 1 < ONAM_QUESTIONS.length ? "Next Question →" : "View Final Score 🏆"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3. COMPLETED SUMMARY */}
      {gameState === "completed" && (
        <div className="rounded-3xl glass-panel-gold p-8 sm:p-12 text-center space-y-8 border border-amber-500/40 animate-in zoom-in-95 duration-300">
          <div className="space-y-3">
            <div className="text-6xl">🏆</div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black uppercase tracking-wider">
              Quiz Completed
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white festival-title-glow">
              {score > 800 ? "OUTSTANDING SCHOLAR!" : "GREAT EFFORT!"}
            </h2>
            <p className="text-sm text-slate-300">
              You correctly answered <strong>{correctCount}</strong> out of {ONAM_QUESTIONS.length} cultural questions.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/30 text-center">
              <div className="text-2xl sm:text-3xl font-black text-amber-400">{score}</div>
              <div className="text-xs font-bold text-slate-400 mt-0.5">Total XP Earned</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/30 text-center">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">
                {Math.round((correctCount / ONAM_QUESTIONS.length) * 100)}%
              </div>
              <div className="text-xs font-bold text-slate-400 mt-0.5">Accuracy Rate</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={handleStartQuiz}
              className="px-8 py-3.5 rounded-2xl font-black text-sm bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:brightness-110 shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 hover:scale-105"
            >
              <RefreshCw className="w-4 h-4" /> Play Again
            </button>

            <Link
              href="/events/onam-2026"
              onClick={() => soundFx.playClick()}
              className="px-6 py-3.5 rounded-2xl font-bold text-sm glass-panel border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Return to Onam Hub
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
