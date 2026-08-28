// @ts-nocheck
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "./profiles";
import { requireAdmin } from "./lib/auth";

// Submit Creator Application
export const applyAsCreator = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    username: v.string(),
    platform: v.union(
      v.literal("youtube"),
      v.literal("twitch"),
      v.literal("instagram"),
      v.literal("kick"),
      v.literal("other")
    ),
    channelName: v.string(),
    channelUrl: v.string(),
    followerCount: v.number(),
    country: v.string(),
    profileImage: v.optional(v.union(v.string(), v.null())),
    description: v.string(),
    whyJoin: v.string(),
    socialLinks: v.object({
      youtube: v.optional(v.union(v.string(), v.null())),
      twitter: v.optional(v.union(v.string(), v.null())),
      instagram: v.optional(v.union(v.string(), v.null())),
      discord: v.optional(v.union(v.string(), v.null())),
    }),
  },
  handler: async (ctx, args) => {
    const clerkUserId = await getAuthUserId(ctx);
    if (!clerkUserId) throw new Error("Unauthorized: Please sign in to apply");

    // Check for existing pending application
    const existing = await ctx.db
      .query("creatorApplications")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .first();

    if (existing && existing.status === "pending") {
      throw new Error("You already have a pending creator application under review.");
    }

    const now = Date.now();
    const applicationId = await ctx.db.insert("creatorApplications", {
      ...args,
      clerkUserId: clerkUserId,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });

    // Notify user
    await ctx.db.insert("notifications", {
      clerkUserId: clerkUserId,
      title: "Creator Application Received 🌟",
      message: `Your application to join D-One Studio Creators as ${args.channelName} is now under review!`,
      type: "system",
      link: "/dashboard",
      isRead: false,
      createdAt: now,
    });

    return applicationId;
  },
});

// Get user's own application
export const getMyApplication = query({
  args: {},
  handler: async (ctx) => {
    const clerkUserId = await getAuthUserId(ctx);
    if (!clerkUserId) return null;

    return await ctx.db
      .query("creatorApplications")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .first();
  },
});

// Admin: List all creator applications
export const listApplicationsForAdmin = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("all"),
        v.literal("pending"),
        v.literal("under_review"),
        v.literal("approved"),
        v.literal("rejected"),
        v.literal("suspended")
      )
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    let apps = await ctx.db.query("creatorApplications").order("desc").collect();

    if (args.status && args.status !== "all") {
      apps = apps.filter((a) => a.status === args.status);
    }

    return apps;
  },
});

// Admin: 1-Click Approve Creator Application
export const approveApplication = mutation({
  args: {
    applicationId: v.id("creatorApplications"),
    adminNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const clerkUserId = await getAuthUserId(ctx);
    if (!clerkUserId) throw new Error("Unauthorized");

    const adminProfile = await ctx.db
      .query("profiles")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .first();

    if (!adminProfile || (adminProfile.role !== "admin" && adminProfile.role !== "super_admin")) {
      throw new Error("Forbidden: Admin privileges required");
    }

    const app = await ctx.db.get(args.applicationId);
    if (!app) throw new Error("Application not found");

    const now = Date.now();

    // 1. Update application status
    await ctx.db.patch(app._id, {
      status: "approved",
      adminNotes: args.adminNotes,
      reviewedBy: clerkUserId,
      reviewedAt: now,
      updatedAt: now,
    });

    // 2. Elevate user role to creator in Convex profile (preserve admin/super_admin)
    const userProfile = await ctx.db
      .query("profiles")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", app.clerkUserId))
      .first();

    if (userProfile) {
      const nextRole = userProfile.role === "super_admin" || userProfile.role === "admin" ? userProfile.role : "creator";
      await ctx.db.patch(userProfile._id, {
        role: nextRole,
        canHostEvents: true,
        points: userProfile.points + 500, // Creator welcome bonus
        updatedAt: now,
      });
    }

    // 3. Create or update verified Creator Profile
    const existingCreatorProfile = await ctx.db
      .query("creatorProfiles")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", app.clerkUserId))
      .first();

    const creatorAvatar = app.profileImage || `https://api.dicebear.com/7.x/bottts/svg?seed=${app.username}`;

    if (!existingCreatorProfile) {
      await ctx.db.insert("creatorProfiles", {
        clerkUserId: app.clerkUserId,
        displayName: app.name,
        username: app.username,
        avatarUrl: creatorAvatar,
        platform: app.platform,
        channelName: app.channelName,
        channelUrl: app.channelUrl,
        followerCount: app.followerCount,
        bio: app.description,
        socialLinks: app.socialLinks,
        verified: true,
        featured: true,
        eventsParticipated: 1,
        achievements: ["Verified Creator", "D-One Pioneer"],
        canHostEvents: true,
        createdAt: now,
      });
    } else {
      await ctx.db.patch(existingCreatorProfile._id, {
        displayName: app.name,
        username: app.username,
        avatarUrl: creatorAvatar,
        platform: app.platform,
        channelName: app.channelName,
        channelUrl: app.channelUrl,
        followerCount: app.followerCount,
        bio: app.description,
        socialLinks: app.socialLinks,
        verified: true,
        canHostEvents: true,
        updatedAt: now,
      });
    }

    // 4. Send high-priority notification to Creator
    await ctx.db.insert("notifications", {
      clerkUserId: app.clerkUserId,
      title: "🎉 Congratulations! Creator Account Approved!",
      message: `Your D-One Studio Creator application for ${app.channelName} has been approved! You now have verified badge and creator access.`,
      type: "creator_approved",
      link: `/creators/${app.username}`,
      isRead: false,
      createdAt: now,
    });

    // 5. Immutable Admin Audit Log
    await ctx.db.insert("adminLogs", {
      adminClerkUserId: clerkUserId,
      adminDisplayName: adminProfile.displayName,
      action: "CREATOR_APPROVED",
      entity: "creatorApplications",
      entityId: app._id,
      details: {
        applicant: app.name,
        channel: app.channelName,
        platform: app.platform,
        followers: app.followerCount,
      },
      timestamp: now,
    });

    return true;
  },
});

// Admin: Reject Application
export const rejectApplication = mutation({
  args: {
    applicationId: v.id("creatorApplications"),
    reason: v.string(),
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

    const app = await ctx.db.get(args.applicationId);
    if (!app) throw new Error("Application not found");

    const now = Date.now();
    await ctx.db.patch(app._id, {
      status: "rejected",
      adminNotes: args.reason,
      reviewedBy: clerkUserId,
      reviewedAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("notifications", {
      clerkUserId: app.clerkUserId,
      title: "Creator Application Update",
      message: `Your creator request could not be approved at this time: ${args.reason}`,
      type: "creator_rejected",
      link: "/creators/apply",
      isRead: false,
      createdAt: now,
    });

    await ctx.db.insert("adminLogs", {
      adminClerkUserId: clerkUserId,
      adminDisplayName: adminProfile.displayName,
      action: "CREATOR_REJECTED",
      entity: "creatorApplications",
      entityId: app._id,
      details: { reason: args.reason, applicant: app.name },
      timestamp: now,
    });

    return true;
  },
});

// Public: List verified creators for directory
export const listVerifiedCreators = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("creatorProfiles")
      .filter((q) => q.eq(q.field("verified"), true))
      .collect();
  },
});

// Public: Get Creator by username
export const getCreatorByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("creatorProfiles")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();
  },
});

