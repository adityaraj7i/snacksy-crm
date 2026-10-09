import type { Metadata, Viewport } from "next";
import "./globals.css";
import ServiceWorkerRegistration from "./service-worker-registration";

export const metadata: Metadata = {
  title: "SNACKSY Cafe & Restro Operations",
  description: "Role-based table ordering, kitchen workflow, billing and owner reports for SNACKSY Cafe & Restro.",
  applicationName: "SNACKSY Cafe & Restro",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "SNACKSY Cafe & Restro",
    statusBarStyle: "black-translucent",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
  icons: {
    icon: [{ url: "/snacksy-favicon.png?v=4", type: "image/png", sizes: "64x64" }],
    shortcut: "/snacksy-favicon.png?v=4",
    apple: [{ url: "/snacksy-apple-touch-icon.png?v=4", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#66544c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-NP">
      <body className="antialiased"><ServiceWorkerRegistration />{children}</body>
    </html>
  );
}
