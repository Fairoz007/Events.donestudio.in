"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, X, ChevronRight, AlertCircle, Trophy, Megaphone } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);
  const announcements = useQuery(api.announcements.listGlobalAnnouncements);
  const featuredEvent = useQuery(api.events.getFeaturedEvent);

  if (!isVisible) return null;

  const currentAnnouncement = announcements && announcements.length > 0 ? announcements[0] : null;

  const title = currentAnnouncement?.title || (featuredEvent ? `${featuredEvent.title} IS ACTIVE!` : "D-ONE STUDIO EVENTS");
  const content = currentAnnouncement?.content || (featuredEvent?.tagline || "Join Kerala's premier interactive cultural celebrations, games & tournaments.");
  const linkHref = featuredEvent ? `/events/${featuredEvent.slug}` : "/events";

  const getIcon = () => {
    if (currentAnnouncement?.type === "urgent") return <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />;
    if (currentAnnouncement?.type === "winner") return <Trophy className="w-4 h-4 text-amber-300 shrink-0" />;
    if (currentAnnouncement?.type === "tournament") return <Megaphone className="w-4 h-4 text-emerald-300 shrink-0" />;
    return <Sparkles className="w-4 h-4 text-amber-200 shrink-0" />;
  };

  return (
    <div className="relative bg-gradient-to-r from-amber-600 via-emerald-600 to-amber-600 text-white text-xs sm:text-sm font-medium py-2 px-4 shadow-md z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 mx-auto truncate">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          <span className="hidden sm:inline">{getIcon()}</span>
          <span className="font-bold text-amber-200 uppercase">{title}</span>
          <span className="hidden md:inline text-amber-100 truncate max-w-xl">
            {content}
          </span>
          <Link
            href={linkHref}
            className="inline-flex items-center gap-1 font-semibold text-white underline underline-offset-2 hover:text-amber-200 transition-colors ml-1 shrink-0"
          >
            Enter Arena <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors shrink-0"
          aria-label="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
