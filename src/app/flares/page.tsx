import type { Metadata } from "next";
import FlaresClient from "./FlaresClient";

export const metadata: Metadata = {
  title: "Flares — Short-Form Video for Creators | CORELX",
  description:
    "Discover vertical 60-second video flares by engineers, designers, and creators.",
};

export default function FlaresPage() {
  return <FlaresClient />;
}
