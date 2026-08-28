import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// Helper to extract authenticated clerk user id
export async function getAuthUserId(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  return identity.tokenIdentifier;
}

// Get the current user's profile
export const getCurrentProfile = query({
  args: {},
  handler: async (ctx) => {
    const clerkUserId = await getAuthUserId(ctx);
    if (!clerkUserId) return null;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .first();

    return profile;
  },
});

// Get public profile by username
export const getProfileByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (!profile) return null;
    return {
      username: profile.username,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      role: profile.role,
      level: profile.level,
      points: profile.points,
      country: profile.country,
      joinDate: profile.joinDate,
      stats: profile.stats,
    };
  },
});

// Get profile by clerkUserId
export const getProfileByClerkId = query({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("profiles")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();
  },
});

// Upsert profile when authenticated via Clerk
export const syncProfile = mutation({
  args: {
    clerkUserId: v.string(),
    email: v.string(),
    displayName: v.string(),
    avatarUrl: v.string(),
    username: v.optional(v.string()),
    country: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const authUserId = await getAuthUserId(ctx);
    if (!authUserId) throw new Error("Unauthorized");

    // Check if profile exists
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", authUserId))
      .first();

    const now = Date.now();
    const cleanUsername =
      args.username ||
      args.email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "") ||
      `user_${Math.floor(1000 + Math.random() * 9000)}`;

    if (existing) {
      // Update basic fields
      await ctx.db.patch(existing._id, {
        displayName: args.displayName || existing.displayName,
        avatarUrl: args.avatarUrl || existing.avatarUrl,
        email: args.email,
        updatedAt: now,
      });
      return existing._id;
    }

    // New profile creation
    const newProfileId = await ctx.db.insert("profiles", {
      clerkUserId: authUserId,
      username: cleanUsername,
      displayName: args.displayName || cleanUsername,
      avatarUrl: args.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
      email: args.email,
      country: args.country || "IN",
      role: "user", // default role
      points: 100, // welcome bonus
      level: 1,
      joinDate: new Date().toISOString().split("T")[0],
      isSuspended: false,
      isBanned: false,
      stats: {
        vadamvaliWins: 0,
        vadamvaliLosses: 0,
        quizzesTaken: 0,
        quizHighScore: 0,
        pookalamsSubmitted: 0,
        pookalamVotesReceived: 0,
      },
      createdAt: now,
      updatedAt: now,
    });

    // Award initial welcome notification
    await ctx.db.insert("notifications", {
      clerkUserId: authUserId,
      title: "Welcome to D-One Studio ONAM 2026",
      message: "Your profile is ready. Register for ONAM 2026, then join Vadamvali, Digital Pookalam, and the Onam Cultural Quiz.",
      type: "system",
      link: "/events/onam-2026",
      isRead: false,
      createdAt: now,
    });

    return newProfileId;
  },
});

// Update editable profile details
export const updateProfile = mutation({
  args: {
    displayName: v.optional(v.string()),
    country: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const clerkUserId = await getAuthUserId(ctx);
    if (!clerkUserId) throw new Error("Unauthorized: Please sign in");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .first();

    if (!profile) throw new Error("Profile not found");
    if (profile.isSuspended || profile.isBanned) {
      throw new Error("Account is suspended or banned");
    }

    const updates: any = { updatedAt: Date.now() };
    if (args.displayName) updates.displayName = args.displayName;
    if (args.country) updates.country = args.country;
    if (args.avatarUrl) updates.avatarUrl = args.avatarUrl;

    await ctx.db.patch(profile._id, updates);
    return true;
  },
});

// Internal mutation to award points and calculate leveling
export const awardPoints = internalMutation({
  args: {
    clerkUserId: v.string(),
    pointsToAdd: v.number(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();

    if (!profile) return null;

    const newPoints = profile.points + args.pointsToAdd;
    // Level formula: Level = Math.floor(Math.sqrt(points / 100)) + 1
    const newLevel = Math.max(1, Math.floor(Math.sqrt(newPoints / 100)) + 1);

    await ctx.db.patch(profile._id, {
      points: newPoints,
      level: newLevel,
      updatedAt: Date.now(),
    });

    if (newLevel > profile.level) {
      // Level up notification
      await ctx.db.insert("notifications", {
        clerkUserId: args.clerkUserId,
        title: `Level Up! Level ${newLevel}`,
        message: `Congratulations! You advanced to Level ${newLevel} (+${args.pointsToAdd} XP from ${args.reason}).`,
        type: "system",
        link: "/dashboard",
        isRead: false,
        createdAt: Date.now(),
      });
    }

    return { points: newPoints, level: newLevel };
  },
});

// ---------------------------------------------------------------------------
// Helper: get existing profile or auto-create a minimal one for the user.
// Used by matches, tournaments, and lib/auth when a mutation context is
// available but the profile might not exist yet (e.g. first action before
// the Clerk webhook arrives).
// ---------------------------------------------------------------------------
export async function getOrEnsureProfile(ctx: any, clerkUserId: string) {
  const existing = await ctx.db
    .query("profiles")
    .withIndex("by_clerkUserId", (q: any) => q.eq("clerkUserId", clerkUserId))
    .first();

  if (existing) return existing;

  const now = Date.now();
  const username = `player_${Math.floor(1000 + Math.random() * 9000)}`;

  const newId = await ctx.db.insert("profiles", {
    clerkUserId,
    username,
    displayName: username,
    avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
    email: `${username}@done-events.com`,
    country: "IN",
    role: "user" as const,
    points: 100,
    level: 1,
    joinDate: new Date().toISOString().split("T")[0],
    isSuspended: false,
    isBanned: false,
    stats: {
      vadamvaliWins: 0,
      vadamvaliLosses: 0,
      quizzesTaken: 0,
      quizHighScore: 0,
      pookalamsSubmitted: 0,
      pookalamVotesReceived: 0,
    },
    createdAt: now,
    updatedAt: now,
  });

  return await ctx.db.get(newId);
}

// ---------------------------------------------------------------------------
// Internal mutation called by the Clerk webhook handler (convex/http.ts)
// to upsert a profile whenever a user is created or updated in Clerk.
// ---------------------------------------------------------------------------
export const syncProfileFromClerk = internalMutation({
  args: {
    clerkUserId: v.string(),
    email: v.string(),
    displayName: v.string(),
    avatarUrl: v.string(),
    username: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        displayName: args.displayName || existing.displayName,
        avatarUrl: args.avatarUrl || existing.avatarUrl,
        email: args.email,
        updatedAt: now,
      });
      return existing._id;
    }

    const cleanUsername =
      args.username ||
      args.email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "") ||
      `user_${Math.floor(1000 + Math.random() * 9000)}`;

    const newId = await ctx.db.insert("profiles", {
      clerkUserId: args.clerkUserId,
      username: cleanUsername,
      displayName: args.displayName || cleanUsername,
      avatarUrl:
        args.avatarUrl ||
        `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
      email: args.email,
      country: "IN",
      role: "user",
      points: 100,
      level: 1,
      joinDate: new Date().toISOString().split("T")[0],
      isSuspended: false,
      isBanned: false,
      stats: {
        vadamvaliWins: 0,
        vadamvaliLosses: 0,
        quizzesTaken: 0,
        quizHighScore: 0,
        pookalamsSubmitted: 0,
        pookalamVotesReceived: 0,
      },
      createdAt: now,
      updatedAt: now,
    });

    return newId;
  },
});

// ---------------------------------------------------------------------------
// Helper: ensure a creatorProfiles row exists for a trusted creator / admin.
// Called from admin.ts during bootstrap and role-grant flows.
// ---------------------------------------------------------------------------
export async function ensureTrustedCreatorProfile(
  ctx: any,
  clerkUserId: string,
  email: string,
  avatarUrl: string
) {
  const existing = await ctx.db
    .query("creatorProfiles")
    .withIndex("by_clerkUserId", (q: any) => q.eq("clerkUserId", clerkUserId))
    .first();

  if (existing) return existing._id;

  const username =
    email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "") ||
    `creator_${Math.floor(1000 + Math.random() * 9000)}`;

  return await ctx.db.insert("creatorProfiles", {
    clerkUserId,
    displayName: username,
    username,
    avatarUrl:
      avatarUrl ||
      `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
    platform: "other",
    channelName: username,
    channelUrl: "",
    followerCount: 0,
    bio: "",
    socialLinks: {},
    verified: true,
    featured: false,
    eventsParticipated: 0,
    achievements: [],
    createdAt: Date.now(),
  });
}

