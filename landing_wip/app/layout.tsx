import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { LayoutShell } from "./layout-shell";
import { Analytics } from "@vercel/analytics/next";

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
        <LayoutShell>{children}</LayoutShell>
        <Analytics />
      </body>
    </html>
  );
}
