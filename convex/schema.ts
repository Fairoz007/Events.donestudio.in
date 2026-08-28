import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // User Profiles linked to Clerk User ID
  profiles: defineTable({
    clerkUserId: v.string(),
    username: v.string(),
    displayName: v.string(),
    avatarUrl: v.string(),
    email: v.string(),
    country: v.optional(v.string()),
    role: v.union(
      v.literal("visitor"),
      v.literal("user"),
      v.literal("streamer"),
      v.literal("creator"),
      v.literal("moderator"),
      v.literal("admin"),
      v.literal("super_admin")
    ),
    canHostEvents: v.optional(v.boolean()),
    points: v.number(),
    level: v.number(),
    joinDate: v.string(),
    isSuspended: v.boolean(),
    isBanned: v.boolean(),
    stats: v.object({
      vadamvaliWins: v.number(),
      vadamvaliLosses: v.number(),
      quizzesTaken: v.number(),
      quizHighScore: v.number(),
      pookalamsSubmitted: v.number(),
      pookalamVotesReceived: v.number(),
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerkUserId", ["clerkUserId"])
    .index("by_username", ["username"])
    .index("by_role", ["role"])
    .index("by_points", ["points"])
    .index("by_email", ["email"]),

  // Events (Onam 2026, Eid, Christmas, Vishu, Gaming tournaments, etc.)
  events: defineTable({
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
    mode: v.optional(v.union(v.literal("online"), v.literal("offline"), v.literal("hybrid"))),
    eventType: v.optional(
      v.union(
        v.literal("tournament"),
        v.literal("multiplayer_game"),
        v.literal("quiz"),
        v.literal("design_competition"),
        v.literal("voting_competition"),
        v.literal("creator_event"),
        v.literal("live_event"),
        v.literal("giveaway"),
        v.literal("community_event")
      )
    ),
    status: v.union(
      v.literal("draft"),
      v.literal("scheduled"),
      v.literal("registration_open"),
      v.literal("registration_closed"),
      v.literal("ready"),
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
    createdByUserId: v.optional(v.string()),
    hostUserId: v.optional(v.string()),
    hostRole: v.optional(
      v.union(
        v.literal("super_admin"),
        v.literal("admin"),
        v.literal("creator"),
        v.literal("moderator")
      )
    ),
    organizationName: v.optional(v.string()),
    isOfficial: v.optional(v.boolean()),
    isPublished: v.optional(v.boolean()),
    participantCount: v.number(),
    pausedAt: v.optional(v.number()),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    cancelledAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"])
    .index("by_featured", ["featured"])
    .index("by_startDate", ["startDate"]),

  // Event Activities (e.g. Vadamvali, Pookalam Designer, Onam Quiz, etc.)
  eventActivities: defineTable({
    eventId: v.id("events"),
    title: v.string(),
    slug: v.string(),
    type: v.union(
      v.literal("vadamvali"),
      v.literal("pookalam"),
      v.literal("quiz"),
      v.literal("custom")
    ),
    description: v.string(),
    bannerUrl: v.string(),
    status: v.union(
      v.literal("upcoming"),
      v.literal("registration_open"),
      v.literal("registration_closed"),
      v.literal("live"),
      v.literal("paused"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("closed"),
      v.literal("archived")
    ),
    rules: v.array(v.string()),
    pointsReward: v.number(),
    participantCount: v.number(),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    registrationStartTime: v.optional(v.number()),
    registrationCloseTime: v.optional(v.number()),
    scheduledStartTime: v.optional(v.number()),
    expectedEndTime: v.optional(v.number()),
    startedAt: v.optional(v.number()),
    pausedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    votingStatus: v.optional(v.union(v.literal("closed"), v.literal("open"))),
    submissionsOpen: v.optional(v.boolean()),
    order: v.number(),
    config: v.optional(v.any()),
  })
    .index("by_eventId", ["eventId"])
    .index("by_slug", ["slug"])
    .index("by_type", ["type"]),

  // Event Registrations
  eventRegistrations: defineTable({
    eventId: v.id("events"),
    clerkUserId: v.string(),
    registeredAt: v.number(),
    status: v.optional(v.union(v.literal("registered"), v.literal("cancelled"), v.literal("checked_in"))),
    activityIds: v.optional(v.array(v.id("eventActivities"))),
    createdAt: v.optional(v.number()),
  })
    .index("by_eventId_and_user", ["eventId", "clerkUserId"])
    .index("by_user", ["clerkUserId"])
    .index("by_eventId", ["eventId"]),

  activityRegistrations: defineTable({
    eventId: v.id("events"),
    activityId: v.id("eventActivities"),
    clerkUserId: v.string(),
    status: v.union(v.literal("registered"), v.literal("cancelled"), v.literal("disqualified")),
    seed: v.optional(v.number()),
    rankingPoints: v.optional(v.number()),
    registeredAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_activity_and_user", ["activityId", "clerkUserId"])
    .index("by_activity_and_status", ["activityId", "status"])
    .index("by_event_and_user", ["eventId", "clerkUserId"]),

  streamerApplications: defineTable({
    clerkUserId: v.string(),
    name: v.string(),
    username: v.string(),
    platform: v.string(),
    channelUrl: v.string(),
    followerCount: v.number(),
    country: v.string(),
    description: v.string(),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"), v.literal("suspended")),
    reviewedBy: v.optional(v.string()),
    reviewedAt: v.optional(v.number()),
    adminNotes: v.optional(v.string()),
    submittedAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerkUserId", ["clerkUserId"])
    .index("by_status", ["status"]),

  tournaments: defineTable({
    eventId: v.id("events"),
    activityId: v.id("eventActivities"),
    name: v.string(),
    status: v.union(
      v.literal("registration_open"),
      v.literal("registration_closed"),
      v.literal("generated"),
      v.literal("live"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    seedingMethod: v.union(v.literal("random"), v.literal("ranking"), v.literal("manual")),
    bracketSize: v.optional(v.number()),
    winsRequired: v.number(),
    maxGames: v.number(),
    thirdPlaceEnabled: v.boolean(),
    tournamentStartAt: v.optional(v.number()),
    matchDurationMinutes: v.number(),
    intervalMinutes: v.number(),
    simultaneousMatches: v.number(),
    generatedAt: v.optional(v.number()),
    winnerClerkUserId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_activityId", ["activityId"])
    .index("by_eventId", ["eventId"])
    .index("by_status", ["status"]),

  tournamentParticipants: defineTable({
    tournamentId: v.id("tournaments"),
    activityRegistrationId: v.id("activityRegistrations"),
    clerkUserId: v.string(),
    displayName: v.string(),
    avatarUrl: v.string(),
    seed: v.number(),
    status: v.union(v.literal("active"), v.literal("eliminated"), v.literal("disqualified"), v.literal("winner")),
    eliminatedRound: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_tournamentId", ["tournamentId"])
    .index("by_tournament_and_user", ["tournamentId", "clerkUserId"])
    .index("by_tournament_and_seed", ["tournamentId", "seed"]),

  tournamentRounds: defineTable({
    tournamentId: v.id("tournaments"),
    roundNumber: v.number(),
    name: v.string(),
    entrantsCount: v.number(),
    status: v.union(v.literal("waiting"), v.literal("ready"), v.literal("live"), v.literal("completed")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_tournament_and_round", ["tournamentId", "roundNumber"])
    .index("by_tournamentId", ["tournamentId"]),

  tournamentMatches: defineTable({
    tournamentId: v.id("tournaments"),
    roundId: v.id("tournamentRounds"),
    roundNumber: v.number(),
    matchNumber: v.number(),
    slotIndex: v.number(),
    player1ClerkUserId: v.optional(v.string()),
    player2ClerkUserId: v.optional(v.string()),
    player1DisplayName: v.optional(v.string()),
    player2DisplayName: v.optional(v.string()),
    player1AvatarUrl: v.optional(v.string()),
    player2AvatarUrl: v.optional(v.string()),
    player1Ready: v.boolean(),
    player2Ready: v.boolean(),
    player1GameWins: v.number(),
    player2GameWins: v.number(),
    winnerClerkUserId: v.optional(v.string()),
    nextMatchId: v.optional(v.id("tournamentMatches")),
    nextSlot: v.optional(v.union(v.literal("player1"), v.literal("player2"))),
    status: v.union(
      v.literal("scheduled"),
      v.literal("waiting"),
      v.literal("ready"),
      v.literal("live"),
      v.literal("completed"),
      v.literal("forfeit"),
      v.literal("disconnected"),
      v.literal("cancelled")
    ),
    scheduledAt: v.optional(v.number()),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_tournament_and_round", ["tournamentId", "roundNumber"])
    .index("by_tournament_and_status", ["tournamentId", "status"])
    .index("by_player1", ["player1ClerkUserId"])
    .index("by_player2", ["player2ClerkUserId"])
    .index("by_scheduledAt", ["scheduledAt"]),

  matchGames: defineTable({
    tournamentMatchId: v.id("tournamentMatches"),
    gameNumber: v.number(),
    status: v.union(v.literal("scheduled"), v.literal("live"), v.literal("completed"), v.literal("cancelled")),
    ropePosition: v.number(),
    winnerClerkUserId: v.optional(v.string()),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_tournamentMatchId", ["tournamentMatchId"])
    .index("by_match_and_game", ["tournamentMatchId", "gameNumber"]),

  matchSpectators: defineTable({
    tournamentMatchId: v.id("tournamentMatches"),
    clerkUserId: v.string(),
    joinedAt: v.number(),
    lastSeenAt: v.number(),
  })
    .index("by_match_and_user", ["tournamentMatchId", "clerkUserId"])
    .index("by_tournamentMatchId", ["tournamentMatchId"]),

  // Creator Applications
  creatorApplications: defineTable({
    clerkUserId: v.string(),
    name: v.string(),
    email: v.string(),
    username: v.string(),
    platform: v.union(
      v.literal("youtube"),
      v.literal("twitch"),
      v.literal("instagram"),
      v.literal("kick"),
      v.literal("other")
    ),
    channelName: v.string(),
    channelUrl: v.string(),
    followerCount: v.number(),
    country: v.string(),
    profileImage: v.optional(v.union(v.string(), v.null())),
    description: v.string(),
    whyJoin: v.string(),
    socialLinks: v.object({
      youtube: v.optional(v.union(v.string(), v.null())),
      twitter: v.optional(v.union(v.string(), v.null())),
      instagram: v.optional(v.union(v.string(), v.null())),
      discord: v.optional(v.union(v.string(), v.null())),
    }),
    status: v.union(
      v.literal("pending"),
      v.literal("under_review"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("suspended")
    ),
    adminNotes: v.optional(v.string()),
    reviewedBy: v.optional(v.string()),
    reviewedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerkUserId", ["clerkUserId"])
    .index("by_email", ["email"])
    .index("by_status", ["status"])
    .index("by_createdAt", ["createdAt"]),

  // Creator Verified Profiles
  creatorProfiles: defineTable({
    clerkUserId: v.string(),
    displayName: v.string(),
    username: v.string(),
    avatarUrl: v.string(),
    platform: v.string(),
    channelName: v.string(),
    channelUrl: v.string(),
    followerCount: v.number(),
    bio: v.string(),
    socialLinks: v.any(),
    verified: v.boolean(),
    featured: v.boolean(),
    eventsParticipated: v.number(),
    achievements: v.array(v.string()),
    canHostEvents: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_clerkUserId", ["clerkUserId"])
    .index("by_username", ["username"])
    .index("by_featured", ["featured"]),

  // Vadamvali Multiplayer Matches
  matches: defineTable({
    eventId: v.optional(v.id("events")),
    activitySlug: v.string(),
    roomCode: v.string(),
    mode: v.union(v.literal("quick"), v.literal("private")),
    player1: v.object({
      clerkUserId: v.string(),
      displayName: v.string(),
      avatarUrl: v.string(),
      level: v.number(),
      country: v.string(),
      isReady: v.boolean(),
      pulls: v.number(),
      lastPullTimestamp: v.number(),
    }),
    player2: v.optional(
      v.object({
        clerkUserId: v.string(),
        displayName: v.string(),
        avatarUrl: v.string(),
        level: v.number(),
        country: v.string(),
        isReady: v.boolean(),
        pulls: v.number(),
        lastPullTimestamp: v.number(),
      })
    ),
    status: v.union(
      v.literal("waiting"),
      v.literal("lobby"),
      v.literal("countdown"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("disconnected")
    ),
    ropePosition: v.number(), // -100 (Player 1 win) to +100 (Player 2 win), 0 is center
    winner: v.optional(v.string()), // clerkUserId of winner
    loser: v.optional(v.string()),
    winnerPoints: v.optional(v.number()),
    loserPoints: v.optional(v.number()),
    scheduledAt: v.optional(v.number()),
    expected: v.optional(v.boolean()),
    durationSeconds: v.optional(v.number()),
    startedAt: v.optional(v.number()),
    endedAt: v.optional(v.number()),
    antiCheatFlags: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_roomCode", ["roomCode"])
    .index("by_status", ["status"])
    .index("by_player1", ["player1.clerkUserId"])
    .index("by_createdAt", ["createdAt"])
    .index("by_eventId_and_status", ["eventId", "status"]),

  // Matchmaking Queue
  matchmakingQueue: defineTable({
    clerkUserId: v.string(),
    displayName: v.string(),
    avatarUrl: v.string(),
    level: v.number(),
    country: v.string(),
    joinedAt: v.number(),
  }).index("by_clerkUserId", ["clerkUserId"]).index("by_joinedAt", ["joinedAt"]),

  // Pookalam Designs
  pookalamDesigns: defineTable({
    clerkUserId: v.string(),
    eventId: v.id("events"),
    title: v.string(),
    canvasData: v.any(), // JSON list of flower elements, positions, rotations, colors
    previewUrl: v.string(),
    templateId: v.optional(v.string()),
    isSubmitted: v.boolean(),
    isDraft: v.boolean(),
    submittedAt: v.optional(v.number()),
    submissionStatus: v.optional(v.union(v.literal("draft"), v.literal("submitted"), v.literal("approved"), v.literal("rejected"), v.literal("featured"), v.literal("winner"))),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_and_event", ["clerkUserId", "eventId"])
    .index("by_eventId", ["eventId"]),

  // Pookalam Submissions (in competition gallery)
  pookalamSubmissions: defineTable({
    eventId: v.id("events"),
    designId: v.id("pookalamDesigns"),
    clerkUserId: v.string(),
    creatorName: v.string(),
    creatorAvatar: v.string(),
    title: v.string(),
    previewUrl: v.string(),
    canvasData: v.any(),
    voteCount: v.number(),
    viewCount: v.number(),
    status: v.union(
      v.literal("submitted"),
      v.literal("approved"),
      v.literal("featured"),
      v.literal("rejected"),
      v.literal("winner")
    ),
    winnerBadge: v.optional(
      v.union(
        v.literal("first_place"),
        v.literal("second_place"),
        v.literal("third_place"),
        v.literal("peoples_choice"),
        v.literal("special_mention")
      )
    ),
    createdAt: v.number(),
  })
    .index("by_eventId", ["eventId"])
    .index("by_voteCount", ["voteCount"])
    .index("by_status", ["status"])
    .index("by_user", ["clerkUserId"]),

  // Pookalam Votes (1-vote enforcement)
  pookalamVotes: defineTable({
    submissionId: v.id("pookalamSubmissions"),
    clerkUserId: v.string(),
    eventId: v.id("events"),
    votedAt: v.number(),
  })
    .index("by_submission_and_user", ["submissionId", "clerkUserId"])
    .index("by_user_and_event", ["clerkUserId", "eventId"]),

  // Quizzes
  quizzes: defineTable({
    eventId: v.id("events"),
    title: v.string(),
    slug: v.string(),
    description: v.string(),
    timeLimitSeconds: v.number(), // Per question
    totalQuestions: v.number(),
    pointsPerCorrect: v.number(),
    speedBonusMax: v.number(),
    status: v.union(
      v.literal("draft"),
      v.literal("scheduled"),
      v.literal("paused"),
      v.literal("live"),
      v.literal("ended"),
      v.literal("archived")
    ),
    createdAt: v.number(),
    registrationStartTime: v.optional(v.number()),
    registrationCloseTime: v.optional(v.number()),
    scheduledStartTime: v.optional(v.number()),
    expectedEndTime: v.optional(v.number()),
    startedAt: v.optional(v.number()),
    endedAt: v.optional(v.number()),
  })
    .index("by_eventId", ["eventId"])
    .index("by_slug", ["slug"]),

  // Quiz Questions (Correct answer held securely on server)
  quizQuestions: defineTable({
    quizId: v.id("quizzes"),
    question: v.string(),
    options: v.array(v.string()),
    correctOptionIndex: v.number(), // Protected: stripped when querying for player
    explanation: v.string(),
    points: v.number(),
    difficulty: v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard")
    ),
    imageUrl: v.optional(v.string()),
    order: v.number(),
  }).index("by_quizId", ["quizId"]),

  // Quiz Player Sessions
  quizSessions: defineTable({
    quizId: v.id("quizzes"),
    clerkUserId: v.string(),
    currentQuestionIndex: v.number(),
    score: v.number(),
    streak: v.number(),
    answers: v.array(
      v.object({
        questionIndex: v.number(),
        selectedOption: v.number(),
        isCorrect: v.boolean(),
        pointsAwarded: v.number(),
        timeTakenSeconds: v.number(),
      })
    ),
    isCompleted: v.boolean(),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    questionStartedAt: v.optional(v.number()),
    correctAnswers: v.optional(v.number()),
    totalResponseTimeMs: v.optional(v.number()),
  })
    .index("by_quiz_and_user", ["quizId", "clerkUserId"])
    .index("by_score", ["score"]),

  eventSchedule: defineTable({
    eventId: v.id("events"),
    activityId: v.optional(v.id("eventActivities")),
    title: v.string(),
    scheduledAt: v.number(),
    kind: v.union(v.literal("registration"), v.literal("activity"), v.literal("match"), v.literal("voting"), v.literal("announcement")),
    status: v.union(v.literal("scheduled"), v.literal("live"), v.literal("completed"), v.literal("cancelled")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_eventId_and_scheduledAt", ["eventId", "scheduledAt"]),

  // Leaderboards
  leaderboards: defineTable({
    eventId: v.optional(v.id("events")),
    category: v.union(
      v.literal("global_xp"),
      v.literal("vadamvali"),
      v.literal("quiz"),
      v.literal("pookalam")
    ),
    period: v.union(
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("overall")
    ),
    clerkUserId: v.string(),
    displayName: v.string(),
    avatarUrl: v.string(),
    score: v.number(),
    rank: v.number(),
    wins: v.optional(v.number()),
    losses: v.optional(v.number()),
    winRate: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_category_and_period", ["category", "period", "score"])
    .index("by_event_and_category", ["eventId", "category", "score"]),

  // Achievements
  achievements: defineTable({
    code: v.string(),
    title: v.string(),
    description: v.string(),
    icon: v.string(),
    category: v.union(
      v.literal("vadamvali"),
      v.literal("quiz"),
      v.literal("pookalam"),
      v.literal("general"),
      v.literal("creator")
    ),
    pointsReward: v.number(),
  }).index("by_code", ["code"]),

  // User Achievements
  userAchievements: defineTable({
    clerkUserId: v.string(),
    achievementCode: v.string(),
    unlockedAt: v.number(),
  }).index("by_user", ["clerkUserId"]).index("by_user_and_code", ["clerkUserId", "achievementCode"]),

  // In-App Notifications
  notifications: defineTable({
    clerkUserId: v.string(),
    title: v.string(),
    message: v.string(),
    type: v.union(
      v.literal("creator_approved"),
      v.literal("creator_rejected"),
      v.literal("match_result"),
      v.literal("quiz_score"),
      v.literal("pookalam_vote"),
      v.literal("pookalam_winner"),
      v.literal("event_announcement"),
      v.literal("system")
    ),
    link: v.optional(v.string()),
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["clerkUserId"])
    .index("by_user_unread", ["clerkUserId", "isRead"]),

  // Global & Event Announcements
  announcements: defineTable({
    eventId: v.optional(v.id("events")),
    title: v.string(),
    content: v.string(),
    type: v.union(
      v.literal("urgent"),
      v.literal("info"),
      v.literal("tournament"),
      v.literal("winner")
    ),
    isGlobal: v.boolean(),
    publishedAt: v.number(),
    authorName: v.string(),
  })
    .index("by_isGlobal", ["isGlobal"])
    .index("by_eventId", ["eventId"])
    .index("by_publishedAt", ["publishedAt"]),

  // Admin Audit Logs (Immutable)
  adminLogs: defineTable({
    adminClerkUserId: v.string(),
    adminDisplayName: v.string(),
    action: v.string(),
    entity: v.string(),
    entityId: v.string(),
    details: v.any(),
    timestamp: v.number(),
  }).index("by_timestamp", ["timestamp"]),

  // Analytics
  analyticsEvents: defineTable({
    eventType: v.string(),
    eventId: v.optional(v.id("events")),
    clerkUserId: v.optional(v.string()),
    metadata: v.optional(v.any()),
    timestamp: v.number(),
  }).index("by_eventType", ["eventType"]).index("by_timestamp", ["timestamp"]),

  // Suspicious Activity (Anti-cheat records)
  suspiciousActivities: defineTable({
    clerkUserId: v.string(),
    matchId: v.optional(v.id("matches")),
    reason: v.string(),
    metrics: v.any(),
    detectedAt: v.number(),
  }).index("by_clerkUserId", ["clerkUserId"]),
});
