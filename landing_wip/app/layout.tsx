import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { LayoutShell } from "./layout-shell";
import { Analytics } from "@vercel/analytics/next";
import { GoogleAnalytics } from "@next/third-parties/google";

// GA4 Measurement ID (G-XXXXXXXXXX). Set NEXT_PUBLIC_GA_ID in the Vercel
// project env (and .env.local) to enable Google Analytics. When unset, the
// gtag.js script is not injected — no tracking, no extra requests.
const gaId = process.env.NEXT_PUBLIC_GA_ID;

export const metadata: Metadata = {
  title: "Elemental",
  description: "Elemental by Microcore",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {/* loupe.css provides the microscope visual reused by the image loupe. */}
        <link rel="stylesheet" href="/loupe.css" />
        <LayoutShell>{children}</LayoutShell>
        <Analytics />
      </body>
      {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
    </html>
  );
}
