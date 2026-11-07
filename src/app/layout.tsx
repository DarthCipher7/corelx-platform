import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#02020a",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://corelx.app"),
  title: "CORELX — The Creator Identity Layer",
  description:
    "The identity layer for the next generation of creators, builders, and visionaries.",
  keywords: [
    "creator network",
    "portfolio",
    "collaboration",
    "design",
    "engineering",
    "AI",
    "creative community",
  ],
  openGraph: {
    title: "CORELX — The Creator Identity Layer",
    description:
      "The identity layer for the next generation of creators, builders, and visionaries.",
    type: "website",
    url: "https://corelx.app",
    siteName: "CORELX",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "CORELX — The Creator Identity Layer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CORELX — The Creator Identity Layer",
    description:
      "The identity layer for the next generation of creators, builders, and visionaries.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="transition-colors duration-500">
        <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={true}>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
