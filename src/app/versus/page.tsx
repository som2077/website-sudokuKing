import { Suspense } from "react";
import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { VersusGame } from "@/components/versus/VersusGame";

export const metadata: Metadata = {
  title: "1 vs 1 Sudoku Duel - Multiplayer Race | Sudoku King",
  description: "Challenge your friends or race against AI solvers in real-time 1 vs 1 Sudoku duels on Sudoku King.",
};

export default function VersusPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 selection:bg-indigo-500/15 selection:text-indigo-900">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center">
        <Suspense
          fallback={
            <div className="w-full min-h-[60vh] flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center animate-spin">
                <div className="w-5 h-5 rounded-full border-2 border-indigo-600 border-t-transparent" />
              </div>
              <span className="text-xs font-bold text-slate-500 mt-4 tracking-wider uppercase">
                Loading 1 vs 1 Duel Arena...
              </span>
            </div>
          }
        >
          <VersusGame />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
