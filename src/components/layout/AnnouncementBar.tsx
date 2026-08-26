"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, X, ChevronRight } from "lucide-react";

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="relative bg-gradient-to-r from-amber-600 via-emerald-600 to-amber-600 text-white text-xs sm:text-sm font-medium py-2 px-4 shadow-md z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 mx-auto truncate">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          <Sparkles className="w-4 h-4 text-amber-200 shrink-0 hidden sm:inline" />
          <span className="font-bold text-amber-200">ONAM 2026 IS LIVE!</span>
          <span className="hidden md:inline text-amber-100">
            Compete in Vadamvali Tug of War, Pookalam Designer & Cultural Quiz for ₹100,000+ in prizes.
          </span>
          <Link
            href="/events/onam-2026"
            className="inline-flex items-center gap-1 font-semibold text-white underline underline-offset-2 hover:text-amber-200 transition-colors ml-1"
          >
            Enter Onam Arena <ChevronRight className="w-3 h-3" />
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
