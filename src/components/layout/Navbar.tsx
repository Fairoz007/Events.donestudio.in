"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { useAuth } from "@/context/AuthContext";
import { soundFx } from "@/lib/sounds";

export function Navbar() {
  const pathname = usePathname();
  const { isSignedIn, isAdmin, isCreator } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Vadamvali", href: "/events/onam-2026/vadamvali" },
    { label: "Pookalam", href: "/events/onam-2026/pookalam" },
    { label: "Quiz", href: "/events/onam-2026/quiz" },
    { label: "Leaderboard", href: "/leaderboards" },
    { label: "My Onam", href: "/dashboard" },
    ...(isCreator ? [{ label: "Streamer Control", href: "/streamer" }] : []),
    ...(isAdmin ? [{ label: "Admin", href: "/admin" }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#080b0e]/90 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        <BrandLogo />

        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((link) => {
            const isActive = link.href === "/" ? pathname === "/" : pathname === link.href || pathname.startsWith(link.href + "/");
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
                {isActive && <span className="absolute bottom-0 left-3.5 right-3.5 h-[2.5px] bg-emerald-500 rounded-t-full" />}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <NotificationBell />
          {isSignedIn ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <SignInButton mode="modal">
              <button className="px-4 py-2 rounded-lg text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950">
                Sign In
              </button>
            </SignInButton>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950 border-b border-slate-800 px-4 py-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => {
                soundFx.playClick();
                setMobileMenuOpen(false);
              }}
              className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
