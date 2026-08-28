import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "./profiles";

// Save or update Pookalam draft
export const saveDraft = mutation({
  args: {
    eventId: v.id("events"),
    title: v.string(),
    canvasData: v.any(),
    previewUrl: v.string(),
    templateId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const clerkUserId = await getAuthUserId(ctx);
    if (!clerkUserId) throw new Error("Unauthorized: Please sign in");

    const existingDraft = await (ctx.db as any)
      .query("pookalamDesigns")
      .withIndex("by_user_and_event", (q: any) =>
        q.eq("clerkUserId", clerkUserId).eq("eventId", args.eventId)
      )
      .first();

    const now = Date.now();

    if (existingDraft) {
      if (existingDraft.isSubmitted) {
        throw new Error("This Pookalam has already been submitted to the competition and is locked.");
      }
      await ctx.db.patch(existingDraft._id, {
        title: args.title,
        canvasData: args.canvasData,
        previewUrl: args.previewUrl,
        templateId: args.templateId,
        updatedAt: now,
      });
      return existingDraft._id;
    }

    const designId = await ctx.db.insert("pookalamDesigns", {
      clerkUserId: clerkUserId,
      eventId: args.eventId,
      title: args.title,
      canvasData: args.canvasData,
      previewUrl: args.previewUrl,
      templateId: args.templateId,
      isSubmitted: false,
      isDraft: true,
      createdAt: now,
      updatedAt: now,
    });

    return designId;
  },
});

// Get user's current draft for an event
export const getUserDraft = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const clerkUserId = await getAuthUserId(ctx);
    if (!clerkUserId) return null;

    return await ctx.db
      .query("pookalamDesigns")
      .withIndex("by_user_and_event", (q) =>
        q.eq("clerkUserId", clerkUserId).eq("eventId", args.eventId)
      )
      .first();
  },
});

// Submit Pookalam to the Competition
export const submitToCompetition = mutation({
  args: {
    designId: v.id("pookalamDesigns"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const clerkUserId = await getAuthUserId(ctx);
    if (!clerkUserId) throw new Error("Unauthorized: Please sign in");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .first();

    if (!profile) throw new Error("Profile not found");

    const design = await ctx.db.get(args.designId);
    if (!design) throw new Error("Design not found");
    if (design.clerkUserId !== clerkUserId) throw new Error("Unauthorized");
    if (design.isSubmitted) throw new Error("Design is already submitted");
    const registration = await ctx.db
      .query("eventRegistrations")
      .withIndex("by_eventId_and_user", (q) => q.eq("eventId", design.eventId).eq("clerkUserId", clerkUserId))
      .first();
    if (!registration) throw new Error("Register for ONAM 2026 before publishing a Pookalam.");

    const settings = await ctx.db
      .query("onamSettings")
      .withIndex("by_eventId", (q) => q.eq("eventId", design.eventId))
      .first();
    const now = Date.now();
    if (settings && (now < settings.pookalamSubmissionOpensAt || now > settings.pookalamSubmissionClosesAt)) {
      throw new Error("Pookalam submission is not open.");
    }

    // Mark design as submitted
    await ctx.db.patch(design._id, {
      title: args.title,
      isSubmitted: true,
      isDraft: false,
      updatedAt: now,
    });

    // Create public gallery submission
    const submissionId = await ctx.db.insert("pookalamSubmissions", {
      eventId: design.eventId,
      designId: design._id,
      clerkUserId: clerkUserId,
      creatorName: profile.displayName,
      creatorAvatar: profile.avatarUrl,
      title: args.title || design.title || "My Festive Pookalam",
      previewUrl: design.previewUrl,
      canvasData: design.canvasData,
      voteCount: 0,
      viewCount: 1,
      status: "approved", // Automatically approved for competition gallery
      createdAt: now,
    });

    // Award XP (+50 XP) and update profile stats
    await ctx.db.patch(profile._id, {
      points: profile.points + 50,
      level: Math.max(1, Math.floor(Math.sqrt((profile.points + 50) / 100)) + 1),
      stats: {
        ...profile.stats,
        pookalamsSubmitted: (profile.stats.pookalamsSubmitted || 0) + 1,
      },
      updatedAt: now,
    });

    // Notification
    await ctx.db.insert("notifications", {
      clerkUserId: clerkUserId,
      title: "Pookalam Submitted! 🌸",
      message: `Your Pookalam "${args.title}" is now live in the Onam Competition Gallery! +50 XP awarded.`,
      type: "system",
      link: `/events/onam-2026/pookalam/gallery`,
      isRead: false,
      createdAt: now,
    });

    return submissionId;
  },
});

// List Public Pookalam Gallery with filters
export const listGallery = query({
  args: {
    eventId: v.id("events"),
    filter: v.optional(v.string()), // 'trending', 'most_voted', 'latest', 'winners', 'finalists'
  },
  handler: async (ctx, args) => {
    let submissions = await ctx.db
      .query("pookalamSubmissions")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .filter((q) => q.neq(q.field("status"), "rejected"))
      .collect();

    if (args.filter === "most_voted") {
      submissions.sort((a, b) => b.voteCount - a.voteCount);
    } else if (args.filter === "winners") {
      submissions = submissions.filter((s) => s.status === "winner" || s.winnerBadge);
    } else if (args.filter === "finalists") {
      submissions = submissions.filter((s) => s.status === "featured" || s.status === "winner");
    } else {
      // Default: Latest & Trending
      submissions.sort((a, b) => b.createdAt - a.createdAt);
    }

    return submissions;
  },
});

// Get single submission
export const getSubmissionById = query({
  args: { submissionId: v.id("pookalamSubmissions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.submissionId);
  },
});

// Vote for a Pookalam submission (1 final vote per user per event enforced)
export const votePookalam = mutation({
  args: {
    submissionId: v.id("pookalamSubmissions"),
  },
  handler: async (ctx, args) => {
    const clerkUserId = await getAuthUserId(ctx);
    if (!clerkUserId) throw new Error("Unauthorized: Please sign in to vote");

    const submission = await ctx.db.get(args.submissionId);
    if (!submission) throw new Error("Submission not found");

    if (submission.clerkUserId === clerkUserId) {
      throw new Error("You cannot vote for your own Pookalam!");
    }

    const registration = await ctx.db
      .query("eventRegistrations")
      .withIndex("by_eventId_and_user", (q) => q.eq("eventId", submission.eventId).eq("clerkUserId", clerkUserId))
      .first();
    if (!registration) throw new Error("Register for ONAM 2026 before voting.");

    const settings = await ctx.db
      .query("onamSettings")
      .withIndex("by_eventId", (q) => q.eq("eventId", submission.eventId))
      .first();
    const now = Date.now();
    if (settings && (now < settings.pookalamVotingOpensAt || now > settings.pookalamVotingClosesAt)) {
      throw new Error("Pookalam voting is not open.");
    }

    const duplicateSubmissionVote = await ctx.db
      .query("pookalamVotes")
      .withIndex("by_submission_and_user", (q) =>
        q.eq("submissionId", args.submissionId).eq("clerkUserId", clerkUserId)
      )
      .first();

    if (duplicateSubmissionVote) {
      return { success: true, voteCount: submission.voteCount };
    }

    const existingEventVote = await ctx.db
      .query("pookalamVotes")
      .withIndex("by_user_and_event", (q) => q.eq("clerkUserId", clerkUserId).eq("eventId", submission.eventId))
      .first();

    if (existingEventVote) {
      if (!settings?.pookalamVoteChangesAllowed) throw new Error("You have already used your final Pookalam vote.");
      const oldSubmission = await ctx.db.get(existingEventVote.submissionId);
      if (oldSubmission) {
        await ctx.db.patch(oldSubmission._id, { voteCount: Math.max(0, oldSubmission.voteCount - 1) });
      }
      await ctx.db.delete(existingEventVote._id);
    }

    // Insert vote record
    await ctx.db.insert("pookalamVotes", {
      submissionId: args.submissionId,
      clerkUserId: clerkUserId,
      eventId: submission.eventId,
      votedAt: now,
    });

    // Increment vote count
    const newVoteCount = (submission.voteCount || 0) + 1;
    await ctx.db.patch(submission._id, {
      voteCount: newVoteCount,
    });

    // Update creator's profile total votes received
    const creatorProfile = await ctx.db
      .query("profiles")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", submission.clerkUserId))
      .first();

    if (creatorProfile) {
      await ctx.db.patch(creatorProfile._id, {
        stats: {
          ...creatorProfile.stats,
          pookalamVotesReceived: (creatorProfile.stats.pookalamVotesReceived || 0) + 1,
        },
        updatedAt: now,
      });

      // Send notification to creator
      await ctx.db.insert("notifications", {
        clerkUserId: submission.clerkUserId,
        title: "New Pookalam Vote! ❤️",
        message: `Your design "${submission.title}" received a new vote! Total votes: ${newVoteCount}.`,
        type: "pookalam_vote",
        link: `/events/onam-2026/pookalam/gallery`,
        isRead: false,
        createdAt: now,
      });
    }

    return { success: true, voteCount: newVoteCount };
  },
});

// Check if user has voted on a submission
export const hasUserVoted = query({
  args: { submissionId: v.id("pookalamSubmissions") },
  handler: async (ctx, args) => {
    const clerkUserId = await getAuthUserId(ctx);
    if (!clerkUserId) return false;

    const vote = await ctx.db
      .query("pookalamVotes")
      .withIndex("by_submission_and_user", (q) =>
        q.eq("submissionId", args.submissionId).eq("clerkUserId", clerkUserId)
      )
      .first();

    return !!vote;
  },
});

export const getMyVoteForEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const clerkUserId = await getAuthUserId(ctx);
    if (!clerkUserId) return null;
    return await ctx.db
      .query("pookalamVotes")
      .withIndex("by_user_and_event", (q) => q.eq("clerkUserId", clerkUserId).eq("eventId", args.eventId))
      .first();
  },
});

// Admin: Award Winner Badge
export const awardWinnerBadge = mutation({
  args: {
    submissionId: v.id("pookalamSubmissions"),
    badge: v.union(
      v.literal("first_place"),
      v.literal("second_place"),
      v.literal("third_place"),
      v.literal("peoples_choice"),
      v.literal("special_mention")
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

    const submission = await ctx.db.get(args.submissionId);
    if (!submission) throw new Error("Submission not found");

    const now = Date.now();
    await ctx.db.patch(submission._id, {
      status: "winner",
      winnerBadge: args.badge,
    });

    // Notify creator
    await ctx.db.insert("notifications", {
      clerkUserId: submission.clerkUserId,
      title: "🎉 Congratulations! Winner Award!",
      message: `Your Pookalam "${submission.title}" was awarded ${args.badge.replace("_", " ").toUpperCase()} in Onam 2026!`,
      type: "pookalam_winner",
      link: `/events/onam-2026/pookalam/gallery`,
      isRead: false,
      createdAt: now,
    });

    // Audit log
    await ctx.db.insert("adminLogs", {
      adminClerkUserId: clerkUserId,
      adminDisplayName: profile.displayName,
      action: "POOKALAM_WINNER_SELECTED",
      entity: "pookalamSubmissions",
      entityId: args.submissionId,
      details: { badge: args.badge, title: submission.title, creator: submission.creatorName },
      timestamp: now,
    });

    return true;
  },
});

// Admin: List all submissions
export const adminListSubmissions = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("pookalamSubmissions")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .order("desc")
      .collect();
  },
});
