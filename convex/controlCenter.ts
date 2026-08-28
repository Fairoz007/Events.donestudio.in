import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin, requireUser } from "./lib/auth";

const eventState = v.union(v.literal("registration_open"), v.literal("registration_closed"), v.literal("live"), v.literal("paused"), v.literal("completed"), v.literal("cancelled"));
const activityState = v.union(v.literal("registration_open"), v.literal("registration_closed"), v.literal("live"), v.literal("paused"), v.literal("completed"), v.literal("cancelled"));

export const myDashboard = query({
  args: {}, returns: v.any(),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const profile = await ctx.db.query("profiles").withIndex("by_clerkUserId", q => q.eq("clerkUserId", identity.subject)).unique();
    const registrations = await ctx.db.query("eventRegistrations").withIndex("by_user", q => q.eq("clerkUserId", identity.subject)).order("desc").take(100);
    const joinedEvents = (await Promise.all(registrations.map(async registration => ({ registration, event: await ctx.db.get(registration.eventId) })))).filter(row => row.event !== null);
    const pookalams = await ctx.db.query("pookalamDesigns").withIndex("by_user_and_event", q => q.eq("clerkUserId", identity.subject)).order("desc").take(100);
    const matchesAsPlayer1 = await ctx.db.query("matches").withIndex("by_player1", q => q.eq("player1.clerkUserId", identity.subject)).order("desc").take(100);
    const quizSessions = await ctx.db.query("quizSessions").withIndex("by_score").order("desc").take(200);
    return { profile, joinedEvents, pookalams, matches: matchesAsPlayer1, quizSessions: quizSessions.filter(s => s.clerkUserId === identity.subject).slice(0, 100) };
  },
});

export const eventControl = query({
  args: { eventId: v.id("events") }, returns: v.any(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("EVENT_NOT_FOUND");
    const registrations = await ctx.db.query("eventRegistrations").withIndex("by_eventId", q => q.eq("eventId", args.eventId)).order("desc").take(500);
    const participants = await Promise.all(registrations.map(async r => ({ ...r, profile: await ctx.db.query("profiles").withIndex("by_clerkUserId", q => q.eq("clerkUserId", r.clerkUserId)).unique() })));
    const activities = await ctx.db.query("eventActivities").withIndex("by_eventId", q => q.eq("eventId", args.eventId)).take(100);
    const schedule = await ctx.db.query("eventSchedule").withIndex("by_eventId_and_scheduledAt", q => q.eq("eventId", args.eventId)).take(200);
    const matches = await ctx.db.query("matches").withIndex("by_eventId_and_status", q => q.eq("eventId", args.eventId)).take(500);
    const pookalams = await ctx.db.query("pookalamSubmissions").withIndex("by_eventId", q => q.eq("eventId", args.eventId)).take(500);
    const quizzes = await ctx.db.query("quizzes").withIndex("by_eventId", q => q.eq("eventId", args.eventId)).take(50);
    return { event, registrations, participants, activities: activities.sort((a,b) => a.order-b.order), schedule, matches, pookalams, quizzes };
  },
});

export const setEventState = mutation({
  args: { eventId: v.id("events"), state: eventState }, returns: v.null(),
  handler: async (ctx, args) => {
    const { identity, profile } = await requireAdmin(ctx);
    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("EVENT_NOT_FOUND");
    const now = Date.now();
    const timestamps = args.state === "live" ? { startedAt: event.startedAt ?? now } : args.state === "paused" ? { pausedAt: now } : args.state === "completed" ? { completedAt: now } : args.state === "cancelled" ? { cancelledAt: now } : {};
    await ctx.db.patch(args.eventId, { status: args.state, ...timestamps, updatedAt: now });
    await ctx.db.insert("adminLogs", { adminClerkUserId: identity.subject, adminDisplayName: profile.displayName, action: `EVENT_${args.state.toUpperCase()}`, entity: "events", entityId: args.eventId, details: { previousState: event.status }, timestamp: now });
    return null;
  },
});

export const setActivityState = mutation({
  args: { activityId: v.id("eventActivities"), state: activityState }, returns: v.null(),
  handler: async (ctx, args) => {
    const { identity, profile } = await requireAdmin(ctx);
    const activity = await ctx.db.get(args.activityId);
    if (!activity) throw new Error("ACTIVITY_NOT_FOUND");
    const now = Date.now();
    await ctx.db.patch(args.activityId, { status: args.state, startedAt: args.state === "live" ? activity.startedAt ?? now : activity.startedAt, pausedAt: args.state === "paused" ? now : activity.pausedAt, completedAt: args.state === "completed" ? now : activity.completedAt });
    await ctx.db.insert("adminLogs", { adminClerkUserId: identity.subject, adminDisplayName: profile.displayName, action: `ACTIVITY_${args.state.toUpperCase()}`, entity: "eventActivities", entityId: args.activityId, details: { previousState: activity.status }, timestamp: now });
    return null;
  },
});

export const upsertScheduleItem = mutation({
  args: { id: v.optional(v.id("eventSchedule")), eventId: v.id("events"), activityId: v.optional(v.id("eventActivities")), title: v.string(), scheduledAt: v.number(), kind: v.union(v.literal("registration"), v.literal("activity"), v.literal("match"), v.literal("voting"), v.literal("announcement")), status: v.union(v.literal("scheduled"), v.literal("live"), v.literal("completed"), v.literal("cancelled")) }, returns: v.id("eventSchedule"),
  handler: async (ctx, args) => {
    await requireAdmin(ctx); const now = Date.now(); const { id, ...value } = args;
    if (id) { await ctx.db.patch(id, { ...value, updatedAt: now }); return id; }
    return await ctx.db.insert("eventSchedule", { ...value, createdAt: now, updatedAt: now });
  },
});

export const startQuiz = mutation({
  args: { quizId: v.id("quizzes") }, returns: v.null(),
  handler: async (ctx, args) => { await requireAdmin(ctx); const quiz = await ctx.db.get(args.quizId); if (!quiz) throw new Error("QUIZ_NOT_FOUND"); if (quiz.status === "ended" || quiz.status === "archived") throw new Error("QUIZ_FINISHED"); await ctx.db.patch(args.quizId, { status: "live", startedAt: quiz.startedAt ?? Date.now() }); return null; },
});

export const setPookalamMode = mutation({
  args: { activityId: v.id("eventActivities"), submissionsOpen: v.boolean(), votingStatus: v.union(v.literal("closed"), v.literal("open")) }, returns: v.null(),
  handler: async (ctx, args) => { await requireAdmin(ctx); await ctx.db.patch(args.activityId, { submissionsOpen: args.submissionsOpen, votingStatus: args.votingStatus }); return null; },
});

export const deleteScheduleItem = mutation({
  args: { id: v.id("eventSchedule") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
    return true;
  },
});

