"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Calendar, CheckCircle2, Gamepad2, Globe, Share2, Sparkles, Trophy, Users, ArrowRight } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { useAuth } from "@/context/AuthContext";
import { api } from "../../../../convex/_generated/api";
import { soundFx } from "@/lib/sounds";
import confetti from "canvas-confetti";

function getActivityIcon(type: string) {
  switch (type) {
    case "vadamvali":
      return "🪢";
    case "pookalam":
      return "🌸";
    case "quiz":
      return "🧠";
    default:
      return "🏆";
  }
}

export default function EventDetailsPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params?.slug ?? "onam-2026";
  const { isSignedIn } = useAuth();
  const event = useQuery(api.events.getEventBySlug, { slug });
  const activities = useQuery(api.activities.listActivitiesByEventSlug, { eventSlug: slug });
  const registered = useQuery(api.events.isUserRegistered, event?._id ? { eventId: event._id } : "skip");
  const register = useMutation(api.events.registerForEvent);

  const [countdown, setCountdown] = useState<number>(0);

  useEffect(() => {
    if (!event?.startDate) return;
    const target = new Date(event.startDate).getTime();
    
    const updateCountdown = () => {
      setCountdown(Math.max(0, target - Date.now()));
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [event?.startDate]);

  const handleJoinEvent = async () => {
    if (!event) return;
    if (!isSignedIn) {
      soundFx.playClick();
      router.push(`/sign-in?redirect=/events/${slug}`);
      return;
    }
    soundFx.playClick();
    try {
      await register({ eventId: event._id });
      soundFx.playVictory();
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#10b981", "#f59e0b", "#38bdf8"],
      });
    } catch (error) {
      console.error("Registration failed", error);
    }
  };

  const handleShare = () => {
    soundFx.playClick();
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      alert("Event link copied to clipboard!");
    }
  };

  const days = Math.floor(countdown / (1000 * 60 * 60 * 24));
  const hours = Math.floor((countdown / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((countdown / (1000 * 60)) % 60);
  const seconds = Math.floor((countdown / 1000) % 60);

  return (
    <div className="min-h-screen bg-[#080b0e] text-slate-100 pb-20 space-y-12">
      {/* Hero Banner */}
      <section className="relative w-full min-h-[500px] md:min-h-[560px] flex items-center overflow-hidden bg-[#080b0e] border-b border-slate-800/80">
        <div className="absolute inset-0 z-0">
          <img
            src={event?.bannerUrl || "/images/onam-hero-art.jpg"}
            alt={event?.title || "Event art"}
            className="w-full h-full object-cover object-center md:object-[right_center]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080b0e] via-[#080b0e]/90 to-transparent w-full md:w-[60%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080b0e] via-transparent to-black/60" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
          <div className="flex items-center gap-2 text-xs text-slate-400 pb-4 font-medium">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>›</span>
            <Link href="/events" className="hover:text-white transition-colors">Events</Link>
            <span>›</span>
            <span className="text-emerald-400 font-bold">{event?.title ?? slug}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{event?.theme?.festivalIcon || "🌼"}</span>
                  <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white tracking-tight">
                    {event?.title ?? "Event"}
                  </h1>
                </div>
                <p className="text-xl sm:text-2xl font-black text-emerald-400 tracking-tight">
                  {event?.tagline ?? "Celebrate. Play. Compete. Win."}
                </p>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                {event?.description ?? "Official event details are served from Convex and update in real time."}
              </p>

              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 text-slate-950 text-[11px] font-black uppercase shadow-md shadow-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />
                  {event?.status ?? "live"}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700 text-slate-200 text-[11px] font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {event ? new Date(event.startDate).toLocaleDateString() : "Loading date"}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700 text-slate-200 text-[11px] font-semibold">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  {event?.participantCount ?? 0} participants
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-3">
                <button
                  onClick={handleJoinEvent}
                  className="px-6 py-3 rounded-xl font-black text-xs sm:text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-xl shadow-emerald-500/30 transition-all hover:scale-105 flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  <span>{registered ? "Registered ✓" : isSignedIn ? "Join Event" : "Sign in to join"}</span>
                </button>
                <button
                  onClick={handleShare}
                  className="px-5 py-3 rounded-xl font-bold text-xs sm:text-sm bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4 text-slate-300" />
                  <span>Share Event</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-end">
              <div className="w-full max-w-sm rounded-2xl bg-[#0c1015]/90 backdrop-blur-xl border border-slate-800 p-5 space-y-4 shadow-2xl">
                <div className="text-center space-y-1">
                  <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                    {countdown > 0 ? "Starts in" : "Event Status"}
                  </span>
                  {countdown > 0 ? (
                    <div className="grid grid-cols-4 gap-2 pt-1">
                      <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-center"><div className="text-2xl font-black text-emerald-400">{days}</div><div className="text-[9px] font-bold text-slate-400 uppercase">Days</div></div>
                      <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-center"><div className="text-2xl font-black text-emerald-400">{hours}</div><div className="text-[9px] font-bold text-slate-400 uppercase">Hours</div></div>
                      <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-center"><div className="text-2xl font-black text-emerald-400">{minutes}</div><div className="text-[9px] font-bold text-slate-400 uppercase">Minutes</div></div>
                      <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-center"><div className="text-2xl font-black text-emerald-400">{seconds}</div><div className="text-[9px] font-bold text-slate-400 uppercase">Seconds</div></div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 font-black text-lg">
                      🔥 EVENT IS LIVE!
                    </div>
                  )}
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center text-xs font-semibold text-slate-300 flex items-center justify-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>{event ? new Date(event.startDate).toLocaleDateString() : "Loading schedule"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Ribbon */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 text-center">
          <div className="p-4 rounded-2xl bg-[#0c1015] border border-slate-800"><div className="text-lg font-black text-white flex items-center justify-center gap-1.5"><Users className="w-4 h-4 text-amber-400" /> {event?.participantCount ?? 0}</div><div className="text-[11px] font-bold text-slate-400 uppercase">Participants</div></div>
          <div className="p-4 rounded-2xl bg-[#0c1015] border border-slate-800"><div className="text-lg font-black text-white flex items-center justify-center gap-1.5"><Gamepad2 className="w-4 h-4 text-emerald-400" /> {activities?.length ?? 3}</div><div className="text-[11px] font-bold text-slate-400 uppercase">Activities</div></div>
          <div className="p-4 rounded-2xl bg-[#0c1015] border border-slate-800"><div className="text-lg font-black text-amber-400 flex items-center justify-center gap-1.5"><Trophy className="w-4 h-4 text-amber-400" /> ₹2,00,000+</div><div className="text-[11px] font-bold text-slate-400 uppercase">Total Prizes</div></div>
          <div className="p-4 rounded-2xl bg-[#0c1015] border border-slate-800"><div className="text-lg font-black text-white flex items-center justify-center gap-1.5"><Globe className="w-4 h-4 text-sky-400" /> 15+</div><div className="text-[11px] font-bold text-slate-400 uppercase">Countries</div></div>
          <div className="p-4 rounded-2xl bg-[#0c1015] border border-slate-800"><div className="text-lg font-black text-white flex items-center justify-center gap-1.5"><Calendar className="w-4 h-4 text-emerald-400" /> {event ? new Date(event.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}</div><div className="text-[11px] font-bold text-slate-400 uppercase">Date</div></div>
        </div>
      </section>

      {/* Activities Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Event Activities & Arenas</h2>
            <p className="text-xs sm:text-sm text-slate-400">Join any competition arena to earn points and claim your ranking.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activities?.map((act) => {
            const icon = getActivityIcon(act.type);
            return (
              <div
                key={act._id}
                className="rounded-3xl glass-card border border-slate-800 hover:border-amber-500/40 p-6 flex flex-col justify-between space-y-6 group transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{icon}</span>
                    <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {act.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white group-hover:text-amber-400 transition-colors">
                    {act.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                    {act.description}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Reward</span>
                    <span className="font-bold text-amber-400">+{act.pointsReward} XP</span>
                  </div>
                  <Link
                    href={`/events/${slug}/${act.slug}`}
                    onClick={() => soundFx.playClick()}
                    className="w-full py-3 rounded-xl font-black text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center gap-1.5 transition-colors shadow-md"
                  >
                    <span>Enter Arena</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Highlights and Rules */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-3xl bg-[#0c1015] border border-slate-800 p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h3 className="text-xl font-black text-white">Event Rules & Prizes</h3>
          </div>
          <div className="space-y-4 text-xs text-slate-300">
            {event?.rules?.map((rule, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center font-bold shrink-0">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{rule}</span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-black text-emerald-300">
                {registered ? "You're registered for this event!" : "Registration is open"}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              All scores, leaderboards, and matches synchronize in real time across the Convex database.
            </p>
            <Link href="/dashboard" className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 pt-1">
              View Player Dashboard →
            </Link>
          </div>
        </div>

        <div className="rounded-3xl bg-[#0c1015] border border-slate-800 p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="text-xl font-black text-white">Championship Prize Breakdown</h3>
          </div>
          <div className="space-y-3">
            {event?.prizes?.map((prize, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white uppercase">{prize.place} - {prize.title}</div>
                  <div className="text-[11px] text-slate-400">{prize.icon}</div>
                </div>
                <div className="text-sm font-black text-amber-400">{prize.reward}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
