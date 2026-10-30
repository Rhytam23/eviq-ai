import { SITE_URL } from "@/lib/site";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/hi", "/map", "/how-it-works", "/developers", "/privacy"].map((path) => ({
    url: `${SITE_URL}${path}`,
  }));
}
