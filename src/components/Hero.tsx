"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { LightRays } from "@/components/ui/light-rays";

const heroSlides = [
  {
    src: "/rightSide/1.png",
    alt: "Sudoku King app feature 1",
    width: 283,
    height: 641,
  },
  {
    src: "/rightSide/2.png",
    alt: "Sudoku King app feature 2",
    width: 284,
    height: 641,
  },
  {
    src: "/rightSide/3.png",
    alt: "Sudoku King app feature 3",
    width: 277,
    height: 641,
  },
];

export function Hero() {
  const [activeSlide, setActiveSlide] = useState(0);
  const pointerStartX = useRef<number | null>(null);

  useEffect(() => {
    const autoSwipe = window.setInterval(() => {
      setActiveSlide((currentSlide) => (currentSlide + 1) % heroSlides.length);
    }, 3000);

    return () => window.clearInterval(autoSwipe);
  }, []);

  const goToSlide = useCallback((slideIndex: number) => {
    setActiveSlide(Math.max(0, Math.min(slideIndex, heroSlides.length - 1)));
  }, []);

  const goToNextSlide = useCallback(() => {
    setActiveSlide((currentSlide) => (currentSlide + 1) % heroSlides.length);
  }, []);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    pointerStartX.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (pointerStartX.current === null) return;

    const swipeDistance = event.clientX - pointerStartX.current;
    if (swipeDistance >= 45) {
      goToNextSlide();
    }

    pointerStartX.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const handlePointerCancel = () => {
    pointerStartX.current = null;
  };

  return (
    <section className="relative overflow-hidden bg-white py-12 sm:py-16 lg:py-24">
      <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:gap-12 md:grid-cols-2 lg:gap-26 xl:gap-34 items-center">
          {/* Left Column: Text & CTAs */}
          <div className="relative z-10 flex flex-col items-center text-center md:items-start md:text-left lg:scale-[1.15] lg:origin-center">
            {/* Social Proof Badge */}
            <div className="mb-6 inline-flex max-w-full origin-center scale-[1.1] items-center gap-2 rounded-full border border-gray-200 bg-white px-2 py-1 text-[11px] font-medium text-black sm:mb-8 sm:gap-3 sm:px-3 sm:py-1.5 sm:text-sm md:scale-100">
              <span className="flex -space-x-1.5 shrink-0" aria-hidden="true">
                <Image
                  src="/images/avatars/user-1.jpg"
                  alt="Player"
                  width={24}
                  height={24}
                  className="h-5 w-5 sm:h-6 sm:w-6 rounded-full border-2 border-white object-cover"
                />
                <Image
                  src="/images/avatars/user-2.jpg"
                  alt="Player"
                  width={24}
                  height={24}
                  className="h-5 w-5 sm:h-6 sm:w-6 rounded-full border-2 border-white object-cover"
                />
                <Image
                  src="/images/avatars/user-3.jpg"
                  alt="Player"
                  width={24}
                  height={24}
                  className="h-5 w-5 sm:h-6 sm:w-6 rounded-full border-2 border-white object-cover"
                />
              </span>
              <AnimatedShinyText className="min-w-0 flex-1 pr-1 text-center leading-tight sm:pr-2 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
                Loved by 50k users with{" "}
                <span className="text-[#FFB800] text-sm sm:text-base leading-none mx-1">
                  ★
                </span>{" "}
                4.9 rating worldwide
              </AnimatedShinyText>
            </div>

            {/* Heading */}
            <h1 className="max-w-xl text-4xl sm:text-5xl md:text-[3.5rem] lg:text-[3rem] font-bold leading-[1.1] tracking-tight text-black flex flex-col items-center xl:items-start">
              <span className="block">Play Free Sudoku Online</span>
              <span className="block mt-1 text-slate-800 sm:mt-2">
                Daily Puzzles & Guides
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-4 sm:mt-6 max-w-xl text-base sm:text-lg lg:text-xl leading-relaxed text-gray-600 font-normal">
              Sudoku that feels as good as it plays. Solve a fresh board, build
              your streak, and get a nudge when your brain needs one.
            </p>

            {/* Action CTAs */}
            <div className="mt-6 grid w-full max-w-[332px] grid-cols-2 items-center gap-3 px-0 sm:mt-8 sm:flex sm:max-w-none sm:gap-4 md:justify-start">
              <a
                href="#game"
                className="flex h-[48px] w-full min-w-0 items-center justify-center rounded-lg bg-black text-base font-medium text-white shadow-sm transition-all hover:bg-slate-900 hover:scale-[1.02] active:scale-[0.98] apple-press-subtle sm:w-[160px]"
              >
                <span>Play Now</span>
              </a>
              <Link
                href="/versus"
                className="flex h-[48px] w-full min-w-0 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 text-sm font-bold text-white shadow-md shadow-indigo-600/25 transition-all hover:scale-[1.02] hover:bg-indigo-700 active:scale-[0.98] sm:w-[160px]"
              >
                <span>Play 1 vs 1</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Phone Mockup inside a Box */}
          <div className="relative mx-auto mt-4 sm:mt-0 flex w-full max-w-[440px] sm:max-w-[600px] md:max-w-full justify-center md:justify-end">
            <div
              className="relative flex w-full items-end justify-center overflow-hidden rounded-3xl sm:rounded-[2.5rem] bg-gradient-to-br from-[#e8ddff] via-[#efeaff] to-[#dbe7ff] pt-8 px-6 sm:pt-12 sm:px-12 border border-slate-100 shadow-sm aspect-[4/5] sm:aspect-auto sm:h-[620px] lg:h-[720px] md:scale-[1.08] md:origin-center touch-pan-y select-none"
              aria-label="Sudoku King app showcase"
              aria-roledescription="carousel"
              onKeyDown={(event) => {
                if (event.key === "ArrowRight") {
                  event.preventDefault();
                  goToNextSlide();
                }
              }}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
              role="region"
              tabIndex={0}
            >
              <LightRays color="rgba(240, 210, 255, 0.5)" />
              <div className="relative z-10 h-full w-full overflow-hidden">
                <div
                  className="flex h-full items-center transition-transform duration-300 ease-out"
                  style={{
                    transform: `translate3d(-${activeSlide * (100 / heroSlides.length)}%, 0, 0)`,
                    width: `${heroSlides.length * 100}%`,
                  }}
                  aria-live="polite"
                >
                  {heroSlides.map((slide, index) => (
                    <div
                      className="relative flex h-full min-w-0 flex-1 items-center justify-center"
                      key={slide.src}
                      aria-hidden={index !== activeSlide}
                    >
                      <Image
                        src={slide.src}
                        alt={slide.alt}
                        width={slide.width}
                        height={slide.height}
                        priority={index === 0}
                        sizes="(max-width: 768px) 60vw, 283px"
                        className="h-full w-auto object-contain object-center drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/70 bg-white/40 px-3 py-2 shadow-sm backdrop-blur-md">
                {heroSlides.map((slide, index) => (
                  <button
                    aria-label={`Show slide ${index + 1}`}
                    aria-current={index === activeSlide ? "true" : undefined}
                    className={`h-1.5 rounded-full transition-all duration-200 ${
                      index === activeSlide
                        ? "w-5 bg-slate-900"
                        : "w-1.5 bg-slate-300 hover:bg-slate-500"
                    }`}
                    key={slide.src}
                    onClick={() => goToSlide(index)}
                    type="button"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
