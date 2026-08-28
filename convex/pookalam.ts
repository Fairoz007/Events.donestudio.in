import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "./profiles";
import { requireAdmin } from "./lib/auth";

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
    const pookalamActivities = await ctx.db.query("eventActivities").withIndex("by_eventId", q => q.eq("eventId", args.eventId)).take(100);
    const pookalamActivity = pookalamActivities.find(a => a.type === "pookalam");
    if (pookalamActivity && pookalamActivity.submissionsOpen === false) {
      throw new Error("POOKALAM_SUBMISSIONS_CLOSED");
    }

    const existingDraft = await ctx.db
      .query("pookalamDesigns")
      .withIndex("by_user_and_event", (q) =>
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
    const event = await ctx.db.get(design.eventId);
    if (!event) throw new Error("Event not found");
    if (design.clerkUserId !== clerkUserId) throw new Error("Unauthorized");
    if (design.isSubmitted) throw new Error("Design is already submitted");
    const pookalamActivities = await ctx.db.query("eventActivities").withIndex("by_eventId", q => q.eq("eventId", design.eventId)).take(100);
    const pookalamActivity = pookalamActivities.find(a => a.type === "pookalam");
    if (pookalamActivity && pookalamActivity.submissionsOpen === false) {
      throw new Error("POOKALAM_SUBMISSIONS_CLOSED");
    }

    const now = Date.now();

    // Mark design as submitted
    await ctx.db.patch(design._id, {
      title: args.title,
      isSubmitted: true,
      isDraft: false,
      submittedAt: now,
      submissionStatus: "submitted",
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
      status: "submitted",
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
      message: `Your Pookalam "${args.title}" is now live in the ${event.title} competition gallery! +50 XP awarded.`,
      type: "system",
      link: `/events/${event.slug}/pookalam/gallery`,
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

// Vote for a Pookalam submission (1 vote per user per submission enforced)
export const votePookalam = mutation({
  args: {
    submissionId: v.id("pookalamSubmissions"),
  },
  handler: async (ctx, args) => {
    const clerkUserId = await getAuthUserId(ctx);
    if (!clerkUserId) throw new Error("Unauthorized: Please sign in to vote");

    const submission = await ctx.db.get(args.submissionId);
    if (!submission) throw new Error("Submission not found");
    const event = await ctx.db.get(submission.eventId);
    const pookalamActivities = await ctx.db.query("eventActivities").withIndex("by_eventId", q => q.eq("eventId", submission.eventId)).take(100);
    const pookalamActivity = pookalamActivities.find(a => a.type === "pookalam");
    if (pookalamActivity && pookalamActivity.votingStatus === "closed") {
      throw new Error("VOTING_CLOSED");
    }

    if (submission.clerkUserId === clerkUserId) {
      throw new Error("You cannot vote for your own Pookalam!");
    }

    // Check if user already voted
    const existingVote = await ctx.db
      .query("pookalamVotes")
      .withIndex("by_submission_and_user", (q) =>
        q.eq("submissionId", args.submissionId).eq("clerkUserId", clerkUserId)
      )
      .first();

    if (existingVote) {
      throw new Error("You have already voted for this design!");
    }

    const now = Date.now();

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
        link: `/events/${event?.slug ?? "onam-2026"}/pookalam/gallery`,
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
    const event = await ctx.db.get(submission.eventId);

    const now = Date.now();
    await ctx.db.patch(submission._id, {
      status: "winner",
      winnerBadge: args.badge,
    });

    // Notify creator
    await ctx.db.insert("notifications", {
      clerkUserId: submission.clerkUserId,
      title: "🎉 Congratulations! Winner Award!",
      message: `Your Pookalam "${submission.title}" was awarded ${args.badge.replace("_", " ").toUpperCase()} in ${event?.title ?? "the event"}!`,
      type: "pookalam_winner",
      link: `/events/${event?.slug ?? "onam-2026"}/pookalam/gallery`,
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
    await requireAdmin(ctx);
    return await ctx.db
      .query("pookalamSubmissions")
      .withIndex("by_eventId", (q) => q.eq("eventId", args.eventId))
      .order("desc")
      .collect();
  },
});
