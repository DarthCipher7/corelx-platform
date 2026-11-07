import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config/routes";

interface RouteConfig {
  path: string;
  changeFrequency:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority: number;
}

const STATIC_ROUTES: RouteConfig[] = [
  { path: "", changeFrequency: "daily", priority: 1.0 },
  { path: "/explore", changeFrequency: "daily", priority: 0.9 },
  { path: "/showcase", changeFrequency: "daily", priority: 0.9 },
  { path: "/collabs", changeFrequency: "daily", priority: 0.9 },
  { path: "/community", changeFrequency: "weekly", priority: 0.8 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.8 },
  { path: "/features", changeFrequency: "weekly", priority: 0.8 },
  { path: "/pricing", changeFrequency: "weekly", priority: 0.7 },
  { path: "/changelog", changeFrequency: "weekly", priority: 0.7 },
  { path: "/roadmap", changeFrequency: "weekly", priority: 0.7 },
  { path: "/api", changeFrequency: "monthly", priority: 0.7 },
  { path: "/about", changeFrequency: "monthly", priority: 0.6 },
  { path: "/careers", changeFrequency: "monthly", priority: 0.6 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.6 },
  { path: "/privacy", changeFrequency: "monthly", priority: 0.3 },
  { path: "/terms", changeFrequency: "monthly", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  return STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
