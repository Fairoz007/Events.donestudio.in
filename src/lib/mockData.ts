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
  status: "live" | "scheduled" | "registration_open" | "registration_closed" | "completed" | "draft" | "archived";
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
  prizes: { place: string; title: string; reward: string; icon: string }[];
  sponsors: { name: string; logoUrl: string; tier: string; websiteUrl?: string }[];
  organizer: string;
  participantCount: number;
}

export const INITIAL_EVENTS: EventItem[] = [
  {
    _id: "evt_onam_2026",
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
      festivalIcon: "Onam",
    },
    featured: true,
    rules: [
      "Register for ONAM 2026 before joining individual activities.",
      "Vadamvali tournament matchups are Best-of-3 and run one live match at a time.",
      "Pookalam votes and quiz scores are validated by Convex.",
    ],
    prizes: [],
    sponsors: [{ name: "D-One Studio", logoUrl: "/images/onam-hero-art.jpg", tier: "Organizer" }],
    organizer: "D-One Studio",
    participantCount: 0,
  },
];

export const ONAM_ACTIVITIES = [
  {
    _id: "act_vadamvali",
    title: "Vadamvali",
    slug: "vadamvali",
    type: "vadamvali",
    tagline: "Realtime Tug of War Tournament",
    description: "Best-of-3 tournament play with automatic fixture generation, check-in, walkovers, and one live match at a time.",
    bannerUrl: "/images/vadamvali-card.jpg",
    status: "live",
    pointsReward: 0,
    participantCount: 0,
    icon: "V",
  },
  {
    _id: "act_pookalam",
    title: "Digital Pookalam",
    slug: "pookalam",
    type: "pookalam",
    tagline: "Create. Publish. Vote.",
    description: "Design your Pookalam, publish it for competition, and vote for one eligible entry while voting is open.",
    bannerUrl: "/images/pookalam-card.jpg",
    status: "live",
    pointsReward: 0,
    participantCount: 0,
    icon: "P",
  },
  {
    _id: "act_quiz",
    title: "Onam Cultural Quiz",
    slug: "quiz",
    type: "quiz",
    tagline: "Test Your Kerala Knowledge",
    description: "Register, wait in the quiz lobby, answer live questions, and let Convex calculate score, speed bonus, and streak bonus.",
    bannerUrl: "/images/quiz-host-card.jpg",
    status: "live",
    pointsReward: 0,
    participantCount: 0,
    icon: "Q",
  },
];

export const INITIAL_LEADERBOARD: never[] = [];
export const INITIAL_CREATORS: never[] = [];
export const INITIAL_POOKALAMS: never[] = [];
