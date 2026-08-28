"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PookalamCanvas } from "@/components/pookalam/PookalamCanvas";

export default function PookalamPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "onam-2026";
  const tabs = [
    { label: "Create", href: `/events/${slug}/pookalam` },
    { label: "Gallery", href: `/events/${slug}/pookalam/gallery` },
    { label: "Voting", href: `/events/${slug}/pookalam/gallery?tab=voting` },
    { label: "Leaderboard", href: `/leaderboards?category=pookalam` },
    { label: "My Pookalam", href: `/events/${slug}/pookalam#my-pookalam` },
  ];

  return (
    <div className="space-y-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.label}
            href={tab.href}
            className="px-3.5 py-2 rounded-xl text-xs font-black uppercase glass-panel border border-slate-800 text-slate-200 hover:border-amber-500/40"
          >
            {tab.label}
          </Link>
        ))}
      </div>
      <PookalamCanvas eventSlug={slug} />
    </div>
  );
}
