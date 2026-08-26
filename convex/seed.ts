import { mutation } from "./_generated/server";

export const seedDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    const existingEvents = await ctx.db.query("events").collect();
    if (existingEvents.length > 0) {
      return { message: "Database already seeded with events" };
    }

    const now = Date.now();

    // 1. Create Flagship Event: ONAM 2026
    const onamEventId = await ctx.db.insert("events", {
      title: "ONAM 2026",
      slug: "onam-2026",
      tagline: "Celebrate. Play. Compete. Win.",
      description:
        "The grandest Kerala cultural extravaganza presented by D-One Studio! Experience real-time Vadamvali Tug of War multiplayer battles, unleash your creativity in the Digital Pookalam Designer competition, and test your knowledge in the high-stakes Cultural Quiz.",
      bannerUrl: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=1600&q=80",
      thumbnailUrl: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=600&q=80",
      startDate: "2026-08-25T00:00:00Z",
      endDate: "2026-09-05T23:59:59Z",
      registrationStartDate: "2026-08-15T00:00:00Z",
      registrationEndDate: "2026-09-04T23:59:59Z",
      status: "live",
      category: "festival",
      theme: {
        primaryColor: "#064e3b", // Deep emerald
        secondaryColor: "#f59e0b", // Gold
        accentColor: "#ea580c", // Marigold orange
        bgGradient: "from-emerald-950 via-slate-950 to-amber-950",
        bannerBadge: "LIVE NOW • FLAGSHIP FESTIVAL",
        festivalIcon: "🌸",
      },
      featured: true,
      rules: [
        "All registered D-One Studio members are eligible for competitive leaderboards.",
        "Anti-cheat mechanisms are strictly enforced for Vadamvali; automated clickers will disqualify the match.",
        "Pookalam designs must be original creations designed within the canvas tool.",
        "Quizzes are timed with strict server validation; correct answers cannot be retried within the same session.",
      ],
      prizes: [
        {
          place: "1st Place (Grand Champion)",
          title: "Onam Gold Trophy + ₹50,000 + 5,000 Platform XP",
          reward: "₹50,000 + Exclusive Crown Badge",
          icon: "👑",
        },
        {
          place: "2nd Place",
          title: "Silver Shield + ₹25,000 + 2,500 Platform XP",
          reward: "₹25,000 + Champion Badge",
          icon: "🥈",
        },
        {
          place: "3rd Place",
          title: "Bronze Medal + ₹10,000 + 1,000 Platform XP",
          reward: "₹10,000 + Elite Badge",
          icon: "🥉",
        },
        {
          place: "People's Choice Pookalam",
          title: "Special Creator Award + ₹15,000",
          reward: "₹15,000 + Master Artist Badge",
          icon: "🎨",
        },
      ],
      sponsors: [
        {
          name: "D-One Gaming Studio",
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
      participantCount: 14820,
      createdAt: now,
      updatedAt: now,
    });

    // 2. Attach 3 Core Activities to Onam 2026
    await ctx.db.insert("eventActivities", {
      eventId: onamEventId,
      title: "Vadamvali (Tug of War)",
      slug: "vadamvali",
      type: "vadamvali",
      description: "Real-time multiplayer browser tug-of-war! Quick match with random opponents or battle friends in private rooms.",
      bannerUrl: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80",
      status: "live",
      rules: [
        "Tap repeatedly or mash SPACE/CLICK to pull the rope.",
        "Pull the center flag past the marker to win the round.",
        "Win matches to earn +100 XP and climb the Onam leaderboard.",
      ],
      pointsReward: 100,
      participantCount: 9240,
      order: 1,
    });

    await ctx.db.insert("eventActivities", {
      eventId: onamEventId,
      title: "Pookalam Designer",
      slug: "pookalam",
      type: "pookalam",
      description: "Interactive digital floral mandala canvas. Design with marigolds, roses, lotus, and jasmine, then submit to the grand public voting gallery.",
      bannerUrl: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80",
      status: "live",
      rules: [
        "Drag and place floral assets on the circular mandala canvas.",
        "Use symmetry tools (4x, 8x, 12x, 16x) to create intricate Kerala patterns.",
        "Submit your design to enter the community voting competition.",
      ],
      pointsReward: 50,
      participantCount: 4320,
      order: 2,
    });

    const quizActivityId = await ctx.db.insert("eventActivities", {
      eventId: onamEventId,
      title: "Onam Cultural Quiz",
      slug: "quiz",
      type: "quiz",
      description: "Test your knowledge on Mahabali, Vallamkali, Onasadya, and Kerala folklore in a fast-paced 15-second timed challenge.",
      bannerUrl: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=800&q=80",
      status: "live",
      rules: [
        "10 multiple choice questions with a 15-second countdown per question.",
        "Faster answers award speed bonuses up to +50 points.",
        "Consecutive correct answers build streak multipliers.",
      ],
      pointsReward: 1000,
      participantCount: 6810,
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
      status: "live",
      createdAt: now,
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

    // 4. Future Events for the Platform
    await ctx.db.insert("events", {
      title: "D-One Creator Showdown 2026",
      slug: "creator-showdown-2026",
      tagline: "Top Streamers & Creators Battle Live",
      description: "Join your favorite YouTubers, Twitch streamers, and gaming personalities in a 3-day streaming marathon with live community matches and massive fan giveaways.",
      bannerUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1600&q=80",
      thumbnailUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80",
      startDate: "2026-10-10T14:00:00Z",
      endDate: "2026-10-13T23:59:59Z",
      registrationStartDate: "2026-09-15T00:00:00Z",
      registrationEndDate: "2026-10-09T23:59:59Z",
      status: "registration_open",
      category: "creator",
      theme: {
        primaryColor: "#7c3aed",
        secondaryColor: "#ec4899",
        accentColor: "#38bdf8",
        bgGradient: "from-purple-950 via-slate-950 to-pink-950",
        bannerBadge: "REGISTRATION OPEN",
        festivalIcon: "🎮",
      },
      featured: false,
      rules: [
        "Creator accounts must have a verified badge to host matches.",
        "Community members can vote and participate in live streamer squads.",
      ],
      prizes: [
        { place: "Top Streamer", title: "D-One Creator Trophy + ₹100,000", reward: "₹100,000", icon: "🏆" },
      ],
      sponsors: [{ name: "D-One Studio", logoUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=DOne", tier: "Title" }],
      organizer: "D-One Creator Guild",
      participantCount: 3840,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("events", {
      title: "Christmas Carnival 2026",
      slug: "christmas-carnival-2026",
      tagline: "Winter Magic, Quizzes & Holiday Gifts",
      description: "Celebrate the warmth of the holidays with global community mini-games, Christmas Carol quizzes, digital card creations, and holiday prizes.",
      bannerUrl: "https://images.unsplash.com/photo-1543589077-47d81606c1bf?auto=format&fit=crop&w=1600&q=80",
      thumbnailUrl: "https://images.unsplash.com/photo-1543589077-47d81606c1bf?auto=format&fit=crop&w=600&q=80",
      startDate: "2026-12-20T00:00:00Z",
      endDate: "2026-12-28T23:59:59Z",
      registrationStartDate: "2026-12-01T00:00:00Z",
      registrationEndDate: "2026-12-25T23:59:59Z",
      status: "scheduled",
      category: "festival",
      theme: {
        primaryColor: "#dc2626",
        secondaryColor: "#16a34a",
        accentColor: "#fbbf24",
        bgGradient: "from-red-950 via-slate-950 to-emerald-950",
        bannerBadge: "DECEMBER 2026",
        festivalIcon: "🎄",
      },
      featured: false,
      rules: ["Open to all participants worldwide."],
      prizes: [
        { place: "Grand Winter Winner", title: "Holiday Gift Hamper + ₹40,000", reward: "₹40,000", icon: "🎁" },
      ],
      sponsors: [{ name: "D-One Studio", logoUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=Winter", tier: "Title" }],
      organizer: "D-One Studio Events",
      participantCount: 1920,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("events", {
      title: "Vishu Festival 2027",
      slug: "vishu-2027",
      tagline: "New Dawn, Vishukani & Golden Harvest",
      description: "Welcome the astronomical Malayalam New Year with traditional Vishukani digital arrangements, firecracker games, and cultural competitions.",
      bannerUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80",
      thumbnailUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80",
      startDate: "2027-04-12T00:00:00Z",
      endDate: "2027-04-16T23:59:59Z",
      registrationStartDate: "2027-04-01T00:00:00Z",
      registrationEndDate: "2027-04-14T23:59:59Z",
      status: "scheduled",
      category: "festival",
      theme: {
        primaryColor: "#ca8a04",
        secondaryColor: "#15803d",
        accentColor: "#facc15",
        bgGradient: "from-yellow-950 via-slate-950 to-green-950",
        bannerBadge: "COMING APRIL 2027",
        festivalIcon: "✨",
      },
      featured: false,
      rules: ["Standard D-One Studio competition terms apply."],
      prizes: [
        { place: "Vishukani Master", title: "Golden Kani Trophy + ₹30,000", reward: "₹30,000", icon: "✨" },
      ],
      sponsors: [{ name: "D-One Studio", logoUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=Vishu", tier: "Title" }],
      organizer: "D-One Studio Events",
      participantCount: 850,
      createdAt: now,
      updatedAt: now,
    });

    // 5. Seed Starter Achievements
    const achievementsList = [
      { code: "FIRST_MATCH", title: "First Pull", description: "Completed your first Vadamvali Tug of War match.", icon: "🪢", category: "vadamvali" as const, pointsReward: 50 },
      { code: "VADAMVALI_5_WINS", title: "Tug Warrior", description: "Won 5 Vadamvali multiplayer matches.", icon: "⚔️", category: "vadamvali" as const, pointsReward: 150 },
      { code: "VADAMVALI_10_WINS", title: "Maveli Champion", description: "Dominated 10 Vadamvali multiplayer matches.", icon: "🏆", category: "vadamvali" as const, pointsReward: 300 },
      { code: "POOKALAM_ARTIST", title: "Pookalam Artist", description: "Created and submitted your first digital floral design.", icon: "🌸", category: "pookalam" as const, pointsReward: 50 },
      { code: "POOKALAM_POPULAR", title: "Community Star", description: "Received 10+ votes on your Pookalam design.", icon: "❤️", category: "pookalam" as const, pointsReward: 100 },
      { code: "QUIZ_MASTER", title: "Quiz Master", description: "Scored 800+ points in the Onam Cultural Quiz.", icon: "🎯", category: "quiz" as const, pointsReward: 200 },
      { code: "VERIFIED_CREATOR", title: "Verified Creator", description: "Became an approved D-One Studio creator partner.", icon: "🌟", category: "creator" as const, pointsReward: 500 },
    ];

    for (const a of achievementsList) {
      await ctx.db.insert("achievements", a);
    }

    // 6. Seed Global Announcements
    await ctx.db.insert("announcements", {
      eventId: onamEventId,
      title: "🎉 ONAM 2026 is LIVE! Join Vadamvali, Pookalam & Quiz Now",
      content: "Welcome to D-One Studio Events! Compete in real-time Vadamvali, design your digital Pookalam, and climb the leaderboards for ₹100,000+ in grand prizes.",
      type: "urgent",
      isGlobal: true,
      publishedAt: now,
      authorName: "D-One Studio Admin",
    });

    await ctx.db.insert("announcements", {
      eventId: onamEventId,
      title: "🪢 Vadamvali Quick Matches Now Active",
      content: "Real-time matchmaking is in full swing! Challenge opponents in 1v1 Tug of War and win bonus XP for your team.",
      type: "tournament",
      isGlobal: false,
      publishedAt: now - 3600000,
      authorName: "Tournament Master",
    });

    return { message: "Successfully seeded D-One Studio Events platform with Onam 2026 and future events!" };
  },
});
