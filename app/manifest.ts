import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Snacksy Cafe Operations",
    short_name: "Snacksy Cafe",
    description: "Table ordering, kitchen workflow, billing, stock and reports for Snacksy Cafe & Restro.",
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
