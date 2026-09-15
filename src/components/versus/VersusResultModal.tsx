"use client";

import { useEffect, useState } from "react";
import { useVersusStore } from "@/store/useVersusStore";
import confetti from "canvas-confetti";
import {
  Trophy,
  Frown,
  RotateCcw,
  LogOut,
  CheckCircle2,
  Share2,
  Check,
  Flame,
  Zap,
  Award,
} from "lucide-react";
import { getCountryFlag } from "@/lib/leaderboardService";
import { loadVersusStats, VersusStats } from "@/lib/gameStats";
import { soundEffects } from "@/lib/soundEffects";

export function VersusResultModal() {
  const {
    status,
    winner,
    finishReason,
    me,
    opponent,
    elapsedSeconds,
    requestRematch,
    rematchRequestedByMe,
    rematchRequestedByOpponent,
    leaveRoom,
    mySeriesScore,
    opponentSeriesScore,
    roomCode,
  } = useVersusStore();

  const [copiedShare, setCopiedShare] = useState(false);
  const [versusStats, setVersusStats] = useState<VersusStats | null>(null);

  const isWinner = winner && winner.id === me.id;

  useEffect(() => {
    if (status === "finished") {
      setVersusStats(loadVersusStats());
      if (isWinner) {
        confetti({
          particleCount: 140,
          spread: 90,
          origin: { y: 0.55 },
        });
      }
    }
  }, [status, isWinner]);

  if (status !== "finished") return null;

  const formatTime = (secs?: number) => {
    if (secs === undefined) return "--:--";
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleShareResult = async () => {
    if (typeof window === "undefined") return;
    soundEffects.playClick();

    const timeStr = formatTime(elapsedSeconds);
    const opponentName = opponent ? opponent.username : "Opponent";
    const shareText = isWinner
      ? `🏆 I just won a 1 vs 1 Sudoku Duel against ${opponentName} in ${timeStr} on Sudoku King!\nThink you can beat me? Join here: ${window.location.origin}/versus?room=${roomCode}`
      : `⚔️ Just played a thrilling 1 vs 1 Sudoku Duel on Sudoku King!\nChallenge me: ${window.location.origin}/versus?room=${roomCode}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Sudoku King - 1 vs 1 Duel Result",
          text: shareText,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    navigator.clipboard.writeText(shareText);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  // Speed: cells solved per minute
  const mySpeed =
    elapsedSeconds > 0 ? ((me.progress / elapsedSeconds) * 60).toFixed(1) : "0";
  const oppTime = opponent?.timeSeconds || elapsedSeconds;
  const oppSpeed =
    oppTime > 0 ? (((opponent?.progress || 0) / oppTime) * 60).toFixed(1) : "0";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-[36px] p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)] border border-white/60 flex flex-col items-center text-center my-auto relative overflow-hidden">
        {/* Subtle Top Specular Shine */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-slate-100/60 to-transparent pointer-events-none rounded-t-[36px]" />

        {/* Banner Trophy / Defeat Icon with Apple dynamic glow */}
        <div
          className={`relative z-10 w-20 h-20 rounded-[24px] flex items-center justify-center mb-4 transition-transform ${
            isWinner
              ? "bg-gradient-to-b from-amber-400 to-amber-500 text-white shadow-[0_12px_28px_rgba(245,158,11,0.35)] ring-4 ring-amber-100/60"
              : "bg-slate-100 text-slate-500 border border-slate-200/80 shadow-[0_8px_20px_rgba(0,0,0,0.06)]"
          }`}
        >
          {isWinner ? (
            <Trophy className="w-10 h-10 fill-current drop-shadow-sm animate-bounce" />
          ) : (
            <Frown className="w-10 h-10 stroke-[1.75]" />
          )}
        </div>

        {/* Victory / Defeat Title */}
        <h2 className="relative z-10 text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-[-0.03em] leading-tight">
          {isWinner ? "Victory! You Won!" : "Good Match! Defeat"}
        </h2>

        {/* Outcome Description Badge */}
        <div className="relative z-10 mt-2 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-slate-100/90 text-slate-700 border border-slate-200/70 tracking-tight shadow-xs">
          <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>
            {finishReason === "knockout"
              ? isWinner
                ? "Won by Opponent Knockout (3 Mistakes)"
                : "Lost by Knockout (3 Mistakes)"
              : finishReason === "forfeit"
                ? isWinner
                  ? "Opponent Forfeited"
                  : "Match Conceded"
                : isWinner
                  ? "Solved Board 1st (81/81 Complete)"
                  : "Opponent Finished Board First"}
          </span>
        </div>

        {/* Session Series Score */}
        {(mySeriesScore > 0 || opponentSeriesScore > 0) && (
          <div className="relative z-10 w-full mt-4 py-2.5 px-4 rounded-2xl bg-indigo-50/80 border border-indigo-100/90 flex items-center justify-between text-xs backdrop-blur-xs">
            <span className="font-semibold text-slate-600">Series Score</span>
            <span className="font-extrabold text-indigo-700 font-mono text-sm tracking-tight">
              You {mySeriesScore} — {opponentSeriesScore}{" "}
              {opponent?.username || "Opponent"}
            </span>
          </div>
        )}

        {/* Apple Health / Fitness Style Duel Stats Matchup Card */}
        <div className="relative z-10 w-full mt-4 bg-slate-50/80 rounded-[24px] p-4 sm:p-5 border border-slate-200/80 shadow-xs">
          <div className="grid grid-cols-2 gap-3 divide-x divide-slate-200/80">
            {/* You */}
            <div className="flex flex-col items-center pr-2">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-sm">
                  {getCountryFlag(me.countryCode)}
                </span>
                <span className="font-bold text-xs text-slate-900 truncate max-w-[90px] tracking-tight">
                  {me.username}
                </span>
                {isWinner && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100 shrink-0" />
                )}
              </div>
              <span className="text-2xl font-black text-indigo-600 font-mono tracking-tight">
                {formatTime(elapsedSeconds)}
              </span>
              <span className="text-[11px] text-slate-600 font-medium mt-1">
                Solved: <strong className="text-slate-900 font-semibold">{me.progress}/81</strong>
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Speed: {mySpeed} /min
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1.5 tracking-tight ${
                  me.mistakes === 0
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                {me.mistakes === 0
                  ? "Flawless (0 err)"
                  : `${me.mistakes}/3 Mistakes`}
              </span>
            </div>

            {/* Opponent */}
            <div className="flex flex-col items-center pl-4">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-sm">
                  {opponent ? getCountryFlag(opponent.countryCode) : ""}
                </span>
                <span className="font-bold text-xs text-slate-900 truncate max-w-[90px] tracking-tight">
                  {opponent ? opponent.username : "Opponent"}
                </span>
                {!isWinner && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100 shrink-0" />
                )}
              </div>
              <span className="text-2xl font-black text-slate-700 font-mono tracking-tight">
                {formatTime(opponent?.timeSeconds || elapsedSeconds)}
              </span>
              <span className="text-[11px] text-slate-600 font-medium mt-1">
                Solved: <strong className="text-slate-900 font-semibold">{opponent?.progress || 0}/81</strong>
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Speed: {oppSpeed} /min
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1.5 tracking-tight ${
                  (opponent?.mistakes || 0) === 0
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                {opponent?.mistakes || 0}/3 Mistakes
              </span>
            </div>
          </div>
        </div>

        {/* Lifetime Record Pill */}
        {versusStats && versusStats.matchesPlayed > 0 && (
          <div className="relative z-10 w-full mt-3 py-2 px-3 rounded-2xl bg-slate-100/70 border border-slate-200/50 text-[11px] text-slate-600 flex items-center justify-around font-medium tracking-tight">
            <span>
              Record:{" "}
              <strong className="text-slate-900 font-bold font-mono">
                {versusStats.matchesWon}W - {versusStats.matchesLost}L
              </strong>
            </span>
            <span className="text-slate-300">•</span>
            <span>
              Win Rate:{" "}
              <strong className="text-slate-900 font-bold font-mono">
                {Math.round(
                  (versusStats.matchesWon / (versusStats.matchesPlayed || 1)) *
                    100,
                )}
                %
              </strong>
            </span>
            {versusStats.currentStreak > 1 && (
              <>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1 text-amber-700 font-bold">
                  <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                  {versusStats.currentStreak} Streak
                </span>
              </>
            )}
          </div>
        )}

        {/* Apple Tactile Actions */}
        <div className="relative z-10 w-full mt-5 space-y-2.5">
          {/* Rematch Button */}
          <button
            onClick={() => {
              soundEffects.playClick();
              requestRematch();
            }}
            disabled={rematchRequestedByMe}
            className={`w-full h-12.5 rounded-[18px] font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.98] ${
              rematchRequestedByOpponent
                ? "bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-[0_6px_20px_rgba(16,185,129,0.35)] animate-pulse"
                : rematchRequestedByMe
                  ? "bg-slate-100 text-slate-400 border border-slate-200/80 cursor-not-allowed"
                  : "bg-gradient-to-b from-indigo-600 to-indigo-700 text-white shadow-[0_6px_20px_rgba(79,70,229,0.3)] hover:brightness-105"
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span className="tracking-tight">
              {rematchRequestedByOpponent
                ? "Opponent wants a Rematch! Accept"
                : rematchRequestedByMe
                  ? "Waiting for Opponent to Accept..."
                  : "Play Rematch"}
            </span>
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Share Result Button */}
            <button
              onClick={handleShareResult}
              className="h-11 px-3 rounded-[16px] bg-slate-100/90 hover:bg-slate-200/70 active:scale-[0.97] text-slate-800 border border-slate-200/70 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer tracking-tight"
            >
              {copiedShare ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-slate-600" />
                  <span>Share Result</span>
                </>
              )}
            </button>

            {/* Back to Lobby Button */}
            <button
              onClick={() => {
                soundEffects.playClick();
                leaveRoom();
              }}
              className="h-11 px-3 rounded-[16px] bg-slate-100/90 hover:bg-slate-200/70 active:scale-[0.97] text-slate-700 border border-slate-200/70 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer tracking-tight"
            >
              <LogOut className="w-4 h-4 text-slate-500" />
              <span>Lobby</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
