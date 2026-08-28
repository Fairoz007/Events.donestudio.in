"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
  Flame,
  ArrowLeft,
  Copy,
  Check,
  Zap,
  History,
  AlertCircle,
} from "lucide-react";
import { VadamvaliCanvas } from "./VadamvaliCanvas";
import { useAuth } from "@/context/AuthContext";
import { soundFx } from "@/lib/sounds";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function VadamvaliGame({ eventSlug = "onam-2026" }: { eventSlug?: string }) {
  const { user, isSignedIn, isClerkSignedIn, isConvexAuthenticated } = useAuth();

  const [activeRoomCode, setActiveRoomCode] = useState<string | null>(null);
  const [inputRoomCode, setInputRoomCode] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [stamina, setStamina] = useState(100);
  const [showHistory, setShowHistory] = useState(false);
  const [isPullingAnimation, setIsPullingAnimation] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Convex Queries and Mutations
  const liveMatch = useQuery(
    api.matches.getMatchByRoomCode,
    activeRoomCode ? { roomCode: activeRoomCode } : "skip"
  );
  const userMatches = useQuery(api.matches.listUserMatches, isSignedIn ? {} : "skip");
  const event = useQuery(api.events.getEventBySlug, { slug: eventSlug });
  const activity = useQuery(api.activities.getActivityBySlug, { eventSlug, activitySlug: "vadamvali" });

  const createPrivateRoomMutation = useMutation(api.matches.createPrivateRoom);
  const joinPrivateRoomMutation = useMutation(api.matches.joinPrivateRoom);
  const findQuickMatchMutation = useMutation(api.matches.findQuickMatch);
  const setPlayerReadyMutation = useMutation(api.matches.setPlayerReady);
  const pullRopeMutation = useMutation(api.matches.pullRope);
  const startMatchNowMutation = useMutation(api.matches.startMatchNow);

  // Determine current player role (player1 or player2)
  const isPlayer1 = liveMatch?.player1?.clerkUserId === user?.clerkUserId;
  const isPlayer2 = liveMatch?.player2?.clerkUserId === user?.clerkUserId;
  const myPlayerRole = isPlayer1 ? "player1" : isPlayer2 ? "player2" : null;

  // Determine Game Phase from Convex status
  const currentStatus = liveMatch?.status;

  // Check countdown transition to live match
  useEffect(() => {
    if (currentStatus === "countdown" && liveMatch?.startedAt && liveMatch?._id) {
      const remainingMs = liveMatch.startedAt - Date.now();
      const timer = setTimeout(() => {
        if (isSignedIn) {
          startMatchNowMutation({ matchId: liveMatch._id }).catch(() => {});
        }
      }, Math.max(100, remainingMs));
      return () => clearTimeout(timer);
    }
  }, [currentStatus, liveMatch?.startedAt, liveMatch?._id, isSignedIn, startMatchNowMutation]);

  // Victory celebration when match completes
  useEffect(() => {
    if (currentStatus === "completed" && liveMatch) {
      if (liveMatch.winner === user?.clerkUserId) {
        soundFx.playVictory();
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#f59e0b", "#10b981", "#38bdf8", "#ec4899"],
        });
      } else {
        soundFx.playDefeat();
      }
    }
  }, [currentStatus, liveMatch?.winner, user?.clerkUserId]);

  // Stamina regeneration
  useEffect(() => {
    const interval = setInterval(() => {
      setStamina((prev) => Math.min(100, prev + 8));
    }, 200);
    return () => clearInterval(interval);
  }, []);

  // Handlers for Matchmaking
  const handleQuickMatch = async () => {
    if (!isSignedIn) return;
    try {
      setErrorMsg(null);
      soundFx.playClick();
      const res = await findQuickMatchMutation({ activitySlug: "vadamvali", eventId: event?._id });
      setActiveRoomCode(res.roomCode);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to find match");
    }
  };

  const handleCreatePrivate = async () => {
    if (!isSignedIn) return;
    try {
      setErrorMsg(null);
      soundFx.playClick();
      const res = await createPrivateRoomMutation({ activitySlug: "vadamvali", eventId: event?._id });
      setActiveRoomCode(res.roomCode);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create room");
    }
  };

  const handleJoinPrivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputRoomCode.trim() || !isSignedIn) return;
    try {
      setErrorMsg(null);
      soundFx.playClick();
      const res = await joinPrivateRoomMutation({ roomCode: inputRoomCode.trim().toUpperCase() });
      setActiveRoomCode(res.roomCode);
      setInputRoomCode("");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to join room");
    }
  };

  const handleToggleReady = async () => {
    if (!liveMatch || !myPlayerRole) return;
    soundFx.playClick();
    const currentReady = isPlayer1 ? liveMatch.player1.isReady : liveMatch.player2?.isReady;
    await setPlayerReadyMutation({
      matchId: liveMatch._id,
      isReady: !currentReady,
    });
  };

  // High performance rope pull
  const handlePullRope = useCallback(async () => {
    if (!liveMatch || (liveMatch.status !== "in_progress" && liveMatch.status !== "countdown")) return;
    if (stamina < 15) return;

    soundFx.playPull();
    setIsPullingAnimation(true);
    setTimeout(() => setIsPullingAnimation(false), 120);

    setStamina((prev) => Math.max(0, prev - 15));

    try {
      await pullRopeMutation({
        matchId: liveMatch._id,
        pullPower: 2.0,
        clientTimestamp: Date.now(),
      });
    } catch (err) {
      // server anti-cheat or network
    }
  }, [liveMatch, stamina, pullRopeMutation]);

  // Spacebar hotkey for pulling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && liveMatch?.status === "in_progress") {
        e.preventDefault();
        handlePullRope();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePullRope, liveMatch?.status]);

  const handleCopyRoomCode = () => {
    if (activeRoomCode) {
      soundFx.playClick();
      navigator.clipboard?.writeText(activeRoomCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleLeaveMatch = () => {
    soundFx.playClick();
    setActiveRoomCode(null);
    setErrorMsg(null);
  };

  // RENDER: Menu / Match Selection
  if (!activeRoomCode) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10">
        {/* Back Link */}
        <Link
          href={`/events/${eventSlug}`}
          onClick={() => soundFx.playClick()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to {event?.title ?? "Event"} Arena
        </Link>

        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5" /> Real-time Multiplayer Tug of War
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white">
            Vadamvali <span className="text-orange-500">Championship</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Kerala&apos;s ultimate test of strength and teamwork! Real-time 1v1 Tug of War with authoritative rope physics, anti-cheat detection, and instant global XP.
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            <Link
              href={`/events/${eventSlug}/bracket`}
              onClick={() => soundFx.playClick()}
              className="px-4 py-2 rounded-xl text-xs font-black glass-panel border border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
            >
              Tournament Bracket
            </Link>
            {activity && (
              <span className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900/80 border border-slate-800 text-slate-300">
                {activity.participantCount} registered
              </span>
            )}
          </div>
        </div>

        {isClerkSignedIn && !isConvexAuthenticated && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs text-center flex items-center justify-center gap-2 max-w-md mx-auto">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Connecting to game server... If this persists, ensure the Convex JWT template is created in Clerk Dashboard.</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-center flex items-center justify-center gap-2 max-w-md mx-auto">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Mode Selector Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Quick Matchmaking */}
          <div className="rounded-3xl glass-panel p-8 border border-slate-800 hover:border-orange-500/50 transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center text-2xl border border-orange-500/30">
                ⚡
              </div>
              <h3 className="text-2xl font-black text-white">Quick Match</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Instantly jump into a live duel against online rivals. Server matches you with waiting challengers in real-time.
              </p>
            </div>

            <button
              onClick={handleQuickMatch}
              disabled={!isSignedIn}
              className="w-full py-4 rounded-2xl font-black text-sm bg-gradient-to-r from-orange-500 to-amber-600 text-slate-950 hover:brightness-110 shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap className="w-4 h-4 fill-current" />
              {isSignedIn
                ? "Find Quick Match"
                : isClerkSignedIn
                  ? "Connecting to Game Server..."
                  : "Sign in to Play"}
            </button>
          </div>

          {/* Private Room / Invite Friends */}
          <div className="rounded-3xl glass-panel p-8 border border-slate-800 hover:border-amber-500/50 transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-2xl border border-amber-500/30">
                👥
              </div>
              <h3 className="text-2xl font-black text-white">Private Match</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Create a custom private room with a 6-digit room code, or enter an invite code from your friends or streamer.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleCreatePrivate}
                disabled={!isSignedIn}
                className="w-full py-3.5 rounded-2xl font-black text-xs bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Create Private Room</span>
              </button>

              <form onSubmit={handleJoinPrivate} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Room Code (e.g. D1-48291)"
                  value={inputRoomCode}
                  onChange={(e) => setInputRoomCode(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl glass-input text-xs text-white uppercase placeholder-slate-500"
                />
                <button
                  type="submit"
                  disabled={!isSignedIn || !inputRoomCode.trim()}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs bg-amber-500 text-slate-950 hover:brightness-110 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Join
                </button>
              </form>
            </div>
          </div>
        </div>


        {/* Match History Drawer Toggle */}
        <div className="max-w-4xl mx-auto pt-6 border-t border-slate-800/80">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors mx-auto"
          >
            <History className="w-4 h-4" />
            <span>{showHistory ? "Hide Match History" : "View Recent Matches"}</span>
          </button>

          {showHistory && (
            <div className="mt-4 p-6 rounded-2xl glass-panel border border-slate-800 space-y-3 animate-in fade-in">
              <h4 className="text-sm font-black text-white">Your Recent Duels</h4>
              {!userMatches || userMatches.length === 0 ? (
                <p className="text-xs text-slate-500">No match records yet. Play your first match!</p>
              ) : (
                <div className="divide-y divide-slate-800/80 max-h-60 overflow-y-auto">
                  {userMatches.map((m) => {
                    const isWin = m.winner === user?.clerkUserId;
                    const opponent = m.player1.clerkUserId === user?.clerkUserId ? m.player2?.displayName : m.player1.displayName;
                    return (
                      <div key={m._id} className="py-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${isWin ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
                            {isWin ? "Victory" : "Defeat"}
                          </span>
                          <span className="text-slate-300">vs <strong className="text-white">{opponent || "Waiting"}</strong></span>
                        </div>
                        <span className="text-slate-500">{new Date(m.createdAt).toLocaleDateString()}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // RENDER: Active Live Match Lobby / Gameplay / Game Over
  const p1 = liveMatch?.player1;
  const p2 = liveMatch?.player2;
  const isMatchLive = liveMatch?.status === "in_progress" || liveMatch?.status === "countdown";
  const isGameOver = liveMatch?.status === "completed" || liveMatch?.status === "cancelled";
  const isWaitingOrLobby = liveMatch?.status === "waiting" || liveMatch?.status === "lobby";

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6">
      {/* Top Navigation Ribbon */}
      <div className="flex items-center justify-between glass-panel px-5 py-3 rounded-2xl border border-slate-800">
        <button
          onClick={handleLeaveMatch}
          className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Leave Room
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Room</span>
            <span className="text-xs font-mono font-bold text-amber-400">{activeRoomCode}</span>
            <button onClick={handleCopyRoomCode} className="text-slate-400 hover:text-white ml-1">
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${liveMatch?.status === "in_progress" ? "bg-emerald-500 text-slate-950 animate-pulse" : "bg-amber-500/20 text-amber-400"}`}>
            {liveMatch?.status ?? "connecting..."}
          </span>
        </div>
      </div>

      {/* Players Duel Header */}
      <div className="grid grid-cols-3 items-center glass-panel p-6 rounded-3xl border border-slate-800 gap-4">
        {/* Player 1 */}
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={p1?.avatarUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=p1"}
            alt={p1?.displayName || "Player 1"}
            className="w-12 h-12 rounded-2xl object-cover border-2 border-orange-500/50 bg-slate-800 shrink-0"
          />
          <div className="min-w-0">
            <div className="text-sm font-black text-white truncate flex items-center gap-1.5">
              {p1?.displayName || "Waiting..."}
              {isPlayer1 && <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-500 text-slate-950 font-bold">YOU</span>}
            </div>
            <div className="text-xs text-orange-400 font-bold">Level {p1?.level || 1} · {p1?.pulls || 0} pulls</div>
          </div>
        </div>

        {/* VS / Score Meter */}
        <div className="text-center space-y-1">
          <div className="text-lg font-black gold-gradient-text tracking-wider">VS</div>
          <div className="text-[11px] text-slate-400 font-semibold">
            {isMatchLive ? `Rope: ${Math.round(liveMatch?.ropePosition ?? 0)}%` : "Match Lobby"}
          </div>
        </div>

        {/* Player 2 */}
        <div className="flex items-center justify-end gap-3 min-w-0 text-right">
          <div className="min-w-0">
            <div className="text-sm font-black text-white truncate flex items-center justify-end gap-1.5">
              {isPlayer2 && <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-500 text-slate-950 font-bold">YOU</span>}
              {p2?.displayName || "Waiting for Player..."}
            </div>
            <div className="text-xs text-amber-400 font-bold">
              {p2 ? `Level ${p2.level} · ${p2.pulls || 0} pulls` : "Invite code: " + activeRoomCode}
            </div>
          </div>
          <img
            src={p2?.avatarUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=waiting"}
            alt={p2?.displayName || "Opponent"}
            className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-500/50 bg-slate-800 shrink-0"
          />
        </div>
      </div>

      {/* Interactive Visual Canvas Arena */}
      <div className="relative rounded-3xl overflow-hidden glass-panel border border-slate-800 shadow-2xl">
        <VadamvaliCanvas
          ropePosition={liveMatch?.ropePosition ?? 0}
          isPullingP1={isPullingAnimation && isPlayer1}
          isPullingP2={isPullingAnimation && isPlayer2}
          player1Name={p1?.displayName || "Team Alpha"}
          player2Name={p2?.displayName || "Team Beta"}
        />

        {/* Countdown Overlay */}
        {liveMatch?.status === "countdown" && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md animate-in fade-in">
            <span className="text-xs font-black uppercase text-amber-400 tracking-widest mb-2">Get Ready To Pull!</span>
            <div className="text-7xl font-black text-white animate-bounce">
              3
            </div>
          </div>
        )}

        {/* Game Over Screen */}
        {isGameOver && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-lg p-6 text-center space-y-4 animate-in zoom-in-95">
            <div className="text-5xl">
              {liveMatch?.winner === user?.clerkUserId ? "🏆" : "💪"}
            </div>
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-white">
                {liveMatch?.winner === user?.clerkUserId ? "VICTORY IS YOURS!" : "MATCH COMPLETED"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                {liveMatch?.winner === user?.clerkUserId
                  ? "Congratulations! You overpowered your opponent and claimed +100 XP!"
                  : "Great effort! You earned +30 XP participation bonus for competing."}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={handleQuickMatch}
                className="px-6 py-3 rounded-xl font-black text-xs bg-orange-500 text-slate-950 hover:brightness-110 shadow-lg shadow-orange-500/20"
              >
                Play Another Match →
              </button>
              <button
                onClick={handleLeaveMatch}
                className="px-5 py-3 rounded-xl font-bold text-xs bg-slate-800 text-white border border-slate-700 hover:bg-slate-700"
              >
                Return to Menu
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lobby / Ready Screen */}
      {isWaitingOrLobby && (
        <div className="p-8 rounded-3xl glass-panel text-center space-y-6 border border-slate-800">
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-white">Match Lobby</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {!p2
                ? "Share your room code with a friend or wait for a quick match challenger to connect."
                : "Both players must click Ready to start the 3-second countdown!"}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={handleToggleReady}
              className={`px-8 py-4 rounded-2xl font-black text-sm transition-all shadow-xl ${
                (isPlayer1 && p1?.isReady) || (isPlayer2 && p2?.isReady)
                  ? "bg-emerald-500 text-slate-950 hover:brightness-110 shadow-emerald-500/20"
                  : "bg-gradient-to-r from-orange-500 to-amber-600 text-slate-950 hover:brightness-110 shadow-orange-500/20"
              }`}
            >
              {(isPlayer1 && p1?.isReady) || (isPlayer2 && p2?.isReady) ? "✓ Ready (Waiting for Opponent)" : "Click to Ready Up!"}
            </button>
          </div>
        </div>
      )}

      {/* Live Pull Controls */}
      {liveMatch?.status === "in_progress" && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          {/* Stamina Bar */}
          <div className="space-y-1.5 max-w-md mx-auto">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-400">Stamina Meter</span>
              <span className="text-amber-400">{stamina}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-150 ${stamina > 40 ? "bg-amber-500" : "bg-rose-500 animate-pulse"}`}
                style={{ width: `${stamina}%` }}
              />
            </div>
          </div>

          {/* Giant Pull Action Button */}
          <div className="flex flex-col items-center justify-center gap-2 pt-2">
            <button
              onClick={handlePullRope}
              disabled={stamina < 15}
              className={`w-full max-w-md py-6 rounded-3xl font-black text-xl sm:text-2xl shadow-2xl transition-transform active:scale-95 flex items-center justify-center gap-3 ${
                stamina >= 15
                  ? "bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-slate-950 hover:brightness-110 shadow-orange-500/40"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              }`}
            >
              <Zap className="w-7 h-7 fill-current" />
              <span>TAP OR PRESS SPACEBAR TO PULL!</span>
            </button>
            <span className="text-[11px] text-slate-500 font-semibold">
              High frequency anti-cheat active · Server-authoritative rope physics
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
