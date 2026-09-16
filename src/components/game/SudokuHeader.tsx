"use client";

import { useSudokuStore } from "@/store/useSudokuStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import {
  Play,
  Pause,
  Settings,
  Sparkles,
} from "lucide-react";

export function SudokuHeader() {
  const {
    difficulty,
    mistakes,
    score,
    timer,
    status,
    settings,
    dailyDate,
    togglePause,
    openModal,
  } = useSudokuStore();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <header className="w-full border-b border-black/[0.06] bg-white/10 px-4 py-2 text-black backdrop-blur-xl transition-all sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1300px] items-center justify-between gap-4">
        <div className="flex w-full flex-wrap items-center justify-between gap-x-2 gap-y-2.5 sm:flex-nowrap">
          {/* Brand */}
          <div className="hidden shrink-0 items-center gap-2 sm:flex">
            <Image
              src="/sudukoLogo.svg"
              alt="Sudoku King"
              width={151}
              height={52}
              className="h-9 w-auto object-contain sm:h-10 md:h-11"
              priority
            />
            {dailyDate && (
              <Badge variant="outline" className="text-[10px] px-2 py-0 border-blue-200 bg-blue-50 text-blue-700 font-mono font-bold rounded-full ml-1">
                DAILY
              </Badge>
            )}
          </div>

          {/* Game Stats HUD - Apple Dynamic Capsule */}
          <div className="flex min-w-0 shrink-0 items-center justify-center sm:w-auto sm:mt-0">
            <div className="flex items-center gap-3 sm:gap-4 bg-slate-100/80 backdrop-blur-md px-3.5 py-1 rounded-full border border-black/[0.06] text-xs sm:text-sm shadow-2xs">
              {/* Difficulty */}
              <button
                onClick={() => openModal("new-game")}
                className="flex items-center gap-1 hover:text-blue-600 transition-colors font-medium cursor-pointer apple-press-subtle"
                title="Change Difficulty"
              >
                <span className="text-slate-400 hidden sm:inline text-xs font-mono">DIFF:</span>
                <span suppressHydrationWarning className="font-bold text-slate-900 underline decoration-slate-300 decoration-dotted">
                  {difficulty}
                </span>
              </button>

              <span className="text-slate-300 hidden sm:inline">•</span>

              {/* Mistakes */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 hidden sm:inline text-xs font-mono">FAILS:</span>
                <span
                  suppressHydrationWarning
                  className={`font-mono font-bold px-2 py-0.5 rounded-full border text-xs ${
                    mistakes > 0
                      ? "bg-rose-50 border-rose-200 text-rose-700 font-black"
                      : "bg-emerald-50 border-emerald-200 text-emerald-700"
                  }`}
                >
                  {mistakes}/3
                </span>
              </div>

              <span className="text-slate-300 hidden md:inline">•</span>

              {/* Score */}
              <div className="hidden md:flex items-center gap-1.5">
                <span className="text-slate-400 text-xs font-mono">PTS:</span>
                <span suppressHydrationWarning className="font-mono font-bold text-slate-900 tabular-nums">{score}</span>
              </div>

              {/* Timer & Pause */}
              {settings.timerVisible && (
                <>
                  <span className="text-slate-300 hidden sm:inline">•</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900">
                    <span suppressHydrationWarning className="tabular-nums">{formatTime(timer)}</span>
                    <button
                      onClick={togglePause}
                      className="p-1 rounded-full hover:bg-slate-200/80 text-slate-600 hover:text-slate-950 transition-colors cursor-pointer apple-press"
                      aria-label={status === "paused" ? "Resume Game" : "Pause Game"}
                      title={status === "paused" ? "Resume (P)" : "Pause (P)"}
                    >
                      {status === "paused" ? (
                        <Play className="h-3.5 w-3.5 fill-current text-blue-600" />
                      ) : (
                        <Pause className="h-3.5 w-3.5 fill-current" />
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quick Action Buttons (Simplified) */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => openModal("settings")}
              className="h-8 w-8 rounded-full text-slate-600 hover:text-slate-950 hover:bg-slate-100 apple-press cursor-pointer"
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </Button>

            <Button
              size="sm"
              onClick={() => openModal("new-game")}
              className="h-8 px-3 text-xs font-semibold rounded-full bg-slate-950 hover:bg-slate-800 text-white shadow-xs apple-press cursor-pointer border border-white/10"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1 text-amber-400 fill-amber-400" />
              <span className="hidden sm:inline">New Game</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
