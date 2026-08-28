// @ts-nocheck
"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import {
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock,
  Flame,
  Gamepad2,
  History,
  Info,
  Layers,
  Loader2,
  LogIn,
  Play,
  Radio,
  RefreshCw,
  ShieldAlert,
  Swords,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { VadamvaliGame } from "@/components/vadamvali/VadamvaliGame";
import { soundFx } from "@/lib/sounds";
import Link from "next/link";

function fmt(value?: number) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en", {
    timeStyle: "short",
    dateStyle: "medium",
    timeZone: "Asia/Muscat",
  }).format(new Date(value));
}

type TabType = "arena" | "fixture" | "queue" | "history" | "rules";

export default function VadamvaliPage() {
  const { isAdmin, isSignedIn, isLoaded, user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("arena");
  const [selectedRound, setSelectedRound] = useState<number | null>(null);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState(false);
  const [adminActionMsg, setAdminActionMsg] = useState<string | null>(null);

  // Real-time reactive subscriptions to Convex
  const summary = useQuery(api.onam.getSummary, {});
  const fixture = useQuery(api.onam.listFixture);
  const my = useQuery(api.onam.getMyOnam, {});
  const publicLiveMatches = useQuery(api.matches.listPublicLiveMatches);
  const recentCompletedMatches = useQuery(api.matches.listRecentMatches, { limit: 10 });
  const userMatches = useQuery(api.matches.listUserMatches, isSignedIn ? {} : "skip");

  const register = useMutation(api.onam.registerForActivity);
  const ensureSetup = useMutation(api.onam.ensureEventSetup);
  const generate = useMutation(api.onam.generateVadamvaliFixture);
  const openCheckIn = useMutation(api.onam.openNextMatchCheckIn);
  const checkIn = useMutation(api.onam.checkInForMatch);
  const start = useMutation(api.onam.startReadyMatch);
  const record = useMutation(api.onam.recordGameWinner);

  // Ensure settings and tournament exist on initial load
  useEffect(() => {
    void ensureSetup();
  }, [ensureSetup]);

  const rounds = fixture?.rounds || [];
  const matches = fixture?.matches || [];
  const visibleRound = selectedRound || rounds[0]?.roundNumber || 1;
  const roundMatches = useMemo(
    () => matches.filter((m) => m.roundNumber === visibleRound),
    [matches, visibleRound]
  );
  const myVadamvali = my?.activityRegistrations.some((r) => r.activitySlug === "vadamvali");
  const currentMatch = summary?.currentMatch;
  const nextMatch = summary?.nextMatch;
  const isRegistrationOpen = summary?.registrationStatus === "open";
  const liveCount = (publicLiveMatches || []).length;

  const handleRegister = async () => {
    setRegLoading(true);
    setRegError(null);
    try {
      soundFx.playClick();
      await register({ activitySlug: "vadamvali" });
      setRegSuccess(true);
    } catch (err: any) {
      setRegError(err?.message || "Registration failed. Please try again.");
    } finally {
      setRegLoading(false);
    }
  };

  const runAdminAction = async (actionFn: () => Promise<any>, successText: string) => {
    try {
      soundFx.playClick();
      setAdminActionMsg("Processing...");
      await actionFn();
      setAdminActionMsg(successText);
      setTimeout(() => setAdminActionMsg(null), 3500);
    } catch (err: any) {
      setAdminActionMsg(`Error: ${err?.message || "Action failed"}`);
    }
  };

  return (
    <main className="min-h-screen bg-[#080b0e] text-slate-100 px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Ribbon */}
        <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 border-b border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] font-black tracking-widest text-amber-400 uppercase">
                ONAM 2026 OFFICIAL EVENT
              </span>
              {currentMatch && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-black text-emerald-400 flex items-center gap-1 animate-pulse">
                  <Radio className="w-3 h-3" /> TOURNAMENT MATCH LIVE
                </span>
              )}
            </div>
            <h1 className="mt-2 text-4xl sm:text-5xl font-black text-white flex items-center gap-3">
              <Flame className="w-9 h-9 text-orange-500" />
              VADAMVALI HUB
            </h1>
            <p className="mt-2 text-sm text-slate-400 max-w-2xl">
              Real-time multiplayer Tug of War. Play live 1v1 duels, follow the official tournament fixture, and track match advancement in real time.
            </p>
          </div>

          {/* Registration & CTA Action */}
          <div className="flex flex-col items-start lg:items-end gap-2">
            {!isLoaded ? (
              <div className="rounded-xl bg-slate-800 px-5 py-3 text-xs font-bold text-slate-300 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Syncing Convex...
              </div>
            ) : !isSignedIn ? (
              <Link
                href="/sign-in"
                className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-5 py-3 text-xs font-black text-slate-950 flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
              >
                <LogIn className="w-4 h-4" /> Sign In to Participate
              </Link>
            ) : (
              <button
                disabled={!isRegistrationOpen || !!myVadamvali || regLoading}
                onClick={handleRegister}
                className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-5 py-3 text-xs font-black text-slate-950 disabled:bg-slate-800 disabled:text-slate-400 flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all disabled:shadow-none"
              >
                {regLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {myVadamvali || regSuccess
                  ? "✓ Registered for Tournament"
                  : !isRegistrationOpen
                    ? summary?.registrationStatus === "opens_soon"
                      ? `Registration Opens ${fmt(summary?.settings?.registrationOpensAt)}`
                      : "Tournament Registration Closed"
                    : "Register for Tournament"}
              </button>
            )}
            {regError && <p className="text-xs text-rose-400 text-right">{regError}</p>}
            {regSuccess && !myVadamvali && (
              <p className="text-xs text-emerald-400">Tournament registration confirmed!</p>
            )}
          </div>
        </header>

        {/* Global Summary Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <StatCard
            icon={<Users className="w-4 h-4 text-emerald-400" />}
            label="Tournament Players"
            value={String(summary?.activeParticipants ?? 0)}
          />
          <StatCard
            icon={<Trophy className="w-4 h-4 text-amber-400" />}
            label="Format"
            value="Best of 3 (First to 2)"
          />
          <StatCard
            icon={<CalendarClock className="w-4 h-4 text-sky-400" />}
            label="Registration"
            value={
              isRegistrationOpen
                ? "Open Now"
                : summary?.registrationStatus === "opens_soon"
                  ? `Opens ${fmt(summary?.settings?.registrationOpensAt)}`
                  : "Closed"
            }
          />
          <StatCard
            icon={<Radio className="w-4 h-4 text-rose-400" />}
            label="Live Duels"
            value={liveCount > 0 ? `${liveCount} Active` : "Ready"}
          />
        </section>

        {/* Personal Upcoming Match Notice */}
        {my?.upcomingMatch && (
          <section className="rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 to-slate-950/60 p-5 backdrop-blur-md shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-400 uppercase tracking-wider">
                <Swords className="w-4 h-4" /> Your Next Tournament Duel
              </div>
              <h2 className="text-xl font-black text-white mt-1">
                {my.upcomingMatch.player1Name || "TBD"} vs {my.upcomingMatch.player2Name || "TBD"}
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Status: <span className="font-bold text-amber-400 capitalize">{my.upcomingMatch.status.replace(/_/g, " ")}</span> · Expected Start: {fmt(my.upcomingMatch.expectedStartAt)}
              </p>
            </div>
            <div>
              {my.upcomingMatch.status === "ready_for_checkin" || my.upcomingMatch.status === "waiting_for_players" ? (
                <button
                  onClick={() => void checkIn({ matchId: my.upcomingMatch!._id })}
                  className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/30 transition-all flex items-center gap-2 animate-bounce"
                >
                  <CheckCircle2 className="w-4 h-4" /> CHECK IN NOW
                </button>
              ) : (
                <div className="rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-xs font-semibold text-slate-400">
                  Check-in opens 15m before match start
                </div>
              )}
            </div>
          </section>
        )}

        {/* Admin / Host Control Center */}
        {isAdmin && (
          <section className="rounded-2xl border border-amber-500/30 bg-slate-950/80 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" /> Vadamvali Admin Operations
              </h2>
              {adminActionMsg && (
                <span className="text-xs font-bold text-emerald-400">{adminActionMsg}</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => runAdminAction(() => generate(), "Fixture generated successfully")}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black"
              >
                Generate Fixture
              </button>
              <button
                onClick={() => runAdminAction(() => openCheckIn(), "Check-in announced for next match")}
                className="px-4 py-2 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 text-xs font-black"
              >
                Open Next Check-In
              </button>
              {currentMatch && (
                <>
                  <button
                    onClick={() =>
                      runAdminAction(
                        () =>
                          record({
                            matchId: currentMatch._id,
                            winnerClerkUserId: currentMatch.player1ClerkUserId || "",
                          }),
                        `Recorded game to ${currentMatch.player1Name}`
                      )
                    }
                    className="px-4 py-2 rounded-xl border border-emerald-500/40 hover:bg-emerald-500/20 text-emerald-300 text-xs font-bold"
                  >
                    Game to {currentMatch.player1Name}
                  </button>
                  <button
                    onClick={() =>
                      runAdminAction(
                        () =>
                          record({
                            matchId: currentMatch._id,
                            winnerClerkUserId: currentMatch.player2ClerkUserId || "",
                          }),
                        `Recorded game to ${currentMatch.player2Name}`
                      )
                    }
                    className="px-4 py-2 rounded-xl border border-emerald-500/40 hover:bg-emerald-500/20 text-emerald-300 text-xs font-bold"
                  >
                    Game to {currentMatch.player2Name}
                  </button>
                </>
              )}
              {nextMatch?.status === "ready" && (
                <button
                  onClick={() => runAdminAction(() => start({ matchId: nextMatch._id }), "Started match")}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" /> Start Ready Match
                </button>
              )}
            </div>
          </section>
        )}

        {/* Dynamic Real-Time Tabs Navigation */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
          <TabButton
            active={activeTab === "arena"}
            onClick={() => setActiveTab("arena")}
            icon={<Gamepad2 className="w-4 h-4" />}
            label="Battle Arena (Play)"
            badge={liveCount > 0 ? "LIVE" : undefined}
          />
          <TabButton
            active={activeTab === "fixture"}
            onClick={() => setActiveTab("fixture")}
            icon={<Layers className="w-4 h-4" />}
            label="Tournament Fixture"
            badge={matches.length > 0 ? `${matches.length} Matches` : undefined}
          />
          <TabButton
            active={activeTab === "queue"}
            onClick={() => setActiveTab("queue")}
            icon={<Clock className="w-4 h-4" />}
            label="Live Queue & Desk"
            badge={currentMatch ? "1 Live" : nextMatch ? "Next Ready" : undefined}
          />
          <TabButton
            active={activeTab === "history"}
            onClick={() => setActiveTab("history")}
            icon={<History className="w-4 h-4" />}
            label="Match History & Stats"
          />
          <TabButton
            active={activeTab === "rules"}
            onClick={() => setActiveTab("rules")}
            icon={<Info className="w-4 h-4" />}
            label="Rules & Format"
          />
        </div>

        {/* TAB 1: Battle Arena (Interactive Game) */}
        {activeTab === "arena" && (
          <div className="space-y-8">
            <VadamvaliGame eventSlug="onam-2026" />
          </div>
        )}

        {/* TAB 2: Tournament Fixture & Bracket */}
        {activeTab === "fixture" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 glass-panel p-5 rounded-2xl border border-slate-800">
              <div>
                <h2 className="text-xl font-black text-white">Tournament Bracket & Fixtures</h2>
                <p className="text-xs text-slate-400">
                  Single-elimination best-of-3 tournament rounds synchronized live from Convex.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {rounds.map((round) => (
                  <button
                    key={round._id}
                    onClick={() => setSelectedRound(round.roundNumber)}
                    className={`rounded-xl px-3.5 py-2 text-xs font-black transition-all ${
                      visibleRound === round.roundNumber
                        ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                        : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
                    }`}
                  >
                    {round.name}
                  </button>
                ))}
              </div>
            </div>

            {roundMatches.length === 0 ? (
              <div className="text-center py-16 glass-panel rounded-3xl border border-slate-800 space-y-3">
                <Trophy className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-lg font-black text-white">Fixture Not Generated Yet</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Once player registrations close, tournament administrators will generate the official bracket.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {roundMatches.map((match) => (
                  <MatchCard key={match._id} match={match} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Live Queue & Desk */}
        {activeTab === "queue" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <section className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-black tracking-[0.2em] text-slate-400 uppercase">
                    CURRENT LIVE MATCH
                  </h2>
                  {currentMatch && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black uppercase animate-pulse">
                      LIVE
                    </span>
                  )}
                </div>
                {currentMatch ? (
                  <div className="space-y-3">
                    <div className="text-2xl font-black text-white">
                      {currentMatch.player1Name || "TBD"} vs {currentMatch.player2Name || "TBD"}
                    </div>
                    <div className="text-xs text-slate-400">
                      Status: <span className="text-emerald-400 font-bold uppercase">{currentMatch.status}</span> · Match #{currentMatch.matchNumber}
                    </div>
                    <div className="flex items-center gap-4 text-sm font-bold text-white pt-2">
                      <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
                        {currentMatch.player1Name}: {currentMatch.player1Wins} wins
                      </div>
                      <span className="text-slate-500">Game {currentMatch.player1Wins + currentMatch.player2Wins + 1} of 3</span>
                      <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
                        {currentMatch.player2Name}: {currentMatch.player2Wins} wins
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 py-6">No tournament match is active right now.</p>
                )}
              </section>

              <section className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                <h2 className="text-xs font-black tracking-[0.2em] text-slate-400 uppercase">
                  NEXT IN QUEUE
                </h2>
                {nextMatch ? (
                  <div className="space-y-3">
                    <div className="text-2xl font-black text-white">
                      {nextMatch.player1Name || "TBD"} vs {nextMatch.player2Name || "TBD"}
                    </div>
                    <div className="text-xs text-slate-400">
                      Status: <span className="text-amber-400 font-bold uppercase">{nextMatch.status.replace(/_/g, " ")}</span> · Expected: {fmt(nextMatch.expectedStartAt)}
                    </div>
                    {nextMatch.checkInClosesAt && (
                      <div className="text-xs text-rose-400 font-bold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> Check-in closes at {fmt(nextMatch.checkInClosesAt)}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 py-6">No upcoming match scheduled in queue.</p>
                )}
              </section>
            </div>

            {/* Upcoming Queue List */}
            <section className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-base font-black text-white">Full Tournament Queue</h3>
              <div className="space-y-2.5">
                {matches
                  .filter((m) => m.queuePosition > 0 && !["completed", "walkover", "no_show"].includes(m.status))
                  .sort((a, b) => a.queuePosition - b.queuePosition)
                  .map((m) => (
                    <div
                      key={m._id}
                      className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-800 font-black text-amber-400">
                          #{m.queuePosition}
                        </span>
                        <div>
                          <div className="font-bold text-white">
                            {m.player1Name || "TBD"} vs {m.player2Name || "TBD"}
                          </div>
                          <div className="text-slate-400 text-[11px]">Match #{m.matchNumber} · Round {m.roundNumber}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400">Expected: {fmt(m.expectedStartAt)}</span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold uppercase text-[10px]">
                          {m.status.replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>
                  ))}
                {matches.filter((m) => m.queuePosition > 0 && !["completed", "walkover", "no_show"].includes(m.status)).length === 0 && (
                  <p className="text-xs text-slate-500 py-4">No remaining matches in the active queue.</p>
                )}
              </div>
            </section>
          </div>
        )}

        {/* TAB 4: Match History & Stats */}
        {activeTab === "history" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Match History */}
              <section className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-emerald-400" /> Your Duel History
                </h3>
                {!userMatches || userMatches.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6">No personal matches played yet. Jump into the Battle Arena!</p>
                ) : (
                  <div className="space-y-2.5 max-h-96 overflow-y-auto">
                    {userMatches.map((m) => {
                      const isWin = m.winner === user?.clerkUserId;
                      const opponent =
                        m.player1.clerkUserId === user?.clerkUserId
                          ? m.player2?.displayName
                          : m.player1.displayName;
                      return (
                        <div
                          key={m._id}
                          className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                isWin ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                              }`}
                            >
                              {isWin ? "Victory (+100 XP)" : "Defeat (+30 XP)"}
                            </span>
                            <span className="text-slate-300">
                              vs <strong className="text-white">{opponent || "Opponent"}</strong>
                            </span>
                          </div>
                          <span className="text-slate-500">{new Date(m.createdAt).toLocaleDateString()}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Global Recent Matches */}
              <section className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" /> Recent Global Clashes
                </h3>
                {!recentCompletedMatches || recentCompletedMatches.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6">No completed clashes recorded yet.</p>
                ) : (
                  <div className="space-y-2.5 max-h-96 overflow-y-auto">
                    {recentCompletedMatches.map((m) => (
                      <div
                        key={m._id}
                        className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-white">
                            {m.player1?.displayName} vs {m.player2?.displayName || "TBD"}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Winner: <span className="text-emerald-400 font-bold">{m.winner === m.player1?.clerkUserId ? m.player1?.displayName : m.player2?.displayName || "N/A"}</span> · Duration: {m.durationSeconds || 0}s
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-500">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        )}

        {/* TAB 5: Rules & Format */}
        {activeTab === "rules" && (
          <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <Info className="w-6 h-6 text-amber-400" /> Vadamvali Rules & Format
            </h2>
            <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <h3 className="font-bold text-white">🏆 Best of 3 Tournament Match Format</h3>
                <p className="text-xs text-slate-400">
                  Every tournament matchup is played as a Best-of-3 series. The first competitor to win 2 games advances to the next round of the single-elimination bracket.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <h3 className="font-bold text-white">⚡ One Live Match at a Time</h3>
                <p className="text-xs text-slate-400">
                  To ensure maximum spectator spotlight and stream production quality, only one official tournament duel is live at any given moment.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <h3 className="font-bold text-white">⏱️ 15-Minute Check-In Window</h3>
                <p className="text-xs text-slate-400">
                  When a match is called, both players have 15 minutes to check in. If one player fails to check in, a walkover (W.O.) is awarded to the ready player.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <h3 className="font-bold text-white">🛡️ Authoritative Anti-Cheat & Stamina</h3>
                <p className="text-xs text-slate-400">
                  All rope pulls are verified by Convex server-side authority with dynamic click frequency rate limiting. Automated macro clickers are detected and penalized.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4.5 backdrop-blur-md">
      <div className="flex items-center gap-2">{icon}</div>
      <div className="mt-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</div>
      <div className="mt-0.5 text-xl font-black text-white">{value}</div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: string;
}) {
  return (
    <button
      onClick={() => {
        soundFx.playClick();
        onClick();
      }}
      className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${
        active
          ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/20"
          : "glass-panel text-slate-300 hover:text-white hover:border-slate-700"
      }`}
    >
      {icon}
      <span>{label}</span>
      {badge && (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            active ? "bg-slate-950 text-emerald-400" : "bg-emerald-500/20 text-emerald-400"
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

function MatchCard({ match }: { match: any }) {
  return (
    <article className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-4 space-y-3 hover:border-slate-700 transition-colors">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span className="font-bold text-amber-400">Match #{match.matchNumber}</span>
        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] uppercase font-bold text-slate-300">
          {match.status.replace(/_/g, " ")}
        </span>
      </div>
      <div className="space-y-2 text-sm">
        <div
          className={`flex items-center justify-between p-2 rounded-xl ${
            match.winnerClerkUserId && match.winnerClerkUserId === match.player1ClerkUserId
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold"
              : "text-white"
          }`}
        >
          <span className="truncate">{match.player1Name || "TBD"}</span>
          <span className="font-black ml-2">{match.player1Wins ?? 0}</span>
        </div>
        <div
          className={`flex items-center justify-between p-2 rounded-xl ${
            match.winnerClerkUserId && match.winnerClerkUserId === match.player2ClerkUserId
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold"
              : "text-white"
          }`}
        >
          <span className="truncate">{match.player2Name || "TBD"}</span>
          <span className="font-black ml-2">{match.player2Wins ?? 0}</span>
        </div>
      </div>
      {match.winnerClerkUserId && (
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 pt-1 border-t border-slate-800">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>
            {match.matchResultType === "walkover"
              ? "Advances via Walkover"
              : match.matchResultType === "bye"
                ? "Advances via Bye"
                : "Winner advanced"}
          </span>
        </div>
      )}
      {match.status === "live" && (
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 pt-1">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>Match is currently LIVE</span>
        </div>
      )}
    </article>
  );
}
