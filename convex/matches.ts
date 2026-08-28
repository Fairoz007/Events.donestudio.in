
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId, getOrEnsureProfile } from "./profiles";
import { requireAdmin, requireUser } from "./lib/auth";
import type { Doc } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

// Generate a memorable 6-char room code, e.g. D1-48291
function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let num = "";
  for (let i = 0; i < 5; i++) {
    num += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `D1-${num}`;
}

async function requirePlayableActivity(ctx: MutationCtx, eventId: Doc<"matches">["eventId"] | undefined, activitySlug: string, clerkUserId: string) {
  let resolvedEventId = eventId;
  if (!resolvedEventId) {
    const featured = await ctx.db.query("events").withIndex("by_featured", q => q.eq("featured", true)).first();
    resolvedEventId = featured?._id;
  }
  if (!resolvedEventId) {
    const anyEvent = await ctx.db.query("events").order("desc").first();
    resolvedEventId = anyEvent?._id;
  }
  if (resolvedEventId) {
    const registration = await ctx.db.query("eventRegistrations").withIndex("by_eventId_and_user", q => q.eq("eventId", resolvedEventId!).eq("clerkUserId", clerkUserId)).first();
    if (!registration) {
      await ctx.db.insert("eventRegistrations", {
        eventId: resolvedEventId,
        clerkUserId,
        registeredAt: Date.now(),
      });
      const event = await ctx.db.get(resolvedEventId);
      if (event) {
        await ctx.db.patch(resolvedEventId, { participantCount: (event.participantCount || 0) + 1, updatedAt: Date.now() });
      }
    }
  }
  return resolvedEventId;
}

// Get match by room code in real-time
export const getMatchByRoomCode = query({
  args: { roomCode: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("matches")
      .withIndex("by_roomCode", (q) => q.eq("roomCode", args.roomCode))
      .first();
  },
});

// Get match by match ID
export const getMatchById = query({
  args: { matchId: v.id("matches") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.matchId);
  },
});

// Create Private Match Room
export const createPrivateRoom = mutation({
  args: {
    activitySlug: v.string(),
    eventId: v.optional(v.id("events")),
  },
  handler: async (ctx, args) => {
    const clerkUserId = await getAuthUserId(ctx);
    if (!clerkUserId) throw new Error("Unauthorized: Please sign in");
    const resolvedEventId = await requirePlayableActivity(ctx, args.eventId, args.activitySlug, clerkUserId);

    const profile = await getOrEnsureProfile(ctx, clerkUserId);
    if (profile.isSuspended || profile.isBanned) {
      throw new Error("Account suspended");
    }

    const roomCode = generateRoomCode();
    const now = Date.now();

    const matchId = await ctx.db.insert("matches", {
      eventId: resolvedEventId,
      activitySlug: args.activitySlug,
      roomCode: roomCode,
      mode: "private",
      player1: {
        clerkUserId: clerkUserId,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
        level: profile.level,
        country: profile.country || "IN",
        isReady: false,
        pulls: 0,
        lastPullTimestamp: now,
      },
      status: "waiting",
      ropePosition: 0,
      antiCheatFlags: [],
      createdAt: now,
      updatedAt: now,
    });

    return { matchId, roomCode };
  },
});

// Join Private Match Room by code
export const joinPrivateRoom = mutation({
  args: {
    roomCode: v.string(),
  },
  handler: async (ctx, args) => {
    const clerkUserId = await getAuthUserId(ctx);
    if (!clerkUserId) throw new Error("Unauthorized: Please sign in");

    const profile = await getOrEnsureProfile(ctx, clerkUserId);

    const match = await ctx.db
      .query("matches")
      .withIndex("by_roomCode", (q) => q.eq("roomCode", args.roomCode.toUpperCase()))
      .first();

    if (!match) throw new Error("Match room not found. Check the code and try again.");

    if (match.player1.clerkUserId === clerkUserId) {
      // Re-joining own room
      return { matchId: match._id, roomCode: match.roomCode };
    }

    if (match.player2 && match.player2.clerkUserId !== clerkUserId) {
      throw new Error("This room is already full.");
    }

    if (match.status === "completed" || match.status === "cancelled") {
      throw new Error("This match has already ended.");
    }

    const now = Date.now();
    await ctx.db.patch(match._id, {
      player2: {
        clerkUserId: clerkUserId,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
        level: profile.level,
        country: profile.country || "IN",
        isReady: false,
        pulls: 0,
        lastPullTimestamp: now,
      },
      status: "lobby",
      updatedAt: now,
    });

    return { matchId: match._id, roomCode: match.roomCode };
  },
});

// Quick Matchmaking
export const findQuickMatch = mutation({
  args: {
    activitySlug: v.string(),
    eventId: v.optional(v.id("events")),
  },
  handler: async (ctx, args) => {
    const clerkUserId = await getAuthUserId(ctx);
    if (!clerkUserId) throw new Error("Unauthorized: Please sign in");
    const resolvedEventId = await requirePlayableActivity(ctx, args.eventId, args.activitySlug, clerkUserId);

    const profile = await getOrEnsureProfile(ctx, clerkUserId);

    const now = Date.now();

    // Check if there is an active waiting quick-match
    const openMatch = await ctx.db
      .query("matches")
      .withIndex("by_status", (q) => q.eq("status", "waiting"))
      .filter((q) =>
        q.and(
          q.eq(q.field("mode"), "quick"),
          q.neq(q.field("player1.clerkUserId"), clerkUserId)
        )
      )
      .first();

    if (openMatch) {
      // Join as player 2
      await ctx.db.patch(openMatch._id, {
        player2: {
          clerkUserId: clerkUserId,
          displayName: profile.displayName,
          avatarUrl: profile.avatarUrl,
          level: profile.level,
          country: profile.country || "IN",
          isReady: true,
          pulls: 0,
          lastPullTimestamp: now,
        },
        status: "countdown",
        startedAt: now + 3000,
        updatedAt: now,
      });

      return { matchId: openMatch._id, roomCode: openMatch.roomCode, role: "player2" };
    }

    // Create a new waiting quick match
    const roomCode = generateRoomCode();
    const matchId = await ctx.db.insert("matches", {
      eventId: resolvedEventId,
      activitySlug: args.activitySlug,
      roomCode: roomCode,
      mode: "quick",
      player1: {
        clerkUserId: clerkUserId,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
        level: profile.level,
        country: profile.country || "IN",
        isReady: true,
        pulls: 0,
        lastPullTimestamp: now,
      },
      status: "waiting",
      ropePosition: 0,
      antiCheatFlags: [],
      createdAt: now,
      updatedAt: now,
    });

    return { matchId, roomCode, role: "player1" };
  },
});


// Set Player Ready in Lobby
export const setPlayerReady = mutation({
  args: {
    matchId: v.id("matches"),
    isReady: v.boolean(),
  },
  handler: async (ctx, args) => {
    const clerkUserId = await getAuthUserId(ctx);
    if (!clerkUserId) throw new Error("Unauthorized");

    const match = await ctx.db.get(args.matchId);
    if (!match) throw new Error("Match not found");

    const now = Date.now();
    const p1 = { ...match.player1 };
    const p2 = match.player2 ? { ...match.player2 } : undefined;

    if (p1.clerkUserId === clerkUserId) {
      p1.isReady = args.isReady;
    } else if (p2 && p2.clerkUserId === clerkUserId) {
      p2.isReady = args.isReady;
    } else {
      throw new Error("You are not a player in this match");
    }

    let newStatus = match.status;
    let startedAt = match.startedAt;

    if (p1.isReady && p2 && p2.isReady) {
      newStatus = "countdown";
      startedAt = now + 3000; // 3 second countdown
    }

    await ctx.db.patch(args.matchId, {
      player1: p1,
      player2: p2,
      status: newStatus,
      startedAt: startedAt,
      updatedAt: now,
    });

    return true;
  },
});

// Start Match from countdown
export const startMatchNow = mutation({
  args: { matchId: v.id("matches") },
  handler: async (ctx, args) => {
    const { identity } = await requireUser(ctx);
    const match = await ctx.db.get(args.matchId);
    if (!match) return;
    if (match.player1.clerkUserId !== identity.subject && match.player2?.clerkUserId !== identity.subject) {
      throw new Error("NOT_A_MATCH_PLAYER");
    }

    if (match.status === "countdown" || match.status === "lobby") {
      await ctx.db.patch(args.matchId, {
        status: "in_progress",
        startedAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

// Pull Rope in Vadamvali (High frequency with server-authoritative validation & anti-cheat)
export const pullRope = mutation({
  args: {
    matchId: v.id("matches"),
    pullPower: v.number(), // typically 1 to 3
    clientTimestamp: v.number(),
  },
  handler: async (ctx, args) => {
    const clerkUserId = await getAuthUserId(ctx);
    if (!clerkUserId) throw new Error("Unauthorized");

    const match = await ctx.db.get(args.matchId);
    if (!match) throw new Error("Match not found");

    if (match.status !== "in_progress" && match.status !== "countdown") {
      return { status: match.status, ropePosition: match.ropePosition };
    }

    const now = Date.now();
    const isPlayer1 = match.player1.clerkUserId === clerkUserId;
    const isPlayer2 = match.player2 && match.player2.clerkUserId === clerkUserId;

    if (!isPlayer1 && !isPlayer2) {
      throw new Error("Not a player in this match");
    }

    const player = isPlayer1 ? match.player1 : match.player2!;
    const timeSinceLastPull = now - player.lastPullTimestamp;

    // Anti-Cheat Check: Maximum 25 pulls per second (40ms interval minimum)
    const antiCheatFlags = [...match.antiCheatFlags];
    let sanitizedPullPower = Math.min(Math.max(args.pullPower, 0.5), 3.0);

    if (timeSinceLastPull < 35) {
      // Suspicious autoclicker rate detected
      if (!antiCheatFlags.includes(`FAST_CLICK_${clerkUserId}`)) {
        antiCheatFlags.push(`FAST_CLICK_${clerkUserId}`);
        await ctx.db.insert("suspiciousActivities", {
          clerkUserId: clerkUserId,
          matchId: match._id,
          reason: "High frequency click rate (> 28 clicks/sec)",
          metrics: { timeDelta: timeSinceLastPull, power: args.pullPower },
          detectedAt: now,
        });
      }
      // Severely penalize automated rapid clicks
      sanitizedPullPower = 0.2;
    }

    // Direction: Player 1 pulls towards -100, Player 2 pulls towards +100
    const delta = isPlayer1 ? -sanitizedPullPower : sanitizedPullPower;
    const newPosition = Math.max(-100, Math.min(100, match.ropePosition + delta));

    const updatedP1 = { ...match.player1 };
    const updatedP2 = { ...match.player2! };

    if (isPlayer1) {
      updatedP1.pulls = (updatedP1.pulls || 0) + 1;
      updatedP1.lastPullTimestamp = now;
    } else {
      updatedP2.pulls = (updatedP2.pulls || 0) + 1;
      updatedP2.lastPullTimestamp = now;
    }

    // Check for Win condition (>= 100 or <= -100)
    let matchStatus: "waiting" | "lobby" | "countdown" | "in_progress" | "completed" | "cancelled" | "disconnected" = match.status === "countdown" ? "in_progress" : match.status;
    let winnerId: string | undefined = undefined;

    if (newPosition <= -100) {
      matchStatus = "completed";
      winnerId = match.player1.clerkUserId;
    } else if (newPosition >= 100) {
      matchStatus = "completed";
      winnerId = match.player2!.clerkUserId;
    }

    const patchData: any = {
      ropePosition: newPosition,
      status: matchStatus,
      player1: updatedP1,
      player2: updatedP2,
      antiCheatFlags: antiCheatFlags,
      updatedAt: now,
    };

    if (winnerId) {
      patchData.winner = winnerId;
      patchData.endedAt = now;
      const duration = Math.round((now - (match.startedAt || match.createdAt)) / 1000);
      patchData.durationSeconds = duration;

      // Update statistics and award XP for winner (+100 XP) and runner-up (+30 XP)
      const loserId = winnerId === match.player1.clerkUserId ? match.player2!.clerkUserId : match.player1.clerkUserId;

      // Award winner points
      const winProfile = await ctx.db
        .query("profiles")
        .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", winnerId!))
        .first();

      if (winProfile) {
        await ctx.db.patch(winProfile._id, {
          points: winProfile.points + 100,
          level: Math.max(1, Math.floor(Math.sqrt((winProfile.points + 100) / 100)) + 1),
          stats: {
            ...winProfile.stats,
            vadamvaliWins: (winProfile.stats.vadamvaliWins || 0) + 1,
          },
          updatedAt: now,
        });

        await ctx.db.insert("notifications", {
          clerkUserId: winnerId,
          title: "Vadamvali Victory! 🏆",
          message: `You won the Tug of War match against ${isPlayer1 ? updatedP2.displayName : updatedP1.displayName}! +100 XP awarded.`,
          type: "match_result",
          link: `/events/onam-2026/vadamvali`,
          isRead: false,
          createdAt: now,
        });
      }

      // Award loser participation XP
      const loseProfile = await ctx.db
        .query("profiles")
        .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", loserId))
        .first();

      if (loseProfile) {
        await ctx.db.patch(loseProfile._id, {
          points: loseProfile.points + 30,
          stats: {
            ...loseProfile.stats,
            vadamvaliLosses: (loseProfile.stats.vadamvaliLosses || 0) + 1,
          },
          updatedAt: now,
        });
      }
    }

    await ctx.db.patch(match._id, patchData);

    return {
      status: matchStatus,
      ropePosition: newPosition,
      winner: winnerId,
    };
  },
});

// List match history for a user
export const listUserMatches = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }
    const clerkUserId = identity.subject;
    const p1Matches = await ctx.db
      .query("matches")
      .withIndex("by_player1", (q) => q.eq("player1.clerkUserId", clerkUserId))
      .order("desc")
      .take(20);

    const allCompleted = await ctx.db
      .query("matches")
      .withIndex("by_status", (q) => q.eq("status", "completed"))
      .order("desc")
      .take(50);

    const p2Matches = allCompleted.filter(
      (m) => m.player2 && m.player2.clerkUserId === clerkUserId
    );

    const combined = [...p1Matches, ...p2Matches].sort((a, b) => b.createdAt - a.createdAt);
    return combined.slice(0, 20);
  },
});

// Public: List live and waiting match rooms for spectating or discovery
export const listPublicLiveMatches = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("matches")
      .filter((q) =>
        q.or(
          q.eq(q.field("status"), "in_progress"),
          q.eq(q.field("status"), "countdown"),
          q.eq(q.field("status"), "lobby"),
          q.eq(q.field("status"), "waiting")
        )
      )
      .order("desc")
      .take(20);
  },
});

// Public: List recent completed matches
export const listRecentMatches = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("matches")
      .withIndex("by_status", (q) => q.eq("status", "completed"))
      .order("desc")
      .take(args.limit || 15);
  },
});

// Admin: List all live matches
export const listLiveMatches = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const live = await ctx.db
      .query("matches")
      .filter((q) =>
        q.or(
          q.eq(q.field("status"), "in_progress"),
          q.eq(q.field("status"), "countdown"),
          q.eq(q.field("status"), "lobby"),
          q.eq(q.field("status"), "waiting")
        )
      )
      .order("desc")
      .take(50);

    return live;
  },
});

// Admin: Terminate match
export const terminateMatch = mutation({
  args: { matchId: v.id("matches"), reason: v.string() },
  handler: async (ctx, args) => {
    const clerkUserId = await getAuthUserId(ctx);
    if (!clerkUserId) throw new Error("Unauthorized");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .first();

    if (!profile || (profile.role !== "admin" && profile.role !== "super_admin")) {
      throw new Error("Forbidden");
    }

    const now = Date.now();
    await ctx.db.patch(args.matchId, {
      status: "cancelled",
      updatedAt: now,
    });

    await ctx.db.insert("adminLogs", {
      adminClerkUserId: clerkUserId,
      adminDisplayName: profile.displayName,
      action: "MATCH_TERMINATED",
      entity: "matches",
      entityId: args.matchId,
      details: { reason: args.reason },
      timestamp: now,
    });

    return true;
  },
});

