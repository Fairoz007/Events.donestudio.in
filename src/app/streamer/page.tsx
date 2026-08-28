"use client";

import React, { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Eye, Radio, Send, Trophy } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { soundFx } from "@/lib/sounds";

export default function StreamerPage() {
  const dashboard = useQuery(api.tournaments.streamerDashboard);
  const application = useQuery(api.streamers.myApplication);
  const apply = useMutation(api.streamers.apply);
  const spectate = useMutation(api.tournaments.spectateMatch);
  const [form, setForm] = useState({
    name: "",
    username: "",
    platform: "youtube",
    channelUrl: "",
    followerCount: 0,
    country: "IN",
    description: "",
  });

  if (dashboard === undefined || application === undefined) {
    return <div className="min-h-screen p-12 text-center text-white">Loading streamer access...</div>;
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8 text-white">
      <div className="space-y-2 border-b border-slate-800 pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase">
          <Radio className="w-3.5 h-3.5" /> Streamer Spectator Access
        </div>
        <h1 className="text-3xl sm:text-5xl font-black">Streamer Dashboard</h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          Approved streamers can watch eligible live matches in read-only mode. Game actions and scoring stay locked to players and admins.
        </p>
      </div>

      {!dashboard.allowed ? (
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            soundFx.playClick();
            await apply(form);
          }}
          className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-5"
        >
          <div>
            <h2 className="text-xl font-black">Register as Streamer</h2>
            <p className="text-xs text-slate-400 mt-1">
              Current application status: <span className="text-amber-400 font-bold">{application?.status ?? "not submitted"}</span>
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Name" value={form.name} onChange={(name) => setForm({ ...form, name })} />
            <Input label="Username" value={form.username} onChange={(username) => setForm({ ...form, username })} />
            <Input label="Platform" value={form.platform} onChange={(platform) => setForm({ ...form, platform })} />
            <Input label="Channel URL" value={form.channelUrl} onChange={(channelUrl) => setForm({ ...form, channelUrl })} />
            <Input label="Followers/Subscribers" type="number" value={String(form.followerCount)} onChange={(followerCount) => setForm({ ...form, followerCount: Number(followerCount) })} />
            <Input label="Country" value={form.country} onChange={(country) => setForm({ ...form, country })} />
            <label className="sm:col-span-2 space-y-1">
              <span className="text-xs font-bold text-slate-400">Description</span>
              <textarea
                required
                rows={3}
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white"
              />
            </label>
          </div>
          <button className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 text-slate-950 text-xs font-black">
            <Send className="w-4 h-4" /> Submit Application
          </button>
        </form>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <MatchColumn title="Live Now" matches={dashboard.live} highlight onSpectate={spectate} />
          <MatchColumn title="Upcoming" matches={dashboard.upcoming} onSpectate={spectate} />
          <MatchColumn title="Completed" matches={dashboard.completed} onSpectate={spectate} />
        </div>
      )}
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="space-y-1">
      <span className="text-xs font-bold text-slate-400">{label}</span>
      <input
        required
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white"
      />
    </label>
  );
}

function MatchColumn({ title, matches, highlight, onSpectate }: { title: string; matches: any[]; highlight?: boolean; onSpectate: any }) {
  return (
    <section className="space-y-3">
      <h2 className={`text-sm font-black uppercase ${highlight ? "text-emerald-400" : "text-amber-400"}`}>{title}</h2>
      {matches.length === 0 ? (
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 text-xs text-slate-500">No matches here yet.</div>
      ) : (
        matches.map((match) => (
          <div key={match._id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-white">Match {match.matchNumber}</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-bold uppercase text-slate-300">{match.status}</span>
            </div>
            <div className="text-sm font-bold text-slate-200">
              {match.player1DisplayName ?? "Awaiting player"} vs {match.player2DisplayName ?? "Awaiting player"}
            </div>
            <div className="text-xs text-slate-400">
              Score {match.player1GameWins}-{match.player2GameWins}
              {match.scheduledAt ? ` · ${new Date(match.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""}
            </div>
            {(match.status === "live" || match.status === "ready") && (
              <button
                onClick={async () => {
                  soundFx.playClick();
                  await onSpectate({ matchId: match._id });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-black"
              >
                <Eye className="w-3.5 h-3.5" /> Spectate
              </button>
            )}
            {match.winnerClerkUserId && (
              <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                <Trophy className="w-3.5 h-3.5" /> Winner recorded
              </div>
            )}
          </div>
        ))
      )}
    </section>
  );
}
