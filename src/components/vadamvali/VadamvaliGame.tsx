"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
  Sparkles,
  Trophy,
  Users,
  Flame,
  ArrowLeft,
  Share2,
  RefreshCw,
  Copy,
  Check,
  ShieldAlert,
  Zap,
  Volume2,
  Award,
} from "lucide-react";
import { VadamvaliCanvas } from "./VadamvaliCanvas";
import { useAuth } from "@/context/AuthContext";
import { soundFx } from "@/lib/sounds";

type GamePhase = "menu" | "lobby" | "countdown" | "playing" | "game_over";

interface MatchPlayer {
  id: string;
  name: string;
  avatar: string;
  level: number;
  country: string;
  winRate: number;
  isReady: boolean;
  pulls: number;
}

export function VadamvaliGame() {
  const { user, isSignedIn, updateUserPoints } = useAuth();

  const [phase, setPhase] = useState<GamePhase>("menu");
  const [matchMode, setMatchMode] = useState<"quick" | "private" | "bot">("quick");
  const [roomCode, setRoomCode] = useState<string>("D1-48291");
  const [inputRoomCode, setInputRoomCode] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);

  // Players
  const [player1, setPlayer1] = useState<MatchPlayer>({
    id: user?.clerkUserId || "p1",
    name: user?.displayName || "Maveli Warrior",
    avatar: user?.avatarUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=maveli",
    level: user?.level || 5,
    country: user?.country || "IN",
    winRate: 78,
    isReady: true,
    pulls: 0,
  });

  const [player2, setPlayer2] = useState<MatchPlayer>({
    id: "bot_1",
    name: "Royal Tiger",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=tiger",
    level: 6,
    country: "IN",
    winRate: 65,
    isReady: false,
    pulls: 0,
  });

  // Game Engine State
  const [ropePosition, setRopePosition] = useState(0); // -100 (P1 win) to +100 (P2 win)
  const [countdown, setCountdown] = useState(3);
  const [timerSeconds, setTimerSeconds] = useState(30);
  const [winner, setWinner] = useState<MatchPlayer | null>(null);
  const [isPullingP1, setIsPullingP1] = useState(false);
  const [isPullingP2, setIsPullingP2] = useState(false);
  const [stamina, setStamina] = useState(100);
  const [antiCheatWarning, setAntiCheatWarning] = useState(false);

  // Anti-Cheat tracking
  const lastClickTimeRef = useRef<number>(0);
  const rapidClickCountRef = useRef<number>(0);

  // Setup Player 1 when user context loads
  useEffect(() => {
    if (user) {
      setPlayer1((prev) => ({
        ...prev,
        id: user.clerkUserId,
        name: user.displayName,
        avatar: user.avatarUrl,
        level: user.level,
        country: user.country || "IN",
      }));
    }
  }, [user]);

  // Start Quick Matchmaking
  const handleQuickMatch = () => {
    soundFx.playClick();
    setMatchMode("quick");
    setRoomCode(`D1-${Math.floor(10000 + Math.random() * 90000)}`);
    setPlayer2({
      id: "rival_" + Math.floor(Math.random() * 1000),
      name: "Thrissur Tiger " + Math.floor(Math.random() * 99),
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=rival_${Math.random()}`,
      level: Math.floor(Math.random() * 8) + 3,
      country: "IN",
      winRate: Math.floor(Math.random() * 30) + 50,
      isReady: true,
      pulls: 0,
    });
    setPhase("lobby");
  };

  // Create Private Room
  const handleCreatePrivate = () => {
    soundFx.playClick();
    setMatchMode("private");
    const code = `D1-${Math.floor(10000 + Math.random() * 90000)}`;
    setRoomCode(code);
    setPlayer2({
      id: "friend_waiting",
      name: "Waiting for Opponent...",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=waiting",
      level: 1,
      country: "IN",
      winRate: 0,
      isReady: false,
      pulls: 0,
    });
    setPhase("lobby");
  };

  // Join Private Room
  const handleJoinPrivate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputRoomCode.trim()) return;
    soundFx.playClick();
    setMatchMode("private");
    setRoomCode(inputRoomCode.toUpperCase());
    setPlayer2({
      id: "room_host",
      name: "Room Host (Challenger)",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=host",
      level: 7,
      country: "IN",
      winRate: 82,
      isReady: true,
      pulls: 0,
    });
    setPhase("lobby");
  };

  // Start Match Countdown
  const startCountdown = useCallback(() => {
    soundFx.playClick();
    setPhase("countdown");
    setCountdown(3);
    setRopePosition(0);
    setTimerSeconds(30);
    setStamina(100);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setPhase("playing");
          soundFx.playPullRope();
          return 0;
        }
        soundFx.playClick();
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Player Pull Action (With Anti-Cheat frequency limiter)
  const handlePull = useCallback(() => {
    if (phase !== "playing") return;

    const now = Date.now();
    const timeDelta = now - lastClickTimeRef.current;
    lastClickTimeRef.current = now;

    // Anti-cheat: If clicking faster than 35ms (> 28 clicks/sec), flag suspicious bot
    if (timeDelta < 35) {
      rapidClickCountRef.current += 1;
      if (rapidClickCountRef.current > 5) {
        setAntiCheatWarning(true);
        return; // Reject bot pull
      }
    } else {
      rapidClickCountRef.current = Math.max(0, rapidClickCountRef.current - 1);
    }

    soundFx.playPullRope();
    setIsPullingP1(true);
    setTimeout(() => setIsPullingP1(false), 120);

    setPlayer1((prev) => ({ ...prev, pulls: prev.pulls + 1 }));

    // Dynamic Pull Power with Stamina
    const power = stamina > 20 ? 3.5 : 1.5;
    setStamina((prev) => Math.max(10, prev - 3));

    setRopePosition((prev) => {
      const next = prev - power;
      if (next <= -100) {
        endGame(player1);
        return -100;
      }
      return next;
    });
  }, [phase, stamina, player1]);

  // Stamina auto-regen loop during gameplay
  useEffect(() => {
    if (phase !== "playing") return;
    const interval = setInterval(() => {
      setStamina((prev) => Math.min(100, prev + 4));
    }, 200);
    return () => clearInterval(interval);
  }, [phase]);

  // AI / Opponent Pull Simulation Loop
  useEffect(() => {
    if (phase !== "playing") return;

    const interval = setInterval(() => {
      setIsPullingP2(true);
      setTimeout(() => setIsPullingP2(false), 150);

      setPlayer2((prev) => ({ ...prev, pulls: prev.pulls + 1 }));

      const opponentPower = Math.random() * 3.8 + 1.2; // Competitive bot pull
      setRopePosition((prev) => {
        const next = prev + opponentPower;
        if (next >= 100) {
          endGame(player2);
          return 100;
        }
        return next;
      });
    }, Math.random() * 250 + 200);

    return () => clearInterval(interval);
  }, [phase, player2]);

  // Match 30s Timer Loop
  useEffect(() => {
    if (phase !== "playing") return;

    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Determine winner by who has advantage
          if (ropePosition < 0) {
            endGame(player1);
          } else {
            endGame(player2);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, ropePosition, player1, player2]);

  // Keyboard Spacebar / Enter Pull Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === "Enter") {
        e.preventDefault();
        handlePull();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePull]);

  // End Game and Award Rewards
  const endGame = (winnerPlayer: MatchPlayer) => {
    setPhase("game_over");
    setWinner(winnerPlayer);

    const isUserWinner = winnerPlayer.id === player1.id;

    if (isUserWinner) {
      soundFx.playVictory();
      updateUserPoints(100, "Vadamvali Victory");
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#f59e0b", "#10b981", "#ef4444", "#fbbf24"],
      });
    } else {
      soundFx.playDefeat();
      updateUserPoints(30, "Vadamvali Match Participation");
    }
  };

  const copyRoomCode = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(roomCode);
      setCopiedCode(true);
      soundFx.playClick();
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // Advantage Percentage
  // ropePosition: -100 = 100% P1 advantage, 0 = 50-50, +100 = 100% P2 advantage
  const p1Percentage = Math.round(50 - ropePosition / 2);
  const p2Percentage = 100 - p1Percentage;

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <Link
          href="/events/onam-2026"
          onClick={() => soundFx.playClick()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Onam 2026 Hub
        </Link>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
            <span>🪢</span> Vadamvali Arena
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500 text-slate-950">
            Realtime 1v1
          </span>
        </div>
      </div>

      {/* Main Game Interface Container */}
      <div className="space-y-6">
        {/* Anti-Cheat Alert (if triggered) */}
        {antiCheatWarning && (
          <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500 text-rose-200 flex items-center gap-3 text-xs animate-shake">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <strong className="font-bold">Anti-Cheat Triggered:</strong> Rapid click rate detected (&gt; 25 clicks/s). Automated scripts are penalized. Pull naturally!
            </div>
          </div>
        )}

        {/* 1. MENU PHASE */}
        {phase === "menu" && (
          <div className="rounded-3xl glass-panel-gold p-8 sm:p-12 text-center space-y-8 border border-amber-500/30">
            <div className="space-y-3 max-w-xl mx-auto">
              <div className="text-4xl sm:text-5xl">🪢</div>
              <h1 className="text-3xl sm:text-5xl font-black text-white">
                VADAMVALI <span className="gold-gradient-text">ARENA</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300">
                Kerala's iconic Tug of War! Battle in real-time multiplayer duels. Rapidly tap or press SPACE to haul the golden flag past the marker.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
              <button
                onClick={handleQuickMatch}
                className="p-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 hover:brightness-110 shadow-xl shadow-amber-500/20 font-black text-base flex flex-col items-center justify-center gap-2 group hover:scale-[1.02] transition-all"
              >
                <Flame className="w-6 h-6 fill-slate-950" />
                <span>Quick Match</span>
                <span className="text-[11px] font-bold text-slate-900/80">
                  Instant Opponent Matchmaking
                </span>
              </button>

              <button
                onClick={handleCreatePrivate}
                className="p-6 rounded-2xl glass-panel border border-amber-500/40 text-amber-300 hover:bg-amber-500/15 font-black text-base flex flex-col items-center justify-center gap-2 hover:scale-[1.02] transition-all"
              >
                <Users className="w-6 h-6 text-amber-400" />
                <span>Create Private Room</span>
                <span className="text-[11px] font-semibold text-slate-400">
                  Battle a Friend with Code
                </span>
              </button>
            </div>

            {/* Join by Room Code */}
            <form
              onSubmit={handleJoinPrivate}
              className="max-w-md mx-auto flex items-center gap-2 pt-2"
            >
              <input
                type="text"
                placeholder="Enter 6-digit Code (e.g. D1-48291)"
                value={inputRoomCode}
                onChange={(e) => setInputRoomCode(e.target.value.toUpperCase())}
                className="flex-1 px-4 py-3 rounded-xl glass-input text-sm text-white uppercase tracking-wider"
              />
              <button
                type="submit"
                className="px-5 py-3 rounded-xl font-bold text-xs sm:text-sm bg-slate-800 hover:bg-amber-500 hover:text-slate-950 border border-slate-700 transition-colors"
              >
                Join Room
              </button>
            </form>

            <div className="pt-4 flex items-center justify-center gap-6 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" /> +100 XP per Win
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-emerald-400" /> 30-Second Rounds
              </span>
            </div>
          </div>
        )}

        {/* 2. LOBBY PHASE */}
        {phase === "lobby" && (
          <div className="rounded-3xl glass-panel p-6 sm:p-10 space-y-8 border border-amber-500/20">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Match Lobby: <span className="text-amber-400">{roomCode}</span>
                </h2>
                <p className="text-xs text-slate-400">
                  {matchMode === "private"
                    ? "Share this code with your friend to connect."
                    : "Opponent connected. Ready up to pull!"}
                </p>
              </div>

              {matchMode === "private" && (
                <button
                  onClick={copyRoomCode}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode ? "Room Code Copied!" : "Copy Invite Code"}
                </button>
              )}
            </div>

            {/* VS Card Display */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Player 1 Card */}
              <div className="p-6 rounded-2xl glass-card border border-emerald-500/30 text-center space-y-3 bg-emerald-950/20">
                <img
                  src={player1.avatar}
                  alt={player1.name}
                  className="w-20 h-20 rounded-2xl mx-auto object-cover border-2 border-emerald-400 bg-slate-800"
                />
                <div>
                  <h3 className="font-extrabold text-white text-lg">{player1.name}</h3>
                  <div className="text-xs font-bold text-emerald-400">
                    Level {player1.level} • {player1.country}
                  </div>
                </div>
                <div className="text-xs text-slate-300 font-semibold">
                  Win Rate: <strong className="text-white">{player1.winRate}%</strong>
                </div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ✓ Ready for Battle
                </span>
              </div>

              {/* VS Emblem */}
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center mx-auto text-amber-400 font-black text-xl shadow-lg shadow-amber-500/20 animate-pulse">
                  VS
                </div>
                <p className="text-xs font-semibold text-slate-400">1v1 Tug of War</p>
              </div>

              {/* Player 2 Card */}
              <div className="p-6 rounded-2xl glass-card border border-rose-500/30 text-center space-y-3 bg-rose-950/20">
                <img
                  src={player2.avatar}
                  alt={player2.name}
                  className="w-20 h-20 rounded-2xl mx-auto object-cover border-2 border-rose-400 bg-slate-800"
                />
                <div>
                  <h3 className="font-extrabold text-white text-lg">{player2.name}</h3>
                  <div className="text-xs font-bold text-rose-400">
                    Level {player2.level} • {player2.country}
                  </div>
                </div>
                <div className="text-xs text-slate-300 font-semibold">
                  Win Rate: <strong className="text-white">{player2.winRate}%</strong>
                </div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  ✓ Ready for Battle
                </span>
              </div>
            </div>

            {/* Ready / Start Action */}
            <div className="text-center pt-4">
              <button
                onClick={startCountdown}
                className="px-10 py-4 rounded-2xl font-black text-base bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 hover:brightness-110 shadow-xl shadow-amber-500/30 hover:scale-105 transition-all"
              >
                START TUG OF WAR
              </button>
            </div>
          </div>
        )}

        {/* 3. COUNTDOWN & 4. PLAYING PHASE */}
        {(phase === "countdown" || phase === "playing") && (
          <div className="space-y-6">
            {/* Top Match HUD */}
            <div className="p-4 rounded-2xl glass-panel border border-amber-500/20 flex items-center justify-between gap-4">
              {/* Player 1 HUD */}
              <div className="flex items-center gap-3">
                <img
                  src={player1.avatar}
                  alt={player1.name}
                  className="w-10 h-10 rounded-xl border border-emerald-500/40"
                />
                <div>
                  <div className="text-xs font-bold text-white truncate max-w-[120px]">
                    {player1.name}
                  </div>
                  <div className="text-[11px] font-bold text-emerald-400">
                    {player1.pulls} Pulls
                  </div>
                </div>
              </div>

              {/* Timer / Countdown Center */}
              <div className="text-center">
                {phase === "countdown" ? (
                  <div className="text-4xl font-black text-amber-400 animate-bounce">
                    {countdown}
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="text-2xl font-black font-mono text-amber-400">
                      00:{String(timerSeconds).padStart(2, "0")}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Time Remaining
                    </span>
                  </div>
                )}
              </div>

              {/* Player 2 HUD */}
              <div className="flex items-center gap-3 text-right">
                <div>
                  <div className="text-xs font-bold text-white truncate max-w-[120px]">
                    {player2.name}
                  </div>
                  <div className="text-[11px] font-bold text-rose-400">
                    {player2.pulls} Pulls
                  </div>
                </div>
                <img
                  src={player2.avatar}
                  alt={player2.name}
                  className="w-10 h-10 rounded-xl border border-rose-500/40"
                />
              </div>
            </div>

            {/* Live Advantage Bar (54% vs 46%) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-black">
                <span className="text-emerald-400">{player1.name} ({p1Percentage}%)</span>
                <span className="text-rose-400">{player2.name} ({p2Percentage}%)</span>
              </div>
              <div className="w-full h-4 rounded-full bg-slate-900 overflow-hidden flex border border-slate-800">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-150"
                  style={{ width: `${p1Percentage}%` }}
                />
                <div
                  className="bg-gradient-to-r from-rose-400 to-rose-500 transition-all duration-150"
                  style={{ width: `${p2Percentage}%` }}
                />
              </div>
            </div>

            {/* Dynamic 2D Canvas Tug Arena */}
            <VadamvaliCanvas
              ropePosition={ropePosition}
              isPullingP1={isPullingP1}
              isPullingP2={isPullingP2}
              player1Name={player1.name}
              player2Name={player2.name}
            />

            {/* Player Stamina Bar & Action Area */}
            {phase === "playing" && (
              <div className="p-6 rounded-3xl glass-panel-gold border border-amber-500/30 text-center space-y-4">
                {/* Stamina Meter */}
                <div className="max-w-md mx-auto space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-300">
                    <span>Grip Stamina</span>
                    <span>{stamina}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-150 ${
                        stamina > 40 ? "bg-amber-400" : "bg-rose-500 animate-pulse"
                      }`}
                      style={{ width: `${stamina}%` }}
                    />
                  </div>
                </div>

                {/* Big Interactive Pull Button */}
                <button
                  onClick={handlePull}
                  className="w-full sm:w-80 py-6 rounded-3xl font-black text-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 hover:brightness-110 shadow-2xl shadow-amber-500/40 active:scale-95 transition-transform flex items-center justify-center gap-3 mx-auto uppercase tracking-widest cursor-pointer select-none"
                >
                  <Flame className="w-8 h-8 fill-slate-950" />
                  PULL! (TAP / SPACE)
                </button>

                <p className="text-xs text-slate-400">
                  Tip: Mash the <kbd className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-amber-300 font-mono">SPACEBAR</kbd> or tap the pull button in rhythm to pull the opponent past the center line!
                </p>
              </div>
            )}
          </div>
        )}

        {/* 5. GAME OVER / WINNER PHASE */}
        {phase === "game_over" && winner && (
          <div className="rounded-3xl glass-panel-gold p-8 sm:p-12 text-center space-y-8 border border-amber-500/40 animate-in zoom-in-95 duration-300">
            {winner.id === player1.id ? (
              <div className="space-y-4">
                <div className="text-6xl animate-bounce">🏆</div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black uppercase tracking-widest">
                  VICTORY CHAMPION
                </div>
                <h2 className="text-4xl sm:text-6xl font-black text-white festival-title-glow">
                  YOU WON THE MATCH!
                </h2>
                <p className="text-sm text-amber-300 font-bold">
                  Spectacular pulling strength! You hauled the opponent beyond the center marker.
                </p>
                <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-slate-900 border border-amber-500/30 text-amber-400 font-extrabold text-sm shadow-inner">
                  <Zap className="w-4 h-4 fill-amber-400" /> +100 Platform XP Awarded!
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-6xl">⚔️</div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800 text-slate-300 text-xs font-black uppercase tracking-widest">
                  GOOD GAME
                </div>
                <h2 className="text-4xl sm:text-5xl font-black text-white">
                  DEFEAT — TRY AGAIN!
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  {player2.name} won this round. Regroup, build stamina, and challenge for a rematch!
                </p>
                <div className="inline-flex items-center gap-2 px-6 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs">
                  <Award className="w-4 h-4 text-amber-400" /> +30 Participation XP Awarded
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <button
                onClick={handleQuickMatch}
                className="px-8 py-3.5 rounded-2xl font-black text-sm bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:brightness-110 shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 hover:scale-105"
              >
                <RefreshCw className="w-4 h-4" /> Rematch / Find New Player
              </button>

              <Link
                href="/events/onam-2026"
                onClick={() => soundFx.playClick()}
                className="px-6 py-3.5 rounded-2xl font-bold text-sm glass-panel border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Return to Onam Hub
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
