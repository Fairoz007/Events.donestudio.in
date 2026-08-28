import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "./profiles";
import type { Doc, Id } from "./_generated/dataModel";

const ONAM_SLUG = "onam-2026";
const CHECK_IN_MINUTES = 15;

const activitySlug = v.union(v.literal("vadamvali"), v.literal("pookalam"), v.literal("quiz"));

async function getOnamEvent(ctx: any) {
  return await ctx.db
    .query("events")
    .withIndex("by_slug", (q: any) => q.eq("slug", ONAM_SLUG))
    .first();
}

async function requireProfile(ctx: any) {
  const clerkUserId = await getAuthUserId(ctx);
  if (!clerkUserId) throw new Error("Please sign in with Clerk.");
  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_clerkUserId", (q: any) => q.eq("clerkUserId", clerkUserId))
    .first();
  if (!profile) throw new Error("Profile not found.");
  if (profile.isSuspended || profile.isBanned) throw new Error("Account is not eligible.");
  return { clerkUserId, profile };
}

async function requireAdmin(ctx: any) {
  const { clerkUserId, profile } = await requireProfile(ctx);
  if (profile.role !== "admin" && profile.role !== "super_admin") {
    throw new Error("Admin access required.");
  }
  return { clerkUserId, profile };
}

async function canOperateLiveMatch(ctx: any, eventId: Id<"events">) {
  const { clerkUserId, profile } = await requireProfile(ctx);
  if (profile.role === "admin" || profile.role === "super_admin") return { clerkUserId, profile };
  const host = await ctx.db
    .query("eventHosts")
    .withIndex("by_event_and_user", (q: any) => q.eq("eventId", eventId).eq("clerkUserId", clerkUserId))
    .first();
  if (!host || host.revokedAt || host.permission !== "event_host") {
    throw new Error("Event host permission required.");
  }
  return { clerkUserId, profile };
}

function registrationRef(prefix: string, existingCount: number) {
  return `${prefix}-${String(existingCount + 1).padStart(4, "0")}`;
}

function muscatTimeOn(date: string, hour: number, minute: number) {
  return Date.parse(`${date}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00+04:00`);
}

function roundName(size: number, firstRound: boolean) {
  if (size === 2) return "Final";
  if (size === 4) return "Semifinal";
  if (size === 8) return "Quarterfinal";
  if (size >= 16) return `Round of ${size}`;
  return firstRound ? "Preliminary Round" : `Round of ${size}`;
}

function nextPowerOfTwo(n: number) {
  let size = 1;
  while (size < n) size *= 2;
  return size;
}

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Default settings values used when no onamSettings document exists yet.
// These are returned by the read-only query getter so the UI never blocks.
function defaultSettings(eventId: Id<"events">) {
  return {
    _id: "" as any,
    _creationTime: 0,
    eventId,
    timezone: "Asia/Muscat",
    registrationOpensAt: muscatTimeOn("2026-08-28", 20, 30),
    registrationClosesAt: muscatTimeOn("2026-09-04", 20, 30),
    pookalamSubmissionOpensAt: muscatTimeOn("2026-08-28", 20, 30),
    pookalamSubmissionClosesAt: muscatTimeOn("2026-09-04", 20, 30),
    pookalamVotingOpensAt: muscatTimeOn("2026-09-04", 21, 0),
    pookalamVotingClosesAt: muscatTimeOn("2026-09-05", 21, 0),
    pookalamLiveVoteCounts: false,
    pookalamVoteChangesAllowed: true,
    quizStatus: "lobby" as const,
    currentActivity: "Registration",
    nextActivity: "Vadamvali Fixture",
    updatedAt: 0,
  };
}

function defaultTournament(eventId: Id<"events">) {
  return {
    _id: "" as any,
    _creationTime: 0,
    eventId,
    status: "registration" as const,
    format: "best_of_3" as const,
    seedingMode: "random" as const,
    tournamentStartsAt: muscatTimeOn("2026-09-04", 21, 0),
    averageMatchDurationMinutes: 8,
    transitionMinutes: 2,
    updatedAt: 0,
  };
}

// Read-only: safe for use inside queries (never writes).
async function getSettings(ctx: any, event: Doc<"events">) {
  const existing = await ctx.db
    .query("onamSettings")
    .withIndex("by_eventId", (q: any) => q.eq("eventId", event._id))
    .first();
  return existing || defaultSettings(event._id);
}

async function getTournament(ctx: any, eventId: Id<"events">) {
  const existing = await ctx.db
    .query("vadamvaliTournaments")
    .withIndex("by_eventId", (q: any) => q.eq("eventId", eventId))
    .first();
  return existing || defaultTournament(eventId);
}

// Write version: creates the row if missing. Only call from mutations.
async function getOrCreateSettings(ctx: any, event: Doc<"events">) {
  const existing = await ctx.db
    .query("onamSettings")
    .withIndex("by_eventId", (q: any) => q.eq("eventId", event._id))
    .first();
  if (existing) return existing;
  const now = Date.now();
  const settingsId = await ctx.db.insert("onamSettings", {
    eventId: event._id,
    timezone: "Asia/Muscat",
    registrationOpensAt: muscatTimeOn("2026-08-28", 20, 30),
    registrationClosesAt: muscatTimeOn("2026-09-04", 20, 30),
    pookalamSubmissionOpensAt: muscatTimeOn("2026-08-28", 20, 30),
    pookalamSubmissionClosesAt: muscatTimeOn("2026-09-04", 20, 30),
    pookalamVotingOpensAt: muscatTimeOn("2026-09-04", 21, 0),
    pookalamVotingClosesAt: muscatTimeOn("2026-09-05", 21, 0),
    pookalamLiveVoteCounts: false,
    pookalamVoteChangesAllowed: true,
    quizStatus: "lobby",
    currentActivity: "Registration",
    nextActivity: "Vadamvali Fixture",
    updatedAt: now,
  });
  return await ctx.db.get(settingsId);
}

async function getOrCreateTournament(ctx: any, eventId: Id<"events">) {
  const existing = await ctx.db
    .query("vadamvaliTournaments")
    .withIndex("by_eventId", (q: any) => q.eq("eventId", eventId))
    .first();
  if (existing) return existing;
  const now = Date.now();
  const tournamentId = await ctx.db.insert("vadamvaliTournaments", {
    eventId,
    status: "registration",
    format: "best_of_3",
    seedingMode: "random",
    tournamentStartsAt: muscatTimeOn("2026-09-04", 21, 0),
    averageMatchDurationMinutes: 8,
    transitionMinutes: 2,
    updatedAt: now,
  });
  return await ctx.db.get(tournamentId);
}

export const getSummary = query({
  args: { now: v.number() },
  handler: async (ctx, args) => {
    const event = await getOnamEvent(ctx);
    if (!event) return null;
    const settings = await getSettings(ctx, event);
    const tournament = await getTournament(ctx, event._id);
    const activities = await ctx.db.query("eventActivities").withIndex("by_eventId", (q: any) => q.eq("eventId", event._id)).take(10);
    const registrations = await ctx.db.query("eventRegistrations").withIndex("by_eventId", (q: any) => q.eq("eventId", event._id)).take(200);
    const activityRegistrations = await ctx.db.query("activityRegistrations").withIndex("by_event_and_activity", (q: any) => q.eq("eventId", event._id).eq("activitySlug", "vadamvali")).take(200);
    const currentMatch = await ctx.db.query("tournamentMatches").withIndex("by_event_and_status", (q: any) => q.eq("eventId", event._id).eq("status", "live")).first();
    const nextMatch =
      (await ctx.db.query("tournamentMatches").withIndex("by_event_and_status", (q: any) => q.eq("eventId", event._id).eq("status", "ready_for_checkin")).first()) ||
      (await ctx.db.query("tournamentMatches").withIndex("by_event_and_status", (q: any) => q.eq("eventId", event._id).eq("status", "upcoming")).first());
    return {
      event,
      settings,
      tournament,
      activities: activities.sort((a: any, b: any) => a.order - b.order),
      registrationStatus: args.now < settings.registrationOpensAt ? "opens_soon" : args.now <= settings.registrationClosesAt ? "open" : "closed",
      registeredUsers: registrations.length,
      activeParticipants: activityRegistrations.length,
      currentMatch,
      nextMatch,
    };
  },
});

// Mutation to ensure settings + tournament documents exist.
// Called once from the frontend when the page loads.
export const ensureEventSetup = mutation({
  args: {},
  handler: async (ctx) => {
    const event = await getOnamEvent(ctx);
    if (!event) return null;
    await getOrCreateSettings(ctx, event);
    await getOrCreateTournament(ctx, event._id);
    return true;
  },
});

export const getMyOnam = query({
  args: { now: v.number() },
  handler: async (ctx, args) => {
    const clerkUserId = await getAuthUserId(ctx);
    const event = await getOnamEvent(ctx);
    if (!clerkUserId || !event) return null;
    const profile = await ctx.db.query("profiles").withIndex("by_clerkUserId", (q: any) => q.eq("clerkUserId", clerkUserId)).first();
    const eventRegistration = await ctx.db.query("eventRegistrations").withIndex("by_eventId_and_user", (q: any) => q.eq("eventId", event._id).eq("clerkUserId", clerkUserId)).first();
    const activities = await ctx.db.query("activityRegistrations").withIndex("by_user", (q: any) => q.eq("clerkUserId", clerkUserId)).take(20);
    const pookalam = await ctx.db.query("pookalamDesigns").withIndex("by_user_and_event", (q: any) => q.eq("clerkUserId", clerkUserId).eq("eventId", event._id)).first();
    const notifications = await ctx.db.query("notifications").withIndex("by_user", (q: any) => q.eq("clerkUserId", clerkUserId)).order("desc").take(20);
    const p1 = await ctx.db.query("tournamentMatches").withIndex("by_player1", (q: any) => q.eq("player1ClerkUserId", clerkUserId)).take(50);
    const p2 = await ctx.db.query("tournamentMatches").withIndex("by_player2", (q: any) => q.eq("player2ClerkUserId", clerkUserId)).take(50);
    const matches = [...p1, ...p2].sort((a: any, b: any) => (a.queuePosition || 0) - (b.queuePosition || 0));
    return {
      profile,
      event,
      eventRegistration,
      activityRegistrations: activities.filter((r: any) => r.eventId === event._id),
      upcomingMatch: matches.find((m: any) => !["completed", "walkover", "no_show", "cancelled"].includes(m.status)) || null,
      matchHistory: matches.filter((m: any) => ["completed", "walkover", "no_show"].includes(m.status)).slice(0, 10),
      pookalam,
      notifications,
      now: args.now,
    };
  },
});

export const registerForOnam = mutation({
  args: {},
  handler: async (ctx) => {
    const event = await getOnamEvent(ctx);
    if (!event) throw new Error("ONAM 2026 has not been created.");
    const settings = await getOrCreateSettings(ctx, event);
    const { clerkUserId } = await requireProfile(ctx);
    const now = Date.now();
    if (now < settings.registrationOpensAt) throw new Error("Registration is not open yet.");
    if (now > settings.registrationClosesAt) throw new Error("Registration is closed.");
    const existing = await ctx.db.query("eventRegistrations").withIndex("by_eventId_and_user", (q: any) => q.eq("eventId", event._id).eq("clerkUserId", clerkUserId)).first();
    if (existing) return existing;
    const current = await ctx.db.query("eventRegistrations").withIndex("by_eventId", (q: any) => q.eq("eventId", event._id)).take(1000);
    const registration = {
      eventId: event._id,
      clerkUserId,
      registrationRef: registrationRef("ONAM", current.length),
      registeredAt: now,
    };
    const id = await ctx.db.insert("eventRegistrations", registration);
    await ctx.db.patch(event._id, { participantCount: event.participantCount + 1, updatedAt: now });
    await ctx.db.insert("notifications", {
      clerkUserId,
      title: "ONAM 2026 Registered",
      message: "You successfully registered for ONAM 2026.",
      type: "system",
      link: "/dashboard",
      isRead: false,
      createdAt: now,
    });
    return await ctx.db.get(id);
  },
});

export const registerForActivity = mutation({
  args: { activitySlug },
  handler: async (ctx, args) => {
    const event = await getOnamEvent(ctx);
    if (!event) throw new Error("ONAM 2026 has not been created.");
    const settings = await getOrCreateSettings(ctx, event);
    const { clerkUserId, profile } = await requireProfile(ctx);
    const now = Date.now();
    if (now < settings.registrationOpensAt || now > settings.registrationClosesAt) throw new Error("Activity registration is not open.");
    const eventRegistration = await ctx.db.query("eventRegistrations").withIndex("by_eventId_and_user", (q: any) => q.eq("eventId", event._id).eq("clerkUserId", clerkUserId)).first();
    if (!eventRegistration) throw new Error("Register for ONAM 2026 first.");
    const existing = await ctx.db.query("activityRegistrations").withIndex("by_event_activity_and_user", (q: any) => q.eq("eventId", event._id).eq("activitySlug", args.activitySlug).eq("clerkUserId", clerkUserId)).first();
    if (existing) return existing;
    const current = await ctx.db.query("activityRegistrations").withIndex("by_event_and_activity", (q: any) => q.eq("eventId", event._id).eq("activitySlug", args.activitySlug)).take(1000);
    const id = await ctx.db.insert("activityRegistrations", {
      eventId: event._id,
      activitySlug: args.activitySlug,
      clerkUserId,
      registrationRef: registrationRef(args.activitySlug.toUpperCase(), current.length),
      status: "registered",
      registeredAt: now,
    });
    if (args.activitySlug === "vadamvali") {
      const tournament = await getOrCreateTournament(ctx, event._id);
      await ctx.db.insert("vadamvaliParticipants", {
        eventId: event._id,
        tournamentId: tournament?._id,
        clerkUserId,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
        eliminated: false,
        registeredAt: now,
      });
    }
    await ctx.db.insert("notifications", {
      clerkUserId,
      title: "Activity Registered",
      message: `You successfully registered for ${args.activitySlug === "vadamvali" ? "Vadamvali" : args.activitySlug === "pookalam" ? "Digital Pookalam" : "Onam Cultural Quiz"}.`,
      type: "system",
      link: "/dashboard",
      isRead: false,
      createdAt: now,
    });
    return await ctx.db.get(id);
  },
});

export const updateSettings = mutation({
  args: {
    registrationOpensAt: v.optional(v.number()),
    registrationClosesAt: v.optional(v.number()),
    pookalamLiveVoteCounts: v.optional(v.boolean()),
    pookalamVoteChangesAllowed: v.optional(v.boolean()),
    quizStatus: v.optional(v.union(v.literal("registration"), v.literal("lobby"), v.literal("live"), v.literal("paused"), v.literal("finished"))),
  },
  handler: async (ctx, args) => {
    const event = await getOnamEvent(ctx);
    if (!event) throw new Error("ONAM 2026 has not been created.");
    const { clerkUserId, profile } = await requireAdmin(ctx);
    const settings = await getOrCreateSettings(ctx, event);
    const now = Date.now();
    await ctx.db.patch(settings._id, { ...args, updatedAt: now });
    await ctx.db.insert("adminLogs", {
      adminClerkUserId: clerkUserId,
      adminDisplayName: profile.displayName,
      action: "ONAM_SETTINGS_UPDATED",
      entity: "onamSettings",
      entityId: settings._id,
      details: args,
      timestamp: now,
    });
    return true;
  },
});

export const generateVadamvaliFixture = mutation({
  args: {},
  handler: async (ctx) => {
    const event = await getOnamEvent(ctx);
    if (!event) throw new Error("ONAM 2026 has not been created.");
    const { clerkUserId, profile } = await requireAdmin(ctx);
    const tournament = await getOrCreateTournament(ctx, event._id);
    const existing = await ctx.db.query("tournamentMatches").withIndex("by_tournament_and_queue", (q: any) => q.eq("tournamentId", tournament._id)).first();
    if (existing) throw new Error("Fixture has already been generated.");
    const participants = await ctx.db.query("vadamvaliParticipants").withIndex("by_tournament_and_seed", (q: any) => q.eq("tournamentId", tournament._id)).take(1000);
    if (participants.length < 2) throw new Error("At least two Vadamvali participants are required.");
    const seeded = shuffle(participants).map((p: any, index: number) => ({ ...p, seed: index + 1 }));
    for (const p of seeded) await ctx.db.patch(p._id, { seed: p.seed });
    const bracketSize = nextPowerOfTwo(seeded.length);
    const byes = bracketSize - seeded.length;
    const slots: Array<any | null> = [...seeded, ...Array(byes).fill(null)];
    const roundCount = Math.log2(bracketSize);
    const roundIds: Id<"tournamentRounds">[] = [];
    for (let round = 1; round <= roundCount; round++) {
      const size = bracketSize / Math.pow(2, round - 1);
      const id = await ctx.db.insert("tournamentRounds", {
        tournamentId: tournament._id,
        eventId: event._id,
        roundNumber: round,
        name: roundName(size, round === 1),
        size,
        status: round === 1 ? "active" : "waiting",
      });
      roundIds.push(id);
    }
    let queuePosition = 1;
    let previousRoundMatchIds: Id<"tournamentMatches">[] = [];
    for (let i = 0; i < bracketSize; i += 2) {
      const p1 = slots[i];
      const p2 = slots[i + 1];
      const isBye = !!p1 && !p2;
      const matchId = await ctx.db.insert("tournamentMatches", {
        tournamentId: tournament._id,
        eventId: event._id,
        roundId: roundIds[0],
        roundNumber: 1,
        matchNumber: i / 2 + 1,
        queuePosition: isBye ? 0 : queuePosition++,
        player1ClerkUserId: p1?.clerkUserId,
        player1Name: p1?.displayName,
        player2ClerkUserId: p2?.clerkUserId,
        player2Name: p2?.displayName,
        status: isBye ? "completed" : queuePosition === 2 ? "upcoming" : "scheduled",
        expectedStartAt: isBye ? undefined : tournament.tournamentStartsAt + (queuePosition - 2) * (tournament.averageMatchDurationMinutes + tournament.transitionMinutes) * 60000,
        completedAt: isBye ? Date.now() : undefined,
        winnerClerkUserId: isBye ? p1.clerkUserId : undefined,
        matchResultType: isBye ? "bye" : undefined,
        player1Wins: 0,
        player2Wins: 0,
        updatedAt: Date.now(),
      });
      previousRoundMatchIds.push(matchId);
    }
    for (let round = 2; round <= roundCount; round++) {
      const nextRoundMatchIds: Id<"tournamentMatches">[] = [];
      for (let i = 0; i < previousRoundMatchIds.length; i += 2) {
        const matchId = await ctx.db.insert("tournamentMatches", {
          tournamentId: tournament._id,
          eventId: event._id,
          roundId: roundIds[round - 1],
          roundNumber: round,
          matchNumber: i / 2 + 1,
          queuePosition: queuePosition++,
          status: "scheduled",
          player1Wins: 0,
          player2Wins: 0,
          updatedAt: Date.now(),
        });
        await ctx.db.patch(previousRoundMatchIds[i], { nextMatchId: matchId, nextSlot: "player1" });
        if (previousRoundMatchIds[i + 1]) await ctx.db.patch(previousRoundMatchIds[i + 1], { nextMatchId: matchId, nextSlot: "player2" });
        nextRoundMatchIds.push(matchId);
      }
      previousRoundMatchIds = nextRoundMatchIds;
    }
    await advanceByeWinners(ctx, tournament._id);
    await ctx.db.patch(tournament._id, { status: "fixture_ready", generatedAt: Date.now(), updatedAt: Date.now() });
    await ctx.db.insert("adminLogs", {
      adminClerkUserId: clerkUserId,
      adminDisplayName: profile.displayName,
      action: "VADAMVALI_FIXTURE_GENERATED",
      entity: "vadamvaliTournaments",
      entityId: tournament._id,
      details: { participants: participants.length, bracketSize, byes },
      timestamp: Date.now(),
    });
    return { participants: participants.length, bracketSize, byes };
  },
});

async function advanceByeWinners(ctx: any, tournamentId: Id<"vadamvaliTournaments">) {
  const completed = await ctx.db.query("tournamentMatches").withIndex("by_tournament_and_status", (q: any) => q.eq("tournamentId", tournamentId).eq("status", "completed")).take(1000);
  for (const match of completed) {
    if (!match.winnerClerkUserId || !match.nextMatchId || !match.nextSlot) continue;
    const patch: any = match.nextSlot === "player1"
      ? { player1ClerkUserId: match.winnerClerkUserId, player1Name: match.player1Name }
      : { player2ClerkUserId: match.winnerClerkUserId, player2Name: match.player1Name };
    await ctx.db.patch(match.nextMatchId, { ...patch, updatedAt: Date.now() });
  }
}

export const listFixture = query({
  args: {},
  handler: async (ctx) => {
    const event = await getOnamEvent(ctx);
    if (!event) return null;
    const tournament = await getTournament(ctx, event._id);
    if (!tournament._id) return { tournament, rounds: [], matches: [] };
    const rounds = await ctx.db.query("tournamentRounds").withIndex("by_tournament", (q: any) => q.eq("tournamentId", tournament._id)).take(20);
    const matches = await ctx.db.query("tournamentMatches").withIndex("by_tournament_and_queue", (q: any) => q.eq("tournamentId", tournament._id)).take(1000);
    return { tournament, rounds: rounds.sort((a: any, b: any) => a.roundNumber - b.roundNumber), matches };
  },
});

export const openNextMatchCheckIn = mutation({
  args: {},
  handler: async (ctx) => {
    const event = await getOnamEvent(ctx);
    if (!event) throw new Error("ONAM 2026 has not been created.");
    await canOperateLiveMatch(ctx, event._id);
    const tournament = await getOrCreateTournament(ctx, event._id);
    const live = await ctx.db.query("tournamentMatches").withIndex("by_tournament_and_status", (q: any) => q.eq("tournamentId", tournament._id).eq("status", "live")).first();
    if (live) throw new Error("Another Vadamvali match is already live.");
    const next = await ctx.db.query("tournamentMatches").withIndex("by_tournament_and_status", (q: any) => q.eq("tournamentId", tournament._id).eq("status", "upcoming")).first();
    if (!next || !next.player1ClerkUserId || !next.player2ClerkUserId) throw new Error("No eligible next match is ready.");
    const now = Date.now();
    await ctx.db.patch(next._id, {
      status: "ready_for_checkin",
      checkInOpenedAt: now,
      checkInClosesAt: now + CHECK_IN_MINUTES * 60000,
      updatedAt: now,
    });
    for (const userId of [next.player1ClerkUserId, next.player2ClerkUserId]) {
      await ctx.db.insert("notifications", {
        clerkUserId: userId,
        title: "Your match is ready",
        message: "Please check in within 15 minutes.",
        type: "event_announcement",
        link: "/events/onam-2026/vadamvali",
        isRead: false,
        createdAt: now,
      });
    }
    return next._id;
  },
});

export const checkInForMatch = mutation({
  args: { matchId: v.id("tournamentMatches") },
  handler: async (ctx, args) => {
    const { clerkUserId } = await requireProfile(ctx);
    const match = await ctx.db.get(args.matchId);
    if (!match) throw new Error("Match not found.");
    if (match.status !== "ready_for_checkin" && match.status !== "waiting_for_players") throw new Error("Check-in is not open.");
    if (match.player1ClerkUserId !== clerkUserId && match.player2ClerkUserId !== clerkUserId) throw new Error("You are not in this match.");
    const now = Date.now();
    if (match.checkInClosesAt && now > match.checkInClosesAt) throw new Error("Check-in window has closed.");
    const existing = await ctx.db.query("matchCheckIns").withIndex("by_match_and_user", (q: any) => q.eq("matchId", args.matchId).eq("clerkUserId", clerkUserId)).first();
    if (!existing) await ctx.db.insert("matchCheckIns", { matchId: args.matchId, clerkUserId, checkedInAt: now });
    const checkIns = await ctx.db.query("matchCheckIns").withIndex("by_match", (q: any) => q.eq("matchId", args.matchId)).take(2);
    await ctx.db.patch(match._id, { status: checkIns.length >= 2 ? "ready" : "waiting_for_players", updatedAt: now });
    const opponent = clerkUserId === match.player1ClerkUserId ? match.player2ClerkUserId : match.player1ClerkUserId;
    if (opponent) {
      await ctx.db.insert("notifications", {
        clerkUserId: opponent,
        title: "Opponent checked in",
        message: "Your opponent has checked in for the Vadamvali match.",
        type: "event_announcement",
        link: "/events/onam-2026/vadamvali",
        isRead: false,
        createdAt: now,
      });
    }
    return true;
  },
});

export const startReadyMatch = mutation({
  args: { matchId: v.id("tournamentMatches") },
  handler: async (ctx, args) => {
    const match = await ctx.db.get(args.matchId);
    if (!match) throw new Error("Match not found.");
    await canOperateLiveMatch(ctx, match.eventId);
    const tournament = await ctx.db.get(match.tournamentId);
    if (!tournament) throw new Error("Tournament not found.");
    const live = await ctx.db.query("tournamentMatches").withIndex("by_tournament_and_status", (q: any) => q.eq("tournamentId", tournament._id).eq("status", "live")).first();
    if (live && live._id !== match._id) throw new Error("Only one Vadamvali match may be live.");
    const checkIns = await ctx.db.query("matchCheckIns").withIndex("by_match", (q: any) => q.eq("matchId", match._id)).take(2);
    const p1Ready = checkIns.some((c: any) => c.clerkUserId === match.player1ClerkUserId);
    const p2Ready = checkIns.some((c: any) => c.clerkUserId === match.player2ClerkUserId);
    if (!p1Ready || !p2Ready) throw new Error("Both players must check in before the host starts the match.");
    const now = Date.now();
    await ctx.db.patch(match._id, { status: "live", startedAt: now, updatedAt: now });
    await ctx.db.patch(tournament._id, { status: "live", currentMatchId: match._id, updatedAt: now });
    return true;
  },
});

export const recordGameWinner = mutation({
  args: { matchId: v.id("tournamentMatches"), winnerClerkUserId: v.string() },
  handler: async (ctx, args) => {
    const match = await ctx.db.get(args.matchId);
    if (!match) throw new Error("Match not found.");
    const { clerkUserId } = await canOperateLiveMatch(ctx, match.eventId);
    if (match.status !== "live") throw new Error("Match is not live.");
    if (args.winnerClerkUserId !== match.player1ClerkUserId && args.winnerClerkUserId !== match.player2ClerkUserId) throw new Error("Winner must be one of the match players.");
    const games = await ctx.db.query("matchGames").withIndex("by_match", (q: any) => q.eq("matchId", match._id)).take(3);
    if (games.length >= 3) throw new Error("Best-of-3 is already complete.");
    await ctx.db.insert("matchGames", { matchId: match._id, gameNumber: games.length + 1, winnerClerkUserId: args.winnerClerkUserId, recordedBy: clerkUserId, recordedAt: Date.now() });
    const p1Wins = match.player1Wins + (args.winnerClerkUserId === match.player1ClerkUserId ? 1 : 0);
    const p2Wins = match.player2Wins + (args.winnerClerkUserId === match.player2ClerkUserId ? 1 : 0);
    if (p1Wins === 2 || p2Wins === 2) {
      const winner = p1Wins === 2 ? match.player1ClerkUserId! : match.player2ClerkUserId!;
      const loser = p1Wins === 2 ? match.player2ClerkUserId! : match.player1ClerkUserId!;
      await completeTournamentMatch(ctx, match, winner, loser, "played", null, { player1Wins: p1Wins, player2Wins: p2Wins });
    } else {
      await ctx.db.patch(match._id, { player1Wins: p1Wins, player2Wins: p2Wins, updatedAt: Date.now() });
    }
    return { player1Wins: p1Wins, player2Wins: p2Wins };
  },
});

async function completeTournamentMatch(ctx: any, match: Doc<"tournamentMatches">, winner: string, loser: string | null, type: "played" | "walkover" | "no_show", reason: string | null, scorePatch: any = {}) {
  const now = Date.now();
  await ctx.db.patch(match._id, {
    ...scorePatch,
    status: type === "played" ? "completed" : type,
    winnerClerkUserId: winner,
    loserClerkUserId: loser || undefined,
    matchResultType: type,
    reason: reason || undefined,
    completedAt: now,
    updatedAt: now,
  });
  if (match.nextMatchId && match.nextSlot) {
    const patch: any = match.nextSlot === "player1"
      ? { player1ClerkUserId: winner, player1Name: winner === match.player1ClerkUserId ? match.player1Name : match.player2Name }
      : { player2ClerkUserId: winner, player2Name: winner === match.player1ClerkUserId ? match.player1Name : match.player2Name };
    await ctx.db.patch(match.nextMatchId, { ...patch, updatedAt: now });
  } else {
    await ctx.db.patch(match.tournamentId, { status: "completed", championClerkUserId: winner, currentMatchId: undefined, updatedAt: now });
  }
  const next = await ctx.db.query("tournamentMatches").withIndex("by_tournament_and_status", (q: any) => q.eq("tournamentId", match.tournamentId).eq("status", "scheduled")).first();
  if (next && next.player1ClerkUserId && next.player2ClerkUserId) {
    await ctx.db.patch(next._id, { status: "upcoming", expectedStartAt: now + 2 * 60000, updatedAt: now });
  }
}

export const resolveExpiredCheckIn = mutation({
  args: { matchId: v.id("tournamentMatches") },
  handler: async (ctx, args) => {
    const match = await ctx.db.get(args.matchId);
    if (!match) throw new Error("Match not found.");
    await canOperateLiveMatch(ctx, match.eventId);
    if (!match.checkInClosesAt || Date.now() < match.checkInClosesAt) throw new Error("Check-in is still open.");
    const checkIns = await ctx.db.query("matchCheckIns").withIndex("by_match", (q: any) => q.eq("matchId", match._id)).take(2);
    const p1Ready = checkIns.some((c: any) => c.clerkUserId === match.player1ClerkUserId);
    const p2Ready = checkIns.some((c: any) => c.clerkUserId === match.player2ClerkUserId);
    if (p1Ready && !p2Ready && match.player1ClerkUserId) {
      await completeTournamentMatch(ctx, match, match.player1ClerkUserId, match.player2ClerkUserId || null, "walkover", "no_show");
      return "player1_walkover";
    }
    if (p2Ready && !p1Ready && match.player2ClerkUserId) {
      await completeTournamentMatch(ctx, match, match.player2ClerkUserId, match.player1ClerkUserId || null, "walkover", "no_show");
      return "player2_walkover";
    }
    await ctx.db.patch(match._id, { status: "admin_review", matchResultType: "no_show", reason: "both_players_no_show", updatedAt: Date.now() });
    return "admin_review";
  },
});
