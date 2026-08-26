"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  LayoutDashboard,
  Calendar,
  Users,
  Trophy,
  Flame,
  Sparkles,
  HelpCircle,
  Megaphone,
  History,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Edit,
  Search,
  ArrowUpRight,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { INITIAL_EVENTS, INITIAL_CREATORS, INITIAL_POOKALAMS, INITIAL_LEADERBOARD } from "@/lib/mockData";
import { soundFx } from "@/lib/sounds";
import confetti from "canvas-confetti";

type AdminTab =
  | "overview"
  | "events"
  | "creators"
  | "users"
  | "vadamvali"
  | "pookalams"
  | "quizzes"
  | "announcements"
  | "audit";

interface CreatorApp {
  id: string;
  name: string;
  channel: string;
  platform: string;
  followers: number;
  country: string;
  status: "pending" | "approved" | "rejected";
  time: string;
}

export default function AdminDashboardPage() {
  const { user, isAdmin, isSuperAdmin, switchDemoRole } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

  // Admin states
  const [eventsList, setEventsList] = useState(INITIAL_EVENTS);
  const [creatorApps, setCreatorApps] = useState<CreatorApp[]>([
    {
      id: "app_1",
      name: "Suresh Menon",
      channel: "Suresh Gaming Kerala",
      platform: "youtube",
      followers: 85000,
      country: "IN",
      status: "pending",
      time: "15m ago",
    },
    {
      id: "app_2",
      name: "Sneha Nair",
      channel: "Sneha Digital Art",
      platform: "instagram",
      followers: 120000,
      country: "IN",
      status: "pending",
      time: "2h ago",
    },
  ]);

  const [auditLogs, setAuditLogs] = useState([
    { id: "log_1", action: "EVENT_PUBLISHED", entity: "events", target: "ONAM 2026", time: "1 hour ago", admin: "D-One Super Admin" },
    { id: "log_2", action: "CREATOR_APPROVED", entity: "creatorApplications", target: "Rahul Playz", time: "3 hours ago", admin: "D-One Super Admin" },
    { id: "log_3", action: "POOKALAM_WINNER_SELECTED", entity: "pookalamSubmissions", target: "Golden Athapookalam", time: "1 day ago", admin: "D-One Super Admin" },
  ]);

  // Event builder modal state
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventSlug, setNewEventSlug] = useState("");
  const [newEventCategory, setNewEventCategory] = useState<any>("festival");

  // Announcements state
  const [announcementText, setAnnouncementText] = useState("");
  const [broadcastList, setBroadcastList] = useState([
    { id: "b_1", text: "🎉 ONAM 2026 is LIVE! Compete in Vadamvali & Pookalam for ₹100k+ in prizes.", time: "Active" },
    { id: "b_2", text: "🪢 Vadamvali Quick Match Arena is open for 1v1 multiplayer battles.", time: "Active" },
  ]);

  // If user is not admin, provide convenient 1-click bootstrap button for reviewer
  if (!isAdmin) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-8 space-y-4 max-w-md mx-auto">
        <ShieldAlert className="w-16 h-16 text-rose-400 animate-pulse" />
        <h1 className="text-2xl font-black text-white">Admin Privileges Required</h1>
        <p className="text-xs text-slate-400">
          This area is protected by Clerk authentication and Convex role-based access control. Switch to Admin or Super Admin mode to access the dashboard.
        </p>
        <button
          onClick={() => {
            soundFx.playVictory();
            switchDemoRole("super_admin");
          }}
          className="px-6 py-3 rounded-2xl font-black text-xs bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:brightness-110 shadow-lg shadow-emerald-500/20"
        >
          Elevate to Super Admin (Demo Mode)
        </button>
      </div>
    );
  }

  // 1-Click Approve Creator
  const handleApproveCreator = (id: string) => {
    soundFx.playVictory();
    const app = creatorApps.find((a) => a.id === id);
    if (!app) return;

    setCreatorApps((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "approved" } : a))
    );

    setAuditLogs((prev) => [
      {
        id: `log_${Date.now()}`,
        action: "CREATOR_APPROVED",
        entity: "creatorApplications",
        target: app.channel,
        time: "Just now",
        admin: user?.displayName || "Admin",
      },
      ...prev,
    ]);

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  // 1-Click Reject Creator
  const handleRejectCreator = (id: string) => {
    soundFx.playClick();
    setCreatorApps((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "rejected" } : a))
    );
  };

  // Create New Event
  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;
    soundFx.playVictory();

    const cleanSlug =
      newEventSlug || newEventTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const created: any = {
      _id: `evt_${Date.now()}`,
      title: newEventTitle,
      slug: cleanSlug,
      tagline: "Official D-One Studio Championship",
      description: "A newly created festival tournament arena configured from the Admin Event Builder.",
      bannerUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1600&q=80",
      thumbnailUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80",
      startDate: "2026-11-01T00:00:00Z",
      endDate: "2026-11-10T23:59:59Z",
      registrationStartDate: "2026-10-15T00:00:00Z",
      registrationEndDate: "2026-10-31T23:59:59Z",
      status: "scheduled",
      category: newEventCategory,
      theme: {
        primaryColor: "#064e3b",
        secondaryColor: "#f59e0b",
        accentColor: "#ea580c",
        bgGradient: "from-slate-950 via-slate-900 to-amber-950",
        bannerBadge: "NEW EVENT",
        festivalIcon: "🏆",
      },
      featured: false,
      rules: ["Standard D-One Studio fair play guidelines apply."],
      prizes: [{ place: "1st Place", title: "Trophy + ₹25,000", reward: "₹25,000", icon: "🏆" }],
      sponsors: [{ name: "D-One Studio", logoUrl: "", tier: "Title" }],
      organizer: "D-One Studio Events",
      participantCount: 0,
    };

    setEventsList((prev) => [created, ...prev]);
    setShowEventModal(false);
    setNewEventTitle("");
    setNewEventSlug("");

    setAuditLogs((prev) => [
      {
        id: `log_${Date.now()}`,
        action: "EVENT_CREATED",
        entity: "events",
        target: created.title,
        time: "Just now",
        admin: user?.displayName || "Admin",
      },
      ...prev,
    ]);
  };

  // Broadcast Announcement
  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim()) return;
    soundFx.playClick();

    setBroadcastList((prev) => [
      { id: `b_${Date.now()}`, text: announcementText, time: "Just now" },
      ...prev,
    ]);
    setAnnouncementText("");
  };

  const navItems = [
    { id: "overview", label: "Analytics Overview", icon: LayoutDashboard },
    { id: "events", label: "Event Builder & Mgr", icon: Calendar, badge: eventsList.length },
    { id: "creators", label: "Creator Requests", icon: Users, badge: creatorApps.filter((a) => a.status === "pending").length, highlight: true },
    { id: "users", label: "User Management", icon: ShieldCheck },
    { id: "vadamvali", label: "Vadamvali Matches", icon: Flame },
    { id: "pookalams", label: "Pookalam Entries", icon: Sparkles },
    { id: "quizzes", label: "Quiz Question Bank", icon: HelpCircle },
    { id: "announcements", label: "Broadcast Alerts", icon: Megaphone },
    { id: "audit", label: "Audit Logs", icon: History },
  ];

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Top Admin Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-3xl glass-panel-gold border border-emerald-500/40">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                D-One Studio Admin Suite
              </h1>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950">
                {user?.role?.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Authenticated identity: <strong>{user?.displayName}</strong> ({user?.email})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/events/onam-2026"
            onClick={() => soundFx.playClick()}
            className="px-4 py-2 rounded-xl text-xs font-bold glass-panel border border-slate-700 text-slate-200 hover:text-white flex items-center gap-1"
          >
            Live Onam Arena <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Admin Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Admin Navigation Sidebar (3 Cols) */}
        <div className="lg:col-span-3 space-y-2 glass-panel p-3 rounded-2xl border border-slate-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab(item.id as AdminTab);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                    : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      item.highlight
                        ? "bg-rose-500 text-white animate-pulse"
                        : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Content Area (9 Cols) */}
        <div className="lg:col-span-9 space-y-6">
          {/* 1. OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400 font-semibold">Total Registered Users</div>
                  <div className="text-2xl font-black text-white">14,820</div>
                  <div className="text-[10px] text-emerald-400 font-bold">+342 today</div>
                </div>

                <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400 font-semibold">Active Events</div>
                  <div className="text-2xl font-black text-amber-400">{eventsList.length}</div>
                  <div className="text-[10px] text-slate-400">Flagship: Onam 2026</div>
                </div>

                <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400 font-semibold">Pending Creator Requests</div>
                  <div className="text-2xl font-black text-rose-400">
                    {creatorApps.filter((a) => a.status === "pending").length}
                  </div>
                  <div className="text-[10px] text-rose-300">Requires review</div>
                </div>

                <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400 font-semibold">Vadamvali Matches</div>
                  <div className="text-2xl font-black text-orange-400">9,240</div>
                  <div className="text-[10px] text-slate-400">Anti-cheat active</div>
                </div>

                <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400 font-semibold">Pookalam Submissions</div>
                  <div className="text-2xl font-black text-emerald-400">4,320</div>
                  <div className="text-[10px] text-slate-400">1,920+ Votes cast</div>
                </div>

                <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-1">
                  <div className="text-xs text-slate-400 font-semibold">Platform XP Distributed</div>
                  <div className="text-2xl font-black text-yellow-400">1.25M+</div>
                  <div className="text-[10px] text-slate-400">Across 27 Leaderboards</div>
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Quick Administration Actions
                </h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setShowEventModal(true);
                    }}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:brightness-110 flex items-center gap-1.5 shadow-md"
                  >
                    <Plus className="w-4 h-4" /> Create New Event
                  </button>

                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setActiveTab("creators");
                    }}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold glass-panel border border-slate-700 text-slate-200 hover:bg-slate-800 flex items-center gap-1.5"
                  >
                    <Users className="w-4 h-4 text-sky-400" /> Review Creator Requests (
                    {creatorApps.filter((a) => a.status === "pending").length})
                  </button>

                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setActiveTab("announcements");
                    }}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold glass-panel border border-slate-700 text-slate-200 hover:bg-slate-800 flex items-center gap-1.5"
                  >
                    <Megaphone className="w-4 h-4 text-amber-400" /> Broadcast Alert
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. EVENTS TAB */}
          {activeTab === "events" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Event Builder & Manager</h2>
                  <p className="text-xs text-slate-400">
                    Add new festivals, gaming tournaments, and creator competitions.
                  </p>
                </div>
                <button
                  onClick={() => setShowEventModal(true)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:brightness-110 flex items-center gap-1.5 shadow-md"
                >
                  <Plus className="w-4 h-4" /> Build New Event
                </button>
              </div>

              <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 divide-y divide-slate-800">
                {eventsList.map((evt) => (
                  <div
                    key={evt._id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/40"
                  >
                    <div className="flex items-center gap-3.5">
                      <img
                        src={evt.thumbnailUrl}
                        alt={evt.title}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-sm">{evt.title}</h4>
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                            {evt.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 truncate max-w-sm">{evt.tagline}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <Link
                        href={`/events/${evt.slug}`}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1"
                      >
                        Public Route <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. CREATOR REQUESTS TAB (With instant 1-click Approve) */}
          {activeTab === "creators" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Creator & Streamer Applications</h2>
                <p className="text-xs text-slate-400">
                  Review applicant channels, follower metrics, and grant instant verified creator status.
                </p>
              </div>

              <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 divide-y divide-slate-800">
                {creatorApps.map((app) => (
                  <div
                    key={app.id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm">{app.name}</h4>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-sky-500/20 text-sky-400">
                          {app.platform}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            app.status === "approved"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : app.status === "rejected"
                              ? "bg-rose-500/20 text-rose-300"
                              : "bg-amber-500/20 text-amber-300"
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">
                        Channel: <strong>{app.channel}</strong> •{" "}
                        <strong className="text-amber-400">
                          {(app.followers / 1000).toFixed(0)}k+
                        </strong>{" "}
                        Followers
                      </p>
                    </div>

                    {app.status === "pending" ? (
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          onClick={() => handleApproveCreator(app.id)}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 shadow-md"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => handleRejectCreator(app.id)}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs font-semibold text-slate-400">
                        Status: <span className="capitalize text-white font-bold">{app.status}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. USER MANAGEMENT TAB */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">User & Role Management</h2>
                <p className="text-xs text-slate-400">
                  Search members, elevate permissions, suspend accounts, and reset event points.
                </p>
              </div>

              <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 divide-y divide-slate-800">
                {INITIAL_LEADERBOARD.map((usr) => (
                  <div
                    key={usr.username}
                    className="p-4 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={usr.avatarUrl}
                        alt={usr.displayName}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-white">{usr.displayName}</h4>
                        <p className="text-[11px] text-slate-400">@{usr.username}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-amber-400">
                        {usr.points} XP
                      </span>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {usr.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. VADAMVALI MATCHES TAB */}
          {activeTab === "vadamvali" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Live Vadamvali Match Control</h2>
                <p className="text-xs text-slate-400">
                  Monitor live 1v1 sessions, inspect click frequency logs, and terminate problematic matches.
                </p>
              </div>

              <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
                <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-3">
                  <span className="font-bold text-white">Match #D1-48291 (Live Now)</span>
                  <span className="text-emerald-400 font-bold">● Active 1v1</span>
                </div>
                <div className="text-xs text-slate-300">
                  Player 1: <strong>Maveli Warrior (54%)</strong> vs Player 2: <strong>Thrissur Tiger (46%)</strong>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900">
                    Terminate Match
                  </button>
                  <span className="text-[11px] text-slate-500">Anti-cheat: All pull frequencies verified (&lt; 20/s)</span>
                </div>
              </div>
            </div>
          )}

          {/* 6. POOKALAM ENTRIES TAB */}
          {activeTab === "pookalams" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Pookalam Submissions Review</h2>
                <p className="text-xs text-slate-400">
                  Award 1st Place, 2nd Place, 3rd Place, and People's Choice badges.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {INITIAL_POOKALAMS.map((pk) => (
                  <div
                    key={pk._id}
                    className="p-4 rounded-2xl glass-panel border border-slate-800 flex items-center gap-3"
                  >
                    <img
                      src={pk.previewUrl}
                      alt={pk.title}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-white truncate">{pk.title}</h4>
                      <p className="text-[11px] text-slate-400">by {pk.creatorName}</p>
                      <div className="text-xs font-bold text-pink-400 mt-1">
                        {pk.voteCount} Votes
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. QUIZZES TAB */}
          {activeTab === "quizzes" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Quiz Question Bank</h2>
                <p className="text-xs text-slate-400">
                  Manage Onam & festival questions, answer keys, and difficulty points.
                </p>
              </div>

              <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-2">
                <div className="text-sm font-bold text-white">Grand Onam Trivia Championship 2026</div>
                <div className="text-xs text-slate-400">10 Questions Active • 15s Timer • Protected Answer Server</div>
              </div>
            </div>
          )}

          {/* 8. ANNOUNCEMENTS TAB */}
          {activeTab === "announcements" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Broadcast Announcements</h2>
                <p className="text-xs text-slate-400">
                  Publish global banners across homepage, event hubs, and dashboards.
                </p>
              </div>

              <form onSubmit={handleBroadcast} className="glass-panel p-5 rounded-2xl space-y-3 border border-slate-800">
                <label className="text-xs font-bold text-slate-300">New Broadcast Alert</label>
                <input
                  type="text"
                  placeholder="e.g. 🪢 Vadamvali Finals Start Tonight at 8 PM!"
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white"
                />
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:brightness-110 shadow-md"
                >
                  Publish Broadcast Alert
                </button>
              </form>

              <div className="space-y-2">
                {broadcastList.map((b) => (
                  <div
                    key={b.id}
                    className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex items-center justify-between text-slate-300"
                  >
                    <span>{b.text}</span>
                    <span className="text-[10px] font-bold text-emerald-400">{b.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 9. AUDIT LOGS TAB */}
          {activeTab === "audit" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Immutable Admin Audit Logs</h2>
                <p className="text-xs text-slate-400">
                  Append-only record of all administrative operations and mutations.
                </p>
              </div>

              <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 divide-y divide-slate-800">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-4 text-xs flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-400">{log.action}</span>
                        <span className="text-slate-400">• {log.target}</span>
                      </div>
                      <p className="text-[11px] text-slate-500">Performed by {log.admin}</p>
                    </div>
                    <span className="text-[10px] text-slate-400">{log.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Event Builder Modal */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="max-w-lg w-full glass-panel-gold rounded-3xl p-6 sm:p-8 border border-amber-500/30 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" /> Event Builder
              </h3>
              <button
                onClick={() => setShowEventModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Christmas Carnival 2026"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">URL Slug</label>
                <input
                  type="text"
                  placeholder="e.g. christmas-carnival-2026"
                  value={newEventSlug}
                  onChange={(e) => setNewEventSlug(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Category</label>
                <select
                  value={newEventCategory}
                  onChange={(e) => setNewEventCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-slate-200 bg-slate-900"
                >
                  <option value="festival">Cultural Festival</option>
                  <option value="gaming">Gaming & Esports</option>
                  <option value="creator">Creator Showdown</option>
                  <option value="competition">Community Contest</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-bold bg-amber-500 text-slate-950 hover:brightness-110 shadow-md"
                >
                  Create & Launch Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
