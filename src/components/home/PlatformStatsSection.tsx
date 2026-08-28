"use client";

import React from "react";
import { Users, Trophy, Flame, Sparkles } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function PlatformStatsSection() {
  const publicStats = useQuery(api.admin.getPublicPlatformStats);

  const totalUsers = publicStats?.totalUsers ?? 0;
  const totalMatches = publicStats?.totalMatches ?? 0;
  const pookalamSubmissions = publicStats?.pookalamSubmissions ?? 0;
  const totalPoints = publicStats?.totalPointsAwarded ?? 0;

  const stats = [
    {
      label: "Registered Players",
      value: totalUsers > 0 ? totalUsers.toLocaleString() : "1+",
      subtext: "Across Kerala & Worldwide",
      icon: Users,
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
    {
      label: "Vadamvali Matches",
      value: totalMatches > 0 ? totalMatches.toLocaleString() : "0",
      subtext: "Live 1v1 Tug of War Duels",
      icon: Flame,
      color: "text-orange-400",
      bg: "bg-orange-500/10 border-orange-500/20",
    },
    {
      label: "Digital Pookalams",
      value: pookalamSubmissions > 0 ? pookalamSubmissions.toLocaleString() : "0",
      subtext: "Artworks in Community Gallery",
      icon: Sparkles,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      label: "Platform XP Distributed",
      value: totalPoints > 0 ? `${totalPoints.toLocaleString()} XP` : "0 XP",
      subtext: "Leaderboards & Achievements",
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
