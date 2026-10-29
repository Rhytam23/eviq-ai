import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://eviq.ai";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/map", "/privacy"].map((path) => ({ url: `${SITE_URL}${path}` }));
}
