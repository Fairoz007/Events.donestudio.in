"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  CheckCircle2,
  Youtube,
  Instagram,
  ArrowLeft,
  ExternalLink,
  Award,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { soundFx } from "@/lib/sounds";

export default function CreatorProfilePage() {
  const params = useParams();
  const username = params?.username as string;

  const creator = useQuery(api.creators.getCreatorByUsername, username ? { username } : "skip");

  if (creator === undefined) {
    return (
      <div className="min-h-screen py-16 px-4 max-w-5xl mx-auto text-center space-y-4 text-slate-400">
        <p>Loading creator profile…</p>
      </div>
    );
  }

  if (creator === null) {
    return (
      <div className="min-h-screen py-16 px-4 max-w-2xl mx-auto text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-2xl">
          🔍
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white">Creator Not Found</h2>
          <p className="text-xs text-slate-400">No verified creator profile exists with handle @{username}.</p>
        </div>
        <Link
          href="/creators"
          className="inline-flex px-6 py-2.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:brightness-110"
        >
          ← Back to Creator Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-10">
      {/* Back Button */}
      <Link
        href="/creators"
        onClick={() => soundFx.playClick()}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Creator Directory
      </Link>

      {/* Profile Header Banner */}
      <div className="rounded-3xl glass-panel-gold p-8 sm:p-10 border border-amber-500/30 relative overflow-hidden space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <img
            src={creator.avatarUrl}
            alt={creator.displayName}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-amber-500/40 bg-slate-800 shadow-2xl shrink-0"
          />
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl sm:text-4xl font-black text-white">
                {creator.displayName}
              </h1>
              <CheckCircle2 className="w-6 h-6 text-sky-400 fill-sky-400/20" />
            </div>
            <p className="text-sm font-semibold text-amber-400">@{creator.username}</p>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              {creator.bio}
            </p>
          </div>
        </div>

        {/* Creator Stats Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80">
          <div className="p-3 rounded-xl bg-slate-900/60 text-center border border-slate-800">
            <div className="text-lg sm:text-xl font-black text-white">
              {(creator.followerCount / 1000).toFixed(0)}k+
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">Subscribers</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 text-center border border-slate-800">
            <div className="text-lg sm:text-xl font-black text-amber-400">
              {creator.eventsParticipated}
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">Championships</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 text-center border border-slate-800">
            <div className="text-lg sm:text-xl font-black text-emerald-400">Verified</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">Partner Status</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 text-center border border-slate-800">
            <div className="text-lg sm:text-xl font-black text-rose-400">Host</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">Tournament Role</div>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {creator.channelUrl && (
            <a
              href={creator.channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600/20 text-rose-300 border border-rose-500/30 hover:bg-rose-600/30 flex items-center gap-1.5 transition-colors"
            >
              <Youtube className="w-4 h-4 text-rose-500" />
              Visit Channel <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {(creator.socialLinks as any)?.instagram && (
            <a
              href={(creator.socialLinks as any).instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-pink-600/20 text-pink-300 border border-pink-500/30 hover:bg-pink-600/30 flex items-center gap-1.5 transition-colors"
            >
              <Instagram className="w-4 h-4 text-pink-400" />
              Instagram <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {/* Badges & Unlocked Achievements */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-slate-800 space-y-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" /> Creator Badges & Trophies
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {creator.achievements.map((ach) => (
            <div
              key={ach}
              className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl shrink-0">
                🌟
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">{ach}</h4>
                <p className="text-[11px] text-slate-400">Official Creator Guild Milestone</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
