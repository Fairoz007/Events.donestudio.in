"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function LeaderboardsPage() {
  const fixture = useQuery(api.onam.listFixture);
  const summary = useQuery(api.onam.getSummary, { now: Date.now() });
  const matches = fixture?.matches || [];
  const completed = matches.filter((m) => ["completed", "walkover"].includes(m.status));
  const champion = fixture?.tournament.championClerkUserId;

  return (
    <main className="min-h-screen bg-[#080b0e] px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <header>
          <p className="text-xs font-black tracking-[0.3em] text-amber-300 uppercase">ONAM 2026</p>
          <h1 className="mt-2 text-4xl sm:text-5xl font-black text-white">Leaderboards</h1>
          <p className="mt-3 text-slate-400">Realtime standings from Convex. No placeholder ranks are shown.</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card label="ONAM Registrations" value={String(summary?.registeredUsers ?? 0)} />
          <Card label="Vadamvali Completed Matches" value={String(completed.length)} />
          <Card label="Vadamvali Champion" value={champion || "Not decided"} />
        </section>

        <section className="rounded-lg border border-slate-800 bg-slate-950/70 p-5">
          <h2 className="text-xl font-black text-white">Tournament Results</h2>
          <div className="mt-4 space-y-3">
            {completed.length === 0 ? (
              <p className="text-sm text-slate-400">No completed results yet.</p>
            ) : (
              completed.map((match) => (
                <div key={match._id} className="rounded-lg border border-slate-800 p-4 text-sm text-slate-300">
                  {match.player1Name || "TBD"} vs {match.player2Name || "TBD"} · Winner: {match.winnerClerkUserId || "Pending"} · {match.matchResultType || "played"}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-5">
      <div className="text-xs font-bold uppercase text-slate-400">{label}</div>
      <div className="mt-2 text-2xl font-black text-white break-words">{value}</div>
    </div>
  );
}
