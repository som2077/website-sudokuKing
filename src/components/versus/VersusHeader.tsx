"use client";

import { useVersusStore } from "@/store/useVersusStore";
import { getCountryFlag } from "@/lib/leaderboardService";
import { Swords, Clock, AlertTriangle, LogOut, Wifi, WifiOff } from "lucide-react";
import Link from "next/link";

export function VersusHeader() {
  const {
    me,
    opponent,
    status,
    elapsedSeconds,
    forfeit,
    leaveRoom,
    connectionStatus,
    mode,
    difficulty,
  } = useVersusStore();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleQuit = () => {
    if (status === "playing") {
      if (confirm("Are you sure you want to forfeit this match? Your opponent will win.")) {
        forfeit();
      }
    } else {
      leaveRoom();
    }
  };

  const myProgress = me.progress || 0;
  const oppProgress = opponent?.progress || 0;
  const myProgressPercent = Math.min(100, Math.round((myProgress / 81) * 100));
  const oppProgressPercent = Math.min(100, Math.round((oppProgress / 81) * 100));
  const delta = myProgress - oppProgress;

  return (
    <header className="w-full bg-white/80 backdrop-blur-2xl border-b border-black/[0.06] sticky top-0 z-30 shadow-[0_4px_20px_rgb(0,0,0,0.02)] transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5">
        {/* Top utility row: Breadcrumb + Status badge + Quit */}
        <div className="flex items-center justify-between pb-2 border-b border-black/[0.04] text-xs">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="font-bold text-slate-900 hover:text-indigo-600 transition-colors flex items-center gap-1 active:scale-95"
            >
              <span>Sudoku</span>
              <span className="text-amber-500 font-extrabold">King</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-slate-700 tracking-tight">1 vs 1 Duel</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/[0.04] text-slate-700 border border-black/[0.06] tracking-wide">
              {difficulty}
            </span>
            {mode === "bot" ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200/60">
                AI Bot
              </span>
            ) : connectionStatus === "connected" ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <Wifi className="w-3 h-3" />
                <span className="hidden sm:inline">Live</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 font-medium">
                <WifiOff className="w-3 h-3" />
                <span className="hidden sm:inline">Connecting</span>
              </span>
            )}
          </div>

          <button
            onClick={handleQuit}
            className="flex items-center gap-1.5 text-rose-600 hover:text-rose-700 font-semibold px-2.5 py-1 rounded-full hover:bg-rose-50/80 active:scale-95 transition-all cursor-pointer text-xs"
          >
            <LogOut className="w-3 h-3" />
            <span>{status === "playing" ? "Forfeit" : "Exit"}</span>
          </button>
        </div>

        {/* Players Duel Display - iOS Live Activity / Dynamic Island Layout */}
        <div className="pt-2.5 pb-1 grid grid-cols-3 items-center gap-2 sm:gap-4">
          {/* Player 1: You */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0" suppressHydrationWarning>
            <div className="relative shrink-0" suppressHydrationWarning>
              <div
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-extrabold text-sm shadow-[0_4px_12px_rgba(79,70,229,0.25)] ring-1 ring-white/20"
                suppressHydrationWarning
              >
                {me.username.substring(0, 2).toUpperCase()}
              </div>
              <span className="absolute -bottom-1 -right-1 text-xs drop-shadow-xs" suppressHydrationWarning>
                {getCountryFlag(me.countryCode)}
              </span>
            </div>
            <div className="min-w-0 truncate" suppressHydrationWarning>
              <span className="font-bold text-slate-900 text-xs sm:text-sm truncate block leading-tight" suppressHydrationWarning>
                {me.username} <span className="text-[10px] text-slate-400 font-normal">(You)</span>
              </span>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                <span className="font-mono font-bold text-indigo-600 tabular-nums">
                  {myProgress}/81
                </span>
                <span className="flex items-center gap-0.5 text-rose-500 font-medium">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  {me.mistakes}/3
                </span>
              </div>
            </div>
          </div>

          {/* Center: Apple Dynamic Island Capsule */}
          <div className="flex flex-col items-center justify-center">
            {status === "playing" ? (
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-950 text-white shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
                  <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="font-mono font-bold text-xs sm:text-sm tracking-tight tabular-nums">
                    {formatTime(elapsedSeconds)}
                  </span>
                </div>
                {opponent && (
                  <span
                    className={`text-[10px] font-bold mt-1 tracking-tight tabular-nums ${
                      delta > 0
                        ? "text-emerald-600"
                        : delta < 0
                          ? "text-rose-600"
                          : "text-slate-400"
                    }`}
                  >
                    {delta > 0
                      ? `+${delta} cells ahead`
                      : delta < 0
                        ? `${Math.abs(delta)} cells behind`
                        : "Tied race"}
                  </span>
                )}
              </div>
            ) : status === "countdown" ? (
              <div className="px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 font-black text-xs uppercase tracking-wider animate-pulse">
                Duel Starting...
              </div>
            ) : (
              <div className="w-9 h-9 rounded-2xl bg-black/[0.04] border border-black/[0.06] text-slate-700 flex items-center justify-center font-black text-xs shadow-2xs">
                <Swords className="w-4 h-4" />
              </div>
            )}
          </div>

          {/* Player 2: Opponent */}
          <div className="flex items-center justify-end gap-2.5 sm:gap-3 text-right min-w-0">
            <div className="min-w-0 truncate">
              <span className="font-bold text-slate-900 text-xs sm:text-sm truncate block leading-tight">
                {opponent ? opponent.username : "Waiting..."}
              </span>
              <div className="flex items-center justify-end gap-2 text-[11px] text-slate-500 mt-0.5">
                <span className="font-mono font-bold text-rose-600 tabular-nums">
                  {opponent ? `${oppProgress}/81` : "0/81"}
                </span>
                <span className="flex items-center gap-0.5 text-rose-500 font-medium">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  {opponent?.mistakes || 0}/3
                </span>
              </div>
            </div>
            <div className="relative shrink-0">
              <div
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center font-extrabold text-sm shadow-[0_4px_12px_rgba(244,63,94,0.2)] ring-1 ring-white/20 ${
                  opponent
                    ? "bg-gradient-to-br from-rose-500 to-rose-700 text-white"
                    : "bg-slate-100 text-slate-400 border border-dashed border-slate-300 animate-pulse"
                }`}
              >
                {opponent ? opponent.username.substring(0, 2).toUpperCase() : "?"}
              </div>
              {opponent && (
                <span className="absolute -bottom-1 -right-1 text-xs drop-shadow-xs">
                  {getCountryFlag(opponent.countryCode)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Apple Fitness Style Tug-of-War Race Track */}
        {status === "playing" && (
          <div className="mt-2 pt-1 pb-0.5">
            <div className="w-full h-2 rounded-full bg-slate-100 p-0.5 flex items-center border border-black/[0.04] shadow-inner overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-300 ease-out"
                style={{ width: `${Math.max(2, myProgressPercent)}%` }}
              />
              <div className="flex-1" />
              <div
                className="h-full rounded-full bg-gradient-to-l from-rose-500 to-rose-600 transition-all duration-300 ease-out"
                style={{ width: `${Math.max(2, oppProgressPercent)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
