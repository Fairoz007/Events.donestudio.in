import { mutation } from "./_generated/server";
import { requireSuperAdmin } from "./lib/auth";

export const seedDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    const existingEvents = await ctx.db.query("events").collect();
    if (existingEvents.length > 0) {
      // If already seeded, require super admin
      await requireSuperAdmin(ctx);
    }

    const hostId = identity?.subject ?? "system_super_admin";
    const officialHost = {
      createdByUserId: hostId,
      hostUserId: hostId,
      hostRole: "super_admin" as const,
      organizationName: "D-One Studio Events",
      isOfficial: true,
      isPublished: true,
    };

    if (existingEvents.length > 0) {
      return { message: "Database already seeded with events" };
    }

    const now = Date.now();

    // 1. Create Flagship Event: ONAM 2026
    const onamEventId = await ctx.db.insert("events", {
      ...officialHost,
      title: "ONAM 2026",
      slug: "onam-2026",
      tagline: "The grand Kerala cultural celebration presented by D-One Studio.",
      description:
        "Compete in real-time Vadamvali, create and publish your Digital Pookalam, and test your knowledge in the Onam Cultural Quiz.",
      bannerUrl: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=1600&q=80",
      thumbnailUrl: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=600&q=80",
      startDate: "2026-08-25T00:00:00Z",
      endDate: "2026-09-05T23:59:59Z",
      registrationStartDate: "2026-08-15T00:00:00Z",
      registrationEndDate: "2026-09-04T23:59:59Z",
      timezone: "Asia/Muscat",
      registrationOpensAt: Date.parse("2026-08-28T20:30:00+04:00"),
      registrationClosesAt: Date.parse("2026-09-04T23:59:59+04:00"),
      status: "scheduled",
      category: "festival",
      theme: {
        primaryColor: "#064e3b", // Deep emerald
        secondaryColor: "#f59e0b", // Gold
        accentColor: "#ea580c", // Marigold orange
        bgGradient: "from-emerald-950 via-slate-950 to-amber-950",
        bannerBadge: "ONAM 2026",
        festivalIcon: "ONAM",
      },
      featured: true,
      rules: [
        "Register for ONAM 2026 before entering individual activities.",
        "Vadamvali tournament matches are Best of 3 and run one live match at a time.",
        "Digital Pookalam submissions and votes are validated by Convex.",
        "Quiz scoring is calculated on the server.",
      ],
      prizes: [],
      sponsors: [
        {
          name: "D-One Studio",
          logoUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=DOneStudio",
          tier: "Title Sponsor",
          websiteUrl: "https://donestudio.events",
        },
        {
          name: "Kerala Digital Arts Foundation",
          logoUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=KeralaArts",
          tier: "Platinum Partner",
        },
        {
          name: "God's Own Creators Hub",
          logoUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=CreatorsHub",
          tier: "Gold Partner",
        },
      ],
      organizer: "D-One Studio Events Board",
      participantCount: 0,
      activeParticipantCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    // 2. Attach 3 Core Activities to Onam 2026
    await ctx.db.insert("eventActivities", {
      eventId: onamEventId,
      title: "Vadamvali (Tug of War)",
      slug: "vadamvali",
      type: "vadamvali",
      description: "Realtime Tug of War tournament with automatic fixture generation, Best of 3 matchups, check-in, walkovers, and one live match at a time.",
      bannerUrl: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80",
      status: "registration_open",
      rules: [
        "Register after joining ONAM 2026.",
        "Every matchup is Best of 3; first to 2 game wins advances.",
        "Check in within 15 minutes when your match becomes ready.",
      ],
      pointsReward: 100,
      participantCount: 0,
      registrationStartTime: Date.parse("2026-08-28T20:30:00+04:00"),
      registrationCloseTime: Date.parse("2026-09-04T23:59:59+04:00"),
      scheduledStartTime: Date.parse("2026-09-05T20:30:00+04:00"),
      config: { seedingMethod: "random", matchDurationMinutes: 10, intervalMinutes: 2, simultaneousMatches: 1, checkInWindowMinutes: 15 },
      order: 1,
    });

    await ctx.db.insert("eventActivities", {
      eventId: onamEventId,
      title: "Pookalam Designer",
      slug: "pookalam",
      type: "pookalam",
      description: "Interactive digital floral mandala canvas. Design with marigolds, roses, lotus, and jasmine, then submit to the grand public voting gallery.",
      bannerUrl: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80",
      status: "registration_open",
      rules: [
        "Drag and place floral assets on the circular mandala canvas.",
        "Use symmetry tools (4x, 8x, 12x, 16x) to create intricate Kerala patterns.",
        "Submit your design to enter the community voting competition.",
      ],
      pointsReward: 50,
      participantCount: 0,
      registrationStartTime: Date.parse("2026-08-28T20:30:00+04:00"),
      registrationCloseTime: Date.parse("2026-09-04T23:59:59+04:00"),
      votingStatus: "closed",
      submissionsOpen: true,
      config: { votingRule: "one_final_vote", allowVoteChange: true, showLiveVoteCounts: false },
      order: 2,
    });

    await ctx.db.insert("eventActivities", {
      eventId: onamEventId,
      title: "Onam Cultural Quiz",
      slug: "quiz",
      type: "quiz",
      description: "Test your knowledge on Mahabali, Vallamkali, Onasadya, and Kerala folklore in a fast-paced 15-second timed challenge.",
      bannerUrl: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=800&q=80",
      status: "registration_open",
      rules: [
        "10 multiple choice questions with a 15-second countdown per question.",
        "Faster answers award speed bonuses up to +50 points.",
        "Consecutive correct answers build streak multipliers.",
      ],
      pointsReward: 1000,
      participantCount: 0,
      registrationStartTime: Date.parse("2026-08-28T20:30:00+04:00"),
      registrationCloseTime: Date.parse("2026-09-04T23:59:59+04:00"),
      scheduledStartTime: Date.parse("2026-09-05T22:00:00+04:00"),
      order: 3,
    });

    // 3. Create Onam Quiz Record and 10 Cultural Questions
    const quizId = await ctx.db.insert("quizzes", {
      eventId: onamEventId,
      title: "Grand Onam Trivia Championship 2026",
      slug: "onam-trivia-2026",
      description: "Prove your mastery of Kerala's most celebrated festival and traditions.",
      timeLimitSeconds: 15,
      totalQuestions: 10,
      pointsPerCorrect: 100,
      speedBonusMax: 50,
      status: "scheduled",
      createdAt: now,
      registrationStartTime: Date.parse("2026-08-28T20:30:00+04:00"),
      registrationCloseTime: Date.parse("2026-09-04T23:59:59+04:00"),
      scheduledStartTime: Date.parse("2026-09-05T22:00:00+04:00"),
    });

    const questions = [
      {
        question: "According to Kerala legend, which mythical King visits his beloved subjects during Onam?",
        options: ["King Mahabali (Maveli)", "King Harishchandra", "King Vikramaditya", "King Ashoka"],
        correctOptionIndex: 0,
        explanation: "King Mahabali was known for his benevolence and prosperity, and Onam celebrates his annual visit from the netherworld.",
        points: 100,
        difficulty: "easy" as const,
        order: 1,
      },
      {
        question: "What is the famous traditional floral carpet created during the ten days of Onam called?",
        options: ["Kolam", "Rangoli", "Pookalam", "Alpona"],
        correctOptionIndex: 2,
        explanation: "Pookalam ('Poo' meaning flower and 'Kalam' meaning artwork) is laid out with colorful flower petals in circular geometry.",
        points: 100,
        difficulty: "easy" as const,
        order: 2,
      },
      {
        question: "Which sacred avatar of Lord Vishnu is associated with the story of Mahabali?",
        options: ["Matsya", "Kurma", "Narasimha", "Vamana"],
        correctOptionIndex: 3,
        explanation: "Vamana, the dwarf Brahmin avatar, asked King Mahabali for three paces of land.",
        points: 100,
        difficulty: "easy" as const,
        order: 3,
      },
      {
        question: "What is the famous traditional snake boat race held on the Pampa River during the Onam season?",
        options: ["Vallamkali (Aranmula Uthrattathi)", "Nehru Trophy", "Chambakulam Moolam", "Kumarakom Boat Race"],
        correctOptionIndex: 0,
        explanation: "The Aranmula Uthrattathi Vallamkali is the oldest and most revered traditional boat festival held on the sacred Pampa river.",
        points: 100,
        difficulty: "medium" as const,
        order: 4,
      },
      {
        question: "How many traditional vegetarian dishes are typically served on a plantain leaf during the grand Onasadya feast?",
        options: ["9 to 11", "24 to 28 or more", "15 to 18", "Exactly 10"],
        correctOptionIndex: 1,
        explanation: "A grand Onasadya typically features 24 to 28+ distinct delicacies including Parippu, Sambar, Aviyal, Olan, Thoran, and multiple Payasams.",
        points: 100,
        difficulty: "medium" as const,
        order: 5,
      },
      {
        question: "Which energetic folk art form featuring painted tiger body artwork and dancing is performed during Onam in Thrissur?",
        options: ["Kathakali", "Pulikali (Kaduvakali)", "Theyyam", "Kalaripayattu"],
        correctOptionIndex: 1,
        explanation: "Pulikali (Tiger Dance) is a vibrant street performance where artists paint their bodies like tigers and leopards to the beat of traditional drums.",
        points: 100,
        difficulty: "easy" as const,
        order: 6,
      },
      {
        question: "On which Malayalam calendar day does the grand finale of Onam (Thiruvonam) fall in the month of Chingam?",
        options: ["Atham", "Chithira", "Uthradam", "Thiruvonam"],
        correctOptionIndex: 3,
        explanation: "Atham marks Day 1 of Onam celebrations, while Thiruvonam is the auspicious 10th day marking the peak of the festival.",
        points: 100,
        difficulty: "medium" as const,
        order: 7,
      },
      {
        question: "What is the traditional sweet pudding dessert served at the end of Onasadya?",
        options: ["Payasam (Pradhaman)", "Unniyappam", "Neyyappam", "Kozhukatta"],
        correctOptionIndex: 0,
        explanation: "Ada Pradhaman and Palada Payasam are Kerala's quintessential festival desserts made with jaggery/milk, rice flakes, and coconut milk.",
        points: 100,
        difficulty: "easy" as const,
        order: 8,
      },
      {
        question: "What is the traditional off-white handloom attire with golden zari border worn during Onam called?",
        options: ["Kasavu Mundu / Saree", "Kanjeevaram", "Chanderi", "Paithani"],
        correctOptionIndex: 0,
        explanation: "Kasavu is Kerala's iconic cotton fabric woven with pure golden metallic thread borders (zari).",
        points: 100,
        difficulty: "medium" as const,
        order: 9,
      },
      {
        question: "What is the pyramid-like clay installation placed at the center of the Pookalam representing Lord Vamana called?",
        options: ["Thrikkakara Appan (Onathappan)", "Nilavilakku", "Uruli", "Kavadi"],
        correctOptionIndex: 0,
        explanation: "Thrikkakara Appan (Onathappan) is a pyramid-shaped clay figurine representing Lord Vamana and King Mahabali placed with reverence in courtyards.",
        points: 100,
        difficulty: "hard" as const,
        order: 10,
      },
    ];

    for (const q of questions) {
      await ctx.db.insert("quizQuestions", {
        quizId: quizId,
        question: q.question,
        options: q.options,
        correctOptionIndex: q.correctOptionIndex,
        explanation: q.explanation,
        points: q.points,
        difficulty: q.difficulty,
        order: q.order,
      });
    }

    // 4. Seed Starter Achievements
    const achievementsList = [
      { code: "FIRST_MATCH", title: "First Pull", description: "Completed your first Vadamvali Tug of War match.", icon: "🪢", category: "vadamvali" as const, pointsReward: 50 },
      { code: "VADAMVALI_5_WINS", title: "Tug Warrior", description: "Won 5 Vadamvali multiplayer matches.", icon: "⚔️", category: "vadamvali" as const, pointsReward: 150 },
      { code: "VADAMVALI_10_WINS", title: "Maveli Champion", description: "Dominated 10 Vadamvali multiplayer matches.", icon: "🏆", category: "vadamvali" as const, pointsReward: 300 },
      { code: "POOKALAM_ARTIST", title: "Pookalam Artist", description: "Created and submitted your first digital floral design.", icon: "🌸", category: "pookalam" as const, pointsReward: 50 },
      { code: "POOKALAM_POPULAR", title: "Community Star", description: "Received 10+ votes on your Pookalam design.", icon: "❤️", category: "pookalam" as const, pointsReward: 100 },
      { code: "QUIZ_MASTER", title: "Quiz Master", description: "Scored 800+ points in the Onam Cultural Quiz.", icon: "🎯", category: "quiz" as const, pointsReward: 200 },
    ];

    for (const a of achievementsList) {
      await ctx.db.insert("achievements", a);
    }

    // 5. Seed Global Announcements
    await ctx.db.insert("announcements", {
      eventId: onamEventId,
      title: "ONAM 2026 registration opens at 8:30 PM",
      content: "Welcome to D-One Studio ONAM 2026. Register for ONAM, then join Vadamvali, Digital Pookalam, and the Onam Cultural Quiz.",
      type: "urgent",
      isGlobal: true,
      publishedAt: now,
      authorName: "D-One Studio Admin",
    });

    await ctx.db.insert("announcements", {
      eventId: onamEventId,
      title: "Vadamvali fixture will be generated from real registrations",
      content: "The tournament will use random backend seeding, bye handling, Best of 3 matchups, and one live match at a time.",
      type: "tournament",
      isGlobal: false,
      publishedAt: now - 3600000,
      authorName: "Tournament Master",
    });

    return { message: "Successfully seeded dedicated D-One Studio ONAM 2026 platform." };
  },
});
