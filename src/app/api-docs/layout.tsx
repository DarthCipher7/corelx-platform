import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API — CORELX",
  description:
    "The CORELX API is in private development. Apply for early developer access to build on the creator network.",
  openGraph: {
    title: "API — CORELX",
    description: "The CORELX API is in private development. Apply for early developer access.",
    type: "website",
  },
};

export default function ApiDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
