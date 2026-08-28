"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ChevronDown, Menu, X, ShieldCheck, UserCheck, LogOut } from "lucide-react";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { useAuth } from "@/context/AuthContext";
import { soundFx } from "@/lib/sounds";
import { useClerk, useUser } from "@clerk/nextjs";

export function Navbar() {
  const pathname = usePathname();
  const { user, isSignedIn, isAdmin, isClerkSignedIn } = useAuth();
  const { openSignIn, signOut } = useClerk();
  const { user: clerkUser } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Events", href: "/events" },
    { label: "Live Events", href: "/events/onam-2026" },
    { label: "Upcoming", href: "/events" },
    { label: "Leaderboards", href: "/leaderboards" },
    { label: "Creators", href: "/creators" },
    { label: "Community", href: "/creators" },
    { label: "About Us", href: "/events/onam-2026#about" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#080b0e]/90 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <BrandLogo />

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname === link.href || pathname.startsWith(link.href + "/");

            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => soundFx.playClick()}
                className={`relative px-3.5 py-5 text-[13px] font-medium transition-colors hover:text-white ${
                  isActive ? "text-white font-bold" : "text-slate-300"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-3.5 right-3.5 h-[2.5px] bg-emerald-500 rounded-t-full shadow-[0_-2px_8px_rgba(34,197,94,0.6)]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Controls: Search, Notifications, User Menu / Auth Buttons */}
        <div className="flex min-w-0 items-center gap-1 sm:gap-2 lg:gap-3">
          {/* Search Trigger */}
          <button
            onClick={() => {
              soundFx.playClick();
              setShowSearchModal(true);
            }}
            className="hidden sm:flex w-9 h-9 rounded-xl items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
            title="Search events & creators"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Notifications */}
          <NotificationBell />

          {/* User Account Dropdown or Login / Join Now Buttons */}
          {isClerkSignedIn || clerkUser ? (
            <div className="relative">
              <button
                onClick={() => {
                  soundFx.playClick();
                  setShowUserDropdown(!showUserDropdown);
                }}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-800/80 transition-colors group"
              >
                <img
                  src={user?.avatarUrl || clerkUser?.imageUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=member"}
                  alt={user?.displayName || clerkUser?.fullName || "Account"}
                  className="w-8 h-8 rounded-xl object-cover border border-emerald-500/40 bg-slate-800"
                />
                <span className="text-xs font-bold text-white hidden sm:inline">
                  {user?.displayName || clerkUser?.fullName || "Account"}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
              </button>

              {/* User Dropdown */}
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-panel-gold p-2 shadow-2xl border border-amber-500/30 space-y-1 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <div className="text-xs font-black text-white">{user?.displayName || clerkUser?.fullName || "Account"}</div>
                    <div className="text-[11px] text-amber-400">
                      {user ? `Level ${user.level} • ${user.points} XP` : "Connecting profile…"}
                    </div>
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => {
                      soundFx.playClick();
                      setShowUserDropdown(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-slate-800 font-semibold"
                  >
                    <UserCheck className="w-4 h-4 text-emerald-400" /> Player Dashboard
                  </Link>

                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => {
                        soundFx.playClick();
                        setShowUserDropdown(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-slate-800 font-semibold"
                    >
                      <ShieldCheck className="w-4 h-4 text-amber-400" /> Admin Dashboard
                    </Link>
                  )}

                  <div className="pt-2 border-t border-slate-800 space-y-1">
                    <button onClick={() => void signOut()} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800">
                      <LogOut className="w-4 h-4" /> Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => {
                  soundFx.playClick();
                  if (!clerkUser && !isClerkSignedIn) {
                    openSignIn();
                  }
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-200 border border-slate-700 hover:bg-slate-800 transition-colors"
              >
                Login
              </button>
              <Link
                href="/events/onam-2026"
                onClick={() => soundFx.playClick()}
                className="hidden md:inline-flex px-4 py-2 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-colors"
              >
                Join Now
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[var(--mobile-nav-top,7rem)] bottom-0 z-50 bg-slate-950/98 border-b border-slate-800 px-4 py-4 space-y-2 overflow-y-auto animate-in slide-in-from-top-2">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => {
                soundFx.playClick();
                setMobileMenuOpen(false);
              }}
              className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          {!isClerkSignedIn && !clerkUser && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openSignIn();
              }}
              className="w-full min-h-11 rounded-xl bg-emerald-500 px-4 py-3 text-left text-sm font-black text-slate-950"
            >
              Sign in / Join
            </button>
          )}
        </div>
      )}

      {/* Global Quick Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-xl glass-panel p-6 rounded-3xl border border-slate-700 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Search className="w-4 h-4 text-emerald-400" /> Search D-One Events & Activities
              </h3>
              <button
                onClick={() => setShowSearchModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ESC ✕
              </button>
            </div>

            <input
              type="text"
              autoFocus
              placeholder="Search Onam, Vadamvali, Pookalam, Quiz, Gaming, Creators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl glass-input text-sm text-white"
            />

            <div className="space-y-1.5 pt-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Quick Jumps</span>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/events/onam-2026"
                  onClick={() => setShowSearchModal(false)}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-semibold text-white hover:border-emerald-500/50 flex items-center justify-between"
                >
                  <span>🎉 ONAM 2026 Arena</span>
                  <span className="text-emerald-400">Live</span>
                </Link>
                <Link
                  href="/events/onam-2026/vadamvali"
                  onClick={() => setShowSearchModal(false)}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-semibold text-white hover:border-amber-500/50 flex items-center justify-between"
                >
                  <span>🪢 Vadamvali 1v1</span>
                  <span className="text-amber-400">Game</span>
                </Link>
                <Link
                  href="/events/onam-2026/pookalam"
                  onClick={() => setShowSearchModal(false)}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-semibold text-white hover:border-pink-500/50 flex items-center justify-between"
                >
                  <span>🌸 Pookalam Canvas</span>
                  <span className="text-pink-400">Designer</span>
                </Link>
                <Link
                  href="/leaderboards"
                  onClick={() => setShowSearchModal(false)}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-semibold text-white hover:border-sky-500/50 flex items-center justify-between"
                >
                  <span>🏆 Leaderboards</span>
                  <span className="text-sky-400">Rankings</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
