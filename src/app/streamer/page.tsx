// @ts-nocheck
"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Play, Radio } from "lucide-react";

function fmt(value?: number) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en", { timeStyle: "short", dateStyle: "medium", timeZone: "Asia/Muscat" }).format(new Date(value));
}

export default function StreamerControlPage() {
  const summary = useQuery(api.onam.getSummary, { now: Date.now() });
  const fixture = useQuery(api.onam.listFixture);
  const openCheckIn = useMutation(api.onam.openNextMatchCheckIn);
  const start = useMutation(api.onam.startReadyMatch);
  const current = summary?.currentMatch;
  const next = summary?.nextMatch;

  return (
    <main className="min-h-screen bg-[#080b0e] px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <header>
          <p className="text-xs font-black tracking-[0.3em] text-amber-300 uppercase">ONAM Streamer Control</p>
          <h1 className="mt-2 text-4xl sm:text-5xl font-black text-white">Live Match Desk</h1>
          <p className="mt-3 text-slate-400">Streamers can view the bracket and queue. Only approved event hosts can operate scheduled matches.</p>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel title="CURRENT MATCH">
            {current ? (
              <>
                <div className="text-2xl font-black text-white">{current.player1Name || "TBD"} vs {current.player2Name || "TBD"}</div>
                <div className="mt-2 text-sm text-slate-400">Status: {current.status} · Game {current.player1Wins + current.player2Wins + 1} of 3</div>
                <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm font-black text-emerald-300">
                  <Radio className="w-4 h-4" /> LIVE
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-400">No live Vadamvali match.</p>
            )}
          </Panel>
          <Panel title="NEXT MATCH">
            {next ? (
              <>
                <div className="text-2xl font-black text-white">{next.player1Name || "TBD"} vs {next.player2Name || "TBD"}</div>
                <div className="mt-2 text-sm text-slate-400">Expected: {fmt(next.expectedStartAt)}</div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button onClick={() => void openCheckIn()} className="rounded-lg bg-sky-400 px-4 py-2 text-sm font-black text-slate-950">Announce Check-In</button>
                  {next.status === "ready" && (
                    <button onClick={() => void start({ matchId: next._id })} className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-black text-slate-950">
                      <Play className="w-4 h-4" /> Start Match
                    </button>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-400">No next match in queue.</p>
            )}
          </Panel>
        </section>

        <section className="rounded-lg border border-slate-800 bg-slate-950/70 p-5">
          <h2 className="text-xl font-black text-white">Upcoming Queue</h2>
          <div className="mt-4 space-y-3">
            {(fixture?.matches || [])
              .filter((m) => m.queuePosition > 0 && !["completed", "walkover", "no_show"].includes(m.status))
              .sort((a, b) => a.queuePosition - b.queuePosition)
              .slice(0, 12)
              .map((match) => (
                <div key={match._id} className="rounded-lg border border-slate-800 p-4">
                  <div className="text-xs font-bold text-slate-500">Queue #{match.queuePosition} · {match.status}</div>
                  <div className="mt-1 text-sm font-black text-white">{match.player1Name || "TBD"} vs {match.player2Name || "TBD"}</div>
                  <div className="text-xs text-slate-400">Expected Start: {fmt(match.expectedStartAt)}</div>
                </div>
              ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950/70 p-5">
      <h2 className="text-sm font-black tracking-[0.2em] text-slate-400">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

