import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "./profiles";

// List activities for an event
export const listActivitiesByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("eventActivities")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .collect();
  },
});

// List activities by event slug
export const listActivitiesByEventSlug = query({
  args: { eventSlug: v.string() },
  handler: async (ctx, args) => {
    const event = await ctx.db
      .query("events")
      .withIndex("by_slug", (q) => q.eq("slug", args.eventSlug))
      .first();

    if (!event) return [];

    const activities = await ctx.db
      .query("eventActivities")
      .withIndex("by_eventId", (q) => q.eq("eventId", event._id))
      .collect();

    return activities.sort((a, b) => a.order - b.order);
  },
});

// Get single activity by slug and eventId
export const getActivityBySlug = query({
  args: { eventSlug: v.string(), activitySlug: v.string() },
  handler: async (ctx, args) => {
    const event = await ctx.db
      .query("events")
      .withIndex("by_slug", (q) => q.eq("slug", args.eventSlug))
      .first();

    if (!event) return null;

    const activity = await ctx.db
      .query("eventActivities")
      .withIndex("by_eventId", (q) => q.eq("eventId", event._id))
      .filter((q) => q.eq(q.field("slug"), args.activitySlug))
      .first();

    return activity ? { ...activity, event } : null;
  },
});

// Admin: Create Activity
export const createActivity = mutation({
  args: {
    eventId: v.id("events"),
    title: v.string(),
    slug: v.string(),
    type: v.union(
      v.literal("vadamvali"),
      v.literal("pookalam"),
      v.literal("quiz"),
      v.literal("custom")
    ),
    description: v.string(),
    bannerUrl: v.string(),
    status: v.union(
      v.literal("upcoming"),
      v.literal("live"),
      v.literal("closed"),
      v.literal("archived")
    ),
    rules: v.array(v.string()),
    pointsReward: v.number(),
    order: v.number(),
    config: v.optional(v.any()),
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

    return await ctx.db.insert("eventActivities", {
      ...args,
      participantCount: 0,
    });
  },
});
