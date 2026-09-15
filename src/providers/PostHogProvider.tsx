'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react';
import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthogClient = usePostHog();

  useEffect(() => {
    if (pathname && posthogClient) {
      let url = window.origin + pathname;
      if (searchParams && searchParams.toString()) {
        url = url + `?${searchParams.toString()}`;
      }
      posthogClient.capture('$pageview', {
        $current_url: url,
      });
    }
  }, [pathname, searchParams, posthogClient]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

    if (key && typeof window !== 'undefined') {
      posthog.init(key, {
        api_host: host,
        person_profiles: 'always', // Track all visitors for DAU/MAU and country analytics
        capture_pageview: false, // Handled by PostHogPageView for Next.js App Router SPA navigation
        capture_pageleave: true,
        autocapture: true, // Automatically captures clicks, buttons, inputs
        disable_session_recording: false, // Enables session replay
      });
    }
  }, []);

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PHProvider>
  );
}
