// @ts-nocheck
"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, CalendarClock, Radio, Users } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { soundFx } from "@/lib/sounds";

function formatTime(value?: number) {
  if (!value) return "Configured in Convex";
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Muscat",
  }).format(new Date(value));
}

export function HeroBanner() {
  const summary = useQuery(api.onam.getSummary, { now: Date.now() });
  const event = summary?.event;
  const statusLabel =
    summary?.registrationStatus === "open"
      ? "REGISTRATION OPEN"
      : summary?.registrationStatus === "closed"
        ? "REGISTRATION CLOSED"
        : `Registration opens at ${formatTime(summary?.settings.registrationOpensAt)}`;

  return (
    <section className="relative w-full min-h-[620px] flex items-center overflow-hidden bg-[#080b0e]">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="/images/onam-hero-art.jpg"
          alt="ONAM 2026"
          className="w-full h-full object-cover object-center scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080b0e] via-[#080b0e]/86 to-[#080b0e]/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080b0e] via-transparent to-[#080b0e]/50" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 w-full">
        <div className="max-w-3xl space-y-7">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/40 backdrop-blur-md">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-black tracking-widest text-emerald-400 uppercase">
              {event?.theme.bannerBadge || "LIVE NOW"}
            </span>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-black tracking-[0.3em] text-amber-300 uppercase">D-ONE STUDIO</p>
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black leading-none text-white">
              ONAM <span className="gold-gradient-text">2026</span>
            </h1>
          </div>

          <p className="text-base sm:text-lg text-slate-200 max-w-2xl leading-relaxed">
            {event?.tagline || "The grand Kerala cultural celebration presented by D-One Studio."}
            <br />
            Compete in real-time Vadamvali, create and publish your Digital Pookalam, and test your knowledge in the Onam Cultural Quiz.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
            <div className="rounded-lg border border-slate-700 bg-slate-950/70 p-4">
              <div className="flex items-center gap-2 text-[11px] uppercase font-bold text-slate-400">
                <CalendarClock className="w-4 h-4 text-amber-400" /> Registration
              </div>
              <div className="mt-2 text-sm font-black text-white">{statusLabel}</div>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-950/70 p-4">
              <div className="flex items-center gap-2 text-[11px] uppercase font-bold text-slate-400">
                <Users className="w-4 h-4 text-emerald-400" /> Registered
              </div>
              <div className="mt-2 text-2xl font-black text-white">{summary?.registeredUsers ?? 0}</div>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-950/70 p-4">
              <div className="text-[11px] uppercase font-bold text-slate-400">Current / Next</div>
              <div className="mt-2 text-sm font-black text-white">{summary?.settings.currentActivity || "Registration"}</div>
              <div className="text-xs text-slate-400">{summary?.settings.nextActivity || "Vadamvali Fixture"}</div>
            </div>
          </div>

          <Link
            href="/events/onam-2026"
            onClick={() => soundFx.playClick()}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg font-black text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-xl shadow-emerald-500/30 transition-all"
          >
            ENTER ONAM ARENA
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

