import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, GitCommit, CheckCircle2, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Changelog — CORELX",
  description:
    "What we shipped. Version history and release notes for the CORELX platform.",
  openGraph: {
    title: "Changelog — CORELX",
    description: "What we shipped. Version history and release notes for the CORELX platform.",
    type: "website",
  },
};

interface ChangelogEntry {
  version: string;
  date: string;
  category: "Product" | "Platform" | "Performance" | "Fix";
  title: string;
  description: string;
  items: string[];
}

const CHANGELOG_ENTRIES: ChangelogEntry[] = [
  {
    version: "v0.9.0",
    date: "Nov 2026",
    category: "Product",
    title: "Pods on Company and Comms Profiles",
    description:
      "Added the Pods tab to company and org profile pages. Fixed crash from invite-only pods visibility filtering.",
    items: [
      "Company and Comms pages can now host affiliated student pods and hackathon squads directly on their profile tabs.",
      "Fixed client-side filtering crash when unauthenticated visitors encountered invite-only rooms.",
      "Optimized query indexes for campus pod listings, reducing load times by 40%.",
    ],
  },
  {
    version: "v0.8.5",
    date: "Oct 2026",
    category: "Product",
    title: "Pods System Architecture",
    description:
      "Persistent community rooms with invite-only and open visibility modes, member management, and role tags.",
    items: [
      "Introduced modular squad rooms supporting open and invite-only privacy tiers.",
      "Implemented custom creator role tags and member badge displays in real-time pod feeds.",
      "Added pod expiration safety rules and automated archive policies for completed projects.",
    ],
  },
  {
    version: "v0.8.0",
    date: "Sep 2026",
    category: "Platform",
    title: "Company & Comms Profiles",
    description:
      "Full org and company profile pages with admin dashboards, Reach Inbox, partner management, and event hosting.",
    items: [
      "Instituted verified entity profiles for university clubs, student organizations, and studio collectives.",
      "Integrated Reach Inbox directly into organization dashboards for streamlined student recruitment.",
      "Added multi-admin permission management and event co-hosting capabilities.",
    ],
  },
  {
    version: "v0.7.0",
    date: "Aug 2026",
    category: "Product",
    title: "Collab Board",
    description:
      "Post collaboration requests, filter by skill, and apply with one tap using verified credentials.",
    items: [
      "Launched the Collab Board with specialized filters for engineering, 3D design, sound, and writing.",
      "1-Tap application flow utilizing verified Showcase artifacts and live Aura ratings.",
      "Real-time notifications dispatched to project owners upon application receipt.",
    ],
  },
  {
    version: "v0.6.5",
    date: "Jul 2026",
    category: "Platform",
    title: "Aura Reputation System",
    description:
      "Five tiers: New, Rising, Trusted, Core, Pillar. Tracks contributions, collabs, and community impact.",
    items: [
      "Engineered cryptographic reputation calculations based on verified peer output and collaboration milestones.",
      "Tier progression unlocking higher Reach priority and guarded collaboration rooms.",
      "Anti-gaming algorithms detecting synthetic voting rings and artificial spam.",
    ],
  },
  {
    version: "v0.6.0",
    date: "Jun 2026",
    category: "Product",
    title: "Badges Accreditation",
    description:
      "Skill and achievement badges with community-awarded recognition and portfolio ring display.",
    items: [
      "Introduced non-transferable achievement badges for hackathon wins and open-source contributions.",
      "Visual badge rings rendered on creator profiles and Showcase header cards.",
      "Peer-endorsed skill validations with anti-inflation decay models.",
    ],
  },
  {
    version: "v0.5.0",
    date: "May 2026",
    category: "Product",
    title: "Showcase Living Portfolio",
    description:
      "Living portfolio for creators. Auto-curates your best work into an interactive dossier.",
    items: [
      "Launched multi-format portfolio cards supporting WebGL shaders, interactive embeds, and video timelapses.",
      "Custom creator vanity handles (e.g., corelx.app/@maya).",
      "One-click external sharing cards formatted for social previews.",
    ],
  },
  {
    version: "v0.4.0",
    date: "Apr 2026",
    category: "Product",
    title: "Feed + Multi-Entity Discovery",
    description:
      "Real-time creator feed, multi-entity discovery, and skill-indexed search architecture.",
    items: [
      "Integrated search overlay matching creators, campus hubs, open collabs, and active pods.",
      "Curated discovery feed prioritizing work quality over follower count.",
      "Support for media streaming with adaptive bitrate playback.",
    ],
  },
  {
    version: "v0.3.0",
    date: "Mar 2026",
    category: "Product",
    title: "Real-Time Messaging Engine",
    description:
      "Direct and group messaging with real-time websocket delivery and media sharing.",
    items: [
      "End-to-end encrypted direct messaging between verified collaborators.",
      "Group chat channels for accepted Collab Board project squads.",
      "Unread badge sync across desktop and mobile browsers.",
    ],
  },
  {
    version: "v0.2.0",
    date: "Feb 2026",
    category: "Product",
    title: "Campus Events System",
    description:
      "Create, host, and discover campus and remote events with trust-tier RSVP gating.",
    items: [
      "Event creation system with campus hub geofencing.",
      "Guarded vs Open RSVP policies backed by creator Aura tiers.",
      "Integrated countdown widgets and calendar export links.",
    ],
  },
  {
    version: "v0.1.0",
    date: "Jan 2026",
    category: "Platform",
    title: "CORELX Platform Launch",
    description:
      "Creator profiles, follow system, campus verification, and core design system release.",
    items: [
      "Initial production deployment of the CORELX web application.",
      "Institutional email verification linking creators to official university hubs.",
      "Dark-mode first cyber-minimalism design system with CSS custom properties.",
    ],
  },
];

const CATEGORY_STYLES: Record<
  ChangelogEntry["category"],
  { bg: string; text: string; border: string }
> = {
  Product: {
    bg: "rgba(108, 92, 231, 0.15)",
    text: "#a29bfe",
    border: "rgba(108, 92, 231, 0.35)",
  },
  Platform: {
    bg: "rgba(0, 210, 255, 0.15)",
    text: "#00d2ff",
    border: "rgba(0, 210, 255, 0.35)",
  },
  Performance: {
    bg: "rgba(0, 206, 201, 0.15)",
    text: "#00cec9",
    border: "rgba(0, 206, 201, 0.35)",
  },
  Fix: {
    bg: "rgba(253, 121, 168, 0.15)",
    text: "#fd79a8",
    border: "rgba(253, 121, 168, 0.35)",
  },
};

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-void)] text-[var(--text-primary)] pt-28 pb-32 relative overflow-hidden">
      {/* Ambient background lighting */}
      <div
        className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none opacity-20 blur-[140px]"
        style={{
          background: "radial-gradient(circle, #6c5ce7 0%, #00d2ff 60%, transparent 80%)",
        }}
      />
      <div className="absolute inset-0 dot-bg opacity-30 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono mb-4 border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent-cyan)]" />
            <span className="text-[var(--accent-cyan)] uppercase tracking-wider">Shipping Velocity</span>
          </div>
          <h1
            className="text-4xl sm:text-6xl font-bold tracking-tight mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            What we <span className="gradient-text">shipped.</span>
          </h1>
          <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
            Version history, platform enhancements, and release notes for the CORELX ecosystem.
          </p>
        </div>

        {/* Timeline list */}
        <div className="relative border-l border-[var(--border-subtle)] ml-4 sm:ml-8 pl-6 sm:pl-10 space-y-12">
          {CHANGELOG_ENTRIES.map((entry, idx) => {
            const catStyle = CATEGORY_STYLES[entry.category];
            const isLatest = idx === 0;

            return (
              <div key={entry.version} className="relative group">
                {/* Timeline node marker */}
                <div
                  className={`absolute -left-[31px] sm:-left-[47px] top-1.5 w-4 h-4 rounded-full border-2 transition-transform duration-200 group-hover:scale-125 ${
                    isLatest
                      ? "bg-[var(--accent-cyan)] border-[var(--accent-cyan)] shadow-[0_0_12px_var(--accent-cyan)]"
                      : "bg-[var(--bg-deep)] border-[var(--accent-primary)]"
                  }`}
                />

                <div
                  className="rounded-2xl p-6 sm:p-8 border border-[var(--glass-border)] transition-all duration-300 hover:border-[var(--border-glow)]"
                  style={{
                    background: "var(--glass-card-bg)",
                    backdropFilter: "blur(20px)",
                  }}
                >
                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="font-mono text-sm font-bold text-[var(--text-primary)] bg-[var(--bg-surface)] px-2.5 py-1 rounded-lg border border-[var(--border-subtle)]">
                      {entry.version}
                    </span>
                    <span
                      className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: catStyle.bg,
                        color: catStyle.text,
                        border: `1px solid ${catStyle.border}`,
                      }}
                    >
                      {entry.category}
                    </span>
                    <span className="text-xs font-mono text-[var(--text-secondary)]">
                      {entry.date}
                    </span>
                    {isLatest && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00cec9]/20 text-[#00cec9] border border-[#00cec9]/40">
                        Latest Release
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h2
                    className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-2"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {entry.title}
                  </h2>
                  <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed mb-5">
                    {entry.description}
                  </p>

                  {/* Shipped item bullets */}
                  <ul className="space-y-2.5 pt-4 border-t border-[var(--border-subtle)]">
                    {entry.items.map((item, itemIdx) => (
                      <li key={itemIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[var(--text-secondary)]">
                        <CheckCircle2 className="w-4 h-4 text-[var(--accent-cyan)] flex-shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 pt-10 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
              Have a feature request or bug report?
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Talk directly with our product team via the contact terminal.
            </p>
          </div>
          <Link
            href="/contact"
            className="px-5 py-2.5 rounded-xl text-xs font-mono font-medium text-[var(--text-primary)] transition-all hover:scale-105 whitespace-nowrap"
            style={{
              background: "linear-gradient(135deg, #6c5ce7, #00d2ff)",
            }}
          >
            Dispatch Transmission &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
