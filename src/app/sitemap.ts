import type { MetadataRoute } from "next";
import { sudokuTechniques } from "@/data/sudokuRulesData";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/rules"), changeFrequency: "weekly", priority: 0.9 },
  ];

  const techniqueRoutes = sudokuTechniques.map((technique) => ({
    url: absoluteUrl(`/rules/${technique.slug}`),
    changeFrequency: "monthly" as const,
    priority: 0.7,
    images: technique.images.map((image) => absoluteUrl(image.url)),
  }));

  return [...staticRoutes, ...techniqueRoutes];
}
