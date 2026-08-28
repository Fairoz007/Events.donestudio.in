// @ts-nocheck
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Bell, Check, ExternalLink, MessageSquare } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "@/context/AuthContext";
import { soundFx } from "@/lib/sounds";

function timeAgo(value: number) {
  const minutes = Math.max(0, Math.round((Date.now() - value) / 60000));
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  return `${hours}h`;
}

export function NotificationBell() {
  const { isSignedIn } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const data = useQuery(api.notifications.listMyNotifications, { limit: 20 });
  const markAll = useMutation(api.notifications.markAllAsRead);
  const markOne = useMutation(api.notifications.markAsRead);

  if (!isSignedIn) return null;

  const notifications = data || [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="relative">
      <button
        onClick={() => {
          soundFx.playClick();
          setIsOpen(!isOpen);
        }}
        className="relative p-2 rounded-lg text-slate-300 hover:text-amber-400 hover:bg-slate-800/80 transition-all"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-black">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-lg glass-panel shadow-2xl border border-amber-500/20 z-50 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-white">ONAM Notifications</h3>
              </div>
              {unreadCount > 0 && (
                <button onClick={() => void markAll()} className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">No notifications yet.</div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif._id}
                    onClick={() => void markOne({ id: notif._id })}
                    className={`p-3.5 hover:bg-slate-800/50 transition-colors flex gap-3 items-start cursor-pointer ${
                      !notif.isRead ? "bg-amber-500/5" : ""
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                      <MessageSquare className="w-4 h-4 text-sky-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <p className="text-xs font-semibold text-white truncate">{notif.title}</p>
                        <span className="text-[10px] text-slate-500 shrink-0">{timeAgo(notif.createdAt)}</span>
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{notif.message}</p>
                      {notif.link && (
                        <Link href={notif.link} onClick={() => setIsOpen(false)} className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:underline mt-1.5">
                          View <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

