"use client";

import React, { memo } from "react";
import { useVersusStore } from "@/store/useVersusStore";
import { getRow, getCol, getBlock } from "@/lib/sudokuEngine";

interface CellProps {
  index: number;
  value: number;
  isInitial: boolean;
  isSelected: boolean;
  isInSelectedHouse: boolean;
  isSameNumber: boolean;
  isError: boolean;
  notes: number[];
  onClick: () => void;
}

const Cell = memo(function Cell({
  index,
  value,
  isInitial,
  isSelected,
  isInSelectedHouse,
  isSameNumber,
  isError,
  notes,
  onClick,
}: CellProps) {
  const r = getRow(index);
  const c = getCol(index);

  // Borders for 3x3 blocks: high-contrast 2px divider, thin hairline divider for internal cells
  const borderB =
    (r + 1) % 3 === 0 && r !== 8
      ? "border-b-[2px] border-b-slate-900/80"
      : r !== 8
        ? "border-b border-b-black/[0.08]"
        : "";
  const borderR =
    (c + 1) % 3 === 0 && c !== 8
      ? "border-r-[2px] border-r-slate-900/80"
      : c !== 8
        ? "border-r border-r-black/[0.08]"
        : "";

  let bgClass = "bg-white hover:bg-slate-50/70";
  let textClass = isInitial
    ? "text-slate-950 font-black"
    : "text-indigo-600 font-bold";

  if (isError) {
    bgClass = "bg-rose-50/90 text-rose-700 ring-2 ring-rose-500/80 ring-inset";
    textClass = "text-rose-700 font-black";
  } else if (isSelected) {
    bgClass = "bg-indigo-50/90 ring-2 ring-indigo-600 ring-inset z-10 shadow-xs";
    textClass = isInitial
      ? "text-slate-950 font-black"
      : "text-indigo-700 font-black";
  } else if (isSameNumber) {
    bgClass = "bg-indigo-50/50";
    textClass = isInitial
      ? "text-slate-950 font-black"
      : "text-indigo-600 font-bold";
  } else if (isInSelectedHouse) {
    bgClass = "bg-black/[0.02]";
  }

  return (
    <button
      onClick={onClick}
      role="gridcell"
      aria-selected={isSelected}
      tabIndex={isSelected ? 0 : -1}
      aria-label={`Row ${r + 1}, Column ${c + 1}: ${value || "empty"}${isInitial ? ", given clue" : ""}`}
      className={`relative aspect-square flex items-center justify-center text-[28px] sm:text-[34px] select-none cursor-pointer transition-all duration-100 ease-out active:scale-[0.93] ${borderB} ${borderR} ${bgClass} ${textClass}`}
    >
      {value !== 0 ? (
        <span className="font-sans font-bold leading-none tracking-tight">
          {value}
        </span>
      ) : notes.length > 0 ? (
        <div className="grid grid-cols-3 gap-0 w-full h-full p-1 pointer-events-none text-[8px] sm:text-[9.5px] leading-none text-slate-500 font-sans">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <span key={n} className="flex items-center justify-center font-bold">
              {notes.includes(n) ? n : ""}
            </span>
          ))}
        </div>
      ) : null}
    </button>
  );
});

export function VersusBoard() {
  const {
    board,
    initialBoard,
    notes,
    selectedCell,
    selectCell,
    errorCells,
    status,
    countdown,
  } = useVersusStore();

  const selectedValue = selectedCell !== null ? board[selectedCell] : null;
  const selRow = selectedCell !== null ? getRow(selectedCell) : -1;
  const selCol = selectedCell !== null ? getCol(selectedCell) : -1;
  const selBlock = selectedCell !== null ? getBlock(selectedCell) : -1;

  return (
    <div className="relative w-full max-w-[460px] mx-auto aspect-square p-2.5 sm:p-3 rounded-[32px] bg-white border border-black/[0.08] shadow-[0_12px_40px_rgb(0,0,0,0.06)] overflow-hidden">
      {/* Apple-style Frosted Glass Countdown Overlay */}
      {status === "countdown" && (
        <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-200">
          <span className="font-sans text-8xl sm:text-9xl font-black text-indigo-600 tracking-tighter animate-in zoom-in-50 duration-300">
            {countdown}
          </span>
          <div className="mt-4 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/60 text-xs font-bold text-indigo-700 tracking-wider uppercase">
            Get Ready to Duel
          </div>
        </div>
      )}

      {/* Main 9x9 Grid */}
      <div
        role="grid"
        aria-label="Versus Sudoku Board"
        className="grid grid-cols-9 w-full h-full bg-white rounded-2xl overflow-hidden border border-black/[0.06]"
      >
        {Array.from({ length: 9 }, (_, row) => (
          <div key={row} role="row" className="contents">
            {Array.from({ length: 9 }, (_, column) => {
              const idx = row * 9 + column;
              const val = board[idx];
              const isInitial = initialBoard[idx] !== 0;
              const isSelected = selectedCell === idx;
              const r = getRow(idx);
              const c = getCol(idx);
              const b = getBlock(idx);

              const isInSelectedHouse =
                selectedCell !== null &&
                !isSelected &&
                (r === selRow || c === selCol || b === selBlock);

              const isSameNumber =
                selectedValue !== null &&
                selectedValue !== 0 &&
                val === selectedValue &&
                !isSelected;

              const isError = errorCells.includes(idx);
              const cellNotes = notes[idx] || [];

              return (
                <Cell
                  key={idx}
                  index={idx}
                  value={val}
                  isInitial={isInitial}
                  isSelected={isSelected}
                  isInSelectedHouse={isInSelectedHouse}
                  isSameNumber={isSameNumber}
                  isError={isError}
                  notes={cellNotes}
                  onClick={() => selectCell(idx)}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
