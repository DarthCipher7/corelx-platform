"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandX,
  IconBrandWhatsapp,
} from "@tabler/icons-react";
import {
  FOOTER_LINKS,
  SOCIAL_LINKS,
  BRAND_NAME,
  BRAND_TAGLINE,
  type FooterCategory,
  type SocialPlatform,
} from "@/config/routes";

const SOCIAL_ICON_COMPONENTS: Record<
  SocialPlatform,
  React.ComponentType<{ size?: number | string; className?: string }>
> = {
  instagram: IconBrandInstagram,
  linkedin: IconBrandLinkedin,
  x: IconBrandX,
  whatsapp: IconBrandWhatsapp,
};

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    // TODO: Connect to newsletter API (e.g. Resend, Loops, or Supabase newsletter table)
    setSubscribed(true);
  };

  return (
    <footer
      className="relative mt-32 border-t"
      style={{
        borderColor: "rgba(108, 92, 231, 0.12)",
        background: "var(--bg-void)",
      }}
    >
      {/* Glow top border */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-px pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--accent-primary), var(--accent-cyan), transparent)",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16">
          {/* Brand & Newsletter Column */}
          <div className="md:col-span-5 flex flex-col justify-between">
            <div>
              {/* Logo: C✦X text monogram */}
              <Link href="/" className="inline-flex items-center gap-3 group mb-4">
                <span
                  className="text-2xl font-bold tracking-tight select-none transition-transform duration-200 group-hover:scale-105"
                  style={{
                    fontFamily: "var(--font-display)",
                    background:
                      "linear-gradient(135deg, #ffffff 0%, #c4b5fd 60%, #8b5cf6 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  <span>
                    C
                    <span
                      style={{
                        color: "var(--accent-cyan)",
                        WebkitTextFillColor: "var(--accent-cyan)",
                        textShadow: "0 0 12px var(--accent-cyan-glow)",
                      }}
                    >
                      ✦
                    </span>
                    X
                  </span>
                </span>
                <span
                  className="text-xl font-bold tracking-tight"
                  style={{
                    fontFamily: "var(--font-display)",
                    background: "linear-gradient(135deg, #f0f0ff, #a29bfe)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {BRAND_NAME}
                </span>
              </Link>

              <p
                className="text-sm leading-relaxed max-w-sm mb-6"
                style={{ color: "var(--text-secondary)" }}
              >
                {BRAND_TAGLINE}
              </p>

              {/* Social icons */}
              <div className="flex items-center gap-2.5">
                {SOCIAL_LINKS.map((item) => {
                  const IconComponent = SOCIAL_ICON_COMPONENTS[item.platform];
                  if (!item.href) {
                    return (
                      <div
                        key={item.platform}
                        role="button"
                        aria-label={`${item.label} (coming soon)`}
                        aria-disabled="true"
                        tabIndex={-1}
                        className="w-9 h-9 rounded-lg flex items-center justify-center opacity-40 cursor-not-allowed select-none transition-all"
                        style={{
                          color: "var(--text-secondary)",
                          border: "1px solid var(--glass-border)",
                          background: "var(--bg-surface)",
                        }}
                        title={`${item.label} (coming soon)`}
                      >
                        <IconComponent size={18} />
                      </div>
                    );
                  }

                  return (
                    <a
                      key={item.platform}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={item.label}
                      className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
                      style={{
                        color: "var(--text-secondary)",
                        border: "1px solid var(--glass-border)",
                        background: "var(--bg-surface)",
                      }}
                    >
                      <IconComponent size={18} />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Newsletter field */}
            <div
              className="mt-8 pt-8 border-t max-w-md"
              style={{ borderColor: "rgba(108, 92, 231, 0.1)" }}
            >
              <p
                className="text-xs font-semibold mb-1 tracking-wider uppercase"
                style={{ color: "var(--accent-cyan)", fontFamily: "var(--font-mono)" }}
              >
                Stay in the loop
              </p>
              <p className="text-xs mb-3" style={{ color: "var(--text-secondary)" }}>
                Get notified when new creator tools, pods, and features drop.
              </p>
              {subscribed ? (
                <div
                  className="p-3 rounded-xl text-xs flex items-center gap-2"
                  style={{
                    background: "rgba(0, 210, 255, 0.08)",
                    border: "1px solid rgba(0, 210, 255, 0.25)",
                    color: "var(--accent-cyan)",
                  }}
                >
                  <span>✦</span>
                  <span>You&apos;re in. Welcome to the circle.</span>
                </div>
              ) : (
                <form
                  onSubmit={handleNewsletterSubmit}
                  className="flex flex-col sm:flex-row gap-2"
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    aria-label="Email address for newsletter"
                    required
                    className="flex-1 px-3.5 py-2 rounded-xl text-sm outline-none transition-all duration-200 placeholder:text-[var(--text-muted)]"
                    style={{
                      background: "var(--bg-surface)",
                      border: "1px solid var(--glass-border)",
                      color: "var(--text-primary)",
                    }}
                  />
                  <button
                    type="submit"
                    className="btn-primary text-xs font-medium px-4 py-2 whitespace-nowrap cursor-pointer justify-center"
                  >
                    Stay in the loop
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* 3 Link columns: Platform / Product / Company */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {(Object.keys(FOOTER_LINKS) as FooterCategory[]).map((category) => (
              <div key={category}>
                <p
                  className="text-xs font-semibold mb-4 tracking-widest uppercase"
                  style={{
                    color: "var(--accent-cyan)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {category}
                </p>
                <ul className="flex flex-col gap-3">
                  {FOOTER_LINKS[category].map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="footer-link text-sm">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-16 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t"
          style={{ borderColor: "rgba(108, 92, 231, 0.08)" }}
        >
          <div
            className="flex flex-wrap items-center gap-3 text-xs"
            style={{ color: "var(--text-secondary)" }}
          >
            <span>© 2026 CORELX. All rights reserved.</span>
            <span className="opacity-30">|</span>
            <Link href="/privacy" className="footer-link">
              Privacy
            </Link>
            <span className="opacity-30">|</span>
            <Link href="/terms" className="footer-link">
              Terms
            </Link>
          </div>

          {/* Status indicator */}
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background: "#00b894",
                boxShadow: "0 0 8px rgba(0, 184, 148, 0.6)",
              }}
            />
            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
