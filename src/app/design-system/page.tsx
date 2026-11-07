import type { Metadata } from "next";
import DesignSystemClient from "./DesignSystemClient";

export const metadata: Metadata = {
  title: "Design System — CORELX",
  description:
    "The living design system and component specification for CORELX. High-fidelity OKLCH color token ramps, 5-level tinted elevation model, tactile glass, typography, and Aura tier finishes.",
};

export default function DesignSystemPage() {
  return <DesignSystemClient />;
}
