import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { LayoutShell } from "./layout-shell";

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
      className={`h-full antialiased ${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {/* loupe.css provides the microscope visual reused by the image loupe. */}
        <link rel="stylesheet" href="/loupe.css" />
        <LayoutShell>{children}</LayoutShell>
        <Analytics />
      </body>
    </html>
  );
}
