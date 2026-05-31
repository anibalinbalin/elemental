import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { NavbarPill } from "./components/navbar";

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
        <NavbarPill />
        {children}
      </body>
    </html>
  );
}
