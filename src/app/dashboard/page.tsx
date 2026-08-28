// @ts-nocheck
"use client";

import Link from "next/link";
import { SignInButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Bell, CalendarClock, FileCheck, Palette, Trophy } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useStableNow } from "@/lib/useStableNow";

function fmt(value?: number) {
  if (!value) return "Not scheduled";
  return new Intl.DateTimeFormat("en", { timeStyle: "short", dateStyle: "medium", timeZone: "Asia/Muscat" }).format(new Date(value));
}

export default function DashboardPage() {
  const { isSignedIn } = useAuth();
  const data = useQuery(api.onam.getMyOnam, {});

  if (!isSignedIn) {
    return (
      <main className="min-h-screen bg-[#080b0e] px-4 py-20 text-center">
        <h1 className="text-4xl font-black text-white">My ONAM 2026</h1>
        <p className="mt-3 text-slate-400">Sign in with Clerk to view registrations, matches, Pookalam, quiz, and notifications.</p>
        <SignInButton mode="modal">
          <button className="mt-6 rounded-lg bg-emerald-500 px-5 py-3 text-sm font-black text-slate-950">Sign In</button>
        </SignInButton>
      </main>
    );
  }

  const registered = !!data?.eventRegistration;
  const activityBySlug = new Map((data?.activityRegistrations || []).map((r) => [r.activitySlug, r]));

  return (
    <main className="min-h-screen bg-[#080b0e] px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <header>
          <p className="text-xs font-black tracking-[0.3em] text-amber-300 uppercase">My ONAM 2026</p>
          <h1 className="mt-2 text-4xl sm:text-5xl font-black text-white">Dashboard</h1>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-5">
            <FileCheck className="w-5 h-5 text-emerald-300" />
            <div className="mt-3 text-xs font-bold uppercase text-slate-400">ONAM registration</div>
            <div className="mt-1 text-lg font-black text-white">{registered ? "Registered" : "Not registered"}</div>
            <div className="text-sm text-slate-400">{registered ? fmt(data?.eventRegistration?.registeredAt) : "Register on the ONAM arena page."}</div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-5">
            <Trophy className="w-5 h-5 text-amber-300" />
            <div className="mt-3 text-xs font-bold uppercase text-slate-400">Upcoming match</div>
            <div className="mt-1 text-lg font-black text-white">
              {data?.upcomingMatch ? `${data.upcomingMatch.player1Name || "TBD"} vs ${data.upcomingMatch.player2Name || "TBD"}` : "No match yet"}
            </div>
            <div className="text-sm text-slate-400">Expected Start: {fmt(data?.upcomingMatch?.expectedStartAt)}</div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-5">
            <Palette className="w-5 h-5 text-pink-300" />
            <div className="mt-3 text-xs font-bold uppercase text-slate-400">My Pookalam</div>
            <div className="mt-1 text-lg font-black text-white">{data?.pookalam?.isSubmitted ? "Submitted" : data?.pookalam ? "Draft" : "Not started"}</div>
            <Link href="/events/onam-2026/pookalam" className="text-sm font-bold text-emerald-300">Open Pookalam</Link>
          </div>
        </section>

        <section className="rounded-lg border border-slate-800 bg-slate-950/70 p-5">
          <h2 className="text-xl font-black text-white">MY REGISTRATIONS</h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
            <RegistrationCard title="ONAM 2026" status={registered ? "Registered" : "Not registered"} refText={data?.eventRegistration?.registrationRef} />
            <RegistrationCard title="Vadamvali" status={activityBySlug.has("vadamvali") ? "Registered" : "Not registered"} refText={activityBySlug.get("vadamvali")?.registrationRef} />
            <RegistrationCard title="Pookalam" status={activityBySlug.has("pookalam") ? "Participating" : "Not participating"} refText={activityBySlug.get("pookalam")?.registrationRef} />
            <RegistrationCard title="Onam Quiz" status={activityBySlug.has("quiz") ? "Registered" : "Not registered"} refText={activityBySlug.get("quiz")?.registrationRef} />
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel title="Match History" icon={<CalendarClock className="w-5 h-5 text-amber-300" />}>
            {(data?.matchHistory || []).length === 0 ? (
              <p className="text-sm text-slate-400">No completed Vadamvali matches yet.</p>
            ) : (
              data?.matchHistory.map((match) => (
                <div key={match._id} className="rounded-lg border border-slate-800 p-3 text-sm text-slate-300">
                  {match.player1Name || "TBD"} vs {match.player2Name || "TBD"} · {match.status}
                </div>
              ))
            )}
          </Panel>
          <Panel title="Notifications" icon={<Bell className="w-5 h-5 text-sky-300" />}>
            {(data?.notifications || []).length === 0 ? (
              <p className="text-sm text-slate-400">No notifications yet.</p>
            ) : (
              data?.notifications.slice(0, 8).map((item) => (
                <div key={item._id} className="rounded-lg border border-slate-800 p-3">
                  <div className="text-sm font-bold text-white">{item.title}</div>
                  <p className="text-xs text-slate-400">{item.message}</p>
                </div>
              ))
            )}
          </Panel>
        </section>
      </div>
    </main>
  );
}

function RegistrationCard({ title, status, refText }: { title: string; status: string; refText?: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
      <div className="text-sm font-black text-white">{title}</div>
      <div className="mt-1 text-xs font-bold text-emerald-300">{status}</div>
      {refText && <div className="mt-2 text-xs text-slate-400">Registration {refText}</div>}
    </div>
  );
}

function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950/70 p-5">
      <h2 className="flex items-center gap-2 text-xl font-black text-white">
        {icon}
        {title}
      </h2>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

