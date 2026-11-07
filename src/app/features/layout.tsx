import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Features — CORELX",
  description:
    "Every tool a creator needs. Flares, Traces, Aura, Pods, Collab Board, Showcase, Reach, SafeMode, Badges.",
  openGraph: {
    title: "Features — CORELX",
    description:
      "Every tool a creator needs. Flares, Traces, Aura, Pods, Collab Board, Showcase, Reach, SafeMode, Badges.",
    type: "website",
  },
};

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
