import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "SNACKSY Cafe & Restro Operations",
    short_name: "SNACKSY",
    description: "Table ordering, kitchen workflow, billing, stock and reports for SNACKSY Cafe & Restro.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#f6f2ed",
    theme_color: "#66544c",
    categories: ["business", "food"],
    icons: [
      { src: "/snacksy-icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/snacksy-icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/snacksy-icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
