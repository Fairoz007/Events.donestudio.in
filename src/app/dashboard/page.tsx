"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Trophy,
  Users,
  Flame,
  Sparkles,
  Zap,
  Calendar,
  Award,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Play,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { INITIAL_EVENTS } from "@/lib/mockData";
import { soundFx } from "@/lib/sounds";

export default function DashboardPage() {
  const { user, isSignedIn, isAdmin, isCreator } = useAuth();
  const [activeTab, setActiveTab] = useState<"events" | "matches" | "pookalams" | "achievements">("events");

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-8 space-y-4">
        <LayoutDashboard className="w-12 h-12 text-amber-400 animate-bounce" />
        <h1 className="text-2xl font-black text-white">Please Sign In</h1>
        <p className="text-sm text-slate-400 max-w-sm">
          Sign in via Clerk to view your event registrations, match history, and leaderboard ranking.
        </p>
      </div>
    );
  }

  // Sample match history
  const matches = [
    { id: "m_1", opponent: "Thrissur Tiger", result: "win", pulls: 42, points: "+100 XP", time: "10 mins ago" },
    { id: "m_2", opponent: "Ananya Kerala", result: "win", pulls: 56, points: "+100 XP", time: "1 hour ago" },
    { id: "m_3", opponent: "Rahul Playz", result: "loss", pulls: 38, points: "+30 XP", time: "3 hours ago" },
    { id: "m_4", opponent: "Maveli King", result: "win", pulls: 61, points: "+100 XP", time: "1 day ago" },
  ];

  const nextLevelPoints = Math.pow(user.level, 2) * 100;
  const currentLevelBase = Math.pow(user.level - 1, 2) * 100;
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round(((user.points - currentLevelBase) / (nextLevelPoints - currentLevelBase)) * 100))
  );

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Profile Header Banner */}
      <div className="rounded-3xl glass-panel-gold p-8 sm:p-10 border border-amber-500/30 space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <img
              src={user.avatarUrl}
              alt={user.displayName}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-4 border-amber-500/40 bg-slate-800 shadow-xl shrink-0"
            />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white">
                  Welcome, {user.displayName}!
                </h1>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950">
                  {user.role.replace("_", " ")}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                @{user.username} • Member since {user.joinDate}
              </p>

              {/* XP Progress Bar */}
              <div className="pt-2 max-w-xs sm:max-w-md space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-300">
                  <span>Level {user.level}</span>
                  <span className="text-amber-400">{user.points} / {nextLevelPoints} XP</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/events/onam-2026"
              onClick={() => soundFx.playClick()}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:brightness-110 shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950" />
              Enter Onam Arena
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => soundFx.playClick()}
                className="px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30 transition-colors flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin Suite
              </Link>
            )}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mb-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Platform Points
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-400">
              {user.points.toLocaleString()} XP
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mb-1">
              <Flame className="w-3.5 h-3.5 text-orange-400" /> Vadamvali Record
            </div>
            <div className="text-xl sm:text-2xl font-black text-white">
              {user.stats.vadamvaliWins}W - {user.stats.vadamvaliLosses}L
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mb-1">
              <Trophy className="w-3.5 h-3.5 text-emerald-400" /> Quiz High Score
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400">
              {user.stats.quizHighScore} PTS
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" /> Pookalam Votes
            </div>
            <div className="text-xl sm:text-2xl font-black text-pink-400">
              {user.stats.pookalamVotesReceived}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-4">
        {[
          { id: "events", label: "🗓️ Joined Events" },
          { id: "matches", label: "🪢 Vadamvali Matches" },
          { id: "pookalams", label: "🌸 My Pookalams" },
          { id: "achievements", label: "🏆 Unlocked Badges" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              soundFx.playClick();
              setActiveTab(tab.id as any);
            }}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. JOINED EVENTS TAB */}
      {activeTab === "events" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {INITIAL_EVENTS.slice(0, 2).map((evt) => (
              <div
                key={evt._id}
                className="p-6 rounded-3xl glass-card border border-slate-800 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={evt.thumbnailUrl}
                    alt={evt.title}
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-700"
                  />
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      REGISTERED
                    </span>
                    <h3 className="text-base font-black text-white mt-1">{evt.title}</h3>
                    <p className="text-xs text-slate-400">{evt.tagline}</p>
                  </div>
                </div>

                <Link
                  href={`/events/${evt.slug}`}
                  onClick={() => soundFx.playClick()}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:brightness-110 flex items-center gap-1 shadow-md shrink-0"
                >
                  Enter <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. MATCHES TAB */}
      {activeTab === "matches" && (
        <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800">
          <div className="divide-y divide-slate-800/60">
            {matches.map((m) => (
              <div
                key={m.id}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                      m.result === "win"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    {m.result === "win" ? "W" : "L"}
                  </span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">
                      vs {m.opponent}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {m.pulls} Pulls Recorded • {m.time}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-xs font-black block ${
                      m.result === "win" ? "text-emerald-400" : "text-slate-400"
                    }`}
                  >
                    {m.points}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-500">
                    {m.result.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. POOKALAM SUBMISSIONS TAB */}
      {activeTab === "pookalams" && (
        <div className="p-8 rounded-3xl glass-panel border border-slate-800 text-center space-y-4">
          <div className="text-4xl">🌸</div>
          <h3 className="text-lg font-bold text-white">Your Pookalam Submissions</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            You currently have 1 active submission in the Onam 2026 public voting competition.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link
              href="/events/onam-2026/pookalam"
              onClick={() => soundFx.playClick()}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-amber-500 text-slate-950 hover:brightness-110"
            >
              Open Designer Canvas
            </Link>
            <Link
              href="/events/onam-2026/pookalam/gallery"
              onClick={() => soundFx.playClick()}
              className="px-5 py-2.5 rounded-xl font-bold text-xs glass-panel border border-slate-700 text-slate-200"
            >
              View in Gallery
            </Link>
          </div>
        </div>
      )}

      {/* 4. ACHIEVEMENTS TAB */}
      {activeTab === "achievements" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { title: "First Tug", desc: "Completed your first Vadamvali match", icon: "🪢", unlocked: true },
            { title: "Tug Warrior", desc: "Won 5 Vadamvali multiplayer matches", icon: "⚔️", unlocked: true },
            { title: "Pookalam Artist", desc: "Submitted your first floral design", icon: "🌸", unlocked: true },
            { title: "Quiz Master", desc: "Scored 800+ in Cultural Quiz", icon: "🎯", unlocked: true },
            { title: "Maveli Champion", desc: "Won 10 Vadamvali matches", icon: "👑", unlocked: false },
            { title: "Community Star", desc: "Received 10+ votes on Pookalam", icon: "❤️", unlocked: true },
          ].map((ach, i) => (
            <div
              key={i}
              className={`p-4 rounded-2xl border flex items-center gap-3.5 ${
                ach.unlocked
                  ? "bg-slate-900/80 border-amber-500/30"
                  : "bg-slate-950/40 border-slate-800/60 opacity-50"
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl shrink-0">
                {ach.icon}
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">{ach.title}</h4>
                <p className="text-[11px] text-slate-400">{ach.desc}</p>
                {ach.unlocked && (
                  <span className="text-[10px] font-bold text-emerald-400">✓ Unlocked</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
