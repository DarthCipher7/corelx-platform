"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Video,
  Clock,
  Shield,
  Users,
  Compass,
  Briefcase,
  Layers,
  Award,
  Sparkles,
  ArrowRight,
  Heart,
  MessageCircle,
  Share2,
  Lock,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  Flame,
  Radio,
} from "lucide-react";

interface FeatureItem {
  id: string;
  name: string;
  tagline: string;
  description: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  stats: { label: string; value: string }[];
}

const FEATURES: FeatureItem[] = [
  {
    id: "flares",
    name: "Flares",
    tagline: "Short-form vertical video for creators.",
    description:
      "Shoot, edit, and share without the algorithmic brain rot. Showcase your coding timelapses, 3D design workflows, or music production in 60 sharp seconds.",
    badge: "Core Media",
    icon: Flame,
    color: "#6c5ce7",
    stats: [
      { label: "Duration", value: "60s Max" },
      { label: "Resolution", value: "4K HDR" },
      { label: "Discovery", value: "Skill-Indexed" },
    ],
  },
  {
    id: "traces",
    name: "Traces",
    tagline: "Ephemeral moments. Here now, gone in 24 hours.",
    description:
      "Share raw work-in-progress renders, late-night hackathon sparks, and spontaneous thoughts. Build real anticipation without clogging your permanent portfolio.",
    badge: "Ephemeral",
    icon: Clock,
    color: "#00d2ff",
    stats: [
      { label: "Lifespan", value: "24 Hours" },
      { label: "Interactions", value: "Private Sparks" },
      { label: "Archive", value: "Optional Vault" },
    ],
  },
  {
    id: "aura",
    name: "Aura",
    tagline: "Your reputation, earned.",
    description:
      "Five verifiable tiers: New, Rising, Trusted, Core, Pillar. The more you contribute, ship, and mentor, the more you rise. Zero vanity followers. Zero pay-to-win checkmarks.",
    badge: "Trust Engine",
    icon: Shield,
    color: "#fd79a8",
    stats: [
      { label: "Tiers", value: "5 Distinct" },
      { label: "Metric", value: "Contribution" },
      { label: "Transferable", value: "Never" },
    ],
  },
  {
    id: "pods",
    name: "Pods",
    tagline: "Persistent communities for creators.",
    description:
      "Squad rooms, project hubs, and campus groups. Built to replace chaotic WhatsApp chats with structured discussions, member roles, and integrated Collab Board feeds.",
    badge: "Communities",
    icon: Users,
    color: "#00cec9",
    stats: [
      { label: "Modes", value: "Open / Invite" },
      { label: "Channels", value: "Multi-Stream" },
      { label: "Roles", value: "Custom Tags" },
    ],
  },
  {
    id: "collab-board",
    name: "Collab Board",
    tagline: "Post what you need. Find who you need.",
    description:
      "Ship projects together. Filter by skill, software stack, and campus hub. Apply with one tap using your verified Showcase portfolio and Aura score.",
    badge: "Opportunity",
    icon: Briefcase,
    color: "#a29bfe",
    stats: [
      { label: "Application", value: "1-Tap Pitch" },
      { label: "Filters", value: "Skill + Campus" },
      { label: "Matching", value: "Aura-Aligned" },
    ],
  },
  {
    id: "showcase",
    name: "Showcase",
    tagline: "A living portfolio for creators.",
    description:
      "Your best work, curated automatically. Link your GitHub repos, Figma prototypes, and video breakdowns into an elegant interactive dossier that employers actually respect.",
    badge: "Identity",
    icon: Layers,
    color: "#00d2ff",
    stats: [
      { label: "Media Support", value: "3D, Code, Video" },
      { label: "Custom Handle", value: "@handle" },
      { label: "Verification", value: "Proof of Work" },
    ],
  },
  {
    id: "reach",
    name: "Reach",
    tagline: "Find your next collaborator. Direct, relevant, no noise.",
    description:
      "High-signal inbound outreach. Reach Inbox filters incoming messages by collaborator compatibility and Aura standing, keeping your attention focused strictly on builders.",
    badge: "Outreach",
    icon: Compass,
    color: "#fdcb6e",
    stats: [
      { label: "Noise Filter", value: "Strict" },
      { label: "Intent Matching", value: "Project-Based" },
      { label: "Spam Rate", value: "< 0.01%" },
    ],
  },
  {
    id: "safemode",
    name: "SafeMode",
    tagline: "Your space, your rules.",
    description:
      "Granular geolocation privacy, campus perimeter filtering, and an automated three-strike enforcement engine that protects creators from harassment and bot farms.",
    badge: "Integrity",
    icon: Lock,
    color: "#00cec9",
    stats: [
      { label: "Enforcement", value: "3-Strikes" },
      { label: "Geo-Fence", value: "Opt-In Only" },
      { label: "Data Sharing", value: "Zero" },
    ],
  },
  {
    id: "badges",
    name: "Badges",
    tagline: "Earned, not bought.",
    description:
      "Cryptographic proof of skill, hackathon victories, and community stewardship. Awarded through verified milestones and peer peer endorsements.",
    badge: "Accreditation",
    icon: Award,
    color: "#e17055",
    stats: [
      { label: "Type", value: "SBT Proof" },
      { label: "Acquisition", value: "Merit Only" },
      { label: "Display", value: "Showcase Ring" },
    ],
  },
];

export default function FeaturesPage() {
  const [activeId, setActiveId] = useState<string>("flares");

  useEffect(() => {
    const handleScroll = () => {
      const sections = FEATURES.map((f) => document.getElementById(f.id));
      const scrollPos = window.scrollY + 250;

      for (let i = sections.length - 1; i >= 0; i--) {
        const sec = sections[i];
        if (sec && sec.offsetTop <= scrollPos) {
          setActiveId(FEATURES[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const topOffset = el.getBoundingClientRect().top + window.pageYOffset - 100;
      window.scrollTo({ top: topOffset, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-void)] text-[var(--text-primary)] pt-28 pb-32 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div
        className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none opacity-20 blur-[130px]"
        style={{
          background: "radial-gradient(circle, #6c5ce7 0%, #00d2ff 60%, transparent 80%)",
        }}
      />
      <div className="absolute inset-0 dot-bg opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Hero header */}
        <div className="max-w-3xl mb-16 sm:mb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono mb-4 border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent-cyan)]" />
            <span className="text-[var(--accent-cyan)] uppercase tracking-wider">The CORELX Architecture</span>
          </div>
          <h1
            className="text-4xl sm:text-6xl font-bold tracking-tight mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Engineered for <span className="gradient-text">builders.</span>
          </h1>
          <p className="text-lg sm:text-xl text-[var(--text-secondary)] leading-relaxed">
            Nine unified pillars that merge social creation, portfolio credibility, and verified reputation into a single cyber-minimal platform.
          </p>
        </div>

        {/* Mobile sticky pill navigation */}
        <div className="lg:hidden sticky top-20 z-40 mb-10 -mx-4 px-4 py-3 bg-[var(--bg-void)]/90 backdrop-blur-md border-y border-[var(--border-subtle)] overflow-x-auto no-scrollbar flex items-center gap-2">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            const isActive = activeId === feat.id;
            return (
              <button
                key={feat.id}
                onClick={() => scrollToSection(feat.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-[var(--accent-primary)] text-[var(--text-primary)] shadow-lg shadow-[var(--accent-primary)]/40 font-bold"
                    : "bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{feat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Main 2-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Pinned Left Sidebar */}
          <aside className="hidden lg:block lg:col-span-4 sticky top-28 space-y-2 p-5 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-card-bg)] backdrop-blur-xl">
            <p className="text-[11px] font-mono uppercase tracking-widest text-[var(--text-muted)] mb-3 px-3">
              Navigation Protocol
            </p>
            {FEATURES.map((feat, index) => {
              const Icon = feat.icon;
              const isActive = activeId === feat.id;
              return (
                <button
                  key={feat.id}
                  onClick={() => scrollToSection(feat.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-left transition-all group ${
                    isActive
                      ? "bg-[var(--bg-elevated)] border border-[var(--accent-primary)] text-[var(--text-primary)] shadow-md shadow-[var(--accent-primary)]/20"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                        isActive
                          ? "bg-[var(--accent-primary)] text-[var(--text-primary)]"
                          : "bg-[var(--bg-surface)] text-[var(--text-muted)] group-hover:text-[var(--text-primary)]"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold leading-tight">{feat.name}</p>
                      <p className="text-[10px] font-mono text-[var(--text-muted)]">{feat.badge}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-[var(--text-muted)]">0{index + 1}</span>
                </button>
              );
            })}

            <div className="pt-4 mt-4 border-t border-[var(--border-subtle)]">
              <Link
                href="/signup"
                className="w-full py-2.5 px-4 rounded-xl text-xs font-medium text-[var(--text-primary)] flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
                style={{
                  background: "linear-gradient(135deg, #6c5ce7, #00d2ff)",
                }}
              >
                <span>Enter Early Access</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </aside>

          {/* Right Scrolling Feature Sections */}
          <div className="lg:col-span-8 space-y-24">
            {FEATURES.map((feat, index) => {
              const Icon = feat.icon;
              return (
                <section
                  key={feat.id}
                  id={feat.id}
                  className="scroll-mt-28 rounded-3xl p-7 sm:p-10 border border-[var(--glass-border)] relative overflow-hidden"
                  style={{
                    background: "var(--glass-card-bg)",
                    backdropFilter: "blur(20px)",
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.45 }}
                  >
                    {/* Header info */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--text-primary)]"
                          style={{
                            background: `linear-gradient(135deg, ${feat.color}, #6c5ce7)`,
                            boxShadow: `0 0 16px ${feat.color}40`,
                          }}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <span
                          className="px-3 py-1 rounded-full text-xs font-mono font-medium"
                          style={{
                            background: "var(--bg-frosted)",
                            border: "1px solid var(--border-subtle)",
                            color: feat.color,
                          }}
                        >
                          {feat.badge}
                        </span>
                      </div>
                      <span className="text-sm font-mono text-[var(--text-muted)]">
                        0{index + 1} / 09
                      </span>
                    </div>

                    <h2
                      className="text-3xl sm:text-4xl font-bold tracking-tight mb-2 text-[var(--text-primary)]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {feat.name}
                    </h2>
                    <p className="text-base sm:text-lg font-medium text-[var(--accent-cyan)] mb-4">
                      {feat.tagline}
                    </p>
                    <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed mb-8 max-w-2xl">
                      {feat.description}
                    </p>

                    {/* Stats bar */}
                    <div className="grid grid-cols-3 gap-3 mb-8 p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                      {feat.stats.map((st) => (
                        <div key={st.label} className="text-center">
                          <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                            {st.label}
                          </p>
                          <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)] mt-0.5">
                            {st.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Interactive Mock UI Demo */}
                    <div className="w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-deep)] p-4 sm:p-6 overflow-hidden">
                      {feat.id === "flares" && <MockFlaresDemo />}
                      {feat.id === "traces" && <MockTracesDemo />}
                      {feat.id === "aura" && <MockAuraDemo />}
                      {feat.id === "pods" && <MockPodsDemo />}
                      {feat.id === "collab-board" && <MockCollabBoardDemo />}
                      {feat.id === "showcase" && <MockShowcaseDemo />}
                      {feat.id === "reach" && <MockReachDemo />}
                      {feat.id === "safemode" && <MockSafeModeDemo />}
                      {feat.id === "badges" && <MockBadgesDemo />}
                    </div>
                  </motion.div>
                </section>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA section */}
        <div
          className="mt-28 rounded-3xl p-8 sm:p-14 border border-[var(--border-subtle)] text-center relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(15,15,35,0.9) 0%, rgba(10,10,25,0.95) 100%)",
          }}
        >
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 opacity-20 blur-3xl pointer-events-none"
            style={{ background: "#6c5ce7" }}
          />

          <h3
            className="text-3xl sm:text-5xl font-bold tracking-tight mb-4 relative z-10"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Ready to build your <span className="gradient-text">creative legacy?</span>
          </h3>
          <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-xl mx-auto mb-8 relative z-10">
            Join thousands of college designers, engineers, and creators claiming early access before the public release.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 relative z-10">
            <Link
              href="/signup"
              className="px-8 py-3.5 rounded-full text-sm font-semibold text-[var(--text-primary)] transition-transform hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #6c5ce7, #00d2ff)",
                boxShadow: "0 0 24px rgba(108,92,231,0.5)",
              }}
            >
              Get Early Access Free
            </Link>
            <Link
              href="/explore"
              className="px-7 py-3.5 rounded-full text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--glass-border)] bg-[var(--bg-frosted)] transition-colors"
            >
              Explore Feed
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MOCK DEMO COMPONENTS (HTML/CSS Cyber-Minimal UI Simulations)
   ───────────────────────────────────────────────────────────── */

function MockFlaresDemo() {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-4">
      <div className="w-[260px] h-[440px] rounded-3xl bg-[var(--bg-void)] border-2 border-[var(--border-subtle)] relative overflow-hidden shadow-2xl flex flex-col justify-between p-4">
        {/* Simulated vertical video backdrop */}
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at bottom, #6c5ce7 0%, #00d2ff 50%, #02020a 100%)",
          }}
        />

        {/* Video top bar */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase bg-black/60 px-2 py-0.5 rounded text-[var(--accent-cyan)] border border-[var(--border-subtle)]">
            FLARE • 0:42 / 1:00
          </span>
          <span className="w-2 h-2 rounded-full bg-[#00cec9] animate-pulse" />
        </div>

        {/* Mock center content */}
        <div className="relative z-10 my-auto text-center">
          <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mx-auto flex items-center justify-center text-[var(--text-primary)] shadow-lg mb-2">
            <Flame className="w-8 h-8 text-[var(--accent-cyan)]" />
          </div>
          <p className="text-xs font-mono text-[var(--text-primary)]/90 font-bold">Procedural Shaders in Rust</p>
        </div>

        {/* Video bottom overlay & action sidebar */}
        <div className="relative z-10 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold text-[var(--text-primary)]">@aarav.codes</p>
            <p className="text-[11px] text-[var(--text-primary)]/80 line-clamp-1">Writing GPU kernels from scratch...</p>
            <div className="w-32 h-1 bg-white/20 rounded-full mt-2 overflow-hidden">
              <div className="w-2/3 h-full bg-[var(--accent-cyan)]" />
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 text-[var(--text-primary)]">
            <div className="flex flex-col items-center">
              <Heart className="w-5 h-5 text-[var(--accent-magenta)] fill-[var(--accent-magenta)]" />
              <span className="text-[10px] font-mono mt-0.5">3.8k</span>
            </div>
            <div className="flex flex-col items-center">
              <MessageCircle className="w-5 h-5 text-[var(--text-primary)]/80" />
              <span className="text-[10px] font-mono mt-0.5">241</span>
            </div>
            <div className="flex flex-col items-center">
              <Share2 className="w-5 h-5 text-[var(--text-primary)]/80" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-xs text-xs text-[var(--text-secondary)] space-y-2">
        <p className="font-semibold text-[var(--text-primary)]">Vertical Media for Builders</p>
        <p>No dance trends. No meme spam. Flares indexes by software tags, campus hub, and project repository links.</p>
        <div className="p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] font-mono text-[11px] text-[var(--accent-cyan)]">
          &gt; git commit -m &quot;flare: 60s demo ready&quot;
        </div>
      </div>
    </div>
  );
}

function MockTracesDemo() {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-4">
      <div className="w-[280px] p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] relative">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-[#00d2ff] to-[#6c5ce7]">
            <div className="w-10 h-10 rounded-full bg-[var(--bg-deep)] flex items-center justify-center text-xs font-bold text-[var(--text-primary)] font-mono">
              C✦X
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-[var(--text-primary)]">@maya_ui</p>
            <p className="text-[10px] font-mono text-[var(--accent-cyan)]">Expires in 18h 42m</p>
          </div>
        </div>

        <div className="w-full h-36 rounded-xl bg-gradient-to-br from-[#1a1a3a] to-[#0a0a18] border border-[var(--glass-border)] p-3 flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-center text-[10px] font-mono text-[var(--text-primary)]/70">
            <span>#Trace04</span>
            <span className="bg-[#fd79a8]/20 text-[#fd79a8] px-2 py-0.5 rounded">Raw WIP</span>
          </div>
          <p className="text-xs text-[var(--text-primary)]/90 font-medium">
            &quot;Drafting the tactile glassmorphism system for next week&apos;s campus showcase. Thoughts?&quot;
          </p>
          <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-primary)]/60 font-mono">
            <span>🔥 42</span>
            <span>⚡ 18</span>
            <span>✨ 89</span>
          </div>
        </div>
      </div>

      <div className="max-w-xs text-xs text-[var(--text-secondary)] space-y-2">
        <p className="font-semibold text-[var(--text-primary)]">Zero Permanent Clutter</p>
        <p>Traces dissolve completely in 24 hours. Perfect for live critiques, sprint check-ins, and late night design tests.</p>
      </div>
    </div>
  );
}

function MockAuraDemo() {
  const tiers = [
    { name: "New", active: true, color: "#a8a8c4" },
    { name: "Rising", active: true, color: "#00d2ff" },
    { name: "Trusted", active: true, color: "#6c5ce7" },
    { name: "Core", active: true, color: "#fd79a8" },
    { name: "Pillar", active: true, color: "#e17055" },
  ];

  return (
    <div className="p-4 sm:p-6 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-[var(--accent-primary)]" />
          <span className="text-sm font-bold text-[var(--text-primary)] font-mono">AURA REPUTATION SCORE</span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#fd79a8]/20 text-[#fd79a8] border border-[#fd79a8]/40">
          TIER: CORE
        </span>
      </div>

      <div className="relative my-6">
        <div className="h-2 rounded-full bg-[var(--bg-deep)] overflow-hidden flex">
          <div className="w-4/5 h-full bg-gradient-to-r from-[#00d2ff] via-[#6c5ce7] to-[#fd79a8]" />
        </div>
        <div className="flex justify-between items-center text-[10px] font-mono mt-2 text-[var(--text-secondary)]">
          {tiers.map((t) => (
            <span key={t.name} style={{ color: t.color }} className="font-semibold">
              {t.name}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-2.5 rounded-lg bg-[var(--bg-deep)] border border-[var(--border-subtle)]">
          <p className="text-[10px] text-[var(--text-muted)] font-mono">Collabs Completed</p>
          <p className="text-sm font-bold text-[var(--accent-cyan)]">12 Verified</p>
        </div>
        <div className="p-2.5 rounded-lg bg-[var(--bg-deep)] border border-[var(--border-subtle)]">
          <p className="text-[10px] text-[var(--text-muted)] font-mono">Peer Endorsements</p>
          <p className="text-sm font-bold text-[var(--accent-primary)]">98 Sparks</p>
        </div>
        <div className="p-2.5 rounded-lg bg-[var(--bg-deep)] border border-[var(--border-subtle)]">
          <p className="text-[10px] text-[var(--text-muted)] font-mono">Moderation Integrity</p>
          <p className="text-sm font-bold text-[#00cec9]">100% Clean</p>
        </div>
      </div>
    </div>
  );
}

function MockPodsDemo() {
  return (
    <div className="p-4 sm:p-6 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] max-w-lg mx-auto">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)] mb-3">
        <div>
          <p className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[var(--accent-cyan)]" />
            Autonomous Robotics Pod
          </p>
          <p className="text-[10px] font-mono text-[var(--text-muted)]">IIT Bombay Hub • 34 Members • Open</p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/30">
          Active Room
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="p-2.5 rounded-xl bg-[var(--bg-deep)] text-xs border border-[var(--glass-border)]">
          <span className="font-bold text-[var(--accent-primary)]">@rohit_ee: </span>
          <span className="text-[var(--text-secondary)]">ROS2 navigation node calibration is committed to main.</span>
        </div>
        <div className="p-2.5 rounded-xl bg-[var(--bg-deep)] text-xs border border-[var(--glass-border)]">
          <span className="font-bold text-[var(--accent-cyan)]">@priya_ai: </span>
          <span className="text-[var(--text-secondary)]">Testing the lidar point cloud stream on the emulator now!</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)] pt-2 border-t border-[var(--border-subtle)]">
        <span>Squad: 8 Engineers, 2 Designers</span>
        <span className="text-[var(--accent-cyan)] font-bold">Join Pod &rarr;</span>
      </div>
    </div>
  );
}

function MockCollabBoardDemo() {
  return (
    <div className="p-4 sm:p-6 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] max-w-lg mx-auto">
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] border border-[var(--accent-primary)]/40">
            Open Bounty / Role
          </span>
          <h4 className="text-sm font-bold text-[var(--text-primary)] mt-1.5">Lead 3D Motion Designer for Sci-Fi Short</h4>
          <p className="text-[11px] text-[var(--text-secondary)]">Posted by Team Hyperion • BITS Pilani</p>
        </div>
        <span className="text-xs font-mono text-[#00cec9] font-bold">Aura: Trusted+</span>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {["Blender", "Unreal Engine 5", "Octane", "Cinema4D"].map((s) => (
          <span key={s} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-deep)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
            {s}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]">
        <span className="text-[11px] font-mono text-[var(--text-muted)]">3 slots • 8 applicants</span>
        <button className="px-3 py-1.5 rounded-lg bg-[var(--accent-primary)] text-[var(--text-primary)] text-xs font-semibold hover:brightness-110">
          Apply with 1-Tap
        </button>
      </div>
    </div>
  );
}

function MockShowcaseDemo() {
  return (
    <div className="p-4 sm:p-6 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] max-w-lg mx-auto">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)] mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#6c5ce7] to-[#00d2ff] flex items-center justify-center font-mono font-bold text-[10px] text-[var(--text-primary)]">
            C✦X
          </div>
          <div>
            <p className="text-xs font-bold text-[var(--text-primary)]">karan_ux.corelx.app</p>
            <p className="text-[10px] font-mono text-[var(--accent-cyan)]">Curated Living Portfolio</p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-[var(--text-muted)]">4 Artifacts</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-[var(--bg-deep)] border border-[var(--glass-border)]">
          <div className="w-full h-16 rounded bg-gradient-to-r from-purple-900/40 to-blue-900/40 mb-2 flex items-center justify-center text-[10px] font-mono text-[var(--text-primary)]/70">
            Interactive Canvas
          </div>
          <p className="text-xs font-bold text-[var(--text-primary)] truncate">Quantum UI Framework</p>
          <p className="text-[10px] font-mono text-[var(--text-secondary)]">TypeScript • GLSL</p>
        </div>
        <div className="p-3 rounded-xl bg-[var(--bg-deep)] border border-[var(--glass-border)]">
          <div className="w-full h-16 rounded bg-gradient-to-r from-blue-900/40 to-cyan-900/40 mb-2 flex items-center justify-center text-[10px] font-mono text-[var(--text-primary)]/70">
            Mobile Prototype
          </div>
          <p className="text-xs font-bold text-[var(--text-primary)] truncate">FinTech Gesture Deck</p>
          <p className="text-[10px] font-mono text-[var(--text-secondary)]">Framer Motion • React</p>
        </div>
      </div>
    </div>
  );
}

function MockReachDemo() {
  return (
    <div className="p-4 sm:p-6 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-[var(--text-primary)] font-mono flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-[var(--accent-amber)]" />
          DIRECT REACH PROTOCOL
        </span>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--accent-amber)]/20 text-[var(--accent-amber)]">
          High Signal
        </span>
      </div>

      <div className="p-3 rounded-xl bg-[var(--bg-deep)] border border-[var(--glass-border)] mb-3 text-xs space-y-1.5">
        <div className="flex justify-between text-[11px]">
          <span className="text-[var(--text-primary)] font-semibold">From: @arjun.foundry (Core Tier)</span>
          <span className="text-[var(--accent-cyan)] font-mono">96% Skill Alignment</span>
        </div>
        <p className="text-[var(--text-secondary)] leading-relaxed">
          &quot;Hey Maya, saw your GLSL shader Flare. We need a creative technologist for our National Hackathon finalist sprint.&quot;
        </p>
      </div>

      <div className="flex justify-end gap-2 text-xs">
        <button className="px-3 py-1 rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)]">
          Decline
        </button>
        <button className="px-3 py-1 rounded-lg bg-[var(--accent-primary)] text-[var(--text-primary)] font-semibold">
          Accept &amp; Open Chat
        </button>
      </div>
    </div>
  );
}

function MockSafeModeDemo() {
  return (
    <div className="p-4 sm:p-6 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] max-w-lg mx-auto space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#00cec9]" />
            SafeMode Geofence Protection
          </p>
          <p className="text-[10px] font-mono text-[var(--text-muted)]">Campus-only content perimeter</p>
        </div>
        <div className="w-10 h-5 bg-[#00cec9] rounded-full p-0.5 flex justify-end items-center cursor-pointer">
          <div className="w-4 h-4 bg-white rounded-full shadow" />
        </div>
      </div>

      <div className="p-2.5 rounded-xl bg-[var(--bg-deep)] text-xs border border-[var(--border-subtle)] space-y-1">
        <div className="flex justify-between text-[11px] font-mono">
          <span className="text-[var(--text-secondary)]">Three-Strike Integrity:</span>
          <span className="text-[#00cec9] font-bold">0 / 3 Strikes (Verified Clean)</span>
        </div>
        <div className="flex justify-between text-[11px] font-mono">
          <span className="text-[var(--text-secondary)]">Outreach Shield:</span>
          <span className="text-[var(--text-primary)]">Active (Spam blocked)</span>
        </div>
      </div>
    </div>
  );
}

function MockBadgesDemo() {
  const badges = [
    { title: "Founding Builder", color: "#6c5ce7", code: "CX-01" },
    { title: "Pillar Mentor", color: "#00d2ff", code: "CX-02" },
    { title: "Collab Catalyst", color: "#fd79a8", code: "CX-03" },
    { title: "GLSL Sculptor", color: "#e17055", code: "CX-04" },
  ];

  return (
    <div className="p-4 sm:p-6 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] max-w-lg mx-auto">
      <p className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider mb-3">
        Cryptographic Skill &amp; Milestone Proofs
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {badges.map((b) => (
          <div
            key={b.title}
            className="p-3 rounded-xl bg-[var(--bg-deep)] border border-[var(--border-subtle)] text-center hover:border-[var(--accent-cyan)] transition-all"
          >
            <div
              className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center text-[var(--text-primary)] text-xs font-mono font-bold"
              style={{
                background: `linear-gradient(135deg, ${b.color}, #0a0a18)`,
                boxShadow: `0 0 12px ${b.color}40`,
              }}
            >
              ✦
            </div>
            <p className="text-[11px] font-bold text-[var(--text-primary)] leading-tight">{b.title}</p>
            <p className="text-[9px] font-mono text-[var(--text-muted)] mt-1">{b.code}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
