"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, Heart } from "lucide-react";
import { soundFx } from "@/lib/sounds";

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950/90 text-slate-400 py-10 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 via-amber-600 to-emerald-700 flex items-center justify-center">
              <span className="font-black text-slate-950 text-lg tracking-tighter">D1</span>
            </div>
            <div>
              <div className="font-black text-white text-base tracking-wider">D-ONE STUDIO</div>
              <div className="text-[9px] font-bold text-amber-400 uppercase tracking-widest">ONAM 2026</div>
            </div>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-slate-400">
            A dedicated ONAM 2026 competition platform powered by Clerk authentication and Convex realtime data.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Navigation</h4>
          <ul className="space-y-2.5 text-xs">
            {[
              ["Home", "/"],
              ["ONAM Arena", "/events/onam-2026"],
              ["Leaderboard", "/leaderboards"],
              ["My Onam", "/dashboard"],
            ].map(([label, href]) => (
              <li key={href}>
                <Link href={href} onClick={() => soundFx.playClick()} className="hover:text-amber-400 transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Activities</h4>
          <ul className="space-y-2.5 text-xs">
            {[
              ["Vadamvali", "/events/onam-2026/vadamvali"],
              ["Digital Pookalam", "/events/onam-2026/pookalam"],
              ["Onam Cultural Quiz", "/events/onam-2026/quiz"],
            ].map(([label, href]) => (
              <li key={href}>
                <Link href={href} onClick={() => soundFx.playClick()} className="hover:text-amber-400 transition-colors inline-flex items-center gap-1">
                  {label} <ArrowUpRight className="w-3 h-3" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p>© 2026 D-One Studio ONAM 2026.</p>
        <div className="flex items-center gap-1">
          <span>Built for one festival, one arena</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>D-One Studio</span>
        </div>
      </div>
    </footer>
  );
}
