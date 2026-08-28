"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Trophy,
  Flame,
  Sparkles,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Bell,
  Play,
  Heart,
} from "lucide-react";
import { soundFx } from "@/lib/sounds";

export default function DashboardPage() {
  const { isSignedIn, isLoaded, user } = useAuth();
  const dashboard = useQuery(api.controlCenter.myDashboard, isSignedIn ? {} : "skip");
  const userRank = useQuery(api.leaderboards.getMyRank, isSignedIn ? {} : "skip");
  const userMatches = useQuery(api.matches.listUserMatches, isSignedIn ? {} : "skip");
  const notifications = useQuery(api.notifications.listMyNotifications, isSignedIn ? { limit: 5 } : "skip");
  const featuredEvent = useQuery(api.events.getFeaturedEvent);

  if (!isLoaded) {
    return <main className="max-w-6xl mx-auto p-12 text-center text-white">Loading dashboard…</main>;
  }

  if (!isSignedIn) {
    return (
      <main className="max-w-3xl mx-auto p-12 text-center text-white space-y-6">
        <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-3xl mx-auto border border-amber-500/30">
          👑
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black">Player Dashboard</h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto">
            Sign in with Clerk to view your registered events, live match history, digital pookalams, quiz stats, and global leaderboard rankings.
          </p>
        </div>
        <Link href="/" className="inline-block rounded-xl bg-amber-500 px-6 py-3 text-slate-950 font-bold text-xs">
          Return to Home
        </Link>
      </main>
    );
  }

  const profile = dashboard?.profile ?? user;
  const joinedEvents = dashboard?.joinedEvents ?? [];
  const pookalams = dashboard?.pookalams ?? [];

  const defaultEventRegistration = joinedEvents.find(
    (j) => j.event?._id === featuredEvent?._id || j.event?.slug === "onam-2026"
  );

  return (
    <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 text-white space-y-8">
      {/* Player Header Banner */}
      <header className="p-6 sm:p-8 rounded-3xl glass-panel-gold border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-6">
          <img
            src={profile?.avatarUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=player"}
            alt={profile?.displayName || "Player"}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-500/50 bg-slate-800 shadow-xl"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white">{profile?.displayName || "Player"}</h1>
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                {profile?.role || "USER"}
              </span>
            </div>
            <p className="text-xs text-slate-300">@{profile?.username} · Joined {profile?.joinDate || "2026"}</p>
            <div className="flex items-center gap-3 pt-1">
              <span className="text-xs font-bold text-amber-400">Level {profile?.level || 1}</span>
              <span className="text-slate-600">·</span>
              <span className="text-xs font-bold text-emerald-400">{profile?.points || 0} Total XP</span>
              <span className="text-slate-600">·</span>
              <span className="text-xs font-bold text-sky-400">
                {userRank?.rank ? `Rank #${userRank.rank}` : "Unranked"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/leaderboards"
            onClick={() => soundFx.playClick()}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900/80 border border-slate-700 hover:bg-slate-800 text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Leaderboard</span>
          </Link>
          {profile?.role === "admin" || profile?.role === "super_admin" ? (
            <Link
              href="/admin"
              onClick={() => soundFx.playClick()}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:brightness-110 flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Center</span>
            </Link>
          ) : null}
        </div>
      </header>

      {/* Featured / Default Event Registration Status */}
      <section className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <h2 className="text-lg font-black text-white">Default Championship: {featuredEvent?.title || "ONAM 2026"}</h2>
          </div>
          <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            {featuredEvent?.status || "LIVE"}
          </span>
        </div>

        {defaultEventRegistration ? (
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-bold text-white">Registered for {featuredEvent?.title}</span>
              </div>
              <p className="text-xs text-slate-300">
                Registered on {new Date(defaultEventRegistration.registration.registeredAt).toLocaleString()}
              </p>
            </div>
            <Link
              href={`/events/${featuredEvent?.slug || "onam-2026"}`}
              onClick={() => soundFx.playClick()}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 flex items-center gap-1 shrink-0"
            >
              <span>Enter Arena</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-sm font-bold text-white">Not yet registered for {featuredEvent?.title || "ONAM 2026"}</div>
              <p className="text-xs text-slate-400">Join the official festival arena to participate in Vadamvali, Pookalam, and Quiz.</p>
            </div>
            <Link
              href={`/events/${featuredEvent?.slug || "onam-2026"}`}
              onClick={() => soundFx.playClick()}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:brightness-110 flex items-center gap-1 shrink-0"
            >
              <span>Register Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </section>

      {/* Stats Breakdown */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Vadamvali Record</span>
            <Flame className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {profile?.stats?.vadamvaliWins ?? 0} <span className="text-xs text-emerald-400">W</span> / {profile?.stats?.vadamvaliLosses ?? 0} <span className="text-xs text-rose-400">L</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Quiz High Score</span>
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">
            {profile?.stats?.quizHighScore ?? 0} <span className="text-xs text-slate-400">XP</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Pookalam Artworks</span>
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {pookalams.length} <span className="text-xs text-slate-400">Designs</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Pookalam Votes</span>
            <Heart className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400">
            {profile?.stats?.pookalamVotesReceived ?? 0} <span className="text-xs text-slate-400">Votes</span>
          </div>
        </div>
      </section>

      {/* Activities Quick Arena Access */}
      <section className="space-y-4">
        <h2 className="text-lg font-black text-white">Quick Arena Launch</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/events/onam-2026/vadamvali"
            onClick={() => soundFx.playClick()}
            className="p-5 rounded-2xl glass-card border border-slate-800 hover:border-orange-500/50 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <span className="text-3xl">🪢</span>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-orange-400">Vadamvali Arena</h3>
                <p className="text-[11px] text-slate-400">1v1 Tug of War Multiplayer</p>
              </div>
            </div>
            <Play className="w-4 h-4 text-slate-400 group-hover:text-orange-400 transition-colors" />
          </Link>

          <Link
            href="/events/onam-2026/pookalam"
            onClick={() => soundFx.playClick()}
            className="p-5 rounded-2xl glass-card border border-slate-800 hover:border-emerald-500/50 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <span className="text-3xl">🌸</span>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-emerald-400">Pookalam Studio</h3>
                <p className="text-[11px] text-slate-400">Floral Design & Gallery</p>
              </div>
            </div>
            <Play className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
          </Link>

          <Link
            href="/events/onam-2026/quiz"
            onClick={() => soundFx.playClick()}
            className="p-5 rounded-2xl glass-card border border-slate-800 hover:border-amber-500/50 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <span className="text-3xl">🧠</span>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-amber-400">Cultural Quiz</h3>
                <p className="text-[11px] text-slate-400">Folklore & Speed Trivia</p>
              </div>
            </div>
            <Play className="w-4 h-4 text-slate-400 group-hover:text-amber-400 transition-colors" />
          </Link>
        </div>
      </section>

      {/* 2 Columns: Match History & Notifications */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Matches */}
        <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" /> Recent Vadamvali Duels
            </h3>
            <Link href="/events/onam-2026/vadamvali" className="text-xs font-bold text-orange-400 hover:underline">
              Play Match →
            </Link>
          </div>

          {!userMatches || userMatches.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No matches played yet. Launch Vadamvali to start!</p>
          ) : (
            <div className="divide-y divide-slate-800/80 space-y-1 max-h-64 overflow-y-auto">
              {userMatches.slice(0, 6).map((m) => {
                const isWin = m.winner === user?.clerkUserId;
                const opponent = m.player1.clerkUserId === user?.clerkUserId ? m.player2?.displayName : m.player1.displayName;
                return (
                  <div key={m._id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${isWin ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
                        {isWin ? "WIN" : "LOSS"}
                      </span>
                      <span className="text-slate-300">vs <strong className="text-white">{opponent || "Waiting"}</strong></span>
                    </div>
                    <span className="text-slate-500 text-[11px]">{new Date(m.createdAt).toLocaleDateString()}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Live Notifications */}
        <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" /> Activity Notifications
            </h3>
          </div>

          {!notifications || notifications.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No notifications yet.</p>
          ) : (
            <div className="divide-y divide-slate-800/80 space-y-1 max-h-64 overflow-y-auto">
              {notifications.map((n) => (
                <div key={n._id} className="py-2.5 space-y-0.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{n.title}</span>
                    <span className="text-[10px] text-slate-500">{new Date(n.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed line-clamp-1">{n.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
