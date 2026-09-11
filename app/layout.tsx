import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Snacksy Cafe Operations",
  description: "Role-based table ordering, kitchen workflow, billing and owner reports for Snacksy Cafe & Restro.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
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
