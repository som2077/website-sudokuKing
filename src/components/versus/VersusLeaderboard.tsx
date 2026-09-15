"use client";

import { useEffect, useState } from "react";
import { Trophy, Swords, Flame, Award } from "lucide-react";
import { getCountryFlag } from "@/lib/leaderboardService";

export interface VersusLeaderboardEntry {
  username: string;
  countryCode: string;
  countryName: string;
  avatarSeed: string;
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  winRate: number;
  currentStreak: number;
  bestStreak: number;
  fastestWinSeconds: number | null;
  eloRating: number;
  rank: number;
}

export function VersusLeaderboard() {
  const [entries, setEntries] = useState<VersusLeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/versus/leaderboard")
      .then((res) => res.json())
      .then((data) => {
        if (active && data.entries) {
          setEntries(data.entries);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.warn("Failed to load versus leaderboard:", err);
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto mt-12 px-4">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center justify-center font-bold shadow-xs">
            <Trophy className="w-4.5 h-4.5 fill-current" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-950 tracking-[-0.02em] leading-tight">
              1 vs 1 Duel Rankings
            </h2>
            <p className="text-[11px] text-slate-500 font-medium tracking-tight">
              Top Sudoku Duel Champions by ELO Rating
            </p>
          </div>
        </div>

        <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-indigo-50/90 border border-indigo-200/80 text-indigo-700 flex items-center gap-1.5 shadow-2xs tracking-tight">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          <Swords className="w-3 h-3 text-indigo-600" /> Live ELO
        </span>
      </div>

      <div className="bg-white/90 backdrop-blur-xl rounded-[30px] border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        {isLoading ? (
          <div className="py-14 flex flex-col items-center justify-center text-slate-400 text-xs gap-2.5">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span className="font-medium tracking-tight">Loading leaderboard...</span>
          </div>
        ) : entries.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-400 font-medium px-4">
            No 1v1 matches recorded yet. Play a match to climb the leaderboard!
          </div>
        ) : (
          <div className="divide-y divide-slate-100/80">
            {entries.map((entry) => {
              const isTop1 = entry.rank === 1;
              const isTop2 = entry.rank === 2;
              const isTop3 = entry.rank === 3;

              return (
                <div
                  key={entry.username}
                  className={`p-3.5 sm:p-4 flex items-center justify-between transition-all hover:bg-slate-50/70 active:scale-[0.995] ${
                    isTop1
                      ? "bg-gradient-to-r from-amber-50/50 via-amber-50/20 to-transparent"
                      : isTop2
                        ? "bg-gradient-to-r from-slate-100/40 via-transparent to-transparent"
                        : isTop3
                          ? "bg-gradient-to-r from-amber-900/5 via-transparent to-transparent"
                          : ""
                  }`}
                >
                  {/* Rank & Player Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-7 text-center shrink-0">
                      {isTop1 ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-amber-100/80 text-base shadow-2xs">
                          🥇
                        </span>
                      ) : isTop2 ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-slate-100 text-base shadow-2xs">
                          🥈
                        </span>
                      ) : isTop3 ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-amber-900/10 text-base shadow-2xs">
                          🥉
                        </span>
                      ) : (
                        <span className="font-mono font-bold text-xs text-slate-400">
                          #{entry.rank}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className="text-xl shrink-0">
                        {getCountryFlag(entry.countryCode)}
                      </span>
                      <div>
                        <span className="font-bold text-xs sm:text-sm text-slate-900 block leading-tight tracking-tight">
                          {entry.username}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {entry.matchesWon}W / {entry.matchesPlayed}M (
                          {entry.winRate}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rating & Streak */}
                  <div className="text-right flex items-center gap-3">
                    {entry.bestStreak > 2 && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50/90 px-2.5 py-1 rounded-full border border-amber-200/70 tracking-tight">
                        <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                        {entry.bestStreak} Streak
                      </span>
                    )}
                    <div className="bg-slate-50/80 border border-slate-200/60 rounded-xl px-2.5 py-1 min-w-[62px] text-center">
                      <span className="font-mono font-black text-sm text-indigo-600 block leading-tight tracking-tight">
                        {entry.eloRating}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        ELO
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
