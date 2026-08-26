"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Crown,
  Medal,
  Award,
  Search,
  Sparkles,
  Flame,
  Zap,
  ArrowUpRight,
} from "lucide-react";
import { INITIAL_LEADERBOARD } from "@/lib/mockData";
import { soundFx } from "@/lib/sounds";

export default function LeaderboardsPage() {
  const [tab, setTab] = useState<"global" | "vadamvali" | "quiz" | "pookalam">("global");
  const [search, setSearch] = useState("");

  const filteredList = INITIAL_LEADERBOARD.filter(
    (p) =>
      p.displayName.toLowerCase().includes(search.toLowerCase()) ||
      p.username.toLowerCase().includes(search.toLowerCase())
  );

  const top3 = filteredList.slice(0, 3);
  const remaining = filteredList.slice(3);

  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <Trophy className="w-3.5 h-3.5" /> Hall of Champions
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white">
          Championship <span className="gold-gradient-text">Leaderboards</span>
        </h1>
        <p className="text-slate-400 text-xs sm:text-base">
          Track top ranked players, Vadamvali warriors, master quiz scholars, and celebrated Pookalam artists across D-One Studio Events.
        </p>
      </div>

      {/* Filter Tabs & Search */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {[
            { id: "global", label: "🏆 Global XP Standings" },
            { id: "vadamvali", label: "🪢 Vadamvali Wins" },
            { id: "quiz", label: "🎯 Quiz Masters" },
            { id: "pookalam", label: "🌸 Pookalam Stars" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => {
                soundFx.playClick();
                setTab(t.id as any);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                tab === t.id
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search player..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs text-white"
          />
        </div>
      </div>

      {/* Top 3 Podium Showcase */}
      {top3.length >= 3 && !search && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-8 max-w-4xl mx-auto">
          {/* 2nd Place */}
          <div className="order-2 md:order-1 p-6 rounded-3xl glass-card border border-slate-700 text-center space-y-3 bg-slate-900/60 transform md:translate-y-4">
            <div className="w-10 h-10 rounded-full bg-slate-300 text-slate-950 flex items-center justify-center font-black mx-auto text-sm shadow-md">
              2
            </div>
            <img
              src={top3[1].avatarUrl}
              alt={top3[1].displayName}
              className="w-16 h-16 rounded-2xl mx-auto object-cover border-2 border-slate-400 bg-slate-800"
            />
            <div>
              <h3 className="font-extrabold text-white text-base truncate">{top3[1].displayName}</h3>
              <p className="text-xs text-slate-400">@{top3[1].username}</p>
            </div>
            <div className="text-sm font-black text-amber-400">
              {top3[1].points.toLocaleString()} XP
            </div>
            <span className="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
              Level {top3[1].level}
            </span>
          </div>

          {/* 1st Place (Grand Champion) */}
          <div className="order-1 md:order-2 p-8 rounded-3xl glass-panel-gold border-2 border-amber-500 text-center space-y-4 shadow-2xl relative">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-black text-lg shadow-xl shadow-amber-500/40">
              👑
            </div>
            <img
              src={top3[0].avatarUrl}
              alt={top3[0].displayName}
              className="w-20 h-20 rounded-2xl mx-auto object-cover border-4 border-amber-400 bg-slate-800 shadow-xl"
            />
            <div>
              <h3 className="font-black text-white text-xl truncate">{top3[0].displayName}</h3>
              <p className="text-xs text-amber-300">@{top3[0].username}</p>
            </div>
            <div className="text-xl font-black text-amber-400">
              {top3[0].points.toLocaleString()} XP
            </div>
            <span className="inline-block text-xs font-black px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Level {top3[0].level} • 142 Wins
            </span>
          </div>

          {/* 3rd Place */}
          <div className="order-3 p-6 rounded-3xl glass-card border border-amber-800/40 text-center space-y-3 bg-amber-950/20 transform md:translate-y-8">
            <div className="w-10 h-10 rounded-full bg-amber-700 text-white flex items-center justify-center font-black mx-auto text-sm shadow-md">
              3
            </div>
            <img
              src={top3[2].avatarUrl}
              alt={top3[2].displayName}
              className="w-16 h-16 rounded-2xl mx-auto object-cover border-2 border-amber-700 bg-slate-800"
            />
            <div>
              <h3 className="font-extrabold text-white text-base truncate">{top3[2].displayName}</h3>
              <p className="text-xs text-slate-400">@{top3[2].username}</p>
            </div>
            <div className="text-sm font-black text-amber-400">
              {top3[2].points.toLocaleString()} XP
            </div>
            <span className="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
              Level {top3[2].level}
            </span>
          </div>
        </div>
      )}

      {/* Main Leaderboard Table */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800">
        <div className="divide-y divide-slate-800/60">
          {filteredList.map((player) => (
            <div
              key={player.username}
              className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-center gap-4 min-w-0">
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                    player.rank === 1
                      ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30"
                      : player.rank === 2
                      ? "bg-slate-300 text-slate-950"
                      : player.rank === 3
                      ? "bg-amber-700 text-white"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {player.rank}
                </span>

                <img
                  src={player.avatarUrl}
                  alt={player.displayName}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                />

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white truncate">
                      {player.displayName}
                    </h4>
                    {player.role === "creator" && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">
                        CREATOR
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">@{player.username}</p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-right shrink-0">
                <div className="hidden sm:block">
                  <span className="text-xs text-slate-400 block">Level {player.level}</span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {player.vadamvaliWins} Wins
                  </span>
                </div>

                <div>
                  <span className="text-base sm:text-lg font-black text-amber-400 block">
                    {player.points.toLocaleString()} XP
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">
                    Rank #{player.rank}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
