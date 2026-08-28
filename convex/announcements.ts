import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "./profiles";

// List global announcements
export const listGlobalAnnouncements = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("announcements")
      .withIndex("by_isGlobal", (q) => q.eq("isGlobal", true))
      .order("desc")
      .take(5);
  },
});

// List announcements for an event
export const listEventAnnouncements = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("announcements")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .order("desc")
      .take(10);
  },
});

// Admin: Publish announcement
export const publishAnnouncement = mutation({
  args: {
    eventId: v.optional(v.id("events")),
    title: v.string(),
    content: v.string(),
    type: v.union(
      v.literal("urgent"),
      v.literal("info"),
      v.literal("tournament"),
      v.literal("winner")
    ),
    isGlobal: v.boolean(),
  },
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
    const id = await ctx.db.insert("announcements", {
      ...args,
      authorName: profile.displayName,
      publishedAt: now,
    });

    await ctx.db.insert("adminLogs", {
      adminClerkUserId: clerkUserId,
      adminDisplayName: profile.displayName,
      action: "ANNOUNCEMENT_PUBLISHED",
      entity: "announcements",
      entityId: id,
      details: { title: args.title, isGlobal: args.isGlobal },
      timestamp: now,
    });

    return id;
  },
});

// Admin: Delete announcement
export const deleteAnnouncement = mutation({
  args: { announcementId: v.id("announcements") },
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

    await ctx.db.delete(args.announcementId);
    return true;
  },
});
