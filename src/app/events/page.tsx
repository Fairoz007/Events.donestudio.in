"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Calendar, ChevronRight } from "lucide-react";
import { soundFx } from "@/lib/sounds";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Doc } from "../../../convex/_generated/dataModel";

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const events = useQuery(api.events.listEvents, {
    category: selectedCategory === "all" ? undefined : selectedCategory,
    status: selectedStatus === "all" ? undefined : selectedStatus,
  });
  const filteredEvents = (events ?? []).filter((e: Doc<"events">) => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.tagline.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold tracking-wider uppercase">
          <Calendar className="w-3.5 h-3.5" /> All Championships & Festivals
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white">
          Events & <span className="gold-gradient-text">Competitions</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base">
          Explore ongoing live festivals, upcoming gaming tournaments, creator showdowns, and seasonal celebrations on the D-One Studio platform.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl space-y-4 border border-slate-800">
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search festivals, tournaments, games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm text-white placeholder-slate-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl glass-input text-xs font-semibold text-slate-200 bg-slate-900"
            >
              <option value="all">All Categories</option>
              <option value="festival">Cultural Festivals</option>
              <option value="gaming">Gaming & Esports</option>
              <option value="creator">Creator Showdowns</option>
              <option value="competition">Community Competitions</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl glass-input text-xs font-semibold text-slate-200 bg-slate-900"
            >
              <option value="all">All Statuses</option>
              <option value="live">Live Now</option>
              <option value="registration_open">Registration Open</option>
              <option value="scheduled">Coming Soon</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {events === undefined ? (
          <div className="col-span-full py-16 text-center text-sm text-slate-400">Loading official events…</div>
        ) : filteredEvents.length === 0 ? (
          <div className="col-span-full py-16 text-center space-y-3">
            <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">No events found</h3>
            <p className="text-sm text-slate-400">
              Try adjusting your search query or filter settings.
            </p>
          </div>
        ) : (
          filteredEvents.map((evt: Doc<"events">) => {
            const isLive = evt.status === "live";

            return (
              <div
                key={evt._id}
                className="rounded-3xl glass-card border border-slate-800/80 overflow-hidden flex flex-col justify-between group hover:border-amber-500/40 transition-all"
              >
                {/* Event Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={evt.bannerUrl}
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase ${
                        isLive
                          ? "bg-amber-500 text-slate-950 animate-pulse"
                          : "bg-slate-900/90 text-slate-300 border border-slate-700"
                      }`}
                    >
                      {isLive ? "Live Now" : "Upcoming"}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-900/90 text-white border border-slate-700">
                      {evt.theme.festivalIcon} {evt.category}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="text-xl font-black text-white truncate">
                      {evt.title}
                    </h3>
                  </div>
                </div>

                {/* Event Info */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {evt.description}
                  </p>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Date</span>
                      <span className="font-semibold text-white">
                        {new Date(evt.startDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-400">
                      <span>Prize</span>
                      <span className="font-bold text-amber-400 truncate max-w-[150px]">
                        {evt.prizes?.[0]?.reward || "Platform XP"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-400">
                      <span>Participants</span>
                      <span className="font-semibold text-white">
                        {evt.participantCount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/events/${evt.slug}`}
                    onClick={() => soundFx.playClick()}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md ${
                      isLive
                        ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:brightness-110 shadow-amber-500/20"
                        : "glass-panel border border-slate-700 text-white hover:bg-slate-800 hover:border-amber-500/40"
                    }`}
                  >
                    {isLive ? "Enter Event Arena" : "View Details"}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
