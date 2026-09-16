const fallbackSiteUrl = "https://sudokuking.imperialtech.me";

/** The public, canonical origin used in metadata and crawl directives. */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? fallbackSiteUrl)
  .trim()
  .replace(/\/$/, "");

export const siteName = "Sudoku King";

export function absoluteUrl(path = "/") {
  return new URL(path, `${siteUrl}/`).toString();
}
