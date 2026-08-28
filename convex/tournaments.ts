import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { getAuthUserId, getOrEnsureProfile } from "./profiles";
import { requireAdmin, requireUser } from "./lib/auth";

function nextPowerOfTwo(value: number) {
  let size = 1;
  while (size < value) size *= 2;
  return size;
}

function roundName(roundNumber: number, totalRounds: number, entrantsCount: number) {
  if (roundNumber === totalRounds) return "Final";
  if (roundNumber === totalRounds - 1) return "Semifinal";
  if (roundNumber === totalRounds - 2) return "Quarterfinal";
  if (entrantsCount <= 2) return "Final";
  return `Round of ${entrantsCount}`;
}

function seededSlots(size: number): number[] {
  let slots = [1, 2];
  while (slots.length < size) {
    const nextSize = slots.length * 2 + 1;
    slots = slots.flatMap((seed) => [seed, nextSize - seed]);
  }
  return slots;
}

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

async function ensureTournament(ctx: MutationCtx, activityId: Id<"eventActivities">) {
  const existing = await ctx.db
    .query("tournaments")
    .withIndex("by_activityId", (q) => q.eq("activityId", activityId))
    .first();
  if (existing) return existing;

  const activity = await ctx.db.get(activityId);
  if (!activity) throw new Error("ACTIVITY_NOT_FOUND");

  const now = Date.now();
  const config = (activity.config ?? {}) as {
    seedingMethod?: "random" | "ranking" | "manual";
    tournamentStartAt?: number;
    matchDurationMinutes?: number;
    intervalMinutes?: number;
    simultaneousMatches?: number;
    thirdPlaceEnabled?: boolean;
  };

  const id = await ctx.db.insert("tournaments", {
    eventId: activity.eventId,
    activityId,
    name: activity.title,
    status: activity.status === "registration_closed" ? "registration_closed" : "registration_open",
    seedingMethod: config.seedingMethod ?? "random",
    winsRequired: 2,
    maxGames: 3,
    thirdPlaceEnabled: config.thirdPlaceEnabled ?? false,
    tournamentStartAt: config.tournamentStartAt ?? activity.scheduledStartTime,
    matchDurationMinutes: config.matchDurationMinutes ?? 10,
    intervalMinutes: config.intervalMinutes ?? 2,
    simultaneousMatches: Math.max(1, config.simultaneousMatches ?? 1),
    createdAt: now,
    updatedAt: now,
  });
  return (await ctx.db.get(id))!;
}

async function assignWinnerToNextMatch(
  ctx: MutationCtx,
  match: Doc<"tournamentMatches">,
  winnerClerkUserId: string,
) {
  if (!match.nextMatchId || !match.nextSlot) return;
  const next = await ctx.db.get(match.nextMatchId);
  if (!next) return;
  const winnerProfile = await ctx.db
    .query("profiles")
    .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", winnerClerkUserId))
    .first();
  const prefix = match.nextSlot === "player1" ? "player1" : "player2";
  await ctx.db.patch(next._id, {
    [`${prefix}ClerkUserId`]: winnerClerkUserId,
    [`${prefix}DisplayName`]: winnerProfile?.displayName ?? "Qualified Player",
    [`${prefix}AvatarUrl`]: winnerProfile?.avatarUrl ?? "",
    status: next.player1ClerkUserId || next.player2ClerkUserId ? "ready" : "waiting",
    updatedAt: Date.now(),
  });
}

export const registerForActivity = mutation({
  args: { activityId: v.id("eventActivities") },
  handler: async (ctx, args) => {
    const { identity } = await requireUser(ctx);
    const clerkUserId = identity.subject;
    const profile = await getOrEnsureProfile(ctx, clerkUserId);
    if (profile.isSuspended || profile.isBanned) throw new Error("ACCOUNT_RESTRICTED");

    const activity = await ctx.db.get(args.activityId);
    if (!activity) throw new Error("ACTIVITY_NOT_FOUND");
    const event = await ctx.db.get(activity.eventId);
    if (!event) throw new Error("EVENT_NOT_FOUND");
    if (activity.status !== "registration_open") throw new Error("REGISTRATION_CLOSED");
    if (activity.registrationCloseTime && activity.registrationCloseTime < Date.now()) {
      throw new Error("REGISTRATION_CLOSED");
    }

    const existing = await ctx.db
      .query("activityRegistrations")
      .withIndex("by_activity_and_user", (q) =>
        q.eq("activityId", args.activityId).eq("clerkUserId", clerkUserId),
      )
      .first();
    if (existing && existing.status !== "cancelled") return existing._id;

    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, { status: "registered", updatedAt: now });
      return existing._id;
    }

    const registrationId = await ctx.db.insert("activityRegistrations", {
      eventId: activity.eventId,
      activityId: args.activityId,
      clerkUserId,
      status: "registered",
      registeredAt: now,
      updatedAt: now,
    });
    await ctx.db.patch(activity._id, {
      participantCount: (activity.participantCount ?? 0) + 1,
    });
    await ctx.db.insert("notifications", {
      clerkUserId,
      title: `${activity.title} registration confirmed`,
      message: "You are registered. Match assignments will update here when the bracket is generated.",
      type: "system",
      link: `/events`,
      isRead: false,
      createdAt: now,
    });
    return registrationId;
  },
});

export const generateTournamentBracket = mutation({
  args: { activityId: v.id("eventActivities") },
  handler: async (ctx, args) => {
    const { identity, profile } = await requireAdmin(ctx);
    const activity = await ctx.db.get(args.activityId);
    if (!activity) throw new Error("ACTIVITY_NOT_FOUND");
    const event = await ctx.db.get(activity.eventId);
    if (!event) throw new Error("EVENT_NOT_FOUND");
    if (activity.status !== "registration_closed" && activity.status !== "closed") {
      throw new Error("REGISTRATION_MUST_BE_CLOSED");
    }

    const tournament = await ensureTournament(ctx, args.activityId);
    if (tournament.status === "live" || tournament.status === "completed") {
      throw new Error("CANNOT_REGENERATE_ACTIVE_BRACKET");
    }
    const existingMatches = await ctx.db
      .query("tournamentMatches")
      .withIndex("by_tournament_and_round", (q) => q.eq("tournamentId", tournament._id).eq("roundNumber", 1))
      .take(1);
    if (existingMatches.length > 0) throw new Error("BRACKET_ALREADY_GENERATED");

    const registrations = await ctx.db
      .query("activityRegistrations")
      .withIndex("by_activity_and_status", (q) => q.eq("activityId", args.activityId).eq("status", "registered"))
      .take(256);
    if (registrations.length < 2) throw new Error("NEED_AT_LEAST_TWO_PARTICIPANTS");

    const participants = [];
    for (const registration of registrations) {
      const userProfile = await ctx.db
        .query("profiles")
        .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", registration.clerkUserId))
        .first();
      if (!userProfile || userProfile.isBanned || userProfile.isSuspended) continue;
      participants.push({ registration, profile: userProfile });
    }
    if (participants.length < 2) throw new Error("NO_VALID_PARTICIPANTS");

    const sorted =
      tournament.seedingMethod === "ranking"
        ? [...participants].sort((a, b) => (b.profile.points ?? 0) - (a.profile.points ?? 0))
        : shuffle(participants);
    const bracketSize = nextPowerOfTwo(sorted.length);
    const slots = seededSlots(bracketSize);
    const seededBySlot = new Map<number, (typeof sorted)[number]>();
    sorted.forEach((participant, index) => seededBySlot.set(slots[index], participant));

    const now = Date.now();
    const participantIds = new Map<string, Id<"tournamentParticipants">>();
    for (let i = 0; i < sorted.length; i++) {
      const seed = i + 1;
      const participant = sorted[i];
      const participantId = await ctx.db.insert("tournamentParticipants", {
        tournamentId: tournament._id,
        activityRegistrationId: participant.registration._id,
        clerkUserId: participant.registration.clerkUserId,
        displayName: participant.profile.displayName,
        avatarUrl: participant.profile.avatarUrl,
        seed,
        status: "active",
        createdAt: now,
        updatedAt: now,
      });
      participantIds.set(participant.registration.clerkUserId, participantId);
    }

    const totalRounds = Math.log2(bracketSize);
    const roundIds: Id<"tournamentRounds">[] = [];
    for (let roundNumber = 1; roundNumber <= totalRounds; roundNumber++) {
      const entrantsCount = bracketSize / Math.pow(2, roundNumber - 1);
      roundIds.push(await ctx.db.insert("tournamentRounds", {
        tournamentId: tournament._id,
        roundNumber,
        name: roundName(roundNumber, totalRounds, entrantsCount),
        entrantsCount,
        status: roundNumber === 1 ? "ready" : "waiting",
        createdAt: now,
        updatedAt: now,
      }));
    }

    const matchIdsByRound: Id<"tournamentMatches">[][] = [];
    for (let roundNumber = 1; roundNumber <= totalRounds; roundNumber++) {
      const matchesInRound = bracketSize / Math.pow(2, roundNumber);
      const roundMatchIds: Id<"tournamentMatches">[] = [];
      for (let slotIndex = 0; slotIndex < matchesInRound; slotIndex++) {
        const scheduledAt = tournament.tournamentStartAt
          ? tournament.tournamentStartAt +
            Math.floor(slotIndex / tournament.simultaneousMatches) *
              (tournament.matchDurationMinutes + tournament.intervalMinutes) *
              60_000
          : undefined;
        const id = await ctx.db.insert("tournamentMatches", {
          tournamentId: tournament._id,
          roundId: roundIds[roundNumber - 1],
          roundNumber,
          matchNumber: slotIndex + 1,
          slotIndex,
          player1Ready: false,
          player2Ready: false,
          player1GameWins: 0,
          player2GameWins: 0,
          status: roundNumber === 1 ? "scheduled" : "waiting",
          scheduledAt,
          createdAt: now,
          updatedAt: now,
        });
        roundMatchIds.push(id);
      }
      matchIdsByRound.push(roundMatchIds);
    }

    for (let roundNumber = 1; roundNumber <= totalRounds; roundNumber++) {
      for (let i = 0; i < matchIdsByRound[roundNumber - 1].length; i++) {
        const nextMatchId = roundNumber < totalRounds ? matchIdsByRound[roundNumber][Math.floor(i / 2)] : undefined;
        await ctx.db.patch(matchIdsByRound[roundNumber - 1][i], {
          nextMatchId,
          nextSlot: roundNumber < totalRounds ? (i % 2 === 0 ? "player1" : "player2") : undefined,
        });
      }
    }

    let autoAdvanced = 0;
    for (let slotIndex = 0; slotIndex < bracketSize / 2; slotIndex++) {
      const match = (await ctx.db.get(matchIdsByRound[0][slotIndex]))!;
      const player1 = seededBySlot.get(slotIndex * 2 + 1);
      const player2 = seededBySlot.get(slotIndex * 2 + 2);
      const patch: Partial<Doc<"tournamentMatches">> = {
        player1ClerkUserId: player1?.registration.clerkUserId,
        player1DisplayName: player1?.profile.displayName,
        player1AvatarUrl: player1?.profile.avatarUrl,
        player2ClerkUserId: player2?.registration.clerkUserId,
        player2DisplayName: player2?.profile.displayName,
        player2AvatarUrl: player2?.profile.avatarUrl,
        status: player1 && player2 ? "scheduled" : "completed",
        winnerClerkUserId: player1 && !player2 ? player1.registration.clerkUserId : player2 && !player1 ? player2.registration.clerkUserId : undefined,
        completedAt: player1 && player2 ? undefined : now,
        updatedAt: now,
      };
      await ctx.db.patch(match._id, patch);
      const byeWinner = patch.winnerClerkUserId;
      if (byeWinner) {
        autoAdvanced++;
        await assignWinnerToNextMatch(ctx, { ...match, ...patch } as Doc<"tournamentMatches">, byeWinner);
      }
    }

    await ctx.db.patch(tournament._id, {
      status: "generated",
      bracketSize,
      generatedAt: now,
      updatedAt: now,
    });
    await ctx.db.insert("adminLogs", {
      adminClerkUserId: identity.subject,
      adminDisplayName: profile.displayName,
      action: "TOURNAMENT_BRACKET_GENERATED",
      entity: "tournaments",
      entityId: tournament._id,
      details: { participants: participants.length, bracketSize, autoAdvanced },
      timestamp: now,
    });

    for (const participant of sorted) {
      await ctx.db.insert("notifications", {
        clerkUserId: participant.registration.clerkUserId,
        title: "Tournament bracket generated",
        message: `${activity.title} bracket is ready. Your match assignment will update automatically.`,
        type: "system",
        link: `/events/${event.slug}/bracket`,
        isRead: false,
        createdAt: now,
      });
    }

    return { tournamentId: tournament._id, participants: participants.length, bracketSize, byes: autoAdvanced };
  },
});

export const listBracket = query({
  args: { activityId: v.id("eventActivities") },
  handler: async (ctx, args) => {
    const tournament = await ctx.db
      .query("tournaments")
      .withIndex("by_activityId", (q) => q.eq("activityId", args.activityId))
      .first();
    if (!tournament) return null;
    const rounds = await ctx.db
      .query("tournamentRounds")
      .withIndex("by_tournamentId", (q) => q.eq("tournamentId", tournament._id))
      .take(16);
    const matches = await ctx.db
      .query("tournamentMatches")
      .withIndex("by_tournament_and_round", (q) => q.eq("tournamentId", tournament._id).eq("roundNumber", 1))
      .take(256);
    const allMatches = [...matches];
    for (const round of rounds.filter((r) => r.roundNumber !== 1)) {
      const roundMatches = await ctx.db
        .query("tournamentMatches")
        .withIndex("by_tournament_and_round", (q) => q.eq("tournamentId", tournament._id).eq("roundNumber", round.roundNumber))
        .take(256);
      allMatches.push(...roundMatches);
    }
    return {
      tournament,
      rounds: rounds.sort((a, b) => a.roundNumber - b.roundNumber),
      matches: allMatches.sort((a, b) => a.roundNumber - b.roundNumber || a.matchNumber - b.matchNumber),
    };
  },
});

export const myNextMatch = query({
  args: { activityId: v.id("eventActivities") },
  handler: async (ctx, args) => {
    const clerkUserId = await getAuthUserId(ctx);
    if (!clerkUserId) return null;
    const tournament = await ctx.db
      .query("tournaments")
      .withIndex("by_activityId", (q) => q.eq("activityId", args.activityId))
      .first();
    if (!tournament) return null;
    const p1Matches = await ctx.db.query("tournamentMatches").withIndex("by_player1", q => q.eq("player1ClerkUserId", clerkUserId)).take(20);
    const p2Matches = await ctx.db.query("tournamentMatches").withIndex("by_player2", q => q.eq("player2ClerkUserId", clerkUserId)).take(20);
    return [...p1Matches, ...p2Matches]
      .filter((m) => m.tournamentId === tournament._id && m.status !== "completed" && m.status !== "cancelled")
      .sort((a, b) => (a.scheduledAt ?? 0) - (b.scheduledAt ?? 0))[0] ?? null;
  },
});

export const setMatchReady = mutation({
  args: { matchId: v.id("tournamentMatches"), ready: v.boolean() },
  handler: async (ctx, args) => {
    const { identity } = await requireUser(ctx);
    const match = await ctx.db.get(args.matchId);
    if (!match) throw new Error("MATCH_NOT_FOUND");
    const patch: Partial<Doc<"tournamentMatches">> = { updatedAt: Date.now() };
    if (match.player1ClerkUserId === identity.subject) patch.player1Ready = args.ready;
    else if (match.player2ClerkUserId === identity.subject) patch.player2Ready = args.ready;
    else throw new Error("NOT_A_MATCH_PLAYER");
    const p1Ready = patch.player1Ready ?? match.player1Ready;
    const p2Ready = patch.player2Ready ?? match.player2Ready;
    if (p1Ready && p2Ready && match.status !== "live") {
      patch.status = "ready";
    }
    await ctx.db.patch(match._id, patch);
    return true;
  },
});

export const recordGameResult = mutation({
  args: {
    matchId: v.id("tournamentMatches"),
    gameNumber: v.number(),
    winnerClerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const match = await ctx.db.get(args.matchId);
    if (!match) throw new Error("MATCH_NOT_FOUND");
    if (match.status === "completed") throw new Error("MATCH_ALREADY_COMPLETED");
    if (args.gameNumber > 3 || args.gameNumber < 1) throw new Error("INVALID_GAME_NUMBER");
    if (match.player1GameWins >= 2 || match.player2GameWins >= 2) throw new Error("MATCH_ALREADY_DECIDED");
    if (args.winnerClerkUserId !== match.player1ClerkUserId && args.winnerClerkUserId !== match.player2ClerkUserId) {
      throw new Error("WINNER_NOT_IN_MATCH");
    }

    const previousGame = await ctx.db
      .query("matchGames")
      .withIndex("by_match_and_game", (q) => q.eq("tournamentMatchId", args.matchId).eq("gameNumber", args.gameNumber))
      .first();
    if (previousGame) throw new Error("GAME_ALREADY_RECORDED");

    const now = Date.now();
    await ctx.db.insert("matchGames", {
      tournamentMatchId: args.matchId,
      gameNumber: args.gameNumber,
      status: "completed",
      ropePosition: args.winnerClerkUserId === match.player1ClerkUserId ? -100 : 100,
      winnerClerkUserId: args.winnerClerkUserId,
      startedAt: now,
      completedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    const player1GameWins = match.player1GameWins + (args.winnerClerkUserId === match.player1ClerkUserId ? 1 : 0);
    const player2GameWins = match.player2GameWins + (args.winnerClerkUserId === match.player2ClerkUserId ? 1 : 0);
    const matchWinner =
      player1GameWins >= 2 ? match.player1ClerkUserId : player2GameWins >= 2 ? match.player2ClerkUserId : undefined;
    await ctx.db.patch(match._id, {
      player1GameWins,
      player2GameWins,
      winnerClerkUserId: matchWinner,
      status: matchWinner ? "completed" : "live",
      completedAt: matchWinner ? now : undefined,
      updatedAt: now,
    });

    if (matchWinner) {
      await assignWinnerToNextMatch(ctx, { ...match, player1GameWins, player2GameWins } as Doc<"tournamentMatches">, matchWinner);
      if (!match.nextMatchId) {
        await ctx.db.patch(match.tournamentId, { status: "completed", winnerClerkUserId: matchWinner, updatedAt: now });
      }
    }

    return { matchWinner: matchWinner ?? null, player1GameWins, player2GameWins };
  },
});

export const spectateMatch = mutation({
  args: { matchId: v.id("tournamentMatches") },
  handler: async (ctx, args) => {
    const { identity, profile } = await requireUser(ctx);
    if (profile.role !== "streamer" && profile.role !== "admin" && profile.role !== "super_admin") {
      throw new Error("STREAMER_APPROVAL_REQUIRED");
    }
    const match = await ctx.db.get(args.matchId);
    if (!match) throw new Error("MATCH_NOT_FOUND");
    const now = Date.now();
    const existing = await ctx.db
      .query("matchSpectators")
      .withIndex("by_match_and_user", q => q.eq("tournamentMatchId", args.matchId).eq("clerkUserId", identity.subject))
      .first();
    if (existing) await ctx.db.patch(existing._id, { lastSeenAt: now });
    else await ctx.db.insert("matchSpectators", { tournamentMatchId: args.matchId, clerkUserId: identity.subject, joinedAt: now, lastSeenAt: now });
    return true;
  },
});

export const streamerDashboard = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { allowed: false, live: [], upcoming: [], completed: [] };
    const profile = await ctx.db.query("profiles").withIndex("by_clerkUserId", q => q.eq("clerkUserId", identity.subject)).first();
    const allowed = profile?.role === "streamer" || profile?.role === "admin" || profile?.role === "super_admin";
    if (!allowed) return { allowed: false, live: [], upcoming: [], completed: [] };
    const live = await ctx.db.query("tournamentMatches").withIndex("by_scheduledAt").take(100);
    return {
      allowed: true,
      live: live.filter((m) => m.status === "live" || m.status === "ready").slice(0, 20),
      upcoming: live.filter((m) => m.status === "scheduled" || m.status === "waiting").slice(0, 20),
      completed: live.filter((m) => m.status === "completed").slice(0, 20),
    };
  },
});
