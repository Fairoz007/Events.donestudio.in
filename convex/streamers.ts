// @ts-nocheck
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin, requireUser } from "./lib/auth";

export const myApplication = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return await ctx.db
      .query("streamerApplications")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();
  },
});

export const apply = mutation({
  args: {
    name: v.string(),
    username: v.string(),
    platform: v.string(),
    channelUrl: v.string(),
    followerCount: v.number(),
    country: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const { identity } = await requireUser(ctx);
    const existing = await ctx.db
      .query("streamerApplications")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
      .first();
    const now = Date.now();
    if (existing && existing.status !== "rejected") return existing._id;
    if (existing) {
      await ctx.db.patch(existing._id, { ...args, status: "pending", submittedAt: now, updatedAt: now });
      return existing._id;
    }
    return await ctx.db.insert("streamerApplications", {
      clerkUserId: identity.subject,
      ...args,
      status: "pending",
      submittedAt: now,
      updatedAt: now,
    });
  },
});

export const listApplications = query({
  args: { status: v.optional(v.union(v.literal("all"), v.literal("pending"), v.literal("approved"), v.literal("rejected"), v.literal("suspended"))) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    if (args.status && args.status !== "all") {
      return await ctx.db
        .query("streamerApplications")
        .withIndex("by_status", (q) => q.eq("status", args.status as "pending" | "approved" | "rejected" | "suspended"))
        .order("desc")
        .take(100);
    }
    return await ctx.db.query("streamerApplications").order("desc").take(100);
  },
});

export const reviewApplication = mutation({
  args: {
    applicationId: v.id("streamerApplications"),
    status: v.union(v.literal("approved"), v.literal("rejected"), v.literal("suspended")),
    adminNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { identity, profile } = await requireAdmin(ctx);
    const application = await ctx.db.get(args.applicationId);
    if (!application) throw new Error("APPLICATION_NOT_FOUND");
    const now = Date.now();
    await ctx.db.patch(application._id, {
      status: args.status,
      reviewedBy: identity.subject,
      reviewedAt: now,
      adminNotes: args.adminNotes,
      updatedAt: now,
    });
    const targetProfile = await ctx.db
      .query("profiles")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", application.clerkUserId))
      .first();
    if (targetProfile && args.status === "approved" && targetProfile.role === "user") {
      await ctx.db.patch(targetProfile._id, { role: "streamer", updatedAt: now });
    }
    await ctx.db.insert("notifications", {
      clerkUserId: application.clerkUserId,
      title: args.status === "approved" ? "Streamer access approved" : "Streamer application updated",
      message: args.status === "approved"
        ? "You can now spectate eligible live event matches from the streamer dashboard."
        : args.adminNotes ?? "Your streamer application has been reviewed.",
      type: "system",
      link: "/streamer",
      isRead: false,
      createdAt: now,
    });
    await ctx.db.insert("adminLogs", {
      adminClerkUserId: identity.subject,
      adminDisplayName: profile.displayName,
      action: "STREAMER_APPLICATION_REVIEWED",
      entity: "streamerApplications",
      entityId: application._id,
      details: { status: args.status, username: application.username },
      timestamp: now,
    });
    return true;
  },
});

