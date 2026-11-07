import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roadmap — CORELX",
  description: "What we are building. Now, next, and later.",
  openGraph: {
    title: "Roadmap — CORELX",
    description: "What we are building. Now, next, and later.",
    type: "website",
  },
};

export default function RoadmapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
