import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "./profiles";

// List all events with optional status/category filter
export const listEvents = query({
  args: {
    status: v.optional(v.string()),
    category: v.optional(v.string()),
    featuredOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let events = await ctx.db.query("events").order("desc").collect();

    if (args.featuredOnly) {
      events = events.filter((e) => e.featured);
    }
    if (args.category) {
      events = events.filter((e) => e.category === args.category);
    }
    if (args.status && args.status !== "all") {
      events = events.filter((e) => e.status === args.status);
    }

    return events;
  },
});

// Get a single event by slug
export const getEventBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const event = await ctx.db
      .query("events")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    return event;
  },
});

// Get featured flagship live event (e.g. Onam 2026)
export const getFeaturedEvent = query({
  args: {},
  handler: async (ctx) => {
    const featured = await ctx.db
      .query("events")
      .withIndex("by_featured", (q) => q.eq("featured", true))
      .first();

    if (featured) return featured;

    // Fallback to latest live or scheduled event
    return await ctx.db.query("events").order("desc").first();
  },
});

// Check if user is registered for an event
export const isUserRegistered = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const clerkUserId = await getAuthUserId(ctx);
    if (!clerkUserId) return false;

    const registration = await (ctx.db as any)
      .query("eventRegistrations")
      .withIndex("by_eventId_and_user", (q: any) =>
        q.eq("eventId", args.eventId).eq("clerkUserId", clerkUserId)
      )
      .first();

    return !!registration;
  },
});

// Register user for an event
export const registerForEvent = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const clerkUserId = await getAuthUserId(ctx);
    if (!clerkUserId) throw new Error("Unauthorized: Please sign in to join the event");

    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");

    if (event.status === "cancelled" || event.status === "archived") {
      throw new Error("This event is no longer active for registration");
    }

    // Check duplicate
    const existing = await (ctx.db as any)
      .query("eventRegistrations")
      .withIndex("by_eventId_and_user", (q: any) =>
        q.eq("eventId", args.eventId).eq("clerkUserId", clerkUserId)
      )
      .first();

    if (existing) {
      return { success: true, alreadyRegistered: true };
    }

    const now = Date.now();
    await ctx.db.insert("eventRegistrations", {
      eventId: args.eventId,
      clerkUserId: clerkUserId,
      registeredAt: now,
    });

    // Increment participant count
    await ctx.db.patch(args.eventId, {
      participantCount: (event.participantCount || 0) + 1,
      updatedAt: now,
    });

    // Send notification
    await ctx.db.insert("notifications", {
      clerkUserId: clerkUserId,
      title: `Joined ${event.title}!`,
      message: `You have successfully registered for ${event.title}. Jump into the activities and compete for glory!`,
      type: "system",
      link: `/events/${event.slug}`,
      isRead: false,
      createdAt: now,
    });

    return { success: true, alreadyRegistered: false };
  },
});

// Admin: Create Event
export const createEvent = mutation({
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
  },
  handler: async (ctx, args) => {
    const clerkUserId = await getAuthUserId(ctx);
    if (!clerkUserId) throw new Error("Unauthorized");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .first();

    if (!profile || (profile.role !== "admin" && profile.role !== "super_admin")) {
      throw new Error("Forbidden: Admin privileges required");
    }

    const existingSlug = await ctx.db
      .query("events")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existingSlug) {
      throw new Error("An event with this slug already exists");
    }

    const now = Date.now();
    const eventId = await ctx.db.insert("events", {
      ...args,
      participantCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    // Record audit log
    await ctx.db.insert("adminLogs", {
      adminClerkUserId: clerkUserId,
      adminDisplayName: profile.displayName,
      action: "EVENT_CREATED",
      entity: "events",
      entityId: eventId,
      details: { title: args.title, slug: args.slug },
      timestamp: now,
    });

    return eventId;
  },
});

// Admin: Update Event
export const updateEvent = mutation({
  args: {
    id: v.id("events"),
    title: v.optional(v.string()),
    tagline: v.optional(v.string()),
    description: v.optional(v.string()),
    bannerUrl: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("scheduled"),
        v.literal("registration_open"),
        v.literal("registration_closed"),
        v.literal("live"),
        v.literal("completed"),
        v.literal("cancelled"),
        v.literal("archived")
      )
    ),
    category: v.optional(
      v.union(
        v.literal("festival"),
        v.literal("gaming"),
        v.literal("creator"),
        v.literal("competition"),
        v.literal("campaign")
      )
    ),
    featured: v.optional(v.boolean()),
    theme: v.optional(
      v.object({
        primaryColor: v.string(),
        secondaryColor: v.string(),
        accentColor: v.string(),
        bgGradient: v.string(),
        bannerBadge: v.string(),
        festivalIcon: v.string(),
      })
    ),
    rules: v.optional(v.array(v.string())),
    prizes: v.optional(
      v.array(
        v.object({
          place: v.string(),
          title: v.string(),
          reward: v.string(),
          icon: v.string(),
        })
      )
    ),
    sponsors: v.optional(
      v.array(
        v.object({
          name: v.string(),
          logoUrl: v.string(),
          tier: v.string(),
          websiteUrl: v.optional(v.string()),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const clerkUserId = await getAuthUserId(ctx);
    if (!clerkUserId) throw new Error("Unauthorized");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .first();

    if (!profile || (profile.role !== "admin" && profile.role !== "super_admin")) {
      throw new Error("Forbidden: Admin privileges required");
    }

    const { id, ...updates } = args;
    const now = Date.now();
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: now,
    });

    await ctx.db.insert("adminLogs", {
      adminClerkUserId: clerkUserId,
      adminDisplayName: profile.displayName,
      action: "EVENT_UPDATED",
      entity: "events",
      entityId: id,
      details: updates,
      timestamp: now,
    });

    return true;
  },
});

// Admin: Delete Event
export const deleteEvent = mutation({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    const clerkUserId = await getAuthUserId(ctx);
    if (!clerkUserId) throw new Error("Unauthorized");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .first();

    if (!profile || profile.role !== "super_admin") {
      throw new Error("Forbidden: Super Admin privileges required");
    }

    const event = await ctx.db.get(args.id);
    if (!event) throw new Error("Event not found");

    await ctx.db.delete(args.id);

    await ctx.db.insert("adminLogs", {
      adminClerkUserId: clerkUserId,
      adminDisplayName: profile.displayName,
      action: "EVENT_DELETED",
      entity: "events",
      entityId: args.id,
      details: { title: event.title, slug: event.slug },
      timestamp: Date.now(),
    });

    return true;
  },
});
