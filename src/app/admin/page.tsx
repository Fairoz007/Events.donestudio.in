"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import {
  ShieldCheck,
  Calendar,
  Users,
  Flame,
  Sparkles,
  Trophy,
  Crown,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Lock,
  FileText,
} from "lucide-react";
import { soundFx } from "@/lib/sounds";

export default function AdminControlPage() {
  const { isAdmin, isLoaded, user, isSignedIn } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "events" | "activities" | "pookalam" | "creators" | "announcements" | "users" | "logs"
  >("events");

  const [selectedEventId, setSelectedEventId] = useState<Id<"events"> | null>(null);

  // Queries
  const events = useQuery(api.events.listEvents, { status: "all" });
  const currentEventId = selectedEventId ?? events?.[0]?._id ?? null;

  const controlData = useQuery(
    api.controlCenter.eventControl,
    isAdmin && currentEventId ? { eventId: currentEventId } : "skip"
  );
  const platformAnalytics = useQuery(api.admin.getPlatformAnalytics, isAdmin ? {} : "skip");
  const creatorApplications = useQuery(api.creators.listApplicationsForAdmin, isAdmin ? { status: "all" } : "skip");
  const announcements = useQuery(api.announcements.listGlobalAnnouncements);
  const allUsers = useQuery(api.admin.listUsers, isAdmin ? {} : "skip");
  const auditLogs = useQuery(api.admin.listAuditLogs, isAdmin ? { limit: 50 } : "skip");

  // Mutations
  const setEventStateMutation = useMutation(api.controlCenter.setEventState);
  const setDefaultEventMutation = useMutation(api.events.setDefaultEvent);
  const setActivityStateMutation = useMutation(api.controlCenter.setActivityState);
  const startQuizMutation = useMutation(api.controlCenter.startQuiz);
  const setPookalamModeMutation = useMutation(api.controlCenter.setPookalamMode);
  const awardWinnerBadgeMutation = useMutation(api.pookalam.awardWinnerBadge);
  const approveCreatorMutation = useMutation(api.creators.approveApplication);
  const rejectCreatorMutation = useMutation(api.creators.rejectApplication);
  const publishAnnouncementMutation = useMutation(api.announcements.publishAnnouncement);
  const deleteAnnouncementMutation = useMutation(api.announcements.deleteAnnouncement);
  const updateUserRoleMutation = useMutation(api.admin.updateUserRole);
  const toggleSuspensionMutation = useMutation(api.admin.toggleSuspension);
  const terminateMatchMutation = useMutation(api.matches.terminateMatch);
  const bootstrapSuperAdminMutation = useMutation(api.admin.bootstrapSuperAdmin);

  // Form States for Announcement
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    type: "info" as "urgent" | "info" | "tournament" | "winner",
    isGlobal: true,
  });

  const [announcementMsg, setAnnouncementMsg] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [bootstrapKey, setBootstrapKey] = useState("");
  const [bootstrapEmail, setBootstrapEmail] = useState("");
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);
  const [bootstrapSuccess, setBootstrapSuccess] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(false);

  if (!isLoaded) {
    return <div className="min-h-screen p-12 text-center text-white">Loading admin session…</div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen py-16 px-4 max-w-2xl mx-auto text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto text-3xl shadow-lg shadow-rose-500/10">
          <Lock className="w-8 h-8" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-white tracking-tight">
            {!isSignedIn ? "Sign In Required" : "Admin Privileges Required"}
          </h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            {!isSignedIn
              ? "Please sign in with your administrative account to access the event management control center."
              : `You are signed in as ${user?.email || user?.username || "User"}, but your account is not assigned the admin or super_admin role.`}
          </p>
        </div>

        {!isSignedIn && (
          <div className="pt-2">
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:brightness-110 shadow-lg shadow-emerald-500/25 transition-all"
            >
              Sign In to Continue
            </Link>
          </div>
        )}

        <div className="pt-6 border-t border-slate-800/80 max-w-sm mx-auto space-y-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Bootstrap Admin Access
          </div>

          <input
            type="email"
            placeholder="Account Email (e.g. fairozfaisal2001@gmail.com)"
            value={bootstrapEmail}
            onChange={(e) => setBootstrapEmail(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl glass-input text-xs text-white text-center"
          />

          <div className="relative">
            <input
              type="password"
              placeholder="Bootstrap Secret Key"
              value={bootstrapKey}
              onChange={(e) => setBootstrapKey(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl glass-input text-xs text-white text-center"
            />
          </div>

          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setBootstrapKey("done-studio-super-admin-2026");
                if (!bootstrapEmail) setBootstrapEmail("fairozfaisal2001@gmail.com");
              }}
              className="text-[11px] text-amber-400/90 hover:text-amber-300 underline underline-offset-4 cursor-pointer block transition-colors"
            >
              Fill Default Credentials (<code>done-studio-super-admin-2026</code>)
            </button>
          </div>

          {bootstrapError && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 text-left">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{bootstrapError}</span>
            </div>
          )}

          {bootstrapSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 text-left">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{bootstrapSuccess}</span>
            </div>
          )}

          <button
            disabled={isBootstrapping || !bootstrapKey}
            onClick={async () => {
              try {
                soundFx.playClick();
                setIsBootstrapping(true);
                setBootstrapError(null);
                setBootstrapSuccess(null);
                const res = await bootstrapSuperAdminMutation({
                  secretKey: bootstrapKey,
                  email: bootstrapEmail.trim() || user?.email || "fairozfaisal2001@gmail.com",
                });
                setBootstrapSuccess(res.message || "Admin privileges granted! Reloading...");
                setTimeout(() => window.location.reload(), 1000);
              } catch (err: any) {
                setBootstrapError(err.message || "Failed to bootstrap admin");
              } finally {
                setIsBootstrapping(false);
              }
            }}
            className="w-full px-6 py-3 rounded-xl font-bold text-xs bg-amber-500 text-slate-950 hover:brightness-110 shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isBootstrapping ? "Claiming..." : "Claim Admin Status"}
          </button>
        </div>
      </div>
    );
  }

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.title || !newAnnouncement.content) return;
    soundFx.playClick();
    try {
      await publishAnnouncementMutation({
        title: newAnnouncement.title,
        content: newAnnouncement.content,
        type: newAnnouncement.type,
        isGlobal: newAnnouncement.isGlobal,
      });
      setNewAnnouncement({
        title: "",
        content: "",
        type: "info",
        isGlobal: true,
      });
      setAnnouncementMsg("Announcement broadcasted live!");
      setTimeout(() => setAnnouncementMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to create announcement");
    }
  };

  const usersList = allUsers ?? [];

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 text-white">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase">
            <ShieldCheck className="w-3.5 h-3.5" /> D-One Platform Control Center
          </div>
          <h1 className="text-3xl sm:text-4xl font-black">Admin Management Suite</h1>
          <p className="text-xs text-slate-400">
            Real-time control over events, multiplayer games, creator guild, public gallery, users, and broadcasts.
          </p>
        </div>

        {/* Event Selector */}
        <div className="flex items-center gap-3">
          <select
            className="px-4 py-2.5 rounded-xl glass-input text-xs font-bold text-slate-200 bg-slate-900 border border-slate-700"
            value={currentEventId ?? ""}
            onChange={(e) => setSelectedEventId(e.target.value as Id<"events">)}
          >
            {events?.map((e) => (
              <option key={e._id} value={e._id}>
                {e.title} ({e.status.toUpperCase()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Players</span>
            <Users className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {platformAnalytics?.totalUsers?.toLocaleString() ?? 0}
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Live / Completed Matches</span>
            <Flame className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <div className="text-2xl font-black text-orange-400">
            {platformAnalytics?.liveMatches ?? 0} <span className="text-xs text-slate-400">Live</span> / {platformAnalytics?.completedMatches ?? 0} <span className="text-xs text-slate-400">Done</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Pookalam Artworks</span>
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">
            {platformAnalytics?.pookalamSubmissions?.toLocaleString() ?? 0}
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Platform XP</span>
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
          </div>
          <div className="text-2xl font-black text-yellow-400">
            {platformAnalytics?.totalPointsAwarded?.toLocaleString() ?? 0}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-4">
        {[
          { id: "events", label: "🎪 Event Lifecycle", icon: Calendar },
          { id: "activities", label: "🪢 Matches & Activities", icon: Flame },
          { id: "pookalam", label: "🌸 Pookalam Submissions", icon: Sparkles },
          { id: "creators", label: "👥 Creators Guild", icon: Crown },
          { id: "announcements", label: "📢 Announcements", icon: Bell },
          { id: "users", label: "🛡️ Users & Roles", icon: Users },
          { id: "logs", label: "📜 Audit Logs", icon: FileText },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundFx.playClick();
                setActiveTab(tab.id as any);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                isActive
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "glass-panel text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Event Lifecycle & Default Event */}
      {activeTab === "events" && controlData && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-white">{controlData.event.title}</h3>
                <p className="text-xs text-amber-400 font-bold uppercase mt-0.5">
                  Current Status: {controlData.event.status} · {controlData.registrations.length} Registered Players
                </p>
              </div>

              <button
                onClick={async () => {
                  soundFx.playClick();
                  await setDefaultEventMutation({ eventId: controlData.event._id });
                  alert(`Set "${controlData.event.title}" as platform default flagship event!`);
                }}
                className="px-4 py-2 rounded-xl text-xs font-black bg-emerald-500 text-slate-950 hover:bg-emerald-400 flex items-center gap-1.5 self-start"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Set as Platform Flagship Event</span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-400">Trigger Event State Transition:</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Registration Open", state: "registration_open", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
                  { label: "Registration Closed", state: "registration_closed", color: "bg-slate-800 text-slate-300 border-slate-700" },
                  { label: "Ready (Pre-Launch)", state: "ready", color: "bg-sky-500/20 text-sky-300 border-sky-500/30" },
                  { label: "Go LIVE Now", state: "live", color: "bg-emerald-500 text-slate-950 font-black" },
                  { label: "Pause Event", state: "paused", color: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
                  { label: "Complete Event", state: "completed", color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
                  { label: "Cancel Event", state: "cancelled", color: "bg-rose-500/20 text-rose-300 border-rose-500/30" },
                ].map((btn) => (
                  <button
                    key={btn.state}
                    onClick={async () => {
                      soundFx.playClick();
                      await setEventStateMutation({
                        eventId: controlData.event._id,
                        state: btn.state as any,
                      });
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all hover:scale-105 ${btn.color}`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Registered Participants */}
          <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
            <h3 className="text-base font-black text-white">Registered Participants ({controlData.registrations.length})</h3>
            <div className="divide-y divide-slate-800 max-h-72 overflow-y-auto">
              {controlData.participants.map((p) => (
                <div key={p._id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.profile?.avatarUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=user"}
                      alt="Player"
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <div>
                      <strong className="text-white">{p.profile?.displayName || p.clerkUserId}</strong>
                      <span className="text-slate-400 ml-2">@{p.profile?.username}</span>
                    </div>
                  </div>
                  <span className="text-slate-500">
                    {new Date(p.registeredAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Activities & Matches */}
      {activeTab === "activities" && controlData && (
        <div className="space-y-6">
          {/* Activities Controller */}
          <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
            <h3 className="text-lg font-black text-white">Activity Status Controller</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {controlData.activities.map((act) => (
                <div key={act._id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <strong className="text-white text-sm">{act.title}</strong>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">
                      {act.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {["registration_open", "live", "paused", "completed"].map((st) => (
                      <button
                        key={st}
                        onClick={async () => {
                          soundFx.playClick();
                          await setActivityStateMutation({
                            activityId: act._id,
                            state: st as any,
                          });
                        }}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                      >
                        {st.replace("_", " ")}
                      </button>
                    ))}
                  </div>

                  {act.type === "quiz" && controlData.quizzes[0] && (
                    <button
                      onClick={async () => {
                        soundFx.playClick();
                        await startQuizMutation({ quizId: controlData.quizzes[0]._id });
                        alert("Cultural quiz launched live!");
                      }}
                      className="w-full py-2 rounded-xl text-xs font-black bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                    >
                      🚀 Launch Live Quiz Session
                    </button>
                  )}

                  {act.type === "pookalam" && (
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          soundFx.playClick();
                          await setPookalamModeMutation({
                            activityId: act._id,
                            submissionsOpen: true,
                            votingStatus: "open",
                          });
                        }}
                        className="flex-1 py-1.5 rounded-lg text-[10px] font-bold bg-emerald-600/30 text-emerald-300 border border-emerald-500/40"
                      >
                        Open Submissions & Voting
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Live Matches Terminal */}
          <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
            <h3 className="text-lg font-black text-white">Live Vadamvali Matches Monitor ({controlData.matches.length})</h3>
            {controlData.matches.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No active or pending matches currently.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {controlData.matches.map((m) => (
                  <div key={m._id} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-amber-400">{m.roomCode}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-800 text-slate-300">
                        {m.status}
                      </span>
                    </div>

                    <div className="text-slate-200">
                      <strong>{m.player1.displayName}</strong> vs <strong>{m.player2?.displayName || "Waiting..."}</strong>
                    </div>

                    <div className="text-slate-400 text-[11px]">
                      Rope Position: {Math.round(m.ropePosition)}% · Pulls: {m.player1.pulls} vs {m.player2?.pulls || 0}
                    </div>

                    {m.status === "in_progress" && (
                      <button
                        onClick={async () => {
                          soundFx.playClick();
                          await terminateMatchMutation({ matchId: m._id, reason: "Terminated by admin" });
                        }}
                        className="w-full py-1.5 rounded-lg text-[10px] font-bold bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/30"
                      >
                        Force Terminate Match
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Pookalam Submissions Review */}
      {activeTab === "pookalam" && controlData && (
        <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-white">Community Pookalam Submissions</h3>
              <p className="text-xs text-slate-400">Review submitted digital floral artworks and award official winner badges.</p>
            </div>
            <Link
              href="/events/onam-2026/pookalam/gallery"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400"
            >
              Open Public Gallery →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {controlData.pookalams.map((p) => (
              <div key={p._id} className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden space-y-3 p-3">
                <img
                  src={p.previewUrl}
                  alt={p.title}
                  className="w-full aspect-square object-cover rounded-xl bg-slate-950"
                />
                <div>
                  <h4 className="font-bold text-white text-sm truncate">{p.title}</h4>
                  <p className="text-xs text-slate-400">By {p.creatorName} · {p.voteCount} votes</p>
                  {p.winnerBadge && (
                    <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500 text-slate-950 uppercase">
                      👑 {p.winnerBadge.replace("_", " ")}
                    </span>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-1">
                  {["gold_winner", "silver_winner", "bronze_winner", "peoples_choice"].map((badge) => (
                    <button
                      key={badge}
                      onClick={async () => {
                        soundFx.playVictory();
                        await awardWinnerBadgeMutation({
                          submissionId: p._id,
                          badge: badge as any,
                        });
                        alert(`Awarded ${badge} to "${p.title}"!`);
                      }}
                      className="px-2 py-1 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/40"
                    >
                      {badge.split("_")[0].toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Creators Guild */}
      {activeTab === "creators" && (
        <div className="space-y-6">
          {/* Pending Applications */}
          <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
            <h3 className="text-lg font-black text-white">Pending Creator Applications</h3>
            {!creatorApplications || creatorApplications.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No pending creator applications.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {creatorApplications.map((app: any) => (
                  <div key={app._id} className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <strong className="text-white text-sm">{app.name}</strong>
                        <p className="text-slate-400">@{app.username} · {app.platform.toUpperCase()}</p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300">
                        {app.status}
                      </span>
                    </div>

                    <div className="text-slate-300 leading-relaxed">
                      <strong>Channel:</strong> {app.channelName} ({app.followerCount?.toLocaleString()} followers)
                      <br />
                      <strong>Bio:</strong> {app.description}
                    </div>

                    {app.status === "pending" && (
                      <div className="flex gap-2 pt-2 border-t border-slate-800">
                        <button
                          onClick={async () => {
                            soundFx.playVictory();
                            await approveCreatorMutation({
                              applicationId: app._id,
                            });
                          }}
                          className="flex-1 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                        >
                          ✓ Approve & Verify
                        </button>
                        <button
                          onClick={async () => {
                            soundFx.playClick();
                            await rejectCreatorMutation({
                              applicationId: app._id,
                              reason: "Requirements not met",
                            });
                          }}
                          className="flex-1 py-2 rounded-xl text-xs font-bold bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/30"
                        >
                          ✕ Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: Announcements Broadcaster */}
      {activeTab === "announcements" && (
        <div className="space-y-6">
          <form onSubmit={handleCreateAnnouncement} className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
            <h3 className="text-lg font-black text-white">Broadcast Global Platform Announcement</h3>

            {announcementMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs border border-emerald-500/40">
                {announcementMsg}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Announcement Title</label>
                <input
                  type="text"
                  required
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white"
                  placeholder="e.g. Grand Finale Vadamvali Tournament Live!"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400">Type</label>
                <select
                  value={newAnnouncement.type}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, type: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white bg-slate-900"
                >
                  <option value="info">Info</option>
                  <option value="urgent">Urgent</option>
                  <option value="tournament">Tournament</option>
                  <option value="winner">Winner / Celebration</option>
                </select>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs text-slate-400">Content / Message</label>
                <textarea
                  required
                  rows={2}
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white"
                  placeholder="Broadcast message shown across all players headers..."
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl font-black text-xs bg-amber-500 text-slate-950 hover:brightness-110 shadow-lg shadow-amber-500/20"
            >
              📢 Broadcast Announcement Now
            </button>
          </form>

          {/* Active Announcements List */}
          <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
            <h3 className="text-base font-black text-white">Active Global Announcements</h3>
            <div className="divide-y divide-slate-800">
              {announcements?.map((a) => (
                <div key={a._id} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-white">{a.title}</strong>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {a.type}
                      </span>
                    </div>
                    <p className="text-slate-300 mt-1">{a.content}</p>
                  </div>
                  <button
                    onClick={async () => {
                      soundFx.playClick();
                      await deleteAnnouncementMutation({ announcementId: a._id });
                    }}
                    className="p-2 rounded-xl text-rose-400 hover:bg-rose-950/40"
                    title="Delete announcement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: Users & Role Management */}
      {activeTab === "users" && (
        <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-lg font-black text-white">User Accounts & Roles</h3>
            <input
              type="text"
              placeholder="Filter users..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="px-3.5 py-2 rounded-xl glass-input text-xs text-white"
            />
          </div>

          <div className="divide-y divide-slate-800 max-h-96 overflow-y-auto">
            {usersList
              ?.filter((u: any) => u.displayName.toLowerCase().includes(userSearch.toLowerCase()) || u.username.toLowerCase().includes(userSearch.toLowerCase()))
              .map((u: any) => (
                <div key={u._id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <img src={u.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <strong className="text-white">{u.displayName}</strong>
                      <span className="text-slate-400 ml-2">@{u.username}</span>
                      <div className="text-[11px] text-amber-400">{u.points} XP · Level {u.level}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={u.role}
                      onChange={async (e) => {
                        soundFx.playClick();
                        await updateUserRoleMutation({
                          targetClerkUserId: u.clerkUserId,
                          newRole: e.target.value as any,
                        });
                      }}
                      className="px-2.5 py-1.5 rounded-lg glass-input text-xs text-slate-200 bg-slate-900 border border-slate-700"
                    >
                      <option value="user">User</option>
                      <option value="creator">Creator</option>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>

                    <button
                      onClick={async () => {
                        soundFx.playClick();
                        await toggleSuspensionMutation({
                          targetClerkUserId: u.clerkUserId,
                          suspend: !u.isSuspended,
                        });
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                        u.isSuspended ? "bg-rose-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {u.isSuspended ? "Suspended" : "Active"}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 7: Audit Logs */}
      {activeTab === "logs" && (
        <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
          <h3 className="text-lg font-black text-white">System & Security Audit Logs</h3>
          <div className="divide-y divide-slate-800 max-h-96 overflow-y-auto">
            {auditLogs?.map((log) => (
              <div key={log._id} className="py-2.5 text-xs flex items-center justify-between">
                <div>
                  <strong className="text-amber-400">{log.action}</strong>
                  <span className="text-slate-300 ml-2">on {log.entity}</span>
                  <p className="text-slate-500 text-[11px]">By Admin: {log.adminDisplayName} ({log.adminClerkUserId})</p>
                </div>
                <span className="text-slate-500 text-[11px]">{new Date(log.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
