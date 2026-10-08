import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Snacksy Cafe Operations",
  description: "Role-based table ordering, kitchen workflow, billing and owner reports for Snacksy Cafe & Restro.",
  applicationName: "Snacksy Cafe",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Snacksy Cafe",
    statusBarStyle: "black-translucent",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
  icons: {
    icon: [{ url: "/snacksy-favicon.svg?v=3", type: "image/svg+xml", sizes: "any" }],
    shortcut: "/snacksy-favicon.svg?v=3",
    apple: [{ url: "/snacksy-apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
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
      <body className="antialiased">{children}</body>
    </html>
  );
}
