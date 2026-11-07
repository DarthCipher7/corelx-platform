import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 — Page Not Found",
  description: "This page doesn't exist in our universe.",
};

export default function NotFound() {
  return (
    <div className="relative min-h-[calc(100vh-8rem)] w-full flex items-center justify-center overflow-hidden px-4 py-20 mesh-bg">
      {/* Grid overlay */}
      <div className="absolute inset-0 grid-bg opacity-70 pointer-events-none" />

      {/* Ambient glowing orb */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full pointer-events-none blur-3xl opacity-25"
        style={{
          background:
            "radial-gradient(circle, var(--accent-primary) 0%, var(--accent-cyan) 50%, transparent 75%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center text-center">
        {/* Animated ✦ star element (CSS animation only) */}
        <div className="relative flex items-center justify-center mb-6">
          <div
            className="absolute w-20 h-20 rounded-full blur-xl opacity-60 animate-pulse"
            style={{
              background:
                "radial-gradient(circle, var(--accent-cyan) 0%, var(--accent-primary) 70%, transparent 100%)",
            }}
          />
          <span
            className="relative text-5xl select-none inline-block animate-pulse"
            style={{
              color: "var(--accent-cyan)",
              textShadow:
                "0 0 24px var(--accent-cyan), 0 0 48px var(--accent-primary-glow)",
              fontFamily: "var(--font-display)",
              animationDuration: "2s",
            }}
            aria-hidden="true"
          >
            ✦
          </span>
        </div>

        {/* 404 Header */}
        <h1 className="display-xl gradient-text-cyber select-none tracking-tight mb-4">
          404
        </h1>

        {/* Headline */}
        <h2
          className="text-2xl sm:text-3xl font-bold tracking-tight mb-3"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--text-primary)",
          }}
        >
          This page doesn&apos;t exist in our universe.
        </h2>

        {/* Subtitle */}
        <p
          className="text-base leading-relaxed max-w-md mb-8"
          style={{ color: "var(--text-secondary)" }}
        >
          You may have followed a broken link or typed a URL that doesn&apos;t live
          here.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link href="/" className="btn-primary w-full sm:w-auto justify-center">
            Back to Home
          </Link>
          <Link
            href="/explore"
            className="btn-ghost w-full sm:w-auto justify-center"
          >
            Explore the Platform
          </Link>
        </div>
      </div>
    </div>
  );
}
