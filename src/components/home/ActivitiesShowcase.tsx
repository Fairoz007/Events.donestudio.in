"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Trophy, Flame, ChevronRight, Zap, Play, Palette, HelpCircle } from "lucide-react";
import { ONAM_ACTIVITIES } from "@/lib/mockData";
import { soundFx } from "@/lib/sounds";

export function ActivitiesShowcase() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center space-y-3 mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold tracking-wider uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          Interactive Arena
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white">
          Onam 2026 <span className="gold-gradient-text">Activities</span>
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
          Join three distinct multiplayer and creative competitions. Earn XP, rank on global leaderboards, and win real rewards.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {ONAM_ACTIVITIES.map((act, index) => {
          const isVadamvali = act.type === "vadamvali";
          const isPookalam = act.type === "pookalam";

          return (
            <div
              key={act._id}
              className={`rounded-3xl glass-card border overflow-hidden flex flex-col justify-between group ${
                isVadamvali
                  ? "hover:border-orange-500/50 hover:shadow-orange-500/10"
                  : isPookalam
                  ? "hover:border-emerald-500/50 hover:shadow-emerald-500/10"
                  : "hover:border-amber-500/50 hover:shadow-amber-500/10"
              }`}
            >
              {/* Card Banner Image & Overlay */}
              <div className="relative h-48 sm:h-56 overflow-hidden">
                <img
                  src={act.bannerUrl}
                  alt={act.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                {/* Top Badges */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-950/80 border border-slate-700 text-white backdrop-blur-md flex items-center gap-1.5">
                    <span className="text-base">{act.icon}</span>
                    {act.type.toUpperCase()}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 uppercase">
                    Live
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                  <div className="text-xs font-semibold text-amber-400 mb-1">
                    {act.tagline}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    {act.title}
                  </h3>
                </div>
              </div>

              {/* Card Details */}
              <div className="p-6 space-y-6 flex-1 flex flex-col justify-between">
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {act.description}
                </p>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs py-2 border-y border-slate-800">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-400" /> Reward
                    </span>
                    <span className="font-bold text-amber-400">+{act.pointsReward} XP</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Participants</span>
                    <span className="font-bold text-white">{act.participantCount.toLocaleString()} Played</span>
                  </div>

                  <Link
                    href={`/events/onam-2026/${act.slug}`}
                    onClick={() => soundFx.playClick()}
                    className={`w-full py-3.5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                      isVadamvali
                        ? "bg-gradient-to-r from-orange-500 to-amber-600 text-slate-950 hover:brightness-110 shadow-orange-500/20"
                        : isPookalam
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:brightness-110 shadow-emerald-600/20"
                        : "bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 hover:brightness-110 shadow-amber-500/20"
                    }`}
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Enter {act.title.split(" ")[0]} Arena
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
