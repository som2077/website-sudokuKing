"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { logFirebasePageView } from "@/lib/firebaseAnalytics";

/** Records SPA page views without placing analytics work on the initial render path. */
export function FirebaseAnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    const query = searchParams?.toString();
    const timeout = window.setTimeout(() => {
      logFirebasePageView(`${pathname}${query ? `?${query}` : ""}`);
    }, 3000);

    return () => window.clearTimeout(timeout);
  }, [pathname, searchParams]);

  return <>{children}</>;
}
