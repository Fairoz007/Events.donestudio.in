"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Bell, Check, Sparkles, Trophy, MessageSquare, ExternalLink } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useAuth } from "@/context/AuthContext";
import { soundFx } from "@/lib/sounds";

function formatRelativeTime(timestamp: number) {
  const diffMs = Date.now() - timestamp;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationBell() {
  const { isSignedIn } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const notifications = useQuery(api.notifications.listMyNotifications, isSignedIn ? { limit: 20 } : "skip");
  const unreadCount = useQuery(api.notifications.getUnreadCount, isSignedIn ? {} : "skip") ?? 0;

  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);

  if (!isSignedIn) return null;

  const handleToggle = () => {
    soundFx.playClick();
    setIsOpen(!isOpen);
  };

  const handleMarkAllRead = async () => {
    soundFx.playClick();
    await markAllAsRead();
  };

  const handleMarkSingleRead = async (id: Id<"notifications">) => {
    await markAsRead({ id });
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-lg text-slate-300 hover:text-amber-400 hover:bg-slate-800/80 transition-all"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-black shadow-lg animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-[min(24rem,calc(100vw-2rem))] rounded-2xl glass-panel shadow-2xl border border-amber-500/20 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-xs bg-amber-500/20 text-amber-400 font-semibold px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
                >
                  <Check className="w-3 h-3" /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
              {!notifications || notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  No notifications yet.
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif._id}
                    onClick={() => handleMarkSingleRead(notif._id)}
                    className={`p-3.5 hover:bg-slate-800/50 transition-colors flex gap-3 items-start cursor-pointer ${
                      !notif.isRead ? "bg-amber-500/5" : ""
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                      {notif.type === "match_result" ? (
                        <Trophy className="w-4 h-4 text-amber-400" />
                      ) : notif.type === "pookalam_vote" || notif.type === "pookalam_winner" ? (
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <MessageSquare className="w-4 h-4 text-sky-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <p className="text-xs font-semibold text-white truncate">
                          {notif.title}
                        </p>
                        <span className="text-[10px] text-slate-500 shrink-0">
                          {formatRelativeTime(notif.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>
                      {notif.link && (
                        <Link
                          href={notif.link}
                          onClick={() => setIsOpen(false)}
                          className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:underline mt-1.5"
                        >
                          View details <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-2.5 text-center bg-slate-950/80 border-t border-slate-800">
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="text-xs text-slate-400 hover:text-amber-400 transition-colors"
              >
                Go to Player Dashboard
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
