// @ts-nocheck
"use client";

import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { ArrowRight, CalendarClock, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useStableNow } from "@/lib/useStableNow";

function fmt(value?: number) {
  if (!value) return "Configured in Convex";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Muscat" }).format(new Date(value));
}

export default function OnamEventPage() {
  const { isSignedIn } = useAuth();
  const now = useStableNow();
  const summary = useQuery(api.onam.getSummary, { now });
  const register = useMutation(api.onam.registerForOnam);

  return (
    <main className="min-h-screen bg-[#080b0e]">
      <section className="relative overflow-hidden">
        <img src="/images/onam-hero-art.jpg" alt="ONAM 2026" className="absolute inset-0 h-full w-full object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#080b0e]/70 to-[#080b0e]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-3xl">
            <p className="text-xs font-black tracking-[0.3em] text-amber-300 uppercase">D-ONE STUDIO</p>
            <h1 className="mt-3 text-5xl sm:text-7xl font-black text-white">ONAM 2026</h1>
            <p className="mt-5 text-lg text-slate-200 leading-relaxed">
              The grand Kerala cultural celebration presented by D-One Studio. Register once for ONAM 2026, then join Vadamvali, Digital Pookalam, and the Onam Cultural Quiz.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                disabled={!isSignedIn || summary?.registrationStatus !== "open"}
                onClick={() => void register()}
                className="rounded-lg bg-emerald-500 px-5 py-3 text-sm font-black text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
              >
                {summary?.registrationStatus === "open" ? "Register for ONAM 2026" : `Registration opens at ${fmt(summary?.settings.registrationOpensAt)}`}
              </button>
              <Link href="/dashboard" className="rounded-lg border border-slate-700 px-5 py-3 text-sm font-black text-white hover:bg-slate-900">
                My Onam
              </Link>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-5">
              <CalendarClock className="w-5 h-5 text-amber-300" />
              <div className="mt-3 text-xs font-bold uppercase text-slate-400">Registration</div>
              <div className="mt-1 text-lg font-black text-white">{summary?.registrationStatus === "open" ? "REGISTRATION OPEN" : summary?.registrationStatus === "closed" ? "Closed" : fmt(summary?.settings.registrationOpensAt)}</div>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-5">
              <Users className="w-5 h-5 text-emerald-300" />
              <div className="mt-3 text-xs font-bold uppercase text-slate-400">Registered Users</div>
              <div className="mt-1 text-3xl font-black text-white">{summary?.registeredUsers ?? 0}</div>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-5">
              <div className="text-xs font-bold uppercase text-slate-400">Current / Next Activity</div>
              <div className="mt-3 text-lg font-black text-white">{summary?.settings.currentActivity || "Registration"}</div>
              <div className="text-sm text-slate-400">{summary?.settings.nextActivity || "Fixture generation"}</div>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              ["Vadamvali", "Best-of-3, one live match at a time.", "/events/onam-2026/vadamvali"],
              ["Digital Pookalam", "Create, publish, vote, and view results.", "/events/onam-2026/pookalam"],
              ["Onam Cultural Quiz", "Register, wait in lobby, play when the host starts.", "/events/onam-2026/quiz"],
            ].map(([title, text, href]) => (
              <Link key={title} href={href} className="rounded-lg border border-slate-800 bg-slate-950/70 p-5 hover:border-emerald-500/60">
                <h2 className="text-xl font-black text-white">{title}</h2>
                <p className="mt-2 text-sm text-slate-400">{text}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-emerald-300">
                  Open <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

