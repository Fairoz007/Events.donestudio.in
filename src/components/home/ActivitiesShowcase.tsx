// @ts-nocheck
"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, HelpCircle, Palette, Trophy } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { soundFx } from "@/lib/sounds";

const cards = [
  {
    slug: "vadamvali",
    title: "VADAMVALI",
    text: "Realtime Tug of War Tournament",
    meta: "Best of 3",
    cta: "View Fixture",
    image: "/images/vadamvali-card.jpg",
    icon: Trophy,
  },
  {
    slug: "pookalam",
    title: "DIGITAL POOKALAM",
    text: "Create. Publish. Vote.",
    meta: "Design Pookalam",
    cta: "View Voting",
    image: "/images/pookalam-card.jpg",
    icon: Palette,
  },
  {
    slug: "quiz",
    title: "ONAM CULTURAL QUIZ",
    text: "Test Your Kerala Knowledge",
    meta: "Register",
    cta: "View Schedule",
    image: "/images/quiz-host-card.jpg",
    icon: HelpCircle,
  },
];

export function ActivitiesShowcase() {
  const summary = useQuery(api.onam.getSummary, { now: Date.now() });

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-black tracking-[0.25em] text-amber-300 uppercase">ONAM Activities</p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-black text-white">Three competitions. One event.</h2>
        </div>
        <div className="text-sm text-slate-300">
          Active participants: <span className="font-black text-white">{summary?.activeParticipants ?? 0}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.slug} className="rounded-lg glass-card border border-slate-800 overflow-hidden">
              <div className="relative h-48">
                <img src={card.image} alt={card.title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                <div className="absolute left-4 bottom-4 right-4">
                  <div className="flex items-center gap-2 text-amber-300 text-xs font-black uppercase">
                    <Icon className="w-4 h-4" />
                    {card.meta}
                  </div>
                  <h3 className="mt-1 text-xl font-black text-white">{card.title}</h3>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-sm text-slate-300 min-h-10">{card.text}</p>
                <Link
                  href={`/events/onam-2026/${card.slug}`}
                  onClick={() => soundFx.playClick()}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 py-3 text-sm font-black text-slate-950 hover:bg-emerald-300 transition-colors"
                >
                  {card.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

