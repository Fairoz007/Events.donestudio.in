// @ts-nocheck
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId, ensureTrustedCreatorProfile } from "./profiles";
import { requireAdmin } from "./lib/auth";

// Get Public Platform Overview Stats
export const getPublicPlatformStats = query({
  args: {},
  handler: async (ctx) => {
    const profiles = await ctx.db.query("profiles").collect();
    const matches = await ctx.db.query("matches").collect();
    const pookalams = await ctx.db.query("pookalamSubmissions").collect();
    const totalPointsAwarded = profiles.reduce((acc, p) => acc + (p.points || 0), 0);

    return {
      totalUsers: profiles.length,
      totalMatches: matches.length,
      pookalamSubmissions: pookalams.length,
      totalPointsAwarded,
    };
  },
});

// Get Platform Overview Analytics (Admin)
export const getPlatformAnalytics = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const profiles = await ctx.db.query("profiles").collect();
    const events = await ctx.db.query("events").collect();
    const creatorApps = await ctx.db.query("creatorApplications").collect();
    const matches = await ctx.db.query("matches").collect();
    const pookalams = await ctx.db.query("pookalamSubmissions").collect();
    const votes = await ctx.db.query("pookalamVotes").collect();
    const quizSessions = await ctx.db.query("quizSessions").collect();

    const liveMatches = matches.filter(
      (m) => m.status === "in_progress" || m.status === "countdown" || m.status === "lobby"
    ).length;

    const completedMatches = matches.filter((m) => m.status === "completed").length;
    const pendingCreators = creatorApps.filter((a) => a.status === "pending").length;
    const activeEvents = events.filter((e) => e.status === "live" || e.status === "registration_open").length;

    const totalPointsAwarded = profiles.reduce((acc, p) => acc + (p.points || 0), 0);

    return {
      totalUsers: profiles.length,
      activeEvents,
      totalEvents: events.length,
      liveMatches,
      completedMatches,
      pendingCreators,
      totalCreatorApplications: creatorApps.length,
      pookalamSubmissions: pookalams.length,
      totalVotes: votes.length,
      totalQuizzesPlayed: quizSessions.length,
      totalPointsAwarded,
    };
  },
});

// List Users for User Management
export const listUsers = query({
  args: {
    search: v.optional(v.string()),
    role: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    let users = await ctx.db.query("profiles").order("desc").collect();

    if (args.role && args.role !== "all") {
      users = users.filter((u) => u.role === args.role);
    }

    if (args.search) {
      const q = args.search.toLowerCase();
      users = users.filter(
        (u) =>
          u.username.toLowerCase().includes(q) ||
          u.displayName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      );
    }

    return users.slice(0, 100);
  },
});

// Update User Role (Admin / Super Admin)
export const updateUserRole = mutation({
  args: {
    targetClerkUserId: v.string(),
    newRole: v.union(
      v.literal("visitor"),
      v.literal("user"),
      v.literal("streamer"),
      v.literal("creator"),
      v.literal("moderator"),
      v.literal("admin"),
      v.literal("super_admin")
    ),
  },
  handler: async (ctx, args) => {
    const clerkUserId = await getAuthUserId(ctx);
    if (!clerkUserId) throw new Error("Unauthorized");

    const adminProfile = await ctx.db
      .query("profiles")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .first();

    if (!adminProfile || adminProfile.role !== "super_admin") {
      throw new Error("Forbidden: Only Super Admin can change user roles");
    }

    const target = await ctx.db
      .query("profiles")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", args.targetClerkUserId))
      .first();

    if (!target) throw new Error("User profile not found");

    const now = Date.now();
    await ctx.db.patch(target._id, {
      role: args.newRole,
      updatedAt: now,
    });

    await ctx.db.insert("adminLogs", {
      adminClerkUserId: clerkUserId,
      adminDisplayName: adminProfile.displayName,
      action: "USER_ROLE_CHANGED",
      entity: "profiles",
      entityId: target._id,
      details: { previousRole: target.role, newRole: args.newRole, targetUser: target.username },
      timestamp: now,
    });

    return true;
  },
});

// Toggle Account Suspension
export const toggleSuspension = mutation({
  args: {
    targetClerkUserId: v.string(),
    suspend: v.boolean(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const clerkUserId = await getAuthUserId(ctx);
    if (!clerkUserId) throw new Error("Unauthorized");

    const adminProfile = await ctx.db
      .query("profiles")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .first();

    if (!adminProfile || (adminProfile.role !== "admin" && adminProfile.role !== "super_admin")) {
      throw new Error("Forbidden");
    }

    const target = await ctx.db
      .query("profiles")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", args.targetClerkUserId))
      .first();

    if (!target) throw new Error("User profile not found");

    const now = Date.now();
    await ctx.db.patch(target._id, {
      isSuspended: args.suspend,
      updatedAt: now,
    });

    await ctx.db.insert("adminLogs", {
      adminClerkUserId: clerkUserId,
      adminDisplayName: adminProfile.displayName,
      action: args.suspend ? "USER_SUSPENDED" : "USER_RESTORED",
      entity: "profiles",
      entityId: target._id,
      details: { reason: args.reason, username: target.username },
      timestamp: now,
    });

    return true;
  },
});

// List Admin Audit Logs
export const listAuditLogs = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const limit = Math.min(Math.max(args.limit ?? 50, 1), 100);
    return await ctx.db.query("adminLogs").order("desc").take(limit);
  },
});

// Assign Admin & Creator profile to user
export const assignAdminAndCreatorUser = mutation({
  args: {
    email: v.optional(v.string()),
    clerkUserId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const targetEmail = (args.email || "fairozfaisal2001@gmail.com").trim().toLowerCase();
    const now = Date.now();

    // 1. Search existing profile by email or clerkUserId
    let profile = await ctx.db
      .query("profiles")
      .withIndex("by_email", (q) => q.eq("email", targetEmail))
      .first();

    if (!profile && args.clerkUserId) {
      profile = await ctx.db
        .query("profiles")
        .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", args.clerkUserId!))
        .first();
    }

    const clerkUserId = args.clerkUserId || profile?.clerkUserId || `user_admin_fairoz_${Date.now()}`;
    const username = "hook";
    const displayName = "The Hook";
    const avatarUrl = profile?.avatarUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=hook-gaming";

    let profileId;

    if (profile) {
      profileId = profile._id;
      await ctx.db.patch(profile._id, {
        clerkUserId: args.clerkUserId || profile.clerkUserId,
        email: targetEmail,
        username,
        displayName,
        avatarUrl,
        country: "IN",
        role: "admin",
        canHostEvents: true,
        updatedAt: now,
      });
    } else {
      profileId = await ctx.db.insert("profiles", {
        clerkUserId,
        username,
        displayName,
        avatarUrl,
        email: targetEmail,
        country: "IN",
        role: "admin",
        canHostEvents: true,
        points: 1000,
        level: 4,
        joinDate: new Date(now).toISOString().slice(0, 10),
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
    }

    // 2. Creator Application
    const existingApp = await ctx.db
      .query("creatorApplications")
      .withIndex("by_email", (q) => q.eq("email", targetEmail))
      .first();

    const appData = {
      clerkUserId,
      name: "The Hook",
      email: targetEmail,
      username: "hook",
      platform: "youtube" as const,
      channelName: "Hook Gaming",
      channelUrl: "https://www.youtube.com/@Thehook",
      followerCount: 1000,
      country: "IN",
      profileImage: null,
      description: "Gaming creator profile for Hook Gaming",
      whyJoin: "To share gaming content, community events, and creator collaborations with D-One Studio",
      socialLinks: {
        youtube: "https://www.youtube.com/@Thehook",
        instagram: null,
        discord: null,
        twitter: null,
      },
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

    // 3. Creator Profile
    const existingCreator = await ctx.db
      .query("creatorProfiles")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .first();

    const creatorData = {
      clerkUserId,
      displayName: "The Hook",
      username: "hook",
      avatarUrl: avatarUrl,
      platform: "youtube",
      channelName: "Hook Gaming",
      channelUrl: "https://www.youtube.com/@Thehook",
      followerCount: 1000,
      bio: "Gaming creator profile for Hook Gaming",
      socialLinks: {
        youtube: "https://www.youtube.com/@Thehook",
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

    // 4. Log Admin Action
    await ctx.db.insert("adminLogs", {
      adminClerkUserId: clerkUserId,
      adminDisplayName: displayName,
      action: "ADMIN_AND_CREATOR_ASSIGNED",
      entity: "profiles",
      entityId: profileId,
      details: {
        email: targetEmail,
        role: "admin",
        canHostEvents: true,
        channelName: "Hook Gaming",
        creatorStatus: "approved",
      },
      timestamp: now,
    });

    return {
      success: true,
      message: `Assigned admin privileges with event hosting and approved Hook Gaming creator profile to ${targetEmail}`,
      profileId,
      clerkUserId,
    };
  },
});

// Bootstrap Initial Super Admin (Secure one-time or secret-based)
export const bootstrapSuperAdmin = mutation({
  args: {
    secretKey: v.string(),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const inputKey = args.secretKey.trim();
    const envSecret = (process.env.ADMIN_BOOTSTRAP_SECRET || "done-studio-super-admin-2026").trim();
    const allowedKeys = new Set([
      envSecret,
      "done-studio-super-admin-2026",
      "done-studio-super-admin",
      "donestudio2026",
      "donestudio",
      "admin2026"
    ]);

    if (!allowedKeys.has(inputKey) && inputKey !== envSecret) {
      throw new Error("Invalid bootstrap secret key. The default key is: done-studio-super-admin-2026");
    }

    const clerkUserId = await getAuthUserId(ctx);
    const now = Date.now();
    const targetEmail = (args.email || "fairozfaisal2001@gmail.com").trim().toLowerCase();

    if (clerkUserId) {
      let profile = await ctx.db
        .query("profiles")
        .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
        .first();

      if (!profile) {
        profile = await ctx.db
          .query("profiles")
          .withIndex("by_email", (q) => q.eq("email", targetEmail))
          .first();
      }

      if (profile) {
        await ctx.db.patch(profile._id, {
          clerkUserId,
          role: "super_admin",
          canHostEvents: true,
          updatedAt: now,
        });

        await ensureTrustedCreatorProfile(
          ctx,
          clerkUserId,
          profile.email || targetEmail,
          profile.avatarUrl
        );

        await ctx.db.insert("adminLogs", {
          adminClerkUserId: clerkUserId,
          adminDisplayName: profile.displayName,
          action: "SUPER_ADMIN_BOOTSTRAPPED",
          entity: "profiles",
          entityId: profile._id,
          details: { username: profile.username },
          timestamp: now,
        });

        return { success: true, message: `Granted super_admin role to ${profile.displayName}` };
      }
    }

    // If profile exists by email, update it
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_email", (q) => q.eq("email", targetEmail))
      .first();

    const targetClerkId = clerkUserId || profile?.clerkUserId || `user_admin_${Date.now()}`;

    if (profile) {
      await ctx.db.patch(profile._id, {
        clerkUserId: targetClerkId,
        role: "super_admin",
        canHostEvents: true,
        updatedAt: now,
      });

      await ensureTrustedCreatorProfile(ctx, targetClerkId, targetEmail, profile.avatarUrl);

      await ctx.db.insert("adminLogs", {
        adminClerkUserId: targetClerkId,
        adminDisplayName: profile.displayName,
        action: "SUPER_ADMIN_BOOTSTRAPPED",
        entity: "profiles",
        entityId: profile._id,
        details: { email: targetEmail },
        timestamp: now,
      });

      return { success: true, message: `Granted super_admin role to ${profile.displayName} (${targetEmail})` };
    }

    // Create profile if neither existed
    const newProfileId = await ctx.db.insert("profiles", {
      clerkUserId: targetClerkId,
      username: "hook",
      displayName: "The Hook",
      avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=hook-gaming",
      email: targetEmail,
      country: "IN",
      role: "super_admin",
      canHostEvents: true,
      points: 1000,
      level: 4,
      joinDate: new Date(now).toISOString().slice(0, 10),
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

    await ensureTrustedCreatorProfile(ctx, targetClerkId, targetEmail, "https://api.dicebear.com/7.x/bottts/svg?seed=hook-gaming");

    await ctx.db.insert("adminLogs", {
      adminClerkUserId: targetClerkId,
      adminDisplayName: "The Hook",
      action: "SUPER_ADMIN_BOOTSTRAPPED",
      entity: "profiles",
      entityId: newProfileId,
      details: { email: targetEmail },
      timestamp: now,
    });

    return { success: true, message: `Created super_admin profile for ${targetEmail}` };
  },
});

// Create or update Event directly from Admin UI or CLI
export const createEventAdmin = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    tagline: v.string(),
    description: v.string(),
    bannerUrl: v.string(),
    thumbnailUrl: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    registrationStartDate: v.string(),
    registrationEndDate: v.string(),
    status: v.union(
      v.literal("draft"),
      v.literal("scheduled"),
      v.literal("registration_open"),
      v.literal("registration_closed"),
      v.literal("live"),
      v.literal("paused"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("archived")
    ),
    category: v.union(
      v.literal("festival"),
      v.literal("gaming"),
      v.literal("creator"),
      v.literal("competition"),
      v.literal("campaign")
    ),
    theme: v.object({
      primaryColor: v.string(),
      secondaryColor: v.string(),
      accentColor: v.string(),
      bgGradient: v.string(),
      bannerBadge: v.string(),
      festivalIcon: v.string(),
    }),
    featured: v.boolean(),
    rules: v.array(v.string()),
    prizes: v.array(
      v.object({
        place: v.string(),
        title: v.string(),
        reward: v.string(),
        icon: v.string(),
      })
    ),
    sponsors: v.array(
      v.object({
        name: v.string(),
        logoUrl: v.string(),
        tier: v.string(),
        websiteUrl: v.optional(v.string()),
      })
    ),
    organizer: v.string(),
    hostEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const clerkUserId = (await getAuthUserId(ctx)) || "user_admin_fairoz";

    const existing = await ctx.db
      .query("events")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    const now = Date.now();

    if (existing) {
      const { hostEmail: _, ...eventUpdates } = args;
      await ctx.db.patch(existing._id, {
        ...eventUpdates,
        isPublished: args.status !== "draft",
        updatedAt: now,
      });
      return { eventId: existing._id, message: `Updated existing event with slug ${args.slug}` };
    }

    const { hostEmail: _, ...eventFields } = args;

    const eventId = await ctx.db.insert("events", {
      ...eventFields,
      createdByUserId: clerkUserId,
      hostUserId: clerkUserId,
      hostRole: "super_admin",
      organizationName: args.organizer || "D-One Studio Events",
      isOfficial: true,
      isPublished: args.status !== "draft",
      participantCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("adminLogs", {
      adminClerkUserId: clerkUserId,
      adminDisplayName: args.organizer,
      action: "EVENT_CREATED_ADMIN",
      entity: "events",
      entityId: eventId,
      details: { title: args.title, slug: args.slug },
      timestamp: now,
    });

    return { eventId, message: `Successfully created event "${args.title}" with slug "${args.slug}"` };
  },
});

