import { query, mutation, internalQuery, internalMutation } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { v } from "convex/values";

const TRUSTED_ADMIN_EMAILS = new Set(["fairozfaisal2001@gmail.com"]);
const TRUSTED_SUPER_ADMIN_EMAILS = new Set(["fairozfaisal2001@gmail.com"]);

const HOOK_GAMING_CREATOR = {
  displayName: "The Hook",
  username: "hook",
  channelName: "Hook Gaming",
  channelUrl: "https://www.youtube.com/@Thehook",
  platform: "youtube" as const,
  followerCount: 1000,
  country: "IN",
  profileImage: null,
  status: "approved" as const,
  description: "Gaming creator profile for Hook Gaming",
  whyJoin: "To share gaming content, community events, and creator collaborations with D-One Studio",
  bio: "Gaming creator profile for Hook Gaming",
  socialLinks: {
    youtube: "https://www.youtube.com/@Thehook",
    twitter: null,
    instagram: null,
    discord: null,
  },
  avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=hook-gaming",
};

function resolveProfileRole(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (TRUSTED_ADMIN_EMAILS.has(normalizedEmail)) return "admin" as const;
  return "user" as const;
}

export async function ensureTrustedCreatorProfile(
  ctx: MutationCtx,
  clerkUserId: string,
  email: string,
  avatarUrl?: string | null
) {
  const normalizedEmail = email.trim().toLowerCase();
  if (normalizedEmail !== "fairozfaisal2001@gmail.com") return;

  const now = Date.now();
  const creatorAvatar = avatarUrl || HOOK_GAMING_CREATOR.avatarUrl;

  // 1. Ensure approved creator application is recorded
  const existingApp = await ctx.db
    .query("creatorApplications")
    .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
    .first();

  const appData = {
    clerkUserId,
    name: HOOK_GAMING_CREATOR.displayName,
    email: normalizedEmail,
    username: HOOK_GAMING_CREATOR.username,
    platform: HOOK_GAMING_CREATOR.platform,
    channelName: HOOK_GAMING_CREATOR.channelName,
    channelUrl: HOOK_GAMING_CREATOR.channelUrl,
    followerCount: HOOK_GAMING_CREATOR.followerCount,
    country: HOOK_GAMING_CREATOR.country,
    profileImage: creatorAvatar,
    description: HOOK_GAMING_CREATOR.description,
    whyJoin: HOOK_GAMING_CREATOR.whyJoin,
    socialLinks: HOOK_GAMING_CREATOR.socialLinks,
    status: "approved" as const,
    adminNotes: "Approved admin Creator profile for event hosting",
    reviewedBy: clerkUserId,
    reviewedAt: now,
    updatedAt: now,
  };

  if (existingApp) {
    await ctx.db.patch(existingApp._id, appData);
  } else {
    await ctx.db.insert("creatorApplications", {
      ...appData,
      createdAt: now,
    });
  }

  // 2. Ensure verified Creator Profile is recorded
  const existingCreator = await ctx.db
    .query("creatorProfiles")
    .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
    .first();

  const creatorData = {
    clerkUserId,
    displayName: HOOK_GAMING_CREATOR.displayName,
    username: HOOK_GAMING_CREATOR.username,
    avatarUrl: creatorAvatar,
    platform: HOOK_GAMING_CREATOR.platform,
    channelName: HOOK_GAMING_CREATOR.channelName,
    channelUrl: HOOK_GAMING_CREATOR.channelUrl,
    followerCount: HOOK_GAMING_CREATOR.followerCount,
    bio: HOOK_GAMING_CREATOR.bio,
    socialLinks: {
      youtube: HOOK_GAMING_CREATOR.socialLinks.youtube,
      instagram: null,
      discord: null,
      twitter: null,
    },
    verified: true,
    featured: true,
    eventsParticipated: 1,
    achievements: ["Verified Creator", "Hook Gaming", "Event Host"],
    canHostEvents: true,
    updatedAt: now,
  };

  if (existingCreator) {
    await ctx.db.patch(existingCreator._id, creatorData);
  } else {
    await ctx.db.insert("creatorProfiles", {
      ...creatorData,
      createdAt: now,
    });
  }
}

// Helper to extract authenticated clerk user id
export async function getAuthUserId(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  return identity.subject; // Clerk User ID
}

// Ensure or get existing user profile
export async function getOrEnsureProfile(ctx: MutationCtx, clerkUserId: string) {
  let profile = await ctx.db
    .query("profiles")
    .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
    .first();

  if (profile) return profile;

  const identity = await ctx.auth.getUserIdentity();
  const email = (identity?.email || "").trim().toLowerCase();
  if (email) {
    profile = await ctx.db
      .query("profiles")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    if (profile) {
      await ctx.db.patch(profile._id, { clerkUserId, updatedAt: Date.now() });
      return profile;
    }
  }

  const isTrustedAdmin = TRUSTED_ADMIN_EMAILS.has(email);
  const cleanUsername =
    (isTrustedAdmin ? "hook" : null) ||
    (email ? email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "") : null) ||
    `user_${Math.floor(1000 + Math.random() * 9000)}`;

  const autoRole = resolveProfileRole(email);
  const roleToStore = isTrustedAdmin ? "super_admin" : autoRole;
  const canHostEvents = true;
  const now = Date.now();

  const newProfileId = await ctx.db.insert("profiles", {
    clerkUserId,
    username: isTrustedAdmin ? "hook" : cleanUsername,
    displayName: isTrustedAdmin ? "The Hook" : ((identity?.name as string | undefined) || cleanUsername),
    avatarUrl: (identity?.pictureUrl as string | undefined) || `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
    email,
    country: "IN",
    role: roleToStore,
    canHostEvents,
    points: isTrustedAdmin ? 1000 : 100,
    level: isTrustedAdmin ? 4 : 1,
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

  if (isTrustedAdmin || roleToStore === "super_admin" || roleToStore === "admin") {
    await ensureTrustedCreatorProfile(
      ctx,
      clerkUserId,
      email || "fairozfaisal2001@gmail.com",
      (identity?.pictureUrl as string | undefined)
    );
  }

  return (await ctx.db.get(newProfileId))!;
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
      canHostEvents: profile.canHostEvents,
      level: profile.level,
      points: profile.points,
      country: profile.country,
      joinDate: profile.joinDate,
      stats: profile.stats,
    };
  },
});

// Get profile by clerkUserId
export const getProfileByClerkId = internalQuery({
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
    displayName: v.string(),
    avatarUrl: v.string(),
    email: v.optional(v.string()),
    username: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("UNAUTHENTICATED");
    const clerkUserId = identity.subject;
    const email = (args.email || identity.email || "").trim().toLowerCase();
    const isTrustedAdmin = TRUSTED_ADMIN_EMAILS.has(email);

    // Check if profile exists by clerkUserId or by email
    let existing = await ctx.db
      .query("profiles")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .first();

    if (!existing && email) {
      existing = await ctx.db
        .query("profiles")
        .withIndex("by_email", (q) => q.eq("email", email))
        .first();
    }

    const now = Date.now();
    const cleanUsername =
      args.username ||
      (isTrustedAdmin ? "hook" : null) ||
      (email ? email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "") : null) ||
      `user_${Math.floor(1000 + Math.random() * 9000)}`;

    if (existing) {
      const autoRole = resolveProfileRole(email || existing.email || "");
      const roleToStore =
        existing.role === "super_admin" || existing.role === "admin"
          ? existing.role
          : isTrustedAdmin
            ? "super_admin"
            : autoRole === "user"
              ? existing.role
              : autoRole;

      const canHostEvents = true;

      await ctx.db.patch(existing._id, {
        clerkUserId,
        displayName: isTrustedAdmin ? "The Hook" : (args.displayName || existing.displayName),
        avatarUrl: args.avatarUrl || existing.avatarUrl,
        email: email || existing.email || "",
        username: isTrustedAdmin ? "hook" : (existing.username || cleanUsername),
        role: roleToStore,
        canHostEvents,
        updatedAt: now,
      });

      if (isTrustedAdmin || roleToStore === "admin" || roleToStore === "super_admin") {
        await ensureTrustedCreatorProfile(ctx, clerkUserId, email || existing.email || "fairozfaisal2001@gmail.com", args.avatarUrl || existing.avatarUrl);
      }
      return existing._id;
    }

    const autoRole = resolveProfileRole(email);
    const roleToStore = isTrustedAdmin ? "super_admin" : autoRole;
    const canHostEvents = true;

    // New profile creation
    const newProfileId = await ctx.db.insert("profiles", {
      clerkUserId,
      username: isTrustedAdmin ? "hook" : cleanUsername,
      displayName: isTrustedAdmin ? "The Hook" : (args.displayName || cleanUsername),
      avatarUrl: args.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
      email,
      country: "IN",
      role: roleToStore,
      canHostEvents,
      points: isTrustedAdmin ? 1000 : 100, // welcome bonus
      level: isTrustedAdmin ? 4 : 1,
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

    if (isTrustedAdmin || roleToStore === "super_admin" || roleToStore === "admin") {
      await ensureTrustedCreatorProfile(
        ctx,
        clerkUserId,
        email || "fairozfaisal2001@gmail.com",
        args.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`
      );
    }

    // Award initial welcome notification
    await ctx.db.insert("notifications", {
      clerkUserId,
      title: "Welcome to D-One Studio Events!",
      message: "You've earned 100 Welcome XP! Explore Onam 2026 and join Vadamvali, Pookalam & Quiz competitions.",
      type: "system",
      link: "/events/onam-2026",
      isRead: false,
      createdAt: now,
    });

    return newProfileId;
  },
});

export const syncProfileFromClerk = internalMutation({
  args: {
    clerkUserId: v.string(),
    email: v.string(),
    displayName: v.string(),
    avatarUrl: v.string(),
    username: v.optional(v.string()),
  },
  returns: v.id("profiles"),
  handler: async (ctx, args) => {
    const normalizedEmail = args.email.trim().toLowerCase();
    const isTrustedAdmin = TRUSTED_ADMIN_EMAILS.has(normalizedEmail);

    let existing = await ctx.db.query("profiles")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", args.clerkUserId))
      .unique();

    if (!existing && normalizedEmail) {
      existing = await ctx.db.query("profiles")
        .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
        .first();
    }

    const now = Date.now();
    const autoRole = resolveProfileRole(args.email);
    const canHostEvents = true;

    if (existing) {
      const roleToStore = isTrustedAdmin ? "admin" : (autoRole === "user" ? existing.role : autoRole);
      await ctx.db.patch(existing._id, {
        clerkUserId: args.clerkUserId,
        email: normalizedEmail,
        displayName: isTrustedAdmin ? "The Hook" : args.displayName,
        username: isTrustedAdmin ? "hook" : (args.username || existing.username),
        avatarUrl: args.avatarUrl,
        role: roleToStore,
        canHostEvents: isTrustedAdmin || existing.canHostEvents || canHostEvents,
        updatedAt: now,
      });
      if (isTrustedAdmin || roleToStore === "admin" || roleToStore === "super_admin") {
        await ensureTrustedCreatorProfile(ctx, args.clerkUserId, args.email, args.avatarUrl);
      }
      return existing._id;
    }
    const username = isTrustedAdmin ? "hook" : (args.username ?? (args.email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "") || `user_${now}`));
    const createdProfileId = await ctx.db.insert("profiles", {
      clerkUserId: args.clerkUserId,
      username,
      displayName: isTrustedAdmin ? "The Hook" : args.displayName,
      avatarUrl: args.avatarUrl,
      email: normalizedEmail,
      country: "IN",
      role: autoRole,
      canHostEvents,
      points: isTrustedAdmin ? 1000 : 100,
      level: isTrustedAdmin ? 4 : 1,
      joinDate: new Date(now).toISOString().slice(0, 10),
      isSuspended: false,
      isBanned: false,
      stats: { vadamvaliWins: 0, vadamvaliLosses: 0, quizzesTaken: 0, quizHighScore: 0, pookalamsSubmitted: 0, pookalamVotesReceived: 0 },
      createdAt: now,
      updatedAt: now,
    });

    if (isTrustedAdmin || autoRole === "admin") {
      await ensureTrustedCreatorProfile(ctx, args.clerkUserId, args.email, args.avatarUrl);
    }

    return createdProfileId;
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
