// Comprehensive data fallback and seed state for D-One Studio Events
export interface EventItem {
  _id: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  bannerUrl: string;
  thumbnailUrl: string;
  startDate: string;
  endDate: string;
  registrationStartDate: string;
  registrationEndDate: string;
  status: "live" | "scheduled" | "registration_open" | "completed" | "draft" | "archived";
  category: "festival" | "gaming" | "creator" | "competition" | "campaign";
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    bgGradient: string;
    bannerBadge: string;
    festivalIcon: string;
  };
  featured: boolean;
  rules: string[];
  prizes: {
    place: string;
    title: string;
    reward: string;
    icon: string;
  }[];
  sponsors: {
    name: string;
    logoUrl: string;
    tier: string;
    websiteUrl?: string;
  }[];
  organizer: string;
  participantCount: number;
}

export const INITIAL_EVENTS: EventItem[] = [
  {
    _id: "evt_onam_2026",
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
      primaryColor: "#064e3b",
      secondaryColor: "#f59e0b",
      accentColor: "#ea580c",
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
      },
      {
        name: "Kerala Digital Arts",
        logoUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=KeralaArts",
        tier: "Platinum Partner",
      },
      {
        name: "God's Own Creators",
        logoUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=CreatorsHub",
        tier: "Gold Partner",
      },
    ],
    organizer: "D-One Studio Events Board",
    participantCount: 14820,
  },
  {
    _id: "evt_creator_2026",
    title: "D-One Creator Showdown 2026",
    slug: "creator-showdown-2026",
    tagline: "Top Streamers & Creators Battle Live",
    description:
      "Join your favorite YouTubers, Twitch streamers, and gaming personalities in a 3-day streaming marathon with live community matches and massive fan giveaways.",
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
    rules: ["Creator accounts must have a verified badge to host matches."],
    prizes: [
      { place: "Top Streamer", title: "D-One Creator Trophy + ₹100,000", reward: "₹100,000", icon: "🏆" },
    ],
    sponsors: [{ name: "D-One Studio", logoUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=DOne", tier: "Title" }],
    organizer: "D-One Creator Guild",
    participantCount: 3840,
  },
  {
    _id: "evt_christmas_2026",
    title: "Christmas Carnival 2026",
    slug: "christmas-carnival-2026",
    tagline: "Winter Magic, Quizzes & Holiday Gifts",
    description:
      "Celebrate the warmth of the holidays with global community mini-games, Christmas Carol quizzes, digital card creations, and holiday prizes.",
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
      bannerBadge: "COMING DEC 2026",
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
  },
  {
    _id: "evt_vishu_2027",
    title: "Vishu Festival 2027",
    slug: "vishu-2027",
    tagline: "New Dawn, Vishukani & Golden Harvest",
    description:
      "Welcome the astronomical Malayalam New Year with traditional Vishukani digital arrangements, firecracker games, and cultural competitions.",
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
  },
];

export const ONAM_ACTIVITIES = [
  {
    _id: "act_vadamvali",
    title: "Vadamvali (Tug of War)",
    slug: "vadamvali",
    type: "vadamvali",
    tagline: "Real-Time 1v1 Multiplayer Tug of War",
    description: "Battle live opponents in a thrilling battle of speed and rhythm! Pull the rope past the center line to dominate the arena.",
    bannerUrl: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80",
    status: "live",
    pointsReward: 100,
    participantCount: 9240,
    icon: "🪢",
  },
  {
    _id: "act_pookalam",
    title: "Pookalam Designer",
    slug: "pookalam",
    type: "pookalam",
    tagline: "Create & Submit Your Digital Floral Mandala",
    description: "Use marigolds, roses, lotus petals and geometric symmetry tools to create magnificent Pookalams and win the public vote.",
    bannerUrl: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80",
    status: "live",
    pointsReward: 50,
    participantCount: 4320,
    icon: "🌸",
  },
  {
    _id: "act_quiz",
    title: "Onam Cultural Quiz",
    slug: "quiz",
    type: "quiz",
    tagline: "10-Question High-Speed Cultural Trivia",
    description: "Prove your knowledge of King Mahabali, Vallamkali boat races, Onasadya feasts, and Kerala folklore in a timed 15s challenge.",
    bannerUrl: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=800&q=80",
    status: "live",
    pointsReward: 1000,
    participantCount: 6810,
    icon: "🎯",
  },
];

export const INITIAL_LEADERBOARD = [
  { rank: 1, username: "maveli_king", displayName: "Maveli The Conqueror", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=maveli", level: 18, points: 14250, vadamvaliWins: 142, vadamvaliLosses: 12, country: "IN", role: "super_admin" },
  { rank: 2, username: "ananya_kerala", displayName: "Ananya Ramesh", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=ananya", level: 16, points: 11800, vadamvaliWins: 98, vadamvaliLosses: 15, country: "IN", role: "creator" },
  { rank: 3, username: "rahul_gaming", displayName: "Rahul Playz", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=rahul", level: 15, points: 9450, vadamvaliWins: 85, vadamvaliLosses: 22, country: "AE", role: "creator" },
  { rank: 4, username: "devika_art", displayName: "Devika Designs", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=devika", level: 14, points: 8320, vadamvaliWins: 64, vadamvaliLosses: 19, country: "IN", role: "user" },
  { rank: 5, username: "vipin_warrior", displayName: "Vipin V", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=vipin", level: 12, points: 6800, vadamvaliWins: 52, vadamvaliLosses: 14, country: "QA", role: "user" },
  { rank: 6, username: "karthik_pro", displayName: "Karthik K", avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=karthik", level: 11, points: 5400, vadamvaliWins: 41, vadamvaliLosses: 18, country: "IN", role: "user" },
];

export const INITIAL_CREATORS = [
  {
    _id: "c_1",
    displayName: "Ananya Kerala Vlogs",
    username: "ananya_kerala",
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=ananya",
    platform: "youtube",
    channelName: "Ananya Kerala Vlogs",
    channelUrl: "https://youtube.com/@ananyakerala",
    followerCount: 245000,
    bio: "Kerala culture, festivals, food expeditions and livestreaming gaming events across God's Own Country.",
    socialLinks: { youtube: "https://youtube.com/@ananyakerala", instagram: "https://instagram.com/ananyakerala" },
    verified: true,
    featured: true,
    eventsParticipated: 4,
    achievements: ["Verified Creator", "Onam Legend", "Top Streamer"],
  },
  {
    _id: "c_2",
    displayName: "Rahul Playz Gaming",
    username: "rahul_gaming",
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=rahul",
    platform: "twitch",
    channelName: "RahulPlayzLive",
    channelUrl: "https://twitch.tv/rahulplayzlive",
    followerCount: 180000,
    bio: "High-octane competitive esports, multiplayer tournaments, and Onam Vadamvali master.",
    socialLinks: { youtube: "https://youtube.com/rahulplayz", discord: "https://discord.gg/rahulplayz" },
    verified: true,
    featured: true,
    eventsParticipated: 3,
    achievements: ["Verified Creator", "Tug Master"],
  },
  {
    _id: "c_3",
    displayName: "Mallu Tech & Art",
    username: "mallu_tech",
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=mallutech",
    platform: "youtube",
    channelName: "Mallu Tech & Art",
    channelUrl: "https://youtube.com/@mallutech",
    followerCount: 95000,
    bio: "Digital artwork, 3D designs, and creative festive Pookalam tutorials for the modern web.",
    socialLinks: { youtube: "https://youtube.com/@mallutech", instagram: "https://instagram.com/mallutechart" },
    verified: true,
    featured: true,
    eventsParticipated: 2,
    achievements: ["Verified Creator", "Pookalam Artist"],
  },
];

export const INITIAL_POOKALAMS = [
  {
    _id: "pk_1",
    title: "Golden Athapookalam 2026",
    creatorName: "Devika Designs",
    creatorAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=devika",
    previewUrl: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&q=80",
    voteCount: 384,
    viewCount: 1920,
    status: "winner",
    winnerBadge: "first_place",
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    _id: "pk_2",
    title: "Sahasradala Lotus Mandala",
    creatorName: "Ananya Ramesh",
    creatorAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=ananya",
    previewUrl: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=600&q=80",
    voteCount: 295,
    viewCount: 1450,
    status: "winner",
    winnerBadge: "second_place",
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    _id: "pk_3",
    title: "Thiruvonam Lamp Symphony",
    creatorName: "Karthik K",
    creatorAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=karthik",
    previewUrl: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=600&q=80",
    voteCount: 218,
    viewCount: 980,
    status: "winner",
    winnerBadge: "peoples_choice",
    createdAt: Date.now() - 86400000 * 1,
  },
  {
    _id: "pk_4",
    title: "Marigold Harmony Pattern",
    creatorName: "Vipin V",
    creatorAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=vipin",
    previewUrl: "https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=600&q=80",
    voteCount: 164,
    viewCount: 650,
    status: "featured",
    createdAt: Date.now() - 86400000 * 4,
  },
];
