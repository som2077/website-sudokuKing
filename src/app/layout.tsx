import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { FirebaseAnalyticsProvider } from "@/providers/FirebaseAnalyticsProvider";
import { absoluteUrl, siteName, siteUrl } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Play Sudoku Online & Learn Solving Techniques | Sudoku King",
    template: "%s | Sudoku King",
  },
  description:
    "Play free Sudoku online, take daily challenges, and learn step-by-step Sudoku solving techniques from beginner to advanced.",
  applicationName: siteName,
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  category: "Games",
  formatDetection: { telephone: false, address: false, email: false },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName,
    title: "Play Sudoku Online & Learn Solving Techniques",
    description:
      "Play free Sudoku online, take daily challenges, and learn step-by-step solving techniques.",
    url: absoluteUrl("/"),
  },
  twitter: {
    card: "summary_large_image",
    title: "Play Sudoku Online & Learn Solving Techniques",
    description:
      "Play free Sudoku online, take daily challenges, and learn step-by-step solving techniques.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var clean = function(el) {
                    if (el && el.removeAttribute) el.removeAttribute('bis_skin_checked');
                  };
                  var observer = new MutationObserver(function(mutations) {
                    for (var i = 0; i < mutations.length; i++) {
                      var m = mutations[i];
                      if (m.type === 'attributes' && m.attributeName === 'bis_skin_checked') {
                        clean(m.target);
                      }
                    }
                  });
                  observer.observe(document.documentElement, {
                    attributes: true,
                    subtree: true,
                    attributeFilter: ['bis_skin_checked']
                  });
                } catch (e) {}
                var origError = console.error;
                console.error = function() {
                  for (var i = 0; i < arguments.length; i++) {
                    var arg = arguments[i];
                    if (typeof arg === 'string' && arg.indexOf('bis_skin_checked') !== -1) {
                      return;
                    }
                  }
                  return origError.apply(console, arguments);
                };
              })();
            `,
          }}
        />
      </head>
      <body
        className="min-h-full flex flex-col bg-white text-foreground selection:bg-indigo-500/20 selection:text-indigo-900"
        suppressHydrationWarning
      >
        <FirebaseAnalyticsProvider>
          {children}
        </FirebaseAnalyticsProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
