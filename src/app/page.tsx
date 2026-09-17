import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { DeferredHomepageInteractive } from "@/components/home/DeferredHomepageInteractive";
import { Footer } from "@/components/Footer";
import { absoluteUrl, siteName } from "@/lib/site";

export const metadata: Metadata = {
  title: "Play Free Sudoku Online - Daily Puzzles & Solving Guides",
  description:
    "Play free Sudoku online with daily challenges, smart hints, difficulty levels, and a live leaderboard. Learn strategies in the Sudoku King guides.",
  alternates: { canonical: "/" },
};

export default function Home() {
  const webApplicationSchema = {
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
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/app.png"),
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <main className="flex-1 flex flex-col bg-white">
        <DeferredHomepageInteractive />
        <section
          aria-labelledby="sudoku-guide-title"
          className="border-t border-slate-200 bg-slate-50 py-14 sm:py-20"
        >
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
              <h2
                id="sudoku-guide-title"
                className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl"
              >
                Free online Sudoku for every skill level
              </h2>
              <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg">
                Sudoku King is a free online Sudoku game for quick breaks and
                focused puzzle sessions. Choose a difficulty, fill every row,
                column, and 3×3 box with the numbers 1 through 9, and use notes
                or hints whenever you need a hand.
              </p>
              <div className="mt-8 grid gap-6 sm:grid-cols-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-950">Play daily Sudoku</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Return for a fresh daily challenge, track your streak, and
                    compare your result on the live leaderboard.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-950">Learn to solve Sudoku</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Start with the basic rules, then work through clear guides
                    for singles, pairs, X-Wing, Swordfish, and more.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-950">Improve at your pace</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Practice beginner strategies first and build toward tougher
                    Sudoku techniques without guessing.
                  </p>
                </div>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/rules"
                  className="rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800"
                >
                  Learn Sudoku rules and strategies
                </Link>
                <Link
                  href="/#game"
                  className="rounded-full border border-slate-300 px-5 py-3 text-sm font-bold text-slate-800 transition-colors hover:bg-slate-100"
                >
                  Start a free Sudoku puzzle
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
