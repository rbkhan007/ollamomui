import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";

export const dynamic = "force-static";

const routes = [
  "",
  "/about",
  "/playground",
  "/usage",
  "/settings",
  "/rag",
  "/memory",
  "/login",
  "/register",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((r) => ({
    url: `${SITE_URL}${r}`,
    lastModified: new Date(),
    changeFrequency: r === "" || r === "/about" ? "weekly" : "monthly",
    priority: r === "" ? 1 : r === "/about" ? 0.9 : 0.7,
  }));
}
