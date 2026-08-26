"use client";

import React from "react";
import { Gamepad2, Trophy, Users, ShieldCheck } from "lucide-react";

export function WhyJoinSection() {
  const features = [
    {
      id: "competitions",
      title: "Exciting Competitions",
      desc: "Join thrilling games and contests across different categories.",
      icon: (
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <Gamepad2 className="w-6 h-6" />
        </div>
      ),
    },
    {
      id: "rewards",
      title: "Amazing Rewards",
      desc: "Win attractive prizes, trophies, and exclusive rewards.",
      icon: (
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
          <Trophy className="w-6 h-6" />
        </div>
      ),
    },
    {
      id: "community",
      title: "Community & Fun",
      desc: "Connect with creators and participants from around the world.",
      icon: (
        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
          <Users className="w-6 h-6" />
        </div>
      ),
    },
    {
      id: "security",
      title: "Fair & Secure",
      desc: "100% fair play with our advanced security and anti-cheat systems.",
      icon: (
        <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
          <ShieldCheck className="w-6 h-6" />
        </div>
      ),
    },
  ];

  return (
    <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Headline */}
        <div className="lg:col-span-4 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
            Why Join D-One Studio Events?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm">
            Exciting events, amazing prizes, and a community of passionate people.
          </p>
        </div>

        {/* Right 4 Cards */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {features.map((feat) => (
            <div
              key={feat.id}
              className="p-5 rounded-2xl bg-[#0e141a] border border-slate-800 space-y-3 hover:border-slate-700 transition-colors"
            >
              {feat.icon}
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">{feat.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
