"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { SplitText } from "@/components/ui/SplitText";
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
          <div className="relative z-10 flex flex-col items-center text-center md:items-start md:text-left">
            {/* Social Proof Badge */}
            <div className="mb-6 sm:mb-8 inline-flex max-w-full items-center gap-2 sm:gap-3 rounded-full border border-gray-200 bg-white px-2 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-sm font-medium text-black ">
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
              <AnimatedShinyText className="pr-1 sm:pr-2 whitespace-nowrap inline-flex items-center justify-center transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
                Loved by 50k users with{" "}
                <span className="text-[#FFB800] text-sm sm:text-base leading-none mx-1">
                  ★
                </span>{" "}
                4.9 rating worldwide
              </AnimatedShinyText>
            </div>

            {/* Heading */}
            <h1 className="max-w-xl text-4xl sm:text-5xl md:text-[3.5rem] lg:text-[3rem] font-bold leading-[1.1] tracking-tight text-black flex flex-col items-center xl:items-start">
              <SplitText
                text="Meet Sudoku King"
                className="block"
                delay={30}
                animationFrom={{ opacity: 0, y: 40, filter: "blur(10px)" }}
                animationTo={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              />
              <SplitText
                text="Play with focus"
                className="block mt-1 sm:mt-2 text-slate-800"
                delay={40}
                animationFrom={{ opacity: 0, y: 40, filter: "blur(10px)" }}
                animationTo={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              />
            </h1>

            {/* Subtitle */}
            <p className="mt-4 sm:mt-6 max-w-xl text-base sm:text-lg lg:text-xl leading-relaxed text-gray-600 font-normal">
              Sudoku that feels as good as it plays. Solve a fresh board, build
              your streak, and get a nudge when your brain needs one.
            </p>

            {/* Action CTAs */}
            <div className="mt-6 sm:mt-8 flex w-full flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4 px-2 sm:px-0">
              <a
                href="#game"
                className="flex-1 sm:flex-none sm:w-auto transition-opacity hover:opacity-80 apple-press-subtle flex justify-center"
              >
                <Image
                  src="/playnow.png"
                  alt="Play Now"
                  width={160}
                  height={48}
                  className="h-[48px] w-auto max-w-full rounded-lg object-contain"
                />
              </a>
              <Link
                href="/versus"
                className="h-[48px] px-5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>⚔️ Play 1 vs 1</span>
                <span className="bg-amber-400 text-slate-950 text-[10px] px-2 py-0.5 rounded-full font-black leading-none">
                  NEW
                </span>
              </Link>
            </div>
          </div>

          {/* Right Column: Phone Mockup inside a Box */}
          <div className="relative mx-auto mt-4 sm:mt-0 flex w-full max-w-[440px] sm:max-w-[600px] md:max-w-full justify-center md:justify-end">
            <div
              className="relative flex w-full items-end justify-center overflow-hidden rounded-3xl sm:rounded-[2.5rem] bg-gradient-to-br from-[#e8ddff] via-[#efeaff] to-[#dbe7ff] pt-8 px-6 sm:pt-12 sm:px-12 border border-slate-100 shadow-sm aspect-[4/5] sm:aspect-auto sm:h-[620px] lg:h-[720px] touch-pan-y select-none"
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
                        unoptimized
                        className="h-full w-auto object-contain object-center drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/70 bg-white/80 px-3 py-2 shadow-sm backdrop-blur-md">
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
