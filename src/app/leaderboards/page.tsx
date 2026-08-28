// @ts-nocheck
"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Flame, HelpCircle, Palette, Sparkles, Trophy, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { soundFx } from "@/lib/sounds";

type LeaderboardCategory = "global" | "vadamvali" | "pookalam" | "quiz" | "tournament";

export default function LeaderboardsPage() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState<LeaderboardCategory>("global");

  const summary = useQuery(api.onam.getSummary, {});
  const fixture = useQuery(api.onam.listFixture);
  const globalBoard = useQuery(api.leaderboards.getGlobalLeaderboard, { limit: 50 });
  const vadamvaliBoard = useQuery(api.leaderboards.getVadamvaliLeaderboard, { limit: 50 });
  const quizBoard = useQuery(api.leaderboards.getQuizLeaderboard, { limit: 50 });
  const pookalamBoard = useQuery(api.leaderboards.getPookalamLeaderboard, { limit: 50 });

  const matches = fixture?.matches || [];
  const completedMatches = matches.filter((m) => ["completed", "walkover"].includes(m.status));
  const champion = fixture?.tournament.championClerkUserId;

  return (
    <main className="min-h-screen bg-[#080b0e] text-slate-100 px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="border-b border-slate-800 pb-6">
          <p className="text-xs font-black tracking-[0.3em] text-amber-300 uppercase">ONAM 2026</p>
          <h1 className="mt-2 text-4xl sm:text-5xl font-black text-white flex items-center gap-3">
            <Trophy className="w-9 h-9 text-amber-400" />
            STANDINGS & LEADERBOARDS
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Realtime rankings, XP scores, and tournament standings verified by Convex.
          </p>
        </header>

        {/* Global Summary Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card label="ONAM Registrations" value={String(summary?.registeredUsers ?? 0)} />
          <Card label="Vadamvali Matches Completed" value={String(completedMatches.length)} />
          <Card
            label="Tournament Champion"
            value={champion ? `Champion Crowned 👑` : "In Progress"}
          />
        </section>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
          <CategoryTab
            active={activeCategory === "global"}
            onClick={() => setActiveCategory("global")}
            icon={<Sparkles className="w-4 h-4 text-amber-400" />}
            label="Overall XP Ranking"
          />
          <CategoryTab
            active={activeCategory === "vadamvali"}
            onClick={() => setActiveCategory("vadamvali")}
            icon={<Flame className="w-4 h-4 text-orange-400" />}
            label="Vadamvali Duels"
          />
          <CategoryTab
            active={activeCategory === "pookalam"}
            onClick={() => setActiveCategory("pookalam")}
            icon={<Palette className="w-4 h-4 text-pink-400" />}
            label="Digital Pookalam"
          />
          <CategoryTab
            active={activeCategory === "quiz"}
            onClick={() => setActiveCategory("quiz")}
            icon={<HelpCircle className="w-4 h-4 text-sky-400" />}
            label="Onam Quiz Masters"
          />
          <CategoryTab
            active={activeCategory === "tournament"}
            onClick={() => setActiveCategory("tournament")}
            icon={<Trophy className="w-4 h-4 text-emerald-400" />}
            label="Tournament Results"
          />
        </div>

        {/* Ranking Tables */}
        {activeCategory === "global" && (
          <LeaderboardTable
            title="Global XP Leaderboard"
            description="Players ranked by total XP earned across all ONAM 2026 events and competitions."
            data={globalBoard || []}
            metricLabel="Total XP"
            getMetric={(item) => `${item.points.toLocaleString()} XP`}
            currentUserId={user?.clerkUserId}
          />
        )}

        {activeCategory === "vadamvali" && (
          <LeaderboardTable
            title="Vadamvali Duel Standings"
            description="Top Tug of War competitors ranked by match wins and win rate."
            data={vadamvaliBoard || []}
            metricLabel="Record / Win Rate"
            getMetric={(item) => `${item.wins}W - ${item.losses}L (${item.winRate}%)`}
            currentUserId={user?.clerkUserId}
          />
        )}

        {activeCategory === "pookalam" && (
          <LeaderboardTable
            title="Pookalam Designer Rankings"
            description="Creative artists ranked by community votes received on their floral masterpieces."
            data={pookalamBoard || []}
            metricLabel="Votes Received"
            getMetric={(item) => `${item.votesReceived} Votes`}
            currentUserId={user?.clerkUserId}
          />
        )}

        {activeCategory === "quiz" && (
          <LeaderboardTable
            title="Cultural Quiz Masters"
            description="Competitors ranked by highest score achieved in Kerala heritage and Onam trivia."
            data={quizBoard || []}
            metricLabel="High Score"
            getMetric={(item) => `${item.highScore} Pts (${item.quizzesTaken} played)`}
            currentUserId={user?.clerkUserId}
          />
        )}

        {activeCategory === "tournament" && (
          <section className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-xl font-black text-white">Vadamvali Tournament Results</h2>
            <div className="space-y-3">
              {completedMatches.length === 0 ? (
                <p className="text-xs text-slate-400 py-6">No completed tournament results yet.</p>
              ) : (
                completedMatches.map((match) => (
                  <div
                    key={match._id}
                    className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">
                        {match.player1Name || "TBD"} ({match.player1Wins}) vs {match.player2Name || "TBD"} ({match.player2Wins})
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Winner: <strong className="text-emerald-400">{match.winnerClerkUserId ? (match.winnerClerkUserId === match.player1ClerkUserId ? match.player1Name : match.player2Name) : "Decided"}</strong> · {match.matchResultType || "played"}
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-bold uppercase text-[10px]">
                      Match #{match.matchNumber}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 backdrop-blur-md">
      <div className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</div>
      <div className="mt-2 text-2xl font-black text-white break-words">{value}</div>
    </div>
  );
}

function CategoryTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={() => {
        soundFx.playClick();
        onClick();
      }}
      className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${
        active
          ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
          : "glass-panel text-slate-300 hover:text-white hover:border-slate-700"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function LeaderboardTable({
  title,
  description,
  data,
  metricLabel,
  getMetric,
  currentUserId,
}: {
  title: string;
  description: string;
  data: any[];
  metricLabel: string;
  getMetric: (item: any) => string;
  currentUserId?: string;
}) {
  if (data.length === 0) {
    return (
      <div className="glass-panel p-10 rounded-2xl border border-slate-800 text-center space-y-2">
        <Users className="w-8 h-8 text-slate-600 mx-auto" />
        <h3 className="text-base font-black text-white">{title}</h3>
        <p className="text-xs text-slate-400">No rankings recorded yet. Be the first to compete!</p>
      </div>
    );
  }

  return (
    <section className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
      <div>
        <h2 className="text-xl font-black text-white">{title}</h2>
        <p className="text-xs text-slate-400">{description}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
              <th className="py-3 px-4 w-16">Rank</th>
              <th className="py-3 px-4">Player</th>
              <th className="py-3 px-4 w-24">Level</th>
              <th className="py-3 px-4 text-right">{metricLabel}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {data.map((item, idx) => {
              const isMe = currentUserId && item.clerkUserId === currentUserId;
              const rank = item.rank || idx + 1;
              return (
                <tr
                  key={item.clerkUserId || idx}
                  className={`hover:bg-slate-900/50 transition-colors ${
                    isMe ? "bg-emerald-500/10 font-bold text-emerald-300" : "text-slate-300"
                  }`}
                >
                  <td className="py-3 px-4 font-black">
                    {rank === 1 ? (
                      <span className="text-amber-400 text-sm">🥇 #1</span>
                    ) : rank === 2 ? (
                      <span className="text-slate-300 text-sm">🥈 #2</span>
                    ) : rank === 3 ? (
                      <span className="text-amber-600 text-sm">🥉 #3</span>
                    ) : (
                      `#${rank}`
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={item.avatarUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=user"}
                        alt={item.displayName}
                        className="w-7 h-7 rounded-lg object-cover border border-slate-700 bg-slate-800 shrink-0"
                      />
                      <span className="font-bold text-white truncate max-w-xs">
                        {item.displayName || item.username} {isMe && "(You)"}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-400">
                    Lvl {item.level || 1}
                  </td>
                  <td className="py-3 px-4 text-right font-black text-white">
                    {getMetric(item)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
