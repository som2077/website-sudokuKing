"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import { useVersusStore, saveActiveVersus } from "@/store/useVersusStore";
import { VersusHeader } from "./VersusHeader";
import { VersusBoard } from "./VersusBoard";
import { VersusControls } from "./VersusControls";
import { VersusLobby } from "./VersusLobby";
import { VersusResultModal } from "./VersusResultModal";
import { OpponentMiniBoard } from "./OpponentMiniBoard";
import { VersusLeaderboard } from "./VersusLeaderboard";
import { Swords, Zap, ShieldAlert, Award } from "lucide-react";
import { getCountryFlag } from "@/lib/leaderboardService";

const emptySubscribe = () => () => {};

function useHasMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

function VersusGameSkeleton() {
  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center py-20">
      <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center animate-spin">
        <div className="w-5 h-5 rounded-full border-2 border-indigo-600 border-t-transparent" />
      </div>
      <span className="text-xs font-bold text-slate-500 mt-4 tracking-wider uppercase">
        Loading 1 vs 1 Duel Arena...
      </span>
    </div>
  );
}

export function VersusGame() {
  const hasMounted = useHasMounted();
  const searchParams = useSearchParams();
  const roomParam = searchParams.get("room");

  const {
    status,
    roomCode,
    initRoom,
    tickTimer,
    opponent,
    initialBoard,
    lastOpponentCellIndex,
    restoreSavedVersus,
  } = useVersusStore();

  // On mount: restore previous game if page reloaded, or join from URL param
  useEffect(() => {
    restoreSavedVersus();

    if (roomParam) {
      const normalized = roomParam.toUpperCase();
      const current = useVersusStore.getState().roomCode;
      if (!current || current !== normalized) {
        initRoom({
          roomCode: normalized,
          mode: "friend",
          isHost: false,
          difficulty: "Medium",
        });
      }
    }

    const handleBeforeUnload = () => {
      saveActiveVersus(useVersusStore.getState());
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [restoreSavedVersus, roomParam, initRoom]);

  // Match timer tick
  useEffect(() => {
    if (status !== "playing") return;
    const interval = setInterval(() => {
      tickTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [status, tickTimer]);

  if (!hasMounted) {
    return <VersusGameSkeleton />;
  }

  if (status === "lobby") {
    return (
      <div className="w-full pb-16">
        <VersusLobby />
        <VersusLeaderboard />
      </div>
    );
  }

  const oppProgressPercent = opponent
    ? Math.min(100, Math.round((opponent.progress / 81) * 100))
    : 0;

  return (
    <div className="flex flex-col w-full min-h-screen bg-white text-slate-900 selection:bg-indigo-500/15">
      <VersusHeader />

      {/* Main Duel Stage */}
      <main className="flex-1 container mx-auto max-w-6xl px-3 sm:px-6 py-6 sm:py-8 flex flex-col items-center">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 w-full">
          {/* Left: 9x9 Sudoku Board */}
          <div className="w-full max-w-[460px] flex flex-col items-center justify-center">
            <VersusBoard />
          </div>

          {/* Right: Controls & Opponent Live Tracker */}
          <div className="w-full max-w-[460px] flex flex-col items-center lg:items-start gap-4">
            <VersusControls />

            {/* Live Opponent Radar Card - Apple Watch / Dynamic Island Style */}
            <div className="w-full p-4.5 sm:p-5 rounded-[28px] bg-white/85 backdrop-blur-xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="flex items-center justify-between font-bold text-xs text-slate-900 mb-3.5">
                <span className="flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-tight text-slate-600">
                  <Swords className="h-3.5 w-3.5 text-rose-500" />
                  OPPONENT RADAR
                </span>
                <span className="text-[11px] text-indigo-600 font-semibold flex items-center gap-1.5 bg-indigo-50/80 px-2.5 py-0.5 rounded-full border border-indigo-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <Zap className="w-3 h-3 text-indigo-500" /> Live
                </span>
              </div>

              {opponent ? (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 text-white font-black text-xs flex items-center justify-center shadow-xs ring-2 ring-rose-100">
                        {opponent.username.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-bold text-xs sm:text-sm text-slate-900 block leading-tight tracking-tight">
                          {opponent.username}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {getCountryFlag(opponent.countryCode)} {opponent.countryName}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-black text-sm sm:text-base text-slate-900 block leading-tight tracking-tight">
                        {opponent.progress} <span className="text-slate-400 text-xs font-normal">/ 81</span>
                      </span>
                      <span className="text-[11px] text-rose-600 font-bold tracking-tight">
                        {oppProgressPercent}% Solved
                      </span>
                    </div>
                  </div>

                  {/* Opponent Progress Bar with Apple track styling */}
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200/60 shadow-inner">
                    <div
                      className="bg-gradient-to-r from-rose-500 to-rose-600 h-full rounded-full transition-all duration-300 shadow-xs"
                      style={{ width: `${oppProgressPercent}%` }}
                    />
                  </div>

                  {/* Live Opponent 9x9 Mini Board Heatmap */}
                  <div className="py-2 flex flex-col items-center justify-center">
                    <OpponentMiniBoard
                      initialBoard={initialBoard}
                      solvedIndices={opponent.solvedIndices || []}
                      lastCellIndex={lastOpponentCellIndex ?? undefined}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1.5 font-medium">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                      Mistakes:{" "}
                      <strong className={opponent.mistakes >= 2 ? "text-rose-600" : "text-slate-700"}>
                        {opponent.mistakes}/3
                      </strong>
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      {opponent.mistakes >= 2 ? "⚠️ Danger" : "In Flight"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-xs text-slate-400 font-medium">
                  Waiting for opponent to connect...
                </div>
              )}
            </div>

            {/* Rules quick reminder - Apple squircle pill */}
            <div className="w-full p-3.5 rounded-[20px] bg-amber-50/70 border border-amber-200/60 text-[11px] text-amber-950 flex items-start gap-2.5 shadow-2xs">
              <Award className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="leading-snug">
                <strong className="font-bold">Knockout Rule:</strong> First to 81 solved cells wins. 3 mistakes results in an instant knockout!
              </div>
            </div>
          </div>
        </div>
      </main>

      <VersusResultModal />
    </div>
  );
}
