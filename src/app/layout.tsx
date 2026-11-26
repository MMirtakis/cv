import type { Metadata } from "next";
import { Manrope, Noto_Serif } from "next/font/google";
import { Nav } from "@/components/Nav";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin", "greek"],
  variable: "--font-manrope",
});

const notoSerif = Noto_Serif({
  subsets: ["latin", "greek"],
  variable: "--font-noto-serif",
});

export const metadata: Metadata = {
  title: "Back Office · Multi-company",
  description:
    "Διαχείριση επιχειρήσεων: οικονομικά, μισθοδοσία, ΕΦΚΑ, εφορία και KPIs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="el">
      <body className={`${manrope.variable} ${notoSerif.variable}`}>
        <style>{`
          :root {
            --font-body: var(--font-manrope), system-ui, sans-serif;
            --font-display: var(--font-noto-serif), Georgia, serif;
          }
        `}</style>
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  );
}
