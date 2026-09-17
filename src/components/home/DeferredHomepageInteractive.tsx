"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const SudokuGame = dynamic(
  () => import("@/components/game/SudokuGame").then((module) => module.SudokuGame),
  { ssr: false },
);

const DailyLeaderboard = dynamic(
  () =>
    import("@/components/leaderboard/DailyLeaderboard").then(
      (module) => module.DailyLeaderboard,
    ),
  { ssr: false },
);

function GamePlaceholder() {
  return (
    <div className="mx-auto aspect-square w-full max-w-[560px] animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
  );
}

/** Loads the game and live data only when the visitor is approaching them. */
export function DeferredHomepageInteractive() {
  const [showGame, setShowGame] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const gameTriggerRef = useRef<HTMLDivElement>(null);
  const leaderboardTriggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          if (entry.target === gameTriggerRef.current) setShowGame(true);
          if (entry.target === leaderboardTriggerRef.current) setShowLeaderboard(true);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "400px 0px" },
    );

    if (gameTriggerRef.current) observer.observe(gameTriggerRef.current);
    if (leaderboardTriggerRef.current) observer.observe(leaderboardTriggerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <section id="game" className="scroll-mt-16 bg-white py-6 sm:py-12">
        <div ref={gameTriggerRef}>{showGame ? <SudokuGame /> : <GamePlaceholder />}</div>
      </section>
      <div ref={leaderboardTriggerRef}>
        {showLeaderboard ? <DailyLeaderboard /> : null}
      </div>
    </>
  );
}
