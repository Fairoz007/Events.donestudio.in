import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "./profiles";
import { requireAdmin, requireEventHost, requireUser } from "./lib/auth";

// List all events with optional status/category filter
export const listEvents = query({
  args: {
    status: v.optional(v.string()),
    category: v.optional(v.string()),
    featuredOnly: v.optional(v.boolean()),
    mode: v.optional(v.union(v.literal("online"), v.literal("offline"), v.literal("hybrid"))),
  },
  handler: async (ctx, args) => {
    let events = await ctx.db.query("events").order("desc").take(100);

    if (args.featuredOnly) {
      events = events.filter((e) => e.featured);
    }
    if (args.category) {
      events = events.filter((e) => e.category === args.category);
    }
    if (args.mode) {
      events = events.filter((e) => (e.mode ?? "online") === args.mode);
    }
    if (args.status && args.status !== "all") {
      events = events.filter((e) => e.status === args.status);
    }

    return events;
  },
});

export const listOnlineSections = query({
  args: {},
  handler: async (ctx) => {
    const events = (await ctx.db.query("events").order("desc").take(100))
      .filter((event) => event.isPublished !== false && (event.mode ?? "online") === "online");
    return {
      live: events.filter((event) => event.status === "live"),
      registrationOpen: events.filter((event) => event.status === "registration_open"),
      upcoming: events.filter((event) => event.status === "scheduled" || event.status === "ready"),
      past: events.filter((event) => event.status === "completed" || event.status === "archived"),
      all: events,
    };
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
    const events = await ctx.db.query("events").order("desc").take(10);
    return events[0] ?? null;
  },
});

// Check if user is registered for an event
export const isUserRegistered = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const clerkUserId = await getAuthUserId(ctx);
    if (!clerkUserId) return false;

    const registration = await ctx.db
      .query("eventRegistrations")
      .withIndex("by_eventId_and_user", (q) =>
        q.eq("eventId", args.eventId).eq("clerkUserId", clerkUserId)
      )
      .first();

    return !!registration && registration.status !== "cancelled";
  },
});

// Register user for an event
export const registerForEvent = mutation({
  args: { eventId: v.id("events"), activityIds: v.optional(v.array(v.id("eventActivities"))) },
  handler: async (ctx, args) => {
    const { identity } = await requireUser(ctx);
    const clerkUserId = identity.subject;

    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");
    if (event.status === "cancelled" || event.status === "archived") throw new Error("EVENT_NOT_AVAILABLE");
    const now = Date.now();

    // Check duplicate
    const existing = await ctx.db
      .query("eventRegistrations")
      .withIndex("by_eventId_and_user", (q) =>
        q.eq("eventId", args.eventId).eq("clerkUserId", clerkUserId)
      )
      .first();

    if (existing) {
      if (existing.status === "cancelled") {
        await ctx.db.patch(existing._id, { status: "registered", registeredAt: now });
        await ctx.db.patch(args.eventId, {
          participantCount: (event.participantCount || 0) + 1,
          updatedAt: now,
        });
        return { success: true, alreadyRegistered: false };
      }
      return { success: true, alreadyRegistered: true };
    }

    await ctx.db.insert("eventRegistrations", {
      eventId: args.eventId,
      clerkUserId: clerkUserId,
      registeredAt: now,
      status: "registered",
      activityIds: args.activityIds ?? [],
      createdAt: now,
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

// Admin: Set default/featured event
export const setDefaultEvent = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const { identity, profile } = await requireAdmin(ctx);
    
    // Unset current featured
    const allFeatured = await ctx.db
      .query("events")
      .withIndex("by_featured", (q) => q.eq("featured", true))
      .collect();

    for (const e of allFeatured) {
      await ctx.db.patch(e._id, { featured: false, updatedAt: Date.now() });
    }

    // Set new featured
    await ctx.db.patch(args.eventId, { featured: true, updatedAt: Date.now() });

    await ctx.db.insert("adminLogs", {
      adminClerkUserId: identity.subject,
      adminDisplayName: profile.displayName,
      action: "DEFAULT_EVENT_CHANGED",
      entity: "events",
      entityId: args.eventId,
      details: {},
      timestamp: Date.now(),
    });

    return true;
  },
});

// Admin / Host: Create Event
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
  },
  handler: async (ctx, args) => {
    const { identity, profile } = await requireEventHost(ctx);
    const clerkUserId = identity.subject;

    const existingSlug = await ctx.db
      .query("events")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existingSlug) {
      throw new Error("An event with this slug already exists");
    }

    const now = Date.now();
    const hostRole = profile.role === "visitor" ? "user" : profile.role;
    const eventId = await ctx.db.insert("events", {
      ...args,
      createdByUserId: clerkUserId,
      hostUserId: clerkUserId,
      hostRole,
      organizationName: profile.displayName || "D-One Studio Events",
      isOfficial: profile.role === "super_admin" || profile.role === "admin",
      isPublished: args.status !== "draft",
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
        v.literal("paused"),
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
    const { identity, profile } = await requireAdmin(ctx);
    const clerkUserId = identity.subject;

    const { id, ...updates } = args;
    const now = Date.now();
    await ctx.db.patch(id, {
      ...updates,
      isPublished: updates.status !== undefined ? updates.status !== "draft" : undefined,
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
    const { identity, profile } = await requireAdmin(ctx);
    const clerkUserId = identity.subject;

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
