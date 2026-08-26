"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  CheckCircle2,
  Youtube,
  Twitch,
  Instagram,
  ArrowUpRight,
  Sparkles,
  Search,
  Trophy,
} from "lucide-react";
import { INITIAL_CREATORS } from "@/lib/mockData";
import { soundFx } from "@/lib/sounds";

export default function CreatorsDirectoryPage() {
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");

  const filteredCreators = INITIAL_CREATORS.filter((c) => {
    const matchesSearch =
      c.displayName.toLowerCase().includes(search.toLowerCase()) ||
      c.username.toLowerCase().includes(search.toLowerCase()) ||
      c.channelName.toLowerCase().includes(search.toLowerCase());

    const matchesPlatform = platformFilter === "all" || c.platform === platformFilter;

    return matchesSearch && matchesPlatform;
  });

  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Users className="w-3.5 h-3.5" /> D-One Creators Guild
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white">
            Verified <span className="gold-gradient-text">Creators & Streamers</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Discover official D-One Studio streaming partners, YouTubers, esports commentators, and community artists leading tournaments.
          </p>
        </div>

        <Link
          href="/creators/apply"
          onClick={() => soundFx.playClick()}
          className="px-6 py-3.5 rounded-2xl font-black text-sm bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:brightness-110 shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 self-start md:self-auto hover:scale-105"
        >
          <Sparkles className="w-4 h-4 fill-slate-950" />
          Apply as Creator
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search creator by name, handle, channel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs sm:text-sm text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl glass-input text-xs font-semibold text-slate-200 bg-slate-900"
          >
            <option value="all">All Platforms</option>
            <option value="youtube">YouTube</option>
            <option value="twitch">Twitch</option>
            <option value="instagram">Instagram</option>
          </select>
        </div>
      </div>

      {/* Creators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {filteredCreators.map((creator) => (
          <div
            key={creator._id}
            className="p-6 rounded-3xl glass-card border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between group space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={creator.avatarUrl}
                  alt={creator.displayName}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/40 bg-slate-800"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-white text-lg truncate group-hover:text-amber-400 transition-colors">
                      {creator.displayName}
                    </h3>
                    <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 fill-sky-400/20" />
                  </div>
                  <p className="text-xs text-slate-400">@{creator.username}</p>
                  <div className="text-xs font-bold text-amber-400 mt-1">
                    {(creator.followerCount / 1000).toFixed(0)}k+ Subscribers
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                {creator.bio}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {creator.achievements.map((ach) => (
                  <span
                    key={ach}
                    className="text-[10px] font-semibold px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700"
                  >
                    {ach}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-slate-300">
                {creator.platform === "youtube" ? (
                  <Youtube className="w-4 h-4 text-rose-500" />
                ) : (
                  <Twitch className="w-4 h-4 text-purple-400" />
                )}
                <span className="font-semibold">{creator.channelName}</span>
              </div>

              <Link
                href={`/creators/${creator.username}`}
                onClick={() => soundFx.playClick()}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-amber-500 hover:text-slate-950 transition-colors flex items-center gap-1"
              >
                Profile <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
