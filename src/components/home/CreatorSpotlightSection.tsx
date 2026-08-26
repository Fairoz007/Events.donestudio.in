"use client";

import React from "react";
import Link from "next/link";
import { Users, CheckCircle2, Youtube, Twitch, Instagram, ArrowUpRight, Sparkles } from "lucide-react";
import { INITIAL_CREATORS } from "@/lib/mockData";
import { soundFx } from "@/lib/sounds";

export function CreatorSpotlightSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="rounded-3xl glass-panel-gold p-8 sm:p-12 relative overflow-hidden border border-amber-500/30">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Verified Creators Guild
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white">
                Featured <span className="gold-gradient-text">Streamers & Creators</span>
              </h2>
              <p className="text-slate-300 text-sm sm:text-base max-w-xl">
                Partner with D-One Studio to host live community matches, showcase fan Pookalams, and participate in exclusive tournaments.
              </p>
            </div>

            <Link
              href="/creators/apply"
              onClick={() => soundFx.playClick()}
              className="px-6 py-3.5 rounded-2xl font-black text-sm bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:brightness-110 shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 self-start md:self-auto"
            >
              <Users className="w-4 h-4" />
              Apply to Join Creators
            </Link>
          </div>

          {/* Creators Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {INITIAL_CREATORS.map((creator) => (
              <div
                key={creator._id}
                className="p-6 rounded-2xl glass-card border border-slate-700/80 hover:border-amber-500/40 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={creator.avatarUrl}
                      alt={creator.displayName}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-500/40 bg-slate-800"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-extrabold text-white text-base truncate group-hover:text-amber-400 transition-colors">
                          {creator.displayName}
                        </h4>
                        <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 fill-sky-400/20" />
                      </div>
                      <p className="text-xs text-slate-400">@{creator.username}</p>
                      <div className="text-[11px] font-bold text-amber-400 mt-0.5">
                        {(creator.followerCount / 1000).toFixed(0)}k+ Followers
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                    {creator.bio}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {creator.achievements.map((ach) => (
                      <span
                        key={ach}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700"
                      >
                        {ach}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400 flex items-center gap-1.5">
                    {creator.platform === "youtube" ? (
                      <Youtube className="w-4 h-4 text-rose-500" />
                    ) : (
                      <Twitch className="w-4 h-4 text-purple-400" />
                    )}
                    <span className="capitalize font-semibold text-white">
                      {creator.channelName}
                    </span>
                  </span>

                  <Link
                    href={`/creators/${creator.username}`}
                    onClick={() => soundFx.playClick()}
                    className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
                  >
                    Profile <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
