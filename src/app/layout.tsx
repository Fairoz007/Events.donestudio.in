import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { FloatingSocialDock } from "@/components/layout/FloatingSocialDock";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "D-One Studio ONAM 2026",
  description:
    "The dedicated D-One Studio ONAM 2026 arena for Vadamvali, Digital Pookalam, and the Onam Cultural Quiz.",
  keywords: [
    "D-One Studio",
    "Onam 2026",
    "Vadamvali",
    "Pookalam",
    "Online Tug of War",
    "Kerala Festival Games",
  ],
  authors: [{ name: "D-One Studio" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${inter.className} bg-[#080b0e] text-slate-100 min-h-screen flex flex-col selection:bg-emerald-500 selection:text-slate-950`}>
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
