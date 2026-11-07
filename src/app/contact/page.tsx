import type { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact — CORELX",
  description:
    "Get in touch with the CORELX team. Support, partnerships, press, and general inquiries. We respond within 48 hours.",
  openGraph: {
    title: "Contact — CORELX",
    description: "Get in touch with the CORELX team. Support, partnerships, press, and general inquiries.",
    type: "website",
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
