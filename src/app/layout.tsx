import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Snacksy Cafe And Restro CRM",
  description: "Customer Relationship Management for Snacksy Cafe And Restro, Nepal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
