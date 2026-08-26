"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Calendar,
  Users,
  Trophy,
  Share2,
  Bookmark,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Gamepad2,
  Award,
  Globe,
  Gift,
  HelpCircle,
  Play,
  Flame,
  Check,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { soundFx } from "@/lib/sounds";
import confetti from "canvas-confetti";

export default function EventDetailsPage() {
  const params = useParams();
  const slug = (params?.slug as string) || "onam-2026";
  const { user, isSignedIn } = useAuth();

  const [isRegistered, setIsRegistered] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [copiedShare, setCopiedShare] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  // Live countdown
  const [timeLeft, setTimeLeft] = useState({
    days: 18,
    hours: 7,
    minutes: 34,
    seconds: 22,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleJoinEvent = () => {
    soundFx.playVictory();
    setIsRegistered(true);
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#22c55e", "#f59e0b", "#fbbf24"],
    });
  };

  const handleShare = () => {
    soundFx.playClick();
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: "📋" },
    { id: "activities", label: "Activities", icon: "🎮" },
    { id: "schedule", label: "Schedule", icon: "📅" },
    { id: "rules", label: "Rules", icon: "📜" },
    { id: "prizes", label: "Prizes", icon: "🏆" },
    { id: "leaderboard", label: "Leaderboard", icon: "📊" },
    { id: "gallery", label: "Gallery", icon: "🖼️" },
    { id: "winners", label: "Winners", icon: "👑" },
    { id: "announcements", label: "Announcements", icon: "📢" },
  ];

  const avatars = [
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80",
    "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=80&q=80",
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=80&q=80",
    "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=80&q=80",
  ];

  return (
    <div className="min-h-screen bg-[#080b0e] text-slate-100 pb-20 space-y-8">
      {/* 1. HERO BANNER WITH MAHABALI & POOKALAM ART (Matching Image 1 & 2) */}
      <section className="relative w-full min-h-[500px] md:min-h-[560px] flex items-center overflow-hidden bg-[#080b0e] border-b border-slate-800/80">
        {/* Background Artwork */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/onam-hero-art.jpg"
            alt="Onam 2026 Festival Artwork"
            className="w-full h-full object-cover object-center md:object-[right_center]"
          />
          {/* Dark gradients for high text contrast matching Image 1 */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#080b0e] via-[#080b0e]/90 to-transparent w-full md:w-[60%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080b0e] via-transparent to-black/60" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {/* Breadcrumb matching Image 1 */}
          <div className="flex items-center gap-2 text-xs text-slate-400 pb-4 font-medium">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>›</span>
            <Link href="/events" className="hover:text-white transition-colors">
              Events
            </Link>
            <span>›</span>
            <span className="text-emerald-400 font-bold">Onam 2026</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Floral Marigold Accent + Title */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🌼</span>
                  <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white tracking-tight">
                    ONAM <span className="gold-gradient-text">2026</span>
                  </h1>
                </div>
                <p className="text-xl sm:text-2xl font-black text-emerald-400 tracking-tight">
                  Celebrate. Play. Compete. Win.
                </p>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                Join the grand celebration of Onam with exciting games, creative contests, quizzes and amazing rewards!
              </p>

              {/* Badges Row matching Image 1 */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 text-slate-950 text-[11px] font-black uppercase shadow-md shadow-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />
                  LIVE NOW
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700 text-slate-200 text-[11px] font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Aug 20 – Sep 10, 2026
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700 text-slate-200 text-[11px] font-semibold">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  12.5K+ Participants
                </span>
              </div>

              {/* Action Buttons Row matching Image 1 */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <button
                  onClick={handleJoinEvent}
                  className="px-6 py-3 rounded-xl font-black text-xs sm:text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-xl shadow-emerald-500/30 transition-all hover:scale-105 flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  <span>{isRegistered ? "Registered ✓" : "Join Event"}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="px-5 py-3 rounded-xl font-bold text-xs sm:text-sm bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4 text-slate-300" />
                  <span>{copiedShare ? "Link Copied! ✓" : "Share Event"}</span>
                </button>

                <button
                  onClick={() => {
                    soundFx.playClick();
                    setBookmarked(!bookmarked);
                  }}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-colors ${
                    bookmarked
                      ? "bg-amber-500/20 border-amber-500 text-amber-400"
                      : "bg-slate-900/80 border-slate-700 text-slate-300 hover:text-white"
                  }`}
                  title="Bookmark event"
                >
                  <Bookmark className={`w-4 h-4 ${bookmarked ? "fill-amber-400" : ""}`} />
                </button>
              </div>
            </div>

            {/* Right Floating Countdown Card (5 Cols) matching Image 1 & 2 */}
            <div className="lg:col-span-5 flex justify-end">
              <div className="w-full max-w-sm rounded-2xl bg-[#0c1015]/90 backdrop-blur-xl border border-slate-800 p-5 space-y-4 shadow-2xl">
                <div className="text-center space-y-1">
                  <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                    Event Ends In
                  </span>
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                      <div className="text-2xl font-black text-emerald-400">{timeLeft.days}</div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase">Days</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                      <div className="text-2xl font-black text-emerald-400">{timeLeft.hours}</div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase">Hours</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                      <div className="text-2xl font-black text-emerald-400">{timeLeft.minutes}</div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase">Minutes</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                      <div className="text-2xl font-black text-emerald-400">{timeLeft.seconds}</div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase">Seconds</div>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center text-xs font-semibold text-slate-300 flex items-center justify-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>Aug 20 – Sep 10, 2026</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS RIBBON (From Image 2) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-4 rounded-2xl bg-[#0c1015] border border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 text-center">
          <div className="space-y-0.5">
            <div className="text-lg font-black text-white flex items-center justify-center gap-1.5">
              <Users className="w-4 h-4 text-amber-400" /> 12.5K+
            </div>
            <div className="text-[11px] font-bold text-slate-400 uppercase">Participants</div>
          </div>

          <div className="space-y-0.5">
            <div className="text-lg font-black text-white flex items-center justify-center gap-1.5">
              <Gamepad2 className="w-4 h-4 text-emerald-400" /> 3
            </div>
            <div className="text-[11px] font-bold text-slate-400 uppercase">Activities</div>
          </div>

          <div className="space-y-0.5">
            <div className="text-lg font-black text-amber-400 flex items-center justify-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-400" /> ₹2,00,000+
            </div>
            <div className="text-[11px] font-bold text-slate-400 uppercase">Total Prizes</div>
          </div>

          <div className="space-y-0.5">
            <div className="text-lg font-black text-white flex items-center justify-center gap-1.5">
              <Globe className="w-4 h-4 text-sky-400" /> 15+
            </div>
            <div className="text-[11px] font-bold text-slate-400 uppercase">Countries</div>
          </div>

          <div className="space-y-0.5 col-span-2 sm:col-span-1">
            <div className="text-lg font-black text-white flex items-center justify-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-400" /> Aug 20 – Sep 10
            </div>
            <div className="text-[11px] font-bold text-slate-400 uppercase">Event Duration</div>
          </div>
        </div>
      </section>

      {/* 3. SUB-NAV TABS BAR (Overview, Activities, Schedule, Rules, Prizes, etc.) matching Image 1 & 2 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1 no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab(tab.id);
                }}
                className={`relative px-4 py-3 text-xs sm:text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  isActive ? "text-white font-black" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-emerald-500 rounded-t-full shadow-[0_-2px_8px_rgba(34,197,94,0.6)]" />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. MAIN CONTENT AREA (Image 1 Two-Column Grid: Activities & Schedule on Left + Highlights & Leaderboard on Right) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (8 Cols) */}
          <div className="lg:col-span-8 space-y-10">
            {/* Event Activities Section matching Image 1 & 2 */}
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                    <Gamepad2 className="w-5 h-5 text-emerald-400" /> Event Activities
                  </h2>
                  <p className="text-xs text-slate-400">
                    Participate in exciting activities, earn points and climb the leaderboard!
                  </p>
                </div>

                <Link
                  href="/events/onam-2026/activities"
                  onClick={() => soundFx.playClick()}
                  className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 border border-slate-700 hover:bg-slate-800"
                >
                  View All Activities →
                </Link>
              </div>

              {/* 3 Activity Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* 1. VADAMVALI CARD */}
                <div className="rounded-2xl overflow-hidden bg-[#0e141a] border border-slate-800 hover:border-rose-500/40 transition-all flex flex-col justify-between shadow-xl group">
                  <div>
                    {/* Card Banner */}
                    <div className="relative h-36 w-full overflow-hidden bg-slate-900">
                      <img
                        src="/images/vadamvali-card.jpg"
                        alt="Vadamvali Tug of War"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-rose-500 text-white shadow-md">
                          LIVE NOW
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-xs font-black">
                          🪢
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-white">Vadamvali</h3>
                          <p className="text-[11px] text-slate-400 font-medium">Tug of War</p>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        Compete in real-time 1v1 tug of war matches. Show your strength and win amazing rewards!
                      </p>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="p-4 pt-0 border-t border-slate-800/60 mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>3.2K+ Players</span>
                    </div>

                    <Link
                      href="/events/onam-2026/vadamvali"
                      onClick={() => soundFx.playClick()}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-rose-500 hover:bg-rose-400 text-white shadow-md shadow-rose-500/20 transition-all flex items-center gap-1"
                    >
                      Play Now 🎮
                    </Link>
                  </div>
                </div>

                {/* 2. POOKALAM DESIGNER CARD */}
                <div className="rounded-2xl overflow-hidden bg-[#0e141a] border border-slate-800 hover:border-purple-500/40 transition-all flex flex-col justify-between shadow-xl group">
                  <div>
                    {/* Card Banner */}
                    <div className="relative h-36 w-full overflow-hidden bg-slate-900">
                      <img
                        src="/images/pookalam-card.jpg"
                        alt="Pookalam Floral Canvas Designer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-purple-500 text-white shadow-md">
                          ACTIVE
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-black">
                          🌸
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-white">Pookalam Designer</h3>
                          <p className="text-[11px] text-slate-400 font-medium">Create & Compete</p>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        Design your beautiful Pookalam using our digital studio. Submit and get votes!
                      </p>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="p-4 pt-0 border-t border-slate-800/60 mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                      <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                      <span>2.8K+ Creations</span>
                    </div>

                    <Link
                      href="/events/onam-2026/pookalam"
                      onClick={() => soundFx.playClick()}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-500/20 transition-all flex items-center gap-1"
                    >
                      Design Now ✏️
                    </Link>
                  </div>
                </div>

                {/* 3. ONAM QUIZ CARD (With Interactive Question Preview from Image 2) */}
                <div className="rounded-2xl overflow-hidden bg-[#0e141a] border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between shadow-xl group">
                  <div>
                    {/* Card Banner */}
                    <div className="relative h-36 w-full overflow-hidden bg-slate-900">
                      <img
                        src="/images/quiz-host-card.jpg"
                        alt="Onam Cultural Trivia Quiz"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500 text-slate-950 shadow-md">
                          LIVE NOW
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-black">
                          🎯
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-white">Onam Quiz</h3>
                          <p className="text-[11px] text-slate-400 font-medium">Test Your Knowledge</p>
                        </div>
                      </div>

                      {/* Interactive Preview Box from Image 2 */}
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] space-y-1.5">
                        <div className="font-bold text-slate-200 truncate">
                          Who was the great King of Onam?
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-[10px]">
                          <div className="p-1 rounded bg-emerald-950/80 border border-emerald-500 text-emerald-300 font-bold flex items-center justify-between">
                            <span>A. Mahabali</span>
                            <Check className="w-3 h-3" />
                          </div>
                          <div className="p-1 rounded bg-slate-950 text-slate-400">B. Ravana</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="p-4 pt-0 border-t border-slate-800/60 mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                      <span>4.1K+ Scholars</span>
                    </div>

                    <Link
                      href="/events/onam-2026/quiz"
                      onClick={() => soundFx.playClick()}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1"
                    >
                      Start Quiz ⏱️
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Event Schedule List matching Image 1 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-400" /> Event Schedule
                  </h2>
                  <p className="text-xs text-slate-400">
                    Stay updated with all important dates and activities
                  </p>
                </div>

                <button className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1">
                  View Full Schedule →
                </button>
              </div>

              <div className="rounded-2xl bg-[#0c1015] border border-slate-800 divide-y divide-slate-800/80 overflow-hidden">
                {[
                  {
                    date: "AUG 20",
                    title: "Event Registration Opens",
                    time: "12:00 AM",
                    desc: "Registration for all activities begins",
                  },
                  {
                    date: "AUG 25",
                    title: "Vadamvali Tournament Starts",
                    time: "06:00 PM",
                    desc: "Tug of War matches begin",
                  },
                  {
                    date: "AUG 28",
                    title: "Pookalam Submission Deadline",
                    time: "11:59 PM",
                    desc: "Last date to submit your Pookalam",
                  },
                  {
                    date: "AUG 30",
                    title: "Onam Quiz Round 1",
                    time: "07:00 PM",
                    desc: "First round of Onam Quiz",
                  },
                  {
                    date: "SEP 10",
                    title: "Grand Finale & Winners",
                    time: "08:00 PM",
                    desc: "Championship awards and trophy ceremony",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-900/40 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {/* Date Badge */}
                      <div className="w-16 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-black text-xs text-center uppercase tracking-wider shrink-0">
                        {item.date}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{item.title}</h4>
                        <p className="text-xs text-slate-400">{item.desc}</p>
                      </div>
                    </div>

                    <div className="text-xs font-bold text-slate-300 self-end sm:self-auto">
                      {item.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (4 Cols) - Event Highlights & Top Participants matching Image 1 */}
          <div className="lg:col-span-4 space-y-6">
            {/* Event Highlights Card */}
            <div className="p-6 rounded-2xl bg-[#0c1015] border border-slate-800 space-y-5 shadow-xl">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" /> Event Highlights
              </h3>

              <div className="space-y-3.5 text-xs text-slate-300">
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <strong className="text-white">15+</strong> Countries Participating
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <strong className="text-white">₹2,00,000+</strong> Total Prize Pool
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Gamepad2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <div>
                    <strong className="text-white">Multiple Activities</strong> — Games, Contests & Quizzes
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Gift className="w-4 h-4 text-pink-400 shrink-0" />
                  <div>
                    <strong className="text-white">Amazing Rewards</strong> — Cash Prizes, Gift Hampers & More
                  </div>
                </div>
              </div>

              {/* Inner Registration Status Banner matching Image 1 */}
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs font-black text-emerald-300">You're Registered!</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  You have successfully joined Onam 2026. Start participating in the activities now!
                </p>
                <Link
                  href="/dashboard"
                  onClick={() => soundFx.playClick()}
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 pt-1"
                >
                  Go to Dashboard →
                </Link>
              </div>
            </div>

            {/* Top Participants Leaderboard Preview Card matching Image 1 */}
            <div className="p-6 rounded-2xl bg-[#0c1015] border border-slate-800 space-y-4 shadow-xl">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" /> Top Participants
              </h3>

              <div className="space-y-3">
                {[
                  {
                    rank: 1,
                    name: "Akshay Gaming",
                    points: "4,250 PTS",
                    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80",
                    badge: "👑",
                  },
                  {
                    rank: 2,
                    name: "Mallu Creator",
                    points: "3,980 PTS",
                    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=80&q=80",
                    badge: "🥈",
                  },
                  {
                    rank: 3,
                    name: "Nikhil Plays",
                    points: "3,420 PTS",
                    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=80&q=80",
                    badge: "🥉",
                  },
                ].map((champ) => (
                  <div
                    key={champ.rank}
                    className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-900/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-800 text-amber-400 text-xs font-black flex items-center justify-center">
                        {champ.rank}
                      </span>
                      <img
                        src={champ.avatar}
                        alt={champ.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-700"
                      />
                      <span className="text-xs font-bold text-white truncate max-w-[110px]">
                        {champ.name}
                      </span>
                    </div>

                    <span className="text-xs font-black text-amber-400">{champ.points}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/leaderboards"
                onClick={() => soundFx.playClick()}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 flex items-center justify-center gap-1.5 transition-colors"
              >
                View Leaderboard →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. BOTTOM 5 INFO CARDS GRID (Matching Image 2) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* Card 1: About Onam 2026 */}
          <div className="p-5 rounded-2xl bg-[#0c1015] border border-slate-800 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <h4 className="text-sm font-black text-white">About Onam 2026</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Onam is the most important festival of Kerala, celebrated with joy, togetherness and cultural heritage. Let's keep the traditions alive!
              </p>
            </div>
            <button className="text-xs font-bold text-emerald-400 hover:text-emerald-300 text-left flex items-center gap-1">
              Read More →
            </button>
          </div>

          {/* Card 2: Rules & Guidelines */}
          <div className="p-5 rounded-2xl bg-[#0c1015] border border-slate-800 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <h4 className="text-sm font-black text-white">Rules & Guidelines</h4>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>✓ Be respectful to all participants</li>
                <li>✓ No cheating or abusive behavior</li>
                <li>✓ Follow game & activity rules</li>
                <li>✓ Decisions of admins are final</li>
              </ul>
            </div>
            <button className="text-xs font-bold text-emerald-400 hover:text-emerald-300 text-left flex items-center gap-1">
              View All Rules →
            </button>
          </div>

          {/* Card 3: Exciting Prizes */}
          <div className="p-5 rounded-2xl bg-[#0c1015] border border-slate-800 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <h4 className="text-sm font-black text-white">Exciting Prizes</h4>
              <div className="text-2xl">🏆</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Win amazing cash prizes, gift hampers, gaming gear, exclusive merch and much more!
              </p>
            </div>
            <button className="text-xs font-bold text-amber-400 hover:text-amber-300 text-left flex items-center gap-1">
              View Prizes →
            </button>
          </div>

          {/* Card 4: Event Schedule Summary */}
          <div className="p-5 rounded-2xl bg-[#0c1015] border border-slate-800 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <h4 className="text-sm font-black text-white">Event Schedule</h4>
              <div className="text-[11px] text-slate-400 space-y-1">
                <div>🗓️ Aug 20 Registration Opens</div>
                <div>🗓️ Aug 25 Vadamvali Starts</div>
                <div>🗓️ Aug 28 Pookalam Deadline</div>
                <div>🗓️ Aug 30 Quiz Round 1</div>
                <div>🗓️ Sep 10 Grand Finale</div>
              </div>
            </div>
            <button className="text-xs font-bold text-emerald-400 hover:text-emerald-300 text-left flex items-center gap-1">
              View Full Schedule →
            </button>
          </div>

          {/* Card 5: Top Participants */}
          <div className="p-5 rounded-2xl bg-[#0c1015] border border-slate-800 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <h4 className="text-sm font-black text-white">Top Participants</h4>
              <div className="text-xs text-slate-300 space-y-1.5">
                <div className="flex justify-between">
                  <span>1. Akshay Gaming</span>
                  <span className="text-amber-400 font-bold">4.25k</span>
                </div>
                <div className="flex justify-between">
                  <span>2. Mallu Creator</span>
                  <span className="text-amber-400 font-bold">3.98k</span>
                </div>
                <div className="flex justify-between">
                  <span>3. Nikhil Plays</span>
                  <span className="text-amber-400 font-bold">3.42k</span>
                </div>
              </div>
            </div>
            <Link
              href="/leaderboards"
              onClick={() => soundFx.playClick()}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              View Leaderboard →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
