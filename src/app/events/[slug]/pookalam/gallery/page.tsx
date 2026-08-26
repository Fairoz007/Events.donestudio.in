"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Trophy,
  Heart,
  Eye,
  Share2,
  Filter,
  Plus,
  ArrowLeft,
  Award,
  Crown,
} from "lucide-react";
import { INITIAL_POOKALAMS } from "@/lib/mockData";
import { useAuth } from "@/context/AuthContext";
import { soundFx } from "@/lib/sounds";

export default function PookalamGalleryPage() {
  const { isSignedIn, updateUserPoints } = useAuth();
  const [filter, setFilter] = useState("all");
  const [pookalams, setPookalams] = useState(INITIAL_POOKALAMS);
  const [votedIds, setVotedIds] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleVote = (id: string) => {
    if (votedIds.includes(id)) return;
    soundFx.playVictory();

    setVotedIds((prev) => [...prev, id]);
    setPookalams((prev) =>
      prev.map((item) => (item._id === id ? { ...item, voteCount: item.voteCount + 1 } : item))
    );
    updateUserPoints(10, "Voting for Community Pookalam");
  };

  const handleShare = (id: string) => {
    soundFx.playClick();
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const filteredItems = pookalams.filter((item) => {
    if (filter === "winners") return item.status === "winner";
    if (filter === "most_voted") return true;
    return true;
  });

  if (filter === "most_voted") {
    filteredItems.sort((a, b) => b.voteCount - a.voteCount);
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-6">
        <div className="space-y-3">
          <Link
            href="/events/onam-2026"
            onClick={() => soundFx.playClick()}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Onam 2026 Hub
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Community Gallery & Competition
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white">
            Onam 2026 <span className="emerald-gradient-text">Pookalam Gallery</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Vote for your favorite community floral creations. 1 vote per member per design. Winners receive official trophies and cash prizes!
          </p>
        </div>

        <Link
          href="/events/onam-2026/pookalam"
          onClick={() => soundFx.playClick()}
          className="px-6 py-3.5 rounded-2xl font-black text-sm bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:brightness-110 shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 self-start md:self-auto hover:scale-105"
        >
          <Plus className="w-4 h-4" /> Design Your Pookalam
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 w-fit">
        {[
          { id: "all", label: "All Submissions" },
          { id: "most_voted", label: "🔥 Most Voted" },
          { id: "winners", label: "👑 Award Winners" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => {
              soundFx.playClick();
              setFilter(f.id);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === f.id
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item) => {
          const hasVoted = votedIds.includes(item._id);
          const isWinner = item.status === "winner";

          return (
            <div
              key={item._id}
              className={`rounded-3xl glass-card border overflow-hidden flex flex-col justify-between group transition-all ${
                isWinner ? "border-amber-500/50 bg-amber-500/5" : "border-slate-800"
              }`}
            >
              {/* Image Banner */}
              <div className="relative aspect-square overflow-hidden bg-slate-900">
                <img
                  src={item.previewUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

                {/* Winner Badges */}
                {item.winnerBadge && (
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-black uppercase shadow-lg shadow-amber-500/30">
                    <Crown className="w-3.5 h-3.5 fill-slate-950" />
                    {item.winnerBadge.replace("_", " ")}
                  </div>
                )}

                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="text-base font-bold text-white truncate drop-shadow-md">
                    {item.title}
                  </h3>
                </div>
              </div>

              {/* Card Meta & Vote Button */}
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={item.creatorAvatar}
                      alt={item.creatorName}
                      className="w-7 h-7 rounded-full object-cover border border-slate-700"
                    />
                    <span className="text-xs font-semibold text-slate-300">
                      {item.creatorName}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{item.viewCount}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleVote(item._id)}
                    disabled={hasVoted}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md ${
                      hasVoted
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 cursor-default"
                        : "bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:brightness-110 shadow-rose-500/20 hover:scale-[1.02]"
                    }`}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        hasVoted ? "fill-rose-400 text-rose-400" : "fill-transparent"
                      }`}
                    />
                    <span>{item.voteCount} Votes</span>
                    {hasVoted && <span className="text-[10px] ml-0.5">(Voted)</span>}
                  </button>

                  <button
                    onClick={() => handleShare(item._id)}
                    className="p-2.5 rounded-xl glass-panel border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Share Pookalam"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
