"use client";

import { useMemo, useState } from "react";
import { Search, Trophy } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function LeaderboardsPage() {
  const [tab, setTab] = useState<"global" | "vadamvali" | "quiz" | "pookalam">("global");
  const [search, setSearch] = useState("");

  const globalLeaderboard = useQuery(api.leaderboards.getGlobalLeaderboard, { limit: 25 });
  const vadamvaliLeaderboard = useQuery(api.leaderboards.getVadamvaliLeaderboard, { limit: 25 });
  const quizLeaderboard = useQuery(api.leaderboards.getQuizLeaderboard, { limit: 25 });
  const pookalamLeaderboard = useQuery(api.leaderboards.getPookalamLeaderboard, { limit: 25 });

  const leaderboard = useMemo(() => {
    switch (tab) {
      case "vadamvali":
        return vadamvaliLeaderboard ?? [];
      case "quiz":
        return quizLeaderboard ?? [];
      case "pookalam":
        return pookalamLeaderboard ?? [];
      default:
        return globalLeaderboard ?? [];
    }
  }, [globalLeaderboard, pookalamLeaderboard, quizLeaderboard, tab, vadamvaliLeaderboard]);

  const filteredList = leaderboard.filter((player: any) => {
    const displayName = player.displayName ?? player.username ?? "";
    const username = player.username ?? "";
    const searchValue = search.toLowerCase();
    return displayName.toLowerCase().includes(searchValue) || username.toLowerCase().includes(searchValue);
  });

  const top3 = filteredList.slice(0, 3);

  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <Trophy className="w-3.5 h-3.5" /> Hall of Champions
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white">
          Championship <span className="gold-gradient-text">Leaderboards</span>
        </h1>
        <p className="text-slate-400 text-xs sm:text-base">
          Real-time standings from Convex, updated as matches, votes, and quiz scores change.
        </p>
      </div>

      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {[
            { id: "global", label: "🏆 Global XP Standings" },
            { id: "vadamvali", label: "🪢 Vadamvali Wins" },
            { id: "quiz", label: "🎯 Quiz Masters" },
            { id: "pookalam", label: "🌸 Pookalam Stars" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id as "global" | "vadamvali" | "quiz" | "pookalam")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                tab === item.id
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search player..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs text-white"
          />
        </div>
      </div>

      {top3.length >= 3 && !search && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-8 max-w-4xl mx-auto">
          {[top3[1], top3[0], top3[2]].map((player, index) => {
            const playerAny = player as any;
            const metricValue = playerAny.points ?? playerAny.highScore ?? playerAny.votesReceived ?? 0;
            return (
              <div
                key={playerAny.clerkUserId ?? `${playerAny.username}-${index}`}
                className={`p-6 rounded-3xl border text-center space-y-3 ${
                  index === 1
                    ? "glass-panel-gold border-amber-500 shadow-2xl"
                    : index === 0
                      ? "glass-card border-slate-700 bg-slate-900/60 md:translate-y-4"
                      : "glass-card border-amber-800/40 bg-amber-950/20 md:translate-y-8"
                }`}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-black mx-auto text-sm shadow-md bg-slate-300 text-slate-950">
                  {index === 0 ? 2 : index === 1 ? 1 : 3}
                </div>
                <img
                  src={playerAny.avatarUrl}
                  alt={playerAny.displayName}
                  className="w-16 h-16 rounded-2xl mx-auto object-cover border-2 border-slate-400 bg-slate-800"
                />
                <div>
                  <h3 className="font-extrabold text-white text-base truncate">{playerAny.displayName}</h3>
                  <p className="text-xs text-slate-400">@{playerAny.username}</p>
                </div>
                <div className="text-sm font-black text-amber-400">
                  {metricValue.toLocaleString()}
                  {tab === "global" ? " XP" : tab === "vadamvali" ? " Wins" : tab === "quiz" ? " Score" : " Votes"}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800">
        <div className="divide-y divide-slate-800/60">
          {filteredList.map((player: any) => (
            <div
              key={player.clerkUserId ?? player.username}
              className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-center gap-4 min-w-0">
                <span className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 bg-slate-800 text-slate-400">
                  {player.rank}
                </span>
                <img
                  src={player.avatarUrl}
                  alt={player.displayName}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white truncate">{player.displayName}</h4>
                  </div>
                  <p className="text-xs text-slate-400">@{player.username}</p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-right shrink-0">
                <div className="hidden sm:block">
                  <span className="text-xs text-slate-400 block">
                    {tab === "global" ? `Level ${player.level}` : tab === "vadamvali" ? `${player.wins ?? 0} Wins` : tab === "quiz" ? `${player.quizzesTaken ?? 0} Attempts` : `${player.submissions ?? 0} Entries`}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {tab === "vadamvali" ? `${player.winRate ?? 0}% win rate` : tab === "quiz" ? `${player.highScore ?? 0} Best` : tab === "pookalam" ? `${player.votesReceived ?? 0} votes` : `${player.stats?.vadamvaliWins ?? 0} wins`}
                  </span>
                </div>

                <div>
                  <span className="text-base sm:text-lg font-black text-amber-400 block">
                    {tab === "global"
                      ? `${(player.points ?? 0).toLocaleString()} XP`
                      : tab === "vadamvali"
                        ? `${(player.points ?? 0).toLocaleString()} Points`
                        : tab === "quiz"
                          ? `${(player.highScore ?? 0).toLocaleString()}`
                          : `${(player.votesReceived ?? 0).toLocaleString()} Votes`}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">Rank #{player.rank}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
