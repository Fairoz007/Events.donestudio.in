"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Trophy, Users, ShieldCheck, Heart, ArrowUpRight } from "lucide-react";
import { soundFx } from "@/lib/sounds";

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950/90 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 mt-24 relative overflow-hidden">
      {/* Background Subtle Gradient */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-amber-500/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12 relative z-10">
        {/* Brand Column */}
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-emerald-700 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <span className="font-black text-slate-950 text-lg tracking-tighter">D1</span>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-white text-base tracking-wider">
                D-ONE STUDIO
              </span>
              <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest">
                Events Platform
              </span>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-slate-400">
            A production-ready digital events and interactive festival arena powered by Clerk & Convex. Celebrating cultural festivals, gaming tournaments, and creator championships.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <span className="text-xs font-semibold text-slate-300">Live Flagship:</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-bold">
              🌸 ONAM 2026
            </span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
            Navigation
          </h4>
          <ul className="space-y-2.5 text-xs">
            <li>
              <Link
                href="/"
                onClick={() => soundFx.playClick()}
                className="hover:text-amber-400 transition-colors"
              >
                Home Arena
              </Link>
            </li>
            <li>
              <Link
                href="/events"
                onClick={() => soundFx.playClick()}
                className="hover:text-amber-400 transition-colors"
              >
                All Events & Festivals
              </Link>
            </li>
            <li>
              <Link
                href="/events/onam-2026"
                onClick={() => soundFx.playClick()}
                className="text-amber-400 font-semibold hover:underline flex items-center gap-1"
              >
                ONAM 2026 Flagship <ArrowUpRight className="w-3 h-3" />
              </Link>
            </li>
            <li>
              <Link
                href="/leaderboards"
                onClick={() => soundFx.playClick()}
                className="hover:text-amber-400 transition-colors"
              >
                Global Leaderboards
              </Link>
            </li>
            <li>
              <Link
                href="/creators"
                onClick={() => soundFx.playClick()}
                className="hover:text-amber-400 transition-colors"
              >
                Verified Creators Directory
              </Link>
            </li>
          </ul>
        </div>

        {/* Onam Activities */}
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
            Onam 2026 Games
          </h4>
          <ul className="space-y-2.5 text-xs">
            <li>
              <Link
                href="/events/onam-2026/vadamvali"
                onClick={() => soundFx.playClick()}
                className="hover:text-amber-400 transition-colors flex items-center gap-1.5"
              >
                <span>🪢</span> Vadamvali (Tug of War)
              </Link>
            </li>
            <li>
              <Link
                href="/events/onam-2026/pookalam"
                onClick={() => soundFx.playClick()}
                className="hover:text-amber-400 transition-colors flex items-center gap-1.5"
              >
                <span>🌸</span> Digital Pookalam Designer
              </Link>
            </li>
            <li>
              <Link
                href="/events/onam-2026/pookalam/gallery"
                onClick={() => soundFx.playClick()}
                className="hover:text-amber-400 transition-colors flex items-center gap-1.5"
              >
                <span>🗳️</span> Pookalam Voting Gallery
              </Link>
            </li>
            <li>
              <Link
                href="/events/onam-2026/quiz"
                onClick={() => soundFx.playClick()}
                className="hover:text-amber-400 transition-colors flex items-center gap-1.5"
              >
                <span>🎯</span> Cultural Knowledge Quiz
              </Link>
            </li>
          </ul>
        </div>

        {/* Creators & Platform Security */}
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
            Creators & Community
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            Are you a YouTuber, streamer, or gaming creator? Join D-One Studio Creators for exclusive verified tournaments and fan matches.
          </p>
          <Link
            href="/creators/apply"
            onClick={() => soundFx.playClick()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
          >
            <Users className="w-3.5 h-3.5" />
            Apply as Creator
          </Link>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p>© 2026 D-One Studio Events Platform. All rights reserved.</p>
        <div className="flex items-center gap-1">
          <span>Crafted for Onam & global community championships with</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline mx-0.5" />
          <span>by D-One Studio</span>
        </div>
      </div>
    </footer>
  );
}
