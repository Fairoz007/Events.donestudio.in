// @ts-nocheck
"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { CalendarClock, FileCheck, Radio, Trophy, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useStableNow } from "@/lib/useStableNow";

function fmt(value?: number) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Muscat" }).format(new Date(value));
}

export default function AdminPage() {
  const { isAdmin } = useAuth();
  const now = useStableNow();
  const summary = useQuery(api.onam.getSummary, { now });
  const fixture = useQuery(api.onam.listFixture);
  const generate = useMutation(api.onam.generateVadamvaliFixture);
  const openCheckIn = useMutation(api.onam.openNextMatchCheckIn);
  const updateSettings = useMutation(api.onam.updateSettings);

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-[#080b0e] px-4 py-20 text-center">
        <h1 className="text-4xl font-black text-white">Admin</h1>
        <p className="mt-3 text-slate-400">Admin or super admin access is required.</p>
      </main>
    );
  }

  const matches = fixture?.matches || [];
  const current = summary?.currentMatch;
  const next = summary?.nextMatch;

  return (
    <main className="min-h-screen bg-[#080b0e] px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <header>
          <p className="text-xs font-black tracking-[0.3em] text-amber-300 uppercase">D-One Studio</p>
          <h1 className="mt-2 text-4xl sm:text-5xl font-black text-white">ONAM Control Center</h1>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Stat icon={<Users className="w-5 h-5 text-emerald-300" />} label="Registrations" value={String(summary?.registeredUsers ?? 0)} />
          <Stat icon={<Trophy className="w-5 h-5 text-amber-300" />} label="Vadamvali players" value={String(summary?.activeParticipants ?? 0)} />
          <Stat icon={<Radio className="w-5 h-5 text-sky-300" />} label="Current match" value={current ? `#${current.matchNumber}` : "None"} />
          <Stat icon={<FileCheck className="w-5 h-5 text-pink-300" />} label="Completed matches" value={String(matches.filter((m) => ["completed", "walkover"].includes(m.status)).length)} />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel title="ONAM Overview">
            <Line label="Registration status" value={summary?.registrationStatus || "Loading"} />
            <Line label="Opens" value={fmt(summary?.settings.registrationOpensAt)} />
            <Line label="Closes" value={fmt(summary?.settings.registrationClosesAt)} />
            <Line label="Current activity" value={summary?.settings.currentActivity || "Registration"} />
            <Line label="Next activity" value={summary?.settings.nextActivity || "Vadamvali Fixture"} />
          </Panel>
          <Panel title="Vadamvali">
            <Line label="Tournament status" value={fixture?.tournament.status || "Loading"} />
            <Line label="Format" value="Best of 3" />
            <Line label="Current match" value={current ? `${current.player1Name || "TBD"} vs ${current.player2Name || "TBD"}` : "None"} />
            <Line label="Next match" value={next ? `${next.player1Name || "TBD"} vs ${next.player2Name || "TBD"}` : "None"} />
            <div className="mt-4 flex flex-wrap gap-3">
              <button onClick={() => void generate()} className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-black text-slate-950">Generate Fixture</button>
              <button onClick={() => void openCheckIn()} className="rounded-lg bg-sky-400 px-4 py-2 text-sm font-black text-slate-950">Open Next Check-In</button>
            </div>
          </Panel>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel title="Pookalam">
            <Line label="Submission window" value={`${fmt(summary?.settings.pookalamSubmissionOpensAt)} to ${fmt(summary?.settings.pookalamSubmissionClosesAt)}`} />
            <Line label="Voting window" value={`${fmt(summary?.settings.pookalamVotingOpensAt)} to ${fmt(summary?.settings.pookalamVotingClosesAt)}`} />
            <Line label="Live vote counts" value={summary?.settings.pookalamLiveVoteCounts ? "Visible" : "Hidden until voting ends"} />
            <button onClick={() => void updateSettings({ pookalamLiveVoteCounts: !summary?.settings.pookalamLiveVoteCounts })} className="mt-4 rounded-lg border border-slate-700 px-4 py-2 text-sm font-bold text-white">
              Toggle Live Vote Counts
            </button>
          </Panel>
          <Panel title="Onam Quiz">
            <Line label="Status" value={summary?.settings.quizStatus || "Lobby"} />
            <div className="mt-4 flex flex-wrap gap-3">
              {(["registration", "lobby", "live", "paused", "finished"] as const).map((status) => (
                <button key={status} onClick={() => void updateSettings({ quizStatus: status })} className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-black text-white">
                  {status}
                </button>
              ))}
            </div>
          </Panel>
        </section>

        <section className="rounded-lg border border-slate-800 bg-slate-950/70 p-5">
          <h2 className="text-xl font-black text-white">Match Queue</h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {matches.length === 0 ? (
              <p className="text-sm text-slate-400">No fixture generated yet.</p>
            ) : (
              matches
                .filter((m) => m.queuePosition > 0)
                .sort((a, b) => a.queuePosition - b.queuePosition)
                .slice(0, 24)
                .map((match) => (
                  <div key={match._id} className="rounded-lg border border-slate-800 p-4">
                    <div className="text-xs font-bold text-slate-500">Queue #{match.queuePosition} · {match.status}</div>
                    <div className="mt-2 text-sm font-black text-white">{match.player1Name || "TBD"} vs {match.player2Name || "TBD"}</div>
                    <div className="text-xs text-slate-400">Expected Start: {fmt(match.expectedStartAt)}</div>
                  </div>
                ))
            )}
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {["Registrations", "Participants", "Streamers", "Notifications"].map((title) => (
            <div key={title} className="rounded-lg border border-slate-800 bg-slate-950/70 p-5">
              <h2 className="text-lg font-black text-white">{title}</h2>
              <p className="mt-2 text-sm text-slate-400">Managed through Convex-backed ONAM records.</p>
            </div>
          ))}
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

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950/70 p-5">
      <h2 className="text-xl font-black text-white">{title}</h2>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="font-bold text-white text-right">{value}</span>
    </div>
  );
}

