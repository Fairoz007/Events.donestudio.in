import { query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "./profiles";

// Get Global XP Leaderboard
export const getGlobalLeaderboard = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const profiles = await ctx.db
      .query("profiles")
      .withIndex("by_points")
      .order("desc")
      .take(limit);

    return profiles.map((p, index) => ({
      rank: index + 1,
      clerkUserId: p.clerkUserId,
      username: p.username,
      displayName: p.displayName,
      avatarUrl: p.avatarUrl,
      points: p.points,
      level: p.level,
      role: p.role,
      country: p.country || "IN",
      stats: p.stats,
    }));
  },
});

// Get Vadamvali Tug of War Leaderboard
export const getVadamvaliLeaderboard = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const profiles = await ctx.db.query("profiles").collect();

    // Sort by vadamvaliWins descending
    const sorted = profiles
      .filter((p) => (p.stats?.vadamvaliWins || 0) > 0)
      .sort((a, b) => (b.stats?.vadamvaliWins || 0) - (a.stats?.vadamvaliWins || 0))
      .slice(0, limit);

    return sorted.map((p, index) => {
      const wins = p.stats?.vadamvaliWins || 0;
      const losses = p.stats?.vadamvaliLosses || 0;
      const total = wins + losses;
      const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

      return {
        rank: index + 1,
        clerkUserId: p.clerkUserId,
        username: p.username,
        displayName: p.displayName,
        avatarUrl: p.avatarUrl,
        level: p.level,
        country: p.country || "IN",
        wins: wins,
        losses: losses,
        winRate: winRate,
        points: p.points,
      };
    });
  },
});

// Get Quiz Masters Leaderboard
export const getQuizLeaderboard = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const profiles = await ctx.db.query("profiles").collect();

    const sorted = profiles
      .filter((p) => (p.stats?.quizHighScore || 0) > 0)
      .sort((a, b) => (b.stats?.quizHighScore || 0) - (a.stats?.quizHighScore || 0))
      .slice(0, limit);

    return sorted.map((p, index) => ({
      rank: index + 1,
      clerkUserId: p.clerkUserId,
      username: p.username,
      displayName: p.displayName,
      avatarUrl: p.avatarUrl,
      level: p.level,
      highScore: p.stats?.quizHighScore || 0,
      quizzesTaken: p.stats?.quizzesTaken || 0,
    }));
  },
});

// Get Pookalam Artists Leaderboard
export const getPookalamLeaderboard = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const profiles = await ctx.db.query("profiles").collect();

    const sorted = profiles
      .filter((p) => (p.stats?.pookalamVotesReceived || 0) > 0)
      .sort((a, b) => (b.stats?.pookalamVotesReceived || 0) - (a.stats?.pookalamVotesReceived || 0))
      .slice(0, limit);

    return sorted.map((p, index) => ({
      rank: index + 1,
      clerkUserId: p.clerkUserId,
      username: p.username,
      displayName: p.displayName,
      avatarUrl: p.avatarUrl,
      level: p.level,
      votesReceived: p.stats?.pookalamVotesReceived || 0,
      submissions: p.stats?.pookalamsSubmitted || 0,
    }));
  },
});

// Get current user's personal rank
export const getMyRank = query({
  args: {},
  handler: async (ctx) => {
    const clerkUserId = await getAuthUserId(ctx);
    if (!clerkUserId) return null;

    const allProfiles = await ctx.db
      .query("profiles")
      .withIndex("by_points")
      .order("desc")
      .collect();

    const index = allProfiles.findIndex((p) => p.clerkUserId === clerkUserId);
    if (index === -1) return null;

    const profile = allProfiles[index];
    return {
      rank: index + 1,
      totalUsers: allProfiles.length,
      points: profile.points,
      level: profile.level,
    };
  },
});
