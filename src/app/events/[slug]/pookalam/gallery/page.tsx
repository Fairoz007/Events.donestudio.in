// @ts-nocheck
"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { useStableNow } from "@/lib/useStableNow";

export default function PookalamGalleryPage() {
  const now = useStableNow();
  const summary = useQuery(api.onam.getSummary, { now });
  const submissions = useQuery(
    api.pookalam.listGallery,
    summary?.event ? { eventId: summary.event._id, filter: "latest" } : "skip"
  );
  const vote = useMutation(api.pookalam.votePookalam);

  return (
    <main className="min-h-screen bg-[#080b0e] px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <header>
          <p className="text-xs font-black tracking-[0.3em] text-amber-300 uppercase">Digital Pookalam</p>
          <h1 className="mt-2 text-4xl sm:text-5xl font-black text-white">Gallery, Voting, Results</h1>
          <p className="mt-3 text-slate-400">Published designs and votes come from Convex. One user gets one final vote per event.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(submissions || []).length === 0 ? (
            <p className="text-sm text-slate-400">No published Pookalam submissions yet.</p>
          ) : (
            (submissions || []).map((item: any, index: number) => (
              <article key={item._id} className="rounded-lg border border-slate-800 bg-slate-950/70 overflow-hidden">
                <img src={item.previewUrl} alt={item.title} className="h-56 w-full object-cover" />
                <div className="p-4">
                  <div className="text-xs font-bold text-slate-500">Rank {index + 1}</div>
                  <h2 className="mt-1 text-lg font-black text-white">{item.title}</h2>
                  <p className="text-sm text-slate-400">Creator: {item.creatorName}</p>
                  {summary?.settings.pookalamLiveVoteCounts && <p className="mt-2 text-sm font-bold text-emerald-300">Votes: {item.voteCount}</p>}
                  <button onClick={() => void vote({ submissionId: item._id })} className="mt-4 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-black text-slate-950">
                    Vote
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </main>
  );
}

