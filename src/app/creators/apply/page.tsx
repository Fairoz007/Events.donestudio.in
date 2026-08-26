"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Send,
  Youtube,
  Twitch,
  Instagram,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { soundFx } from "@/lib/sounds";
import confetti from "canvas-confetti";

export default function CreatorApplyPage() {
  const { user, isSignedIn } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.displayName || "",
    email: user?.email || "",
    username: user?.username || "",
    platform: "youtube",
    channelName: "",
    channelUrl: "",
    followerCount: 50000,
    country: "IN",
    profileImage: user?.avatarUrl || "",
    description: "",
    whyJoin: "",
    youtubeLink: "",
    instagramLink: "",
    discordLink: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playVictory();
    setSubmitted(true);

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#f59e0b", "#10b981", "#38bdf8"],
    });
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      {/* Back Link */}
      <Link
        href="/creators"
        onClick={() => soundFx.playClick()}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Creators
      </Link>

      {/* Header */}
      <div className="space-y-3 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> D-One Creators Guild Application
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white">
          Join as a <span className="gold-gradient-text">Verified Creator</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
          Are you a YouTuber, streamer, or community influencer? Apply now to receive an official verified creator badge, host tournament rooms, and stream live community matches.
        </p>
      </div>

      {submitted ? (
        <div className="p-8 sm:p-12 rounded-3xl glass-panel-gold border border-amber-500/40 text-center space-y-6 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto text-3xl">
            ✓
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Application Submitted Successfully!
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
              Our admin team has received your application for <strong>{formData.channelName}</strong>. You can review the status from your Player Dashboard or Admin Suite.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/admin"
              onClick={() => soundFx.playClick()}
              className="px-6 py-3 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-500 flex items-center gap-1.5 transition-colors"
            >
              <ShieldCheck className="w-4 h-4" /> Review in Admin Dashboard
            </Link>

            <Link
              href="/dashboard"
              onClick={() => soundFx.playClick()}
              className="px-6 py-3 rounded-xl text-xs sm:text-sm font-bold glass-panel border border-slate-700 text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Go to Player Dashboard
            </Link>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="p-6 sm:p-10 rounded-3xl glass-panel border border-slate-800 space-y-8"
        >
          {/* Section 1: Basic Identity */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider border-b border-slate-800 pb-2">
              1. Creator Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="creator@channel.com"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Platform Handle / Username</label>
                <input
                  type="text"
                  name="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="e.g. rahul_playz"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Primary Platform</label>
                <select
                  name="platform"
                  value={formData.platform}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-slate-200 bg-slate-900"
                >
                  <option value="youtube">YouTube</option>
                  <option value="twitch">Twitch</option>
                  <option value="instagram">Instagram</option>
                  <option value="kick">Kick</option>
                  <option value="other">Other Platform</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Channel & Follower Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider border-b border-slate-800 pb-2">
              2. Channel & Reach
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Channel Name</label>
                <input
                  type="text"
                  name="channelName"
                  required
                  value={formData.channelName}
                  onChange={handleChange}
                  placeholder="e.g. Rahul Playz Gaming"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Channel URL</label>
                <input
                  type="url"
                  name="channelUrl"
                  required
                  value={formData.channelUrl}
                  onChange={handleChange}
                  placeholder="https://youtube.com/@rahulplayz"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Subscriber / Follower Count</label>
                <input
                  type="number"
                  name="followerCount"
                  required
                  value={formData.followerCount}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Country</label>
                <input
                  type="text"
                  name="country"
                  required
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="IN"
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Channel Bio & Content Summary</label>
              <textarea
                name="description"
                rows={3}
                required
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your content style, livestream games, or community audience..."
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Why do you want to join D-One Studio Creators?</label>
              <textarea
                name="whyJoin"
                rows={2}
                required
                value={formData.whyJoin}
                onChange={handleChange}
                placeholder="Tell us what events or tournaments you'd like to host..."
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-2xl font-black text-sm bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 hover:brightness-110 shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
          >
            <Send className="w-4 h-4" /> Submit Application (REQUEST TO JOIN)
          </button>
        </form>
      )}
    </div>
  );
}
