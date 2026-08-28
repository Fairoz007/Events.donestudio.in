"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { Calendar, Eye, Trophy, Users } from "lucide-react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { useAuth } from "@/context/AuthContext";
import { soundFx } from "@/lib/sounds";

export default function EventBracketPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "onam-2026";
  const activity = useQuery(api.activities.getActivityBySlug, { eventSlug: slug, activitySlug: "vadamvali" });
  const bracket = useQuery(api.tournaments.listBracket, activity?._id ? { activityId: activity._id } : "skip");
  const myNextMatch = useQuery(api.tournaments.myNextMatch, activity?._id ? { activityId: activity._id } : "skip");
  const registerActivity = useMutation(api.tournaments.registerForActivity);
  const spectate = useMutation(api.tournaments.spectateMatch);
  const { isSignedIn, isStreamer } = useAuth();
  const [selectedRound, setSelectedRound] = useState<number | "all">("all");

  const rounds = bracket?.rounds ?? [];
  const matches = bracket?.matches ?? [];
  const mobileMatches = useMemo(
    () => matches.filter((match) => selectedRound === "all" || match.roundNumber === selectedRound),
    [matches, selectedRound],
  );

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 text-white">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase">
            <Trophy className="w-3.5 h-3.5" /> Live Tournament Bracket
          </div>
          <h1 className="text-3xl sm:text-5xl font-black">{activity?.event.title ?? "Event"} Vadamvali Bracket</h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Bracket, scores, byes, scheduling, and advancement are synchronized from Convex in real time.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {isSignedIn && activity && (
            <button
              onClick={async () => {
                soundFx.playClick();
                await registerActivity({ activityId: activity._id });
              }}
              className="px-4 py-2 rounded-xl text-xs font-black bg-emerald-500 text-slate-950 hover:bg-emerald-400"
            >
              Register for Vadamvali
            </button>
          )}
          <Link href={`/events/${slug}/vadamvali`} className="px-4 py-2 rounded-xl text-xs font-bold glass-panel border border-slate-700 text-slate-200">
            Open Game
          </Link>
        </div>
      </div>

      {myNextMatch && (
        <div className="p-5 rounded-2xl glass-panel border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-emerald-400 uppercase">Your Next Match</div>
            <div className="text-lg font-black">
              {myNextMatch.player1DisplayName ?? "You"} vs {myNextMatch.player2DisplayName ?? "Awaiting opponent"}
            </div>
            <div className="text-xs text-slate-400">
              {myNextMatch.scheduledAt ? new Date(myNextMatch.scheduledAt).toLocaleString() : "Schedule pending"} · {myNextMatch.status}
            </div>
          </div>
        </div>
      )}

      {!bracket ? (
        <div className="p-10 rounded-3xl glass-panel border border-slate-800 text-center space-y-3">
          <Users className="w-10 h-10 text-slate-500 mx-auto" />
          <h2 className="text-xl font-black">Bracket Not Generated Yet</h2>
          <p className="text-sm text-slate-400">Registration must close before admins generate the tournament bracket.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl glass-panel border border-slate-800">
              <div className="text-xs text-slate-400">Status</div>
              <div className="text-xl font-black text-amber-400">{bracket.tournament.status}</div>
            </div>
            <div className="p-4 rounded-2xl glass-panel border border-slate-800">
              <div className="text-xs text-slate-400">Bracket Size</div>
              <div className="text-xl font-black">{bracket.tournament.bracketSize ?? "Pending"}</div>
            </div>
            <div className="p-4 rounded-2xl glass-panel border border-slate-800">
              <div className="text-xs text-slate-400">Format</div>
              <div className="text-xl font-black">Best of 3</div>
            </div>
            <div className="p-4 rounded-2xl glass-panel border border-slate-800">
              <div className="text-xs text-slate-400">Seeding</div>
              <div className="text-xl font-black capitalize">{bracket.tournament.seedingMethod}</div>
            </div>
          </div>

          <div className="md:hidden">
            <select
              value={selectedRound}
              onChange={(event) => setSelectedRound(event.target.value === "all" ? "all" : Number(event.target.value))}
              className="w-full px-4 py-3 rounded-xl glass-input text-sm bg-slate-900 text-white"
            >
              <option value="all">All Rounds</option>
              {rounds.map((round) => <option key={round._id} value={round.roundNumber}>{round.name}</option>)}
            </select>
          </div>

          <div className="hidden md:grid gap-5 overflow-x-auto" style={{ gridTemplateColumns: `repeat(${Math.max(rounds.length, 1)}, minmax(260px, 1fr))` }}>
            {rounds.map((round) => (
              <div key={round._id} className="space-y-3 min-w-[260px]">
                <h2 className="text-sm font-black text-amber-400 uppercase">{round.name}</h2>
                {matches.filter((match) => match.roundNumber === round.roundNumber).map((match) => (
                  <MatchCard key={match._id} match={match} canSpectate={isStreamer} onSpectate={spectate} />
                ))}
              </div>
            ))}
          </div>

          <div className="md:hidden space-y-3">
            {mobileMatches.map((match) => (
              <MatchCard key={match._id} match={match} canSpectate={isStreamer} onSpectate={spectate} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function MatchCard({
  match,
  canSpectate,
  onSpectate,
}: {
  match: any;
  canSpectate: boolean;
  onSpectate: (args: { matchId: Id<"tournamentMatches"> }) => Promise<boolean>;
}) {
  return (
    <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-bold text-slate-400">Match {match.matchNumber}</span>
        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase font-black">{match.status}</span>
      </div>
      <div className="space-y-2">
        <PlayerLine name={match.player1DisplayName} wins={match.player1GameWins} winner={match.winnerClerkUserId === match.player1ClerkUserId} />
        <PlayerLine name={match.player2DisplayName} wins={match.player2GameWins} winner={match.winnerClerkUserId === match.player2ClerkUserId} />
      </div>
      <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400">
        <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" /> {match.scheduledAt ? new Date(match.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "TBD"}</span>
        {canSpectate && (match.status === "live" || match.status === "ready") && (
          <button
            onClick={async () => {
              soundFx.playClick();
              await onSpectate({ matchId: match._id });
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-black"
          >
            <Eye className="w-3 h-3" /> Spectate
          </button>
        )}
      </div>
    </div>
  );
}

function PlayerLine({ name, wins, winner }: { name?: string; wins: number; winner: boolean }) {
  return (
    <div className={`flex items-center justify-between px-3 py-2 rounded-xl border ${winner ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300" : "bg-slate-950/70 border-slate-800 text-slate-200"}`}>
      <span className="text-xs font-bold truncate">{name ?? "Awaiting winner"}</span>
      <span className="text-xs font-black">{wins}</span>
    </div>
  );
}
