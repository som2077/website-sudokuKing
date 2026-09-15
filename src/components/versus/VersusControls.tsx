"use client";

import { useEffect, useCallback } from "react";
import { useVersusStore } from "@/store/useVersusStore";
import { Undo2, Eraser, Edit3, Check } from "lucide-react";
import { getRow, getCol } from "@/lib/sudokuEngine";

export function VersusControls() {
  const {
    board,
    solution,
    status,
    selectedCell,
    selectCell,
    inputDigit,
    erase,
    undo,
    notesMode,
    toggleNotesMode,
  } = useVersusStore();

  // Keyboard navigation & inputs
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (status !== "playing") return;

      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      // Numbers 1-9
      if (
        (e.key >= "1" && e.key <= "9") ||
        (e.code.startsWith("Numpad") && e.key >= "1" && e.key <= "9")
      ) {
        e.preventDefault();
        inputDigit(parseInt(e.key, 10));
        return;
      }

      // Erase
      if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
        e.preventDefault();
        erase();
        return;
      }

      // Undo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undo();
        return;
      }

      // Toggle Notes
      if (e.key.toLowerCase() === "n" || e.key === " ") {
        e.preventDefault();
        toggleNotesMode();
        return;
      }

      // Arrow navigation
      if (selectedCell !== null) {
        const r = getRow(selectedCell);
        const c = getCol(selectedCell);
        let newIndex = selectedCell;

        if (e.key === "ArrowUp") {
          e.preventDefault();
          newIndex = ((r - 1 + 9) % 9) * 9 + c;
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          newIndex = ((r + 1) % 9) * 9 + c;
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          newIndex = r * 9 + ((c - 1 + 9) % 9);
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          newIndex = r * 9 + ((c + 1) % 9);
        }

        if (newIndex !== selectedCell) {
          selectCell(newIndex);
        }
      }
    },
    [status, selectedCell, inputDigit, erase, undo, toggleNotesMode, selectCell]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Compute remaining counts for numbers 1-9
  const counts: Record<number, number> = {};
  for (let n = 1; n <= 9; n++) {
    counts[n] = 0;
  }
  board.forEach((val, idx) => {
    if (val !== 0 && val === solution[idx]) {
      counts[val] = (counts[val] || 0) + 1;
    }
  });

  return (
    <div className="w-full max-w-[460px] flex flex-col gap-2.5 sm:gap-3">
      {/* Top Action Bar - Apple Segmented Glass Buttons */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={undo}
          disabled={status !== "playing"}
          className="flex items-center justify-center gap-1.5 py-3 px-2 rounded-2xl bg-white border border-black/[0.08] text-slate-800 font-semibold text-xs hover:bg-slate-50 active:scale-[0.96] transition-all duration-100 ease-out disabled:opacity-40 cursor-pointer shadow-2xs"
        >
          <Undo2 className="w-3.5 h-3.5 text-slate-500" />
          <span>Undo</span>
        </button>

        <button
          onClick={erase}
          disabled={status !== "playing"}
          className="flex items-center justify-center gap-1.5 py-3 px-2 rounded-2xl bg-white border border-black/[0.08] text-slate-800 font-semibold text-xs hover:bg-slate-50 active:scale-[0.96] transition-all duration-100 ease-out disabled:opacity-40 cursor-pointer shadow-2xs"
        >
          <Eraser className="w-3.5 h-3.5 text-slate-500" />
          <span>Erase</span>
        </button>

        <button
          onClick={toggleNotesMode}
          disabled={status !== "playing"}
          className={`flex items-center justify-center gap-1.5 py-3 px-2 rounded-2xl font-semibold text-xs active:scale-[0.96] transition-all duration-100 ease-out disabled:opacity-40 cursor-pointer shadow-2xs border ${
            notesMode
              ? "bg-indigo-600 border-indigo-600 text-white shadow-indigo-600/20"
              : "bg-white border-black/[0.08] text-slate-800 hover:bg-slate-50"
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Notes {notesMode ? "ON" : "OFF"}</span>
        </button>
      </div>

      {/* Number Pad 1-9 - iOS Keypad Aesthetics */}
      <div className="grid grid-cols-9 gap-1.5 sm:gap-2 p-2 sm:p-2.5 rounded-[24px] bg-slate-100/70 border border-black/[0.06] shadow-inner">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
          const isComplete = counts[num] >= 9;
          const remaining = Math.max(0, 9 - (counts[num] || 0));

          return (
            <button
              key={num}
              onClick={() => inputDigit(num)}
              disabled={status !== "playing" || isComplete}
              className={`aspect-square flex flex-col items-center justify-center rounded-2xl select-none cursor-pointer transition-all duration-100 ease-out active:scale-[0.90] ${
                isComplete
                  ? "bg-black/[0.03] text-slate-300 border border-transparent cursor-not-allowed"
                  : "bg-white border border-black/[0.08] text-slate-900 font-bold hover:border-indigo-300 hover:shadow-xs shadow-[0_2px_8px_rgba(0,0,0,0.03)]"
              }`}
            >
              <span className="text-xl sm:text-2xl font-black leading-none tracking-tight">
                {num}
              </span>
              <span className="text-[9px] font-bold text-slate-400 mt-0.5 tabular-nums">
                {isComplete ? (
                  <Check className="w-2.5 h-2.5 text-emerald-500 stroke-[3]" />
                ) : (
                  remaining
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
