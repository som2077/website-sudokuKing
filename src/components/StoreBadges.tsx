import Image from "next/image";

type Store = "app-store" | "google-play";
type StoreBadgeSize = "hero" | "nav";

const storeDetails: Record<
  Store,
  { label: string; icon: string }
> = {
  "app-store": { label: "App Store", icon: "/apple.png" },
  "google-play": { label: "Google Play", icon: "/app.png" },
};

interface StoreBadgeProps {
  store: Store;
  size: StoreBadgeSize;
}

function StoreBadge({ store, size }: StoreBadgeProps) {
  const { label, icon } = storeDetails[store];
  const isHero = size === "hero";

  return (
    <span
      role="img"
      aria-label={`${label} coming soon`}
      className={`inline-flex shrink-0 items-center rounded-[0.7rem] border border-white/80 bg-[#090b0d] text-white shadow-sm ${
        isHero
          ? "h-12 min-w-[148px] gap-2.5 px-3.5"
          : "h-10 min-w-[118px] gap-2 px-2.5"
      }`}
    >
      <Image
        src={icon}
        alt=""
        aria-hidden="true"
        width={isHero ? 30 : 22}
        height={isHero ? 30 : 22}
        className={`shrink-0 object-contain ${
          store === "app-store" ? "brightness-0 invert" : ""
        }`}
      />
      <span className="min-w-0 text-left leading-none">
        <span
          className={`block whitespace-nowrap font-medium uppercase tracking-[0.08em] text-white/90 ${
            isHero ? "text-[7px]" : "text-[5px]"
          }`}
        >
          Coming soon to the
        </span>
        <span
          className={`mt-1 block whitespace-nowrap font-semibold tracking-tight ${
            isHero ? "text-[19px]" : "text-[14px]"
          }`}
        >
          {label}
        </span>
      </span>
    </span>
  );
}

interface StoreBadgesProps {
  size: StoreBadgeSize;
}

export function StoreBadges({ size }: StoreBadgesProps) {
  return (
    <div
      aria-label="Mobile apps coming soon"
      className={`flex items-center gap-2 ${size === "hero" ? "flex-wrap" : "shrink-0"}`}
    >
      <StoreBadge store="google-play" size={size} />
      <StoreBadge store="app-store" size={size} />
    </div>
  );
}
