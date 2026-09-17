import type { Analytics, EventParams } from "firebase/analytics";

type AnalyticsProperties = Record<string, string | number | boolean | null | undefined>;

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let analyticsPromise: Promise<Analytics | null> | undefined;

function getConfiguredProperties(properties: AnalyticsProperties = {}) {
  return Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined),
  ) as EventParams;
}

/** Loads Firebase Analytics only in supported browsers and only after it is needed. */
export function getFirebaseAnalytics() {
  if (typeof window === "undefined" || !firebaseConfig.measurementId) {
    return Promise.resolve(null);
  }

  if (!analyticsPromise) {
    analyticsPromise = Promise.all([import("firebase/app"), import("firebase/analytics")]).then(
      async ([appSdk, analyticsSdk]) => {
        if (!(await analyticsSdk.isSupported())) return null;

        const app = appSdk.getApps().length
          ? appSdk.getApp()
          : appSdk.initializeApp(firebaseConfig);

        return analyticsSdk.initializeAnalytics(app, {
          config: { send_page_view: false },
        });
      },
    );
  }

  return analyticsPromise;
}

export function logFirebaseEvent(eventName: string, properties?: AnalyticsProperties) {
  void getFirebaseAnalytics().then((analytics) => {
    if (analytics) {
      void import("firebase/analytics").then(({ logEvent }) => {
        logEvent(analytics, eventName, getConfiguredProperties(properties));
      });
    }
  });
}

export function logFirebasePageView(path: string) {
  logFirebaseEvent("page_view", {
    page_location: `${window.origin}${path}`,
    page_path: path,
    page_title: document.title,
  });
}

export function setFirebaseUser(userId: string | null, properties?: AnalyticsProperties) {
  void getFirebaseAnalytics().then((analytics) => {
    if (!analytics) return;
    void import("firebase/analytics").then(({ setUserId, setUserProperties }) => {
      setUserId(analytics, userId);
      if (properties) setUserProperties(analytics, getConfiguredProperties(properties));
    });
  });
}
