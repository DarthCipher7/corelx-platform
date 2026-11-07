import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — CORELX",
  description:
    "Why we built CORELX. The identity layer for the next generation of creators, builders, and visionaries.",
  openGraph: {
    title: "About — CORELX",
    description:
      "Why we built CORELX. The identity layer for the next generation of creators, builders, and visionaries.",
    type: "website",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
