import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — CORELX",
  description:
    "Free during early access. Build your legacy on CORELX at no cost.",
  openGraph: {
    title: "Pricing — CORELX",
    description: "Free during early access. Build your legacy on CORELX at no cost.",
    type: "website",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
