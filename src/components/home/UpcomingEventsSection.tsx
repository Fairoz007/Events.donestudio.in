"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { soundFx } from "@/lib/sounds";

function getStatusBadge(status: string) {
  switch (status) {
    case "live":
      return { text: "LIVE NOW", color: "bg-emerald-500 text-slate-950 font-black" };
    case "registration_open":
      return { text: "REGISTRATION OPEN", color: "bg-amber-500 text-slate-950 font-black" };
    case "scheduled":
      return { text: "UPCOMING", color: "bg-sky-500/20 text-sky-400 border border-sky-500/30 font-bold" };
    case "completed":
      return { text: "COMPLETED", color: "bg-slate-800 text-slate-400 border border-slate-700 font-bold" };
    default:
      return { text: status.replace("_", " ").toUpperCase(), color: "bg-slate-800 text-slate-300 font-semibold" };
  }
}

function formatDateRange(startDateStr?: string, endDateStr?: string) {
  if (!startDateStr) return "Dates to be announced";
  const start = new Date(startDateStr);
  const end = endDateStr ? new Date(endDateStr) : null;
  const startFmt = start.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  if (!end) return startFmt;
  const endFmt = end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${startFmt} - ${endFmt}`;
}

export function UpcomingEventsSection() {
  const events = useQuery(api.events.listEvents, { status: "all" });

  const avatars = [
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80",
    "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=80&q=80",
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=80&q=80",
    "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=80&q=80",
  ];

  return (
    <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Upcoming & Active Events</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Official D-One Studio competitions and festival arena events.</p>
        </div>

        <Link
          href="/events"
          onClick={() => soundFx.playClick()}
          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-200 border border-slate-700 hover:bg-slate-800 hover:text-white transition-colors shrink-0"
        >
          View All Events
        </Link>
      </div>

      {/* Events Grid */}
      {!events ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="p-12 text-center rounded-2xl glass-panel border border-slate-800">
          <p className="text-slate-400 text-sm">No events currently scheduled.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {events.slice(0, 4).map((evt) => {
            const badge = getStatusBadge(evt.status);
            return (
              <Link
                key={evt._id}
                href={`/events/${evt.slug}`}
                onClick={() => soundFx.playClick()}
                className="group/card block rounded-2xl overflow-hidden bg-[#0e141a] border border-slate-800 hover:border-emerald-500/40 transition-all hover:scale-[1.02] shadow-xl"
              >
                {/* Event Image Container */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                  <img
                    src={evt.bannerUrl || "/images/onam-hero-art.jpg"}
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e141a] via-transparent to-black/30" />

                  {/* Badge Top Left */}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md shadow-md ${badge.color}`}
                    >
                      {badge.text}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-2.5">
                  <h3 className="text-base font-extrabold text-white group-hover/card:text-emerald-400 transition-colors truncate">
                    {evt.title}
                  </h3>

                  <p className="text-xs text-slate-400 font-medium truncate">
                    {formatDateRange(evt.startDate, evt.endDate)}
                  </p>

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
                      {evt.participantCount ? `${evt.participantCount} Players` : "Open for Players"}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
