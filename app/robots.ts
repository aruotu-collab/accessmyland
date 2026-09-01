import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/dashboard",
        "/welcome",
        "/cases",
        "/projects",
        "/map",
        "/marketplace",
        "/payments",
        "/intelligence",
        "/licence",
      ],
    },
    sitemap: "https://www.accessmyland.com/sitemap.xml",
  };
}
