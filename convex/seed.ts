import { mutation } from "./_generated/server";
import { v } from "convex/values";

function muscatTimeOn(date: string, hour: number, minute: number) {
  return Date.parse(`${date}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00+04:00`);
}

export const seedInitialData = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("events").withIndex("by_slug", (q) => q.eq("slug", "onam-2026")).first();
    if (existing) {
      return { message: "ONAM 2026 already exists.", eventId: existing._id };
    }

    const now = Date.now();
    const eventId = await ctx.db.insert("events", {
      title: "ONAM 2026",
      slug: "onam-2026",
      tagline: "The grand Kerala cultural celebration presented by D-One Studio.",
      description:
        "Compete in real-time Vadamvali, create and publish your Digital Pookalam, and test your knowledge in the Onam Cultural Quiz.",
      bannerUrl: "/images/onam-hero-art.jpg",
      thumbnailUrl: "/images/onam-hero-art.jpg",
      startDate: "2026-09-04T17:00:00+04:00",
      endDate: "2026-09-05T23:00:00+04:00",
      registrationStartDate: "2026-08-28T20:30:00+04:00",
      registrationEndDate: "2026-09-04T20:30:00+04:00",
      status: "live",
      category: "festival",
      theme: {
        primaryColor: "#064e3b",
        secondaryColor: "#f59e0b",
        accentColor: "#ea580c",
        bgGradient: "from-emerald-950 via-slate-950 to-amber-950",
        bannerBadge: "LIVE NOW",
        festivalIcon: "ONAM",
      },
      featured: true,
      rules: [
        "Register for ONAM 2026 before joining an activity.",
        "Vadamvali matchups are Best-of-3. The first player to win two games advances.",
        "Only one Vadamvali tournament match may be live at a time.",
        "Pookalam voting is one final vote per registered user unless admins change the rule.",
        "Quiz scores are calculated by Convex.",
      ],
      prizes: [],
      sponsors: [{ name: "D-One Studio", logoUrl: "/images/onam-hero-art.jpg", tier: "Organizer" }],
      organizer: "D-One Studio",
      participantCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    const activities = [
      {
        title: "Vadamvali",
        slug: "vadamvali",
        type: "vadamvali" as const,
        description: "Realtime Tug of War Tournament. Best of 3.",
        bannerUrl: "/images/vadamvali-card.jpg",
        order: 1,
        rules: ["Best of 3", "Check in within 15 minutes", "Walkover applies on no-show"],
      },
      {
        title: "Digital Pookalam",
        slug: "pookalam",
        type: "pookalam" as const,
        description: "Create. Publish. Vote.",
        bannerUrl: "/images/pookalam-card.jpg",
        order: 2,
        rules: ["One published competition entry per user", "One final vote per user"],
      },
      {
        title: "Onam Cultural Quiz",
        slug: "quiz",
        type: "quiz" as const,
        description: "Test Your Kerala Knowledge.",
        bannerUrl: "/images/quiz-host-card.jpg",
        order: 3,
        rules: ["Host starts the quiz", "Server calculates scores"],
      },
    ];

    for (const activity of activities) {
      await ctx.db.insert("eventActivities", {
        eventId,
        ...activity,
        status: "live",
        pointsReward: 0,
        participantCount: 0,
      });
    }

    await ctx.db.insert("onamSettings", {
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
      quizStatus: "lobby",
      currentActivity: "Registration",
      nextActivity: "Vadamvali Fixture",
      updatedAt: now,
    });

    await ctx.db.insert("vadamvaliTournaments", {
      eventId,
      status: "registration",
      format: "best_of_3",
      seedingMode: "random",
      tournamentStartsAt: muscatTimeOn("2026-09-04", 21, 0),
      averageMatchDurationMinutes: 8,
      transitionMinutes: 2,
      updatedAt: now,
    });

    await ctx.db.insert("announcements", {
      eventId,
      title: "ONAM 2026",
      content: "Registration opens at 8:30 PM Asia/Muscat for ONAM 2026, Vadamvali, Digital Pookalam, and Onam Cultural Quiz.",
      type: "info",
      isGlobal: true,
      publishedAt: now,
      authorName: "D-One Studio",
    });

    return { message: "Seeded dedicated D-One Studio ONAM 2026 platform.", eventId };
  },
});

export const noop = mutation({
  args: { ok: v.optional(v.boolean()) },
  handler: async () => true,
});
