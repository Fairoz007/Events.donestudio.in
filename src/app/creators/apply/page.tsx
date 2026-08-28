"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowLeft,
  Send,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { soundFx } from "@/lib/sounds";
import confetti from "canvas-confetti";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export default function CreatorApplyPage() {
  const { user, isSignedIn } = useAuth();
  const myApp = useQuery(api.creators.getMyApplication, isSignedIn ? {} : "skip");
  const applyMutation = useMutation(api.creators.applyAsCreator);

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    platform: "youtube",
    channelName: "",
    channelUrl: "",
    followerCount: 50000,
    country: "IN",
    profileImage: "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn) {
      alert("Please sign in to submit your application.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);
      soundFx.playClick();

      const effectiveUsername = formData.username.trim() || user?.username || "creator";
      await applyMutation({
        name: formData.name.trim() || user?.displayName || "Creator",
        email: formData.email.trim() || user?.email || "",
        username: effectiveUsername,
        platform: formData.platform as "youtube" | "twitch" | "instagram" | "kick" | "other",
        channelName: formData.channelName.trim(),
        channelUrl: formData.channelUrl.trim(),
        followerCount: Number(formData.followerCount) || 1000,
        country: formData.country.trim() || "IN",
        profileImage: formData.profileImage || user?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${effectiveUsername}`,
        description: formData.description.trim(),
        whyJoin: formData.whyJoin.trim(),
        socialLinks: {
          youtube: formData.youtubeLink ? formData.youtubeLink.trim() : undefined,
          instagram: formData.instagramLink ? formData.instagramLink.trim() : undefined,
          discord: formData.discordLink ? formData.discordLink.trim() : undefined,
        },
      });

      soundFx.playVictory();
      setSubmitted(true);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#f59e0b", "#10b981", "#38bdf8"],
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to submit application";
      setErrorMsg(message);
    } finally {
      setSubmitting(false);
    }
  };

  const isAlreadySubmitted = submitted || myApp?.status === "pending" || myApp?.status === "approved";

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

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {isAlreadySubmitted ? (
        <div className="p-8 sm:p-12 rounded-3xl glass-panel-gold border border-amber-500/40 text-center space-y-6 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto text-3xl">
            ✓
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Application {myApp?.status === "approved" ? "Approved!" : "Under Review"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
              {myApp?.status === "approved"
                ? "Your creator account is approved and active! Check out your profile in the verified directory."
                : `Our admin team has received your application for ${myApp?.channelName || formData.channelName}. You will receive a real-time notification once verified.`}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/creators"
              onClick={() => soundFx.playClick()}
              className="px-6 py-3 rounded-xl text-xs sm:text-sm font-bold bg-amber-500 text-slate-950 hover:brightness-110 shadow-lg shadow-amber-500/20"
            >
              Browse Verified Creators
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
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">
              1. Creator Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Full Name / Creator Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={user?.displayName || ""}
                  value={formData.name || undefined}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs sm:text-sm text-white"
                  placeholder="e.g. Rahul Sharma"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Handle / Username</label>
                <input
                  type="text"
                  name="username"
                  required
                  defaultValue={user?.username || ""}
                  value={formData.username || undefined}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs sm:text-sm text-white lowercase"
                  placeholder="e.g. rahul_gaming"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Channel & Streaming Stats */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">
              2. Channel & Platform Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Primary Platform</label>
                <select
                  name="platform"
                  value={formData.platform}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs sm:text-sm text-white bg-slate-900"
                >
                  <option value="youtube">YouTube</option>
                  <option value="twitch">Twitch</option>
                  <option value="instagram">Instagram</option>
                  <option value="kick">Kick</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Channel / Brand Name</label>
                <input
                  type="text"
                  name="channelName"
                  required
                  value={formData.channelName}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs sm:text-sm text-white"
                  placeholder="e.g. Kerala Gaming Live"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Channel URL</label>
                <input
                  type="url"
                  name="channelUrl"
                  required
                  value={formData.channelUrl}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs sm:text-sm text-white"
                  placeholder="https://youtube.com/@channel"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Subscriber / Follower Count</label>
                <input
                  type="number"
                  name="followerCount"
                  required
                  value={formData.followerCount}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs sm:text-sm text-white"
                  placeholder="50000"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Bio & Motivation */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">
              3. Bio & Community Contribution
            </h3>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Short Creator Bio</label>
                <textarea
                  name="description"
                  required
                  rows={2}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs sm:text-sm text-white"
                  placeholder="Tell us about your content, streams, and audience..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Why do you want to join D-One Creators Guild?</label>
                <textarea
                  name="whyJoin"
                  required
                  rows={2}
                  value={formData.whyJoin}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs sm:text-sm text-white"
                  placeholder="e.g. Hosting live Onam Tug of War streams, casting esports matches..."
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !isSignedIn}
            className="w-full py-4 rounded-2xl font-black text-sm bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:brightness-110 shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? "Submitting Application..." : isSignedIn ? "Submit Creator Application" : "Sign in to Submit"}</span>
          </button>
        </form>
      )}
    </div>
  );
}
