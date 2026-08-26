"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft, ArrowRight } from "lucide-react";
import { soundFx } from "@/lib/sounds";

export function UpcomingEventsSection() {
  const events = [
    {
      id: "onam-2026",
      title: "Onam 2026",
      badge: "LIVE NOW",
      badgeColor: "bg-emerald-500 text-slate-950 font-black",
      dates: "Aug 20 - Sep 10, 2026",
      participants: "12.5K+ Participants",
      image: "/images/onam-hero-art.jpg",
      href: "/events/onam-2026",
    },
    {
      id: "gaming-championship",
      title: "Gaming Championship",
      badge: "COMING SOON",
      badgeColor: "bg-sky-500/20 text-sky-400 border border-sky-500/30",
      dates: "Oct 05 - Oct 20, 2026",
      participants: "8.2K+ Participants",
      image: "/images/gaming-card.jpg",
      href: "/events/gaming-championship-2026",
    },
    {
      id: "vishu-celebration",
      title: "Vishu Celebration",
      badge: "COMING SOON",
      badgeColor: "bg-slate-800 text-slate-300 border border-slate-700",
      dates: "Apr 10 - Apr 15, 2026",
      participants: "5.7K+ Participants",
      image: "/images/vishu-card.jpg",
      href: "/events/vishu-celebration-2026",
    },
    {
      id: "christmas-event",
      title: "Christmas Event",
      badge: "COMING SOON",
      badgeColor: "bg-slate-800 text-slate-300 border border-slate-700",
      dates: "Dec 20 - Dec 31, 2026",
      participants: "7.3K+ Participants",
      image: "/images/christmas-card.jpg",
      href: "/events/christmas-carnival-2026",
    },
  ];

  const avatars = [
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80",
    "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=80&q=80",
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=80&q=80",
    "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=80&q=80",
  ];

  return (
    <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Header matching Image 3 */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl sm:text-3xl font-black text-white">Upcoming Events</h2>

        <Link
          href="/events"
          onClick={() => soundFx.playClick()}
          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-200 border border-slate-700 hover:bg-slate-800 hover:text-white transition-colors"
        >
          View All Events
        </Link>
      </div>

      {/* 4 Event Cards in Grid */}
      <div className="relative group">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {events.map((evt) => (
            <Link
              key={evt.id}
              href={evt.href}
              onClick={() => soundFx.playClick()}
              className="group/card block rounded-2xl overflow-hidden bg-[#0e141a] border border-slate-800 hover:border-emerald-500/40 transition-all hover:scale-[1.02] shadow-xl"
            >
              {/* Event Image Container */}
              <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                <img
                  src={evt.image}
                  alt={evt.title}
                  className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e141a] via-transparent to-black/30" />

                {/* Badge Top Left */}
                <div className="absolute top-3 left-3">
                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md shadow-md ${evt.badgeColor}`}
                  >
                    {evt.badge}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-2.5">
                <h3 className="text-base font-extrabold text-white group-hover/card:text-emerald-400 transition-colors">
                  {evt.title}
                </h3>

                <p className="text-xs text-slate-400 font-medium">{evt.dates}</p>

                {/* Participants Avatars Row */}
                <div className="flex items-center gap-2 pt-1">
                  <div className="flex -space-x-1.5 overflow-hidden">
                    {avatars.map((av, idx) => (
                      <img
                        key={idx}
                        src={av}
                        alt="Participant"
                        className="inline-block h-5 w-5 rounded-full ring-2 ring-[#0e141a] object-cover"
                      />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-slate-300">
                    {evt.participants}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
