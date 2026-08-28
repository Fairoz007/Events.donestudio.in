"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { CalendarClock, CheckCircle2, Play, Trophy, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

function fmt(value?: number) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en", { timeStyle: "short", dateStyle: "medium", timeZone: "Asia/Muscat" }).format(new Date(value));
}

export default function VadamvaliPage() {
  const { isAdmin } = useAuth();
  const summary = useQuery(api.onam.getSummary, { now: Date.now() });
  const fixture = useQuery(api.onam.listFixture);
  const my = useQuery(api.onam.getMyOnam, { now: Date.now() });
  const register = useMutation(api.onam.registerForActivity);
  const generate = useMutation(api.onam.generateVadamvaliFixture);
  const openCheckIn = useMutation(api.onam.openNextMatchCheckIn);
  const checkIn = useMutation(api.onam.checkInForMatch);
  const start = useMutation(api.onam.startReadyMatch);
  const record = useMutation(api.onam.recordGameWinner);
  const [selectedRound, setSelectedRound] = useState<number | null>(null);

  const rounds = fixture?.rounds || [];
  const matches = fixture?.matches || [];
  const visibleRound = selectedRound || rounds[0]?.roundNumber || 1;
  const roundMatches = useMemo(() => matches.filter((m) => m.roundNumber === visibleRound), [matches, visibleRound]);
  const myVadamvali = my?.activityRegistrations.some((r) => r.activitySlug === "vadamvali");
  const currentMatch = summary?.currentMatch;
  const nextMatch = summary?.nextMatch;

  return (
    <main className="min-h-screen bg-[#080b0e] px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <p className="text-xs font-black tracking-[0.3em] text-amber-300 uppercase">ONAM 2026</p>
            <h1 className="mt-2 text-4xl sm:text-5xl font-black text-white">VADAMVALI FIXTURE</h1>
            <p className="mt-3 text-slate-400">Best-of-3 tournament. First to 2 games wins. Only one tournament match may be live at a time.</p>
          </div>
          <button
            disabled={summary?.registrationStatus !== "open" || myVadamvali}
            onClick={() => void register({ activitySlug: "vadamvali" })}
            className="rounded-lg bg-emerald-500 px-5 py-3 text-sm font-black text-slate-950 disabled:bg-slate-700 disabled:text-slate-300"
          >
            {myVadamvali ? "Registered" : "Register for Vadamvali"}
          </button>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Stat icon={<Users className="w-5 h-5 text-emerald-300" />} label="Registrations" value={String(summary?.activeParticipants ?? 0)} />
          <Stat icon={<Trophy className="w-5 h-5 text-amber-300" />} label="Format" value="Best of 3" />
          <Stat icon={<CalendarClock className="w-5 h-5 text-sky-300" />} label="Registration" value={summary?.registrationStatus === "open" ? "Open" : summary?.registrationStatus || "Loading"} />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <MatchPanel title="CURRENT MATCH" match={currentMatch} />
          <MatchPanel title="NEXT MATCH" match={nextMatch} />
        </section>

        {my?.upcomingMatch && (
          <section className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-5">
            <h2 className="text-xl font-black text-white">YOUR NEXT MATCH</h2>
            <p className="mt-2 text-slate-300">
              {my.upcomingMatch.player1Name || "TBD"} vs {my.upcomingMatch.player2Name || "TBD"} · Expected Start {fmt(my.upcomingMatch.expectedStartAt)}
            </p>
            {my.upcomingMatch.status === "ready_for_checkin" ? (
              <button onClick={() => void checkIn({ matchId: my.upcomingMatch!._id })} className="mt-4 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-black text-slate-950">
                CHECK IN
              </button>
            ) : (
              <div className="mt-4 rounded-lg border border-slate-700 px-4 py-3 text-sm font-bold text-slate-300">
                MATCH NOT READY. Expected Start: {fmt(my.upcomingMatch.expectedStartAt)}
              </div>
            )}
          </section>
        )}

        {isAdmin && (
          <section className="rounded-lg border border-slate-800 bg-slate-950/70 p-5">
            <h2 className="text-xl font-black text-white">Vadamvali Admin Controls</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <button onClick={() => void generate()} className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-black text-slate-950">Generate Fixture</button>
              <button onClick={() => void openCheckIn()} className="rounded-lg bg-sky-400 px-4 py-2 text-sm font-black text-slate-950">Open Next Check-In</button>
              {currentMatch && (
                <>
                  <button onClick={() => void record({ matchId: currentMatch._id, winnerClerkUserId: currentMatch.player1ClerkUserId || "" })} className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-bold text-white">
                    Game to {currentMatch.player1Name}
                  </button>
                  <button onClick={() => void record({ matchId: currentMatch._id, winnerClerkUserId: currentMatch.player2ClerkUserId || "" })} className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-bold text-white">
                    Game to {currentMatch.player2Name}
                  </button>
                </>
              )}
              {nextMatch?.status === "ready" && <button onClick={() => void start({ matchId: nextMatch._id })} className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-black text-slate-950">Start Ready Match</button>}
            </div>
          </section>
        )}

        <section className="rounded-lg border border-slate-800 bg-slate-950/70 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-xl font-black text-white">Fixture</h2>
            <div className="flex flex-wrap gap-2">
              {rounds.map((round) => (
                <button
                  key={round._id}
                  onClick={() => setSelectedRound(round.roundNumber)}
                  className={`rounded-lg px-3 py-2 text-xs font-black ${visibleRound === round.roundNumber ? "bg-emerald-500 text-slate-950" : "bg-slate-900 text-slate-300"}`}
                >
                  {round.name}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {roundMatches.length === 0 ? (
              <p className="text-sm text-slate-400">Fixture has not been generated yet.</p>
            ) : (
              roundMatches.map((match) => <MatchCard key={match._id} match={match} />)
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-5">
      {icon}
      <div className="mt-3 text-xs font-bold uppercase text-slate-400">{label}</div>
      <div className="mt-1 text-2xl font-black text-white">{value}</div>
    </div>
  );
}

function MatchPanel({ title, match }: { title: string; match: any }) {
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950/70 p-5">
      <h2 className="text-sm font-black tracking-[0.2em] text-slate-400">{title}</h2>
      {match ? (
        <div className="mt-4">
          <div className="text-2xl font-black text-white">{match.player1Name || "TBD"} vs {match.player2Name || "TBD"}</div>
          <div className="mt-2 text-sm text-slate-400">Status: {match.status} · Expected Start: {fmt(match.expectedStartAt)}</div>
          <div className="mt-3 flex items-center gap-3 text-sm text-white">
            <span>{match.player1Wins}</span>
            <span className="text-slate-500">Game {match.player1Wins + match.player2Wins + 1} of 3</span>
            <span>{match.player2Wins}</span>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm text-slate-400">No match is active in the queue.</p>
      )}
    </section>
  );
}

function MatchCard({ match }: { match: any }) {
  return (
    <article className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Match #{match.matchNumber}</span>
        <span>{match.status}</span>
      </div>
      <div className="mt-3 space-y-2 text-sm">
        <div className="flex items-center justify-between text-white"><span>{match.player1Name || "TBD"}</span><span>{match.player1Wins}</span></div>
        <div className="flex items-center justify-between text-white"><span>{match.player2Name || "TBD"}</span><span>{match.player2Wins}</span></div>
      </div>
      {match.winnerClerkUserId && (
        <div className="mt-3 flex items-center gap-2 text-xs font-bold text-emerald-300">
          <CheckCircle2 className="w-4 h-4" />
          {match.matchResultType === "walkover" ? "Wins by W.O." : "Winner advanced"}
        </div>
      )}
      {match.status === "live" && <Play className="mt-3 w-4 h-4 text-emerald-300" />}
    </article>
  );
}
