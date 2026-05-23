"use client";

import OnboardingOverlay from "@/components/onboarding/OnboardingOverlay";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-void)]">
      <OnboardingOverlay isStaticPage={true} />
    </div>
  );
}
