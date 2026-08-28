"use client";

import { useMemo } from "react";

/**
 * Returns a timestamp rounded to the nearest 60 seconds.
 * Safe to pass as a Convex useQuery argument without triggering infinite re-renders,
 * unlike raw `Date.now()` which produces a new value on every render.
 */
export function useStableNow() {
  return useMemo(() => Math.floor(Date.now() / 60_000) * 60_000, []);
}
