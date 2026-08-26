"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Users, Play, X } from "lucide-react";
import { soundFx } from "@/lib/sounds";

export function HeroBanner() {
  const [showVideoModal, setShowVideoModal] = useState(false);

  return (
    <section className="relative w-full min-h-[580px] sm:min-h-[640px] md:min-h-[700px] flex items-center overflow-hidden bg-[#080b0e]">
      {/* Background Cinematic Art with Gradient Overlays */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="/images/onam-hero-art.jpg"
          alt="Onam 2026 Festival Celebration"
          className="w-full h-full object-cover object-center sm:object-[center_35%] scale-105 transition-transform duration-1000"
        />
        {/* Left Dark Gradient for text readability matching Image 3 */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#080b0e] via-[#080b0e]/85 to-transparent w-full md:w-[65%]" />
        {/* Top and Bottom Fades */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080b0e] via-transparent to-[#080b0e]/60" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 w-full">
        <div className="max-w-2xl space-y-6">
          {/* Badge: D-ONE STUDIO PRESENTS */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/40 backdrop-blur-md shadow-lg shadow-emerald-500/10">
            <span className="text-[11px] font-black tracking-widest text-emerald-400 uppercase">
              D-ONE STUDIO PRESENTS
            </span>
          </div>

          {/* Main Title: ONAM 2026 */}
          <div className="space-y-1">
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight leading-none text-white drop-shadow-2xl">
              ONAM <span className="gold-gradient-text">2026</span>
            </h1>
            <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-100 pt-2 tracking-tight">
              Celebrate. Play. Compete. Win.
            </p>
          </div>

          {/* Description */}
          <p className="text-sm sm:text-base text-slate-300 max-w-lg leading-relaxed">
            Join the grand celebration of Onam with exciting games, contests, and amazing rewards!
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-3">
            {/* 1. Explore Onam (Green Button) */}
            <Link
              href="/events/onam-2026"
              onClick={() => soundFx.playClick()}
              className="px-7 py-3.5 rounded-xl font-black text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-xl shadow-emerald-500/30 transition-all hover:scale-105 flex items-center gap-2"
            >
              <span>Explore Onam</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {/* 2. Join Event (Dark Outline Button) */}
            <Link
              href="/events/onam-2026"
              onClick={() => soundFx.playClick()}
              className="px-6 py-3.5 rounded-xl font-bold text-sm bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 backdrop-blur-md transition-colors flex items-center gap-2"
            >
              <span>Join Event</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </Link>

            {/* 3. Watch Trailer (Text with Play Icon) */}
            <button
              onClick={() => {
                soundFx.playClick();
                setShowVideoModal(true);
              }}
              className="px-4 py-3.5 text-sm font-bold text-slate-300 hover:text-white flex items-center gap-2.5 transition-colors group"
            >
              <div className="w-8 h-8 rounded-full border border-slate-600 flex items-center justify-center group-hover:border-emerald-400 group-hover:bg-emerald-500/10 transition-colors">
                <Play className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-400 fill-current translate-x-0.5" />
              </div>
              <span>Watch Trailer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Trailer Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-lg animate-in fade-in">
          <div className="relative w-full max-w-4xl rounded-3xl overflow-hidden glass-panel border border-slate-700 aspect-video shadow-2xl">
            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-900/80 text-white flex items-center justify-center hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-4 bg-gradient-to-br from-slate-950 via-emerald-950/30 to-amber-950/30">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-3xl">
                🎬
              </div>
              <h3 className="text-2xl font-black text-white">ONAM 2026 Official Cinematic Trailer</h3>
              <p className="text-sm text-slate-300 max-w-md">
                Experience high-stakes Vadamvali Tug of War multiplayer matches, creative digital Pookalam designing, and cultural folklore quizzes with ₹2,00,000+ in grand prizes!
              </p>
              <Link
                href="/events/onam-2026"
                onClick={() => setShowVideoModal(false)}
                className="px-6 py-3 rounded-xl font-bold text-xs bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
              >
                Enter Onam Arena Now →
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
