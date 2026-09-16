import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { SudokuGame } from "@/components/game/SudokuGame";
import { DailyLeaderboard } from "@/components/leaderboard/DailyLeaderboard";
import { Footer } from "@/components/Footer";
import { absoluteUrl, siteName } from "@/lib/site";

export const metadata: Metadata = {
  title: "Play Free Sudoku Online",
  description:
    "Play free Sudoku online with daily challenges, smart hints, difficulty levels, and a live leaderboard. Learn strategies in the Sudoku King guides.",
  alternates: { canonical: "/" },
};

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: siteName,
    url: absoluteUrl("/"),
    applicationCategory: "GameApplication",
    operatingSystem: "Any",
    description:
      "A free online Sudoku game with daily challenges, hints, difficulty levels, and solving guides.",
    isAccessibleForFree: true,
  };

  return (
    <div
      suppressHydrationWarning
      className="flex min-h-screen flex-col bg-white text-foreground selection:bg-indigo-500/15 selection:text-indigo-900"
    >
      <div className="relative">
        <Navbar />
        <Hero />
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="flex-1 flex flex-col bg-white">
        <section id="game" className="py-6 sm:py-12 border-t border-slate-200/80 bg-white scroll-mt-16">
          <SudokuGame />
        </section>
        <DailyLeaderboard />
      </main>
      <Footer />
    </div>
  );
}
import type { Metadata } from "next";
