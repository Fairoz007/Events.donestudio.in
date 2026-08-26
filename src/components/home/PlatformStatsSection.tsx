"use client";

import React from "react";
import { Users, Trophy, Flame, Sparkles, Award, ShieldCheck } from "lucide-react";

export function PlatformStatsSection() {
  const stats = [
    {
      label: "Total Registered Players",
      value: "14,820+",
      subtext: "Across Kerala & Worldwide",
      icon: Users,
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
    {
      label: "Vadamvali Matches Played",
      value: "9,240+",
      subtext: "Live 1v1 Tug of War Duels",
      icon: Flame,
      color: "text-orange-400",
      bg: "bg-orange-500/10 border-orange-500/20",
    },
    {
      label: "Digital Pookalams Created",
      value: "4,320+",
      subtext: "Artworks Submitted to Gallery",
      icon: Sparkles,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: "Platform XP Distributed",
      value: "1,250,000+",
      subtext: "Leaderboard & Level Ups",
      icon: Trophy,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10 border-yellow-500/20",
    },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-y border-slate-800/80 my-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="p-6 rounded-2xl glass-card border border-slate-800/80 text-center space-y-3"
            >
              <div
                className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center border ${stat.bg}`}
              >
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="space-y-1">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-300">
                  {stat.label}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  {stat.subtext}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
