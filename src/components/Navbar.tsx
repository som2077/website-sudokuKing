"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useSudokuStore } from "@/store/useSudokuStore";
import { LivePresenceBadge } from "@/components/live/LivePresenceBadge";
import { StoreBadges } from "@/components/StoreBadges";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const openModal = (modal: "daily" | "stats") => {
    useSudokuStore.getState().openModal(modal);
    closeMenu();
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-white/10 px-4 py-2 text-black backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1300px] items-center justify-between gap-4 lg:grid lg:grid-cols-[1fr_auto_1fr]">
        {/* Brand Logo */}
        <Link
          href="/"
          onClick={closeMenu}
          className="group flex shrink-0 items-center apple-press-subtle lg:justify-self-start"
          aria-label="Sudoku King Home"
        >
          <Image
            src="/sudukoLogo.svg"
            alt="Sudoku King"
            width={151}
            height={52}
            priority
            className="h-9 w-auto object-contain sm:h-10 md:h-11"
          />
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          aria-label="Main navigation"
          className="hidden items-center justify-center lg:flex lg:justify-self-center lg:mx-0 lg:max-w-none"
        >
          <div className="flex items-center gap-1 xl:gap-2  whitespace-nowrap text-xs xl:text-base font-bold text-slate-800">
            <a
              href="#leaderboard"
              className="rounded-full px-2.5 py-1.5 transition-all hover:bg-black/[0.04] hover:text-[#8a5a18] xl:px-3.5 xl:py-2 apple-press-subtle"
            >
              Leaderboard
            </a>
            <Link
              href="/versus"
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 font-bold text-slate-800  hover:bg-indigo-100 "
            >
              <span>1 vs 1</span>
            </Link>
            <button
              onClick={() => openModal("daily")}
              className="cursor-pointer rounded-full px-2.5 py-1.5 transition-all hover:bg-black/[0.04] hover:text-[#8a5a18] xl:px-3.5 xl:py-2 apple-press-subtle"
            >
              Daily Challenge
            </button>
            <button
              onClick={() => openModal("stats")}
              className="cursor-pointer rounded-full px-2.5 py-1.5 transition-all hover:bg-black/[0.04] hover:text-[#8a5a18] xl:px-3.5 xl:py-2 apple-press-subtle"
            >
              Statistics
            </button>
          </div>
        </nav>

        {/* Desktop Right Side: Online Badge + App Availability */}
        <div className="hidden shrink-0 items-center ml-20 gap-3 lg:flex lg:justify-self-end">
          <LivePresenceBadge />
          <StoreBadges size="nav" />
        </div>

        {/* Mobile Right Side: Online Badge + Hamburger */}
        <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-3 lg:hidden">
          <LivePresenceBadge className="px-2.5 py-1 text-[11px]" />
          <button
            type="button"
            aria-label={
              menuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/[0.08] bg-white text-black shadow-xs transition-colors hover:bg-slate-50 hover:text-[#8a5a18] active:scale-95 sm:h-11 sm:w-11"
          >
            {menuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <div
        id="mobile-menu"
        className={`${menuOpen ? "block" : "hidden"} absolute left-0 right-0 top-full px-4 pt-2 pb-4 lg:hidden`}
      >
        <div
          className="fixed inset-0 top-[60px] -z-10 bg-black/20 backdrop-blur-md"
          onClick={closeMenu}
          aria-hidden="true"
        />
        <nav className="mx-auto grid max-w-[1024px] gap-1 rounded-2xl border border-black/[0.08] bg-white/95 p-3 text-base font-medium text-[#333] shadow-xl backdrop-blur-2xl sm:grid-cols-2 sm:p-4">
          <a
            href="#leaderboard"
            onClick={closeMenu}
            className="rounded-xl px-3.5 py-3 transition-colors hover:bg-slate-100/80 hover:text-[#8a5a18]"
          >
            Leaderboard
          </a>
          <Link
            href="/versus"
            onClick={closeMenu}
            className="rounded-xl px-3.5 py-3 font-bold text-indigo-600 bg-indigo-50/70 border border-indigo-200/60 flex items-center justify-between transition-colors hover:bg-indigo-100"
          >
            <span className="flex items-center gap-2">
              <span>⚔️</span>
              <span>1 vs 1 Duel</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 bg-indigo-600 text-white rounded-full font-black">
              NEW
            </span>
          </Link>
          <button
            onClick={() => openModal("daily")}
            className="rounded-xl px-3.5 py-3 text-left transition-colors hover:bg-slate-100/80 hover:text-[#8a5a18] cursor-pointer"
          >
            Daily Challenge
          </button>
          <button
            onClick={() => openModal("stats")}
            className="rounded-xl px-3.5 py-3 text-left transition-colors hover:bg-slate-100/80 hover:text-[#8a5a18] cursor-pointer"
          >
            Statistics
          </button>
          <a
            href="#features"
            onClick={closeMenu}
            className="rounded-xl px-3.5 py-3 transition-colors hover:bg-slate-100/80 hover:text-[#8a5a18]"
          >
            Features
          </a>
          <div className="mt-2 flex justify-center border-t border-black/[0.06] pt-3 sm:col-span-2">
            <StoreBadges size="nav" />
          </div>
        </nav>
      </div>
    </header>
  );
}
