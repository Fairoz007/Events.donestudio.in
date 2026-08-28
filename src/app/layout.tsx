import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { FloatingSocialDock } from "@/components/layout/FloatingSocialDock";

const metadataBase = new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://eventsdonestudioin.pages.dev");

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase,
  title: "D-One Studio Events | ONAM 2026 & Digital Championship Arena",
  description:
    "Discover festivals, tournaments, online competitions, and creator campaigns. Experience real-time Vadamvali Tug of War, Pookalam Designer, and Cultural Trivia on D-One Studio Events.",
  keywords: [
    "D-One Studio",
    "Onam 2026",
    "Vadamvali",
    "Pookalam",
    "Online Tug of War",
    "Kerala Festival Games",
    "Gaming Tournaments",
    "Creator Events",
  ],
  authors: [{ name: "D-One Studio" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    title: "D-One Studio Events | ONAM 2026 & Digital Championship Arena",
    description: "Celebrate, play, compete, and win in D-One Studio's live cultural events.",
    images: [{ url: "/images/onam-hero-art.jpg", width: 1536, height: 1024 }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="bg-[#080b0e] text-slate-100 min-h-screen flex flex-col selection:bg-emerald-500 selection:text-slate-950">
        <ConvexClientProvider>
          <AnnouncementBar />
          <Navbar />
          <FloatingSocialDock />
          <main className="flex-1">{children}</main>
          <Footer />
        </ConvexClientProvider>
      </body>
    </html>
  );
}
