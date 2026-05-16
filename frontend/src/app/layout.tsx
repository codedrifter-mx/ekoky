import type { Metadata } from "next";
import { Newsreader } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ekoky - Reduce Food Waste. Feed Communities.",
  description:
    "An eco-friendly marketplace connecting businesses with food surplus to institutions that can collect and redistribute it. Built on blockchain for verifiable impact.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${newsreader.variable}`}>
        <Providers>
          <Navbar />
          <main className="max-w-5xl mx-auto px-6 py-12">{children}</main>
        </Providers>
      </body>
    </html>
  );
}