import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || "https://precise-wolverine-704.convex.cloud");

async function main() {
  console.log("Creating/updating Hook Gaming Championship 2026 event...");
  const result = await client.mutation(api.admin.createEventAdmin, {
    title: "Hook Gaming Championship 2026",
    slug: "hook-gaming-championship-2026",
    tagline: "Battle with The Hook live on YouTube",
    description: "Exclusive tournament hosted by The Hook featuring custom Tug of War battles and community giveaways.",
    bannerUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1600&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80",
    startDate: "2026-10-01T00:00:00Z",
    endDate: "2026-10-05T23:59:59Z",
    registrationStartDate: "2026-09-15T00:00:00Z",
    registrationEndDate: "2026-09-30T23:59:59Z",
    status: "registration_open",
    category: "creator",
    theme: {
      primaryColor: "#dc2626",
      secondaryColor: "#f59e0b",
      accentColor: "#38bdf8",
      bgGradient: "from-red-950 via-slate-950 to-amber-950",
      bannerBadge: "CREATOR TOURNAMENT",
      festivalIcon: "🎮",
    },
    featured: true,
    rules: [
      "Open to all registered community members.",
      "1v1 Vadamvali matches are streamed live on Hook Gaming.",
      "Top 8 players qualify for championship playoff bracket.",
    ],
    prizes: [
      { place: "1st Place (Grand Champion)", title: "Hook Trophy + ₹25,000 + 5,000 XP", reward: "₹25,000", icon: "🏆" },
      { place: "2nd Place", title: "Runner-up Shield + ₹10,000 + 2,500 XP", reward: "₹10,000", icon: "🥈" },
      { place: "3rd Place", title: "Bronze Medal + ₹5,000 + 1,000 XP", reward: "₹5,000", icon: "🥉" },
    ],
    sponsors: [
      { name: "Hook Gaming", logoUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=hook-gaming", tier: "Title Sponsor", websiteUrl: "https://www.youtube.com/@Thehook" },
      { name: "D-One Studio", logoUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=DOne", tier: "Organizer", websiteUrl: "https://events.donestudio.in" },
    ],
    organizer: "The Hook & D-One Studio",
    hostEmail: "fairozfaisal2001@gmail.com",
  });

  console.log("Result:", result);
}

main().catch(console.error);
