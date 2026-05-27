import { Agentation } from "agentation";
import type { Metadata } from "next";
import "./globals.css";
import { ShapeProvider } from "@/lib/shape-context";
import { ThemeProvider } from "@/lib/theme-context";

export const metadata: Metadata = {
  title: "Elemental Bloom",
  description:
    "Ciencia aplicada al bienestar cotidiano. Formulas funcionales para tu microbiota.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased bg-background text-foreground">
        <ShapeProvider defaultShape="rounded">
          <ThemeProvider defaultTheme="light">
            {children}
          </ThemeProvider>
        </ShapeProvider>
        {process.env.NODE_ENV === "development" && <Agentation />}
      </body>
    </html>
  );
}
