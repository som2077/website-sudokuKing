"use client";

import { memo } from "react";
import { getRow, getCol } from "@/lib/sudokuEngine";

interface OpponentMiniBoardProps {
  initialBoard: number[];
  solvedIndices: number[];
  lastCellIndex?: number;
}

export const OpponentMiniBoard = memo(function OpponentMiniBoard({
  initialBoard,
  solvedIndices,
  lastCellIndex,
}: OpponentMiniBoardProps) {
  const solvedSet = new Set(solvedIndices);

  return (
    <div className="flex flex-col items-center">
      {/* Apple Watch style radar card with specular border */}
      <div className="w-[148px] sm:w-[160px] aspect-square rounded-2xl bg-slate-950 p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.18)] border border-white/10 ring-1 ring-black/40">
        <div className="grid grid-cols-9 w-full h-full gap-[1.5px] bg-slate-900/90 rounded-xl p-[2px] overflow-hidden">
          {Array.from({ length: 81 }).map((_, i) => {
            const isInitial = initialBoard[i] !== 0;
            const isSolved = solvedSet.has(i);
            const isRecent = lastCellIndex === i;

            const r = getRow(i);
            const c = getCol(i);

            // Subtle block borders
            const blockBorderB = (r + 1) % 3 === 0 && r !== 8 ? "mb-[1px]" : "";
            const blockBorderR = (c + 1) % 3 === 0 && c !== 8 ? "mr-[1px]" : "";

            let cellBg = "bg-slate-800/60";
            if (isRecent) {
              cellBg = "bg-rose-400 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]";
            } else if (isSolved) {
              cellBg = "bg-rose-500 shadow-[0_0_4px_rgba(244,63,94,0.4)]";
            } else if (isInitial) {
              cellBg = "bg-slate-700/80";
            }

            return (
              <div
                key={i}
                className={`w-full h-full rounded-[2px] transition-colors duration-200 ${cellBg} ${blockBorderB} ${blockBorderR}`}
              />
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-4 mt-2.5 text-[10px] text-slate-500 font-semibold tracking-tight">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-slate-700" /> Givens
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500" /> Solved
        </span>
      </div>
    </div>
  );
});
