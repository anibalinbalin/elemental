import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import { LayoutShell } from "./layout-shell";

// GA4 Measurement ID (G-XXXXXXXXXX). Set NEXT_PUBLIC_GA_ID in the Vercel
// project env (and .env.local) to enable Google Analytics. When unset, the
// gtag.js script is not injected — no tracking, no extra requests.
const gaId = process.env.NEXT_PUBLIC_GA_ID;

// Brand typefaces — self-hosted at build time via next/font/google (no CDN).
// Inter loads as a variable font (no `weight` array); JetBrains Mono pins the
// Regular 400 + Medium 500 weights the designer specified.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const description =
  "Probiótico termorresistente en polvo para tu microbiota. Una cucharada diaria, en frío o caliente: café, smoothie o yogur. Hecho en Uruguay.";

export const metadata: Metadata = {
  metadataBase: new URL("https://elementalbloomco.com"),
  title: "MICROCORE — Probiótico termorresistente en polvo | Elemental Bloom",
  description,
  openGraph: {
    title: "MICROCORE — Probiótico termorresistente en polvo",
    description,
    url: "/",
    siteName: "Elemental Bloom",
    locale: "es_UY",
    type: "website",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "Pouch de MICROCORE, probiótico termorresistente en polvo de Elemental Bloom",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MICROCORE — Probiótico termorresistente en polvo",
    description,
    images: ["/og.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`h-full antialiased ${inter.variable} ${jetbrainsMono.variable}`}
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
