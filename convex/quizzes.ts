import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "./profiles";

// Get Quiz metadata by slug
export const getQuizBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("quizzes")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

// Get Questions for Quiz (SECURE: Staged without exposing correctOptionIndex or explanation)
export const getQuizQuestionsForPlayer = query({
  args: { quizId: v.id("quizzes") },
  handler: async (ctx, args) => {
    const questions = await ctx.db
      .query("quizQuestions")
      .withIndex("by_quizId", (q) => q.eq("quizId", args.quizId))
      .collect();

    // Sort by order and STRIP answer keys for client protection
    return questions
      .sort((a, b) => a.order - b.order)
      .map((q, idx) => ({
        _id: q._id,
        order: q.order || idx + 1,
        question: q.question,
        options: q.options,
        points: q.points,
        difficulty: q.difficulty,
        imageUrl: q.imageUrl,
        // Note: correctOptionIndex and explanation are NOT included here!
      }));
  },
});

// Start or Resume a Quiz Session
export const startQuizSession = mutation({
  args: { quizId: v.id("quizzes") },
  handler: async (ctx, args) => {
    const clerkUserId = await getAuthUserId(ctx);
    if (!clerkUserId) throw new Error("Unauthorized: Please sign in to play the Quiz");
    const quiz = await ctx.db.get(args.quizId);
    if (!quiz) throw new Error("Quiz not found");
    const registration = await ctx.db
      .query("eventRegistrations")
      .withIndex("by_eventId_and_user", (q) => q.eq("eventId", quiz.eventId).eq("clerkUserId", clerkUserId))
      .first();
    if (!registration) throw new Error("Register for ONAM 2026 before joining the quiz.");
    const settings = await ctx.db
      .query("onamSettings")
      .withIndex("by_eventId", (q) => q.eq("eventId", quiz.eventId))
      .first();
    if (settings && settings.quizStatus !== "live") {
      throw new Error("The Onam Cultural Quiz has not been started by the host.");
    }

    // Look for uncompleted session
    const existing = await ctx.db
      .query("quizSessions")
      .withIndex("by_quiz_and_user", (q) =>
        q.eq("quizId", args.quizId).eq("clerkUserId", clerkUserId)
      )
      .filter((q) => q.eq(q.field("isCompleted"), false))
      .first();

    if (existing) {
      return existing;
    }

    const now = Date.now();
    const sessionId = await ctx.db.insert("quizSessions", {
      quizId: args.quizId,
      clerkUserId: clerkUserId,
      currentQuestionIndex: 0,
      score: 0,
      streak: 0,
      answers: [],
      isCompleted: false,
      startedAt: now,
    });

    return await ctx.db.get(sessionId);
  },
});

// Submit an Answer (Evaluated securely on server)
export const submitAnswer = mutation({
  args: {
    sessionId: v.id("quizSessions"),
    questionIndex: v.number(),
    selectedOption: v.number(),
    timeTakenSeconds: v.number(),
  },
  handler: async (ctx, args) => {
    const clerkUserId = await getAuthUserId(ctx);
    if (!clerkUserId) throw new Error("Unauthorized");

    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");
    if (session.clerkUserId !== clerkUserId) throw new Error("Unauthorized");
    if (session.isCompleted) throw new Error("Quiz already completed");
    const quiz = await ctx.db.get(session.quizId);
    if (!quiz) throw new Error("Quiz not found");
    const settings = await ctx.db
      .query("onamSettings")
      .withIndex("by_eventId", (q) => q.eq("eventId", quiz.eventId))
      .first();
    if (settings && settings.quizStatus !== "live") {
      throw new Error("Quiz is not live.");
    }

    // Fetch quiz questions
    const questions = await ctx.db
      .query("quizQuestions")
      .withIndex("by_quizId", (q) => q.eq("quizId", session.quizId))
      .collect();

    const sortedQuestions = questions.sort((a, b) => a.order - b.order);
    const currentQ = sortedQuestions[args.questionIndex];

    if (!currentQ) throw new Error("Invalid question index");

    const isCorrect = currentQ.correctOptionIndex === args.selectedOption;
    let pointsAwarded = 0;
    let newStreak = session.streak;

    if (isCorrect) {
      newStreak += 1;
      const basePoints = currentQ.points || 100;
      // Speed bonus: up to 50 bonus points if answered within 5 seconds
      const speedBonus = Math.max(0, Math.round((15 - Math.min(args.timeTakenSeconds, 15)) * 3.33));
      // Streak bonus: 20 extra points per streak level
      const streakBonus = Math.min(newStreak * 20, 100);
      pointsAwarded = basePoints + speedBonus + streakBonus;
    } else {
      newStreak = 0;
    }

    const newScore = session.score + pointsAwarded;
    const newAnswers = [
      ...session.answers,
      {
        questionIndex: args.questionIndex,
        selectedOption: args.selectedOption,
        isCorrect: isCorrect,
        pointsAwarded: pointsAwarded,
        timeTakenSeconds: args.timeTakenSeconds,
      },
    ];

    const nextIndex = args.questionIndex + 1;
    const isCompleted = nextIndex >= sortedQuestions.length;

    await ctx.db.patch(session._id, {
      currentQuestionIndex: nextIndex,
      score: newScore,
      streak: newStreak,
      answers: newAnswers,
      isCompleted: isCompleted,
      completedAt: isCompleted ? Date.now() : undefined,
    });

    // If completed, finalize and award XP
    if (isCompleted) {
      const profile = await ctx.db
        .query("profiles")
        .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
        .first();

      if (profile) {
        const currentHigh = profile.stats?.quizHighScore || 0;
        await ctx.db.patch(profile._id, {
          points: profile.points + newScore,
          level: Math.max(1, Math.floor(Math.sqrt((profile.points + newScore) / 100)) + 1),
          stats: {
            ...profile.stats,
            quizzesTaken: (profile.stats.quizzesTaken || 0) + 1,
            quizHighScore: Math.max(currentHigh, newScore),
          },
          updatedAt: Date.now(),
        });

        await ctx.db.insert("notifications", {
          clerkUserId: clerkUserId,
          title: "Quiz Completed! 🎯",
          message: `You scored ${newScore} points in the Onam Cultural Quiz! Total XP increased by +${newScore}.`,
          type: "quiz_score",
          link: `/events/onam-2026/quiz`,
          isRead: false,
          createdAt: Date.now(),
        });
      }
    }

    return {
      isCorrect,
      correctOptionIndex: currentQ.correctOptionIndex,
      explanation: currentQ.explanation,
      pointsAwarded,
      newScore,
      streak: newStreak,
      isCompleted,
    };
  },
});

// Admin: Add Question to Quiz
export const adminAddQuestion = mutation({
  args: {
    quizId: v.id("quizzes"),
    question: v.string(),
    options: v.array(v.string()),
    correctOptionIndex: v.number(),
    explanation: v.string(),
    points: v.number(),
    difficulty: v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard")
    ),
    imageUrl: v.optional(v.string()),
    order: v.number(),
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

    return await ctx.db.insert("quizQuestions", args);
  },
});
