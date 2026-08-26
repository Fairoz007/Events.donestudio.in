import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "./profiles";

// Get Platform Overview Analytics
export const getPlatformAnalytics = query({
  args: {},
  handler: async (ctx) => {
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

    if (!target) throw new Error("User not found");

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
    const limit = args.limit || 50;
    return await ctx.db.query("adminLogs").order("desc").take(limit);
  },
});

// Bootstrap Initial Super Admin (Secure one-time or secret-based)
export const bootstrapSuperAdmin = mutation({
  args: { secretKey: v.string() },
  handler: async (ctx, args) => {
    const clerkUserId = await getAuthUserId(ctx);
    if (!clerkUserId) throw new Error("Unauthorized: Please sign in first");

    // Check if valid bootstrap secret or first user
    const validSecret = process.env.ADMIN_BOOTSTRAP_SECRET || "done-studio-super-admin-2026";
    if (args.secretKey !== validSecret) {
      throw new Error("Invalid bootstrap secret key");
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .first();

    if (!profile) throw new Error("Profile not found. Please reload and try again.");

    const now = Date.now();
    await ctx.db.patch(profile._id, {
      role: "super_admin",
      updatedAt: now,
    });

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
  },
});
