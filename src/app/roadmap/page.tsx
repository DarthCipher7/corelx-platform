"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Bell,
  CheckCircle,
  Radio,
  ArrowRight,
  Clock,
  Flame,
  Layers,
  Shield,
  Zap,
  Globe,
  Monitor,
  X,
} from "lucide-react";

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  category: "Core Media" | "AI & Discovery" | "Identity" | "Platform" | "Ecosystem";
}

const NOW_ITEMS: RoadmapItem[] = [
  {
    id: "flares-beta",
    title: "Flares Beta",
    description: "Short-form vertical video upload, edge caching, and hardware-accelerated playback for creator workflows.",
    category: "Core Media",
  },
  {
    id: "traces-ephemeral",
    title: "Traces Engine",
    description: "Ephemeral 24-hour creative moments, WIP drops, and private spark interactions with zero permanent clutter.",
    category: "Core Media",
  },
  {
    id: "collab-ai",
    title: "Collab Matching AI",
    description: "Intelligent collaborator suggestions pairing complementary skillsets and aligned Aura reputation scores.",
    category: "AI & Discovery",
  },
  {
    id: "pwa-offline",
    title: "PWA Install + Offline Shell",
    description: "Installable Progressive Web App with local caching, instant launch, and background push notifications.",
    category: "Platform",
  },
];

const NEXT_ITEMS: RoadmapItem[] = [
  {
    id: "campus-badges",
    title: "Campus-Verified Badges",
    description: "Direct institution-linked credentials, club leadership tags, and verified hackathon winner seals.",
    category: "Identity",
  },
  {
    id: "shareable-cards",
    title: "Shareable Profile Cards",
    description: "Auto-generated dynamic OG cards with custom stats, Aura tier rings, and QR codes for LinkedIn & Instagram.",
    category: "Identity",
  },
  {
    id: "command-k",
    title: "Command Palette (⌘K)",
    description: "Omni-search navigation, instant user jump, pod shortcuts, and quick collaboration drafting via keyboard.",
    category: "Platform",
  },
  {
    id: "aura-moments",
    title: "Aura Moments",
    description: "Milestone promotion events with high-fidelity shareable animations when reaching Rising, Core, or Pillar tiers.",
    category: "Identity",
  },
  {
    id: "gesture-layer",
    title: "Mobile Gesture Layer",
    description: "Native-feel swipe navigation between feeds, pull-to-refresh feeds, and long-press quick previews.",
    category: "Platform",
  },
];

const LATER_ITEMS: RoadmapItem[] = [
  {
    id: "public-api",
    title: "Public Developer API",
    description: "REST & WebSocket API granting developers access to read profiles, publish pods, and query public collabs.",
    category: "Ecosystem",
  },
  {
    id: "intl-campuses",
    title: "International Campuses",
    description: "Expanding campus hub verification beyond India to university ecosystems in Southeast Asia, Europe, and US.",
    category: "Ecosystem",
  },
  {
    id: "desktop-app",
    title: "Native Desktop App",
    description: "Ultra-fast Tauri-powered desktop application for macOS, Windows, and Linux with native screen capture.",
    category: "Platform",
  },
  {
    id: "brand-marketplace",
    title: "Brand Partnerships Marketplace",
    description: "Direct sponsorship and freelance contracts channel exclusively open to Trusted, Core, and Pillar creators.",
    category: "Ecosystem",
  },
  {
    id: "ai-portfolio",
    title: "AI Portfolio Generation",
    description: "Auto-synthesize written project case studies, metrics breakdown, and media carousels from raw repository commits.",
    category: "AI & Discovery",
  },
];

export default function RoadmapPage() {
  const [activeModalItem, setActiveModalItem] = useState<RoadmapItem | null>(null);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifiedMap, setNotifiedMap] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalItem || !notifyEmail.includes("@")) return;

    setIsSubmitting(true);
    // TODO: Wire to Supabase notification waitlist table
    setTimeout(() => {
      setNotifiedMap((prev) => ({ ...prev, [activeModalItem.id]: true }));
      setIsSubmitting(false);
      setActiveModalItem(null);
      setNotifyEmail("");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-void)] text-[var(--text-primary)] pt-28 pb-32 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div
        className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none opacity-20 blur-[140px]"
        style={{
          background: "radial-gradient(circle, #6c5ce7 0%, #00d2ff 60%, transparent 80%)",
        }}
      />
      <div className="absolute inset-0 dot-bg opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono mb-4 border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
            <Radio className="w-3.5 h-3.5 text-[var(--accent-cyan)] animate-pulse" />
            <span className="text-[var(--accent-cyan)] uppercase tracking-wider">Public Flight Plan</span>
          </div>
          <h1
            className="text-4xl sm:text-6xl font-bold tracking-tight mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            What we are <span className="gradient-text">building.</span>
          </h1>
          <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
            Our active engineering pipeline divided into active sprints, next priority milestones, and long-range horizons.
          </p>
        </div>

        {/* 3-Column Roadmap Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: NOW */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--accent-cyan)]/30">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-cyan)] shadow-[0_0_8px_var(--accent-cyan)] animate-ping" />
                <h2 className="text-lg font-bold font-mono tracking-wider text-white">NOW</h2>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--accent-cyan)]/15 text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/30">
                In Active Flight ({NOW_ITEMS.length})
              </span>
            </div>

            <div className="space-y-4">
              {NOW_ITEMS.map((item) => (
                <RoadmapCard
                  key={item.id}
                  item={item}
                  isNotified={Boolean(notifiedMap[item.id])}
                  onNotifyClick={() => setActiveModalItem(item)}
                />
              ))}
            </div>
          </div>

          {/* Column 2: NEXT */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--accent-primary)]/30">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-primary)]" />
                <h2 className="text-lg font-bold font-mono tracking-wider text-white">NEXT</h2>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] border border-[var(--accent-primary)]/30">
                Planned ({NEXT_ITEMS.length})
              </span>
            </div>

            <div className="space-y-4">
              {NEXT_ITEMS.map((item) => (
                <RoadmapCard
                  key={item.id}
                  item={item}
                  isNotified={Boolean(notifiedMap[item.id])}
                  onNotifyClick={() => setActiveModalItem(item)}
                />
              ))}
            </div>
          </div>

          {/* Column 3: LATER */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--text-muted)]/30">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--text-muted)]" />
                <h2 className="text-lg font-bold font-mono tracking-wider text-white">LATER</h2>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--bg-frosted)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                Horizons ({LATER_ITEMS.length})
              </span>
            </div>

            <div className="space-y-4">
              {LATER_ITEMS.map((item) => (
                <RoadmapCard
                  key={item.id}
                  item={item}
                  isNotified={Boolean(notifiedMap[item.id])}
                  onNotifyClick={() => setActiveModalItem(item)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Notify Modal */}
      <AnimatePresence>
        {activeModalItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md p-6 sm:p-8 rounded-2xl border border-[var(--border-glow)] bg-[var(--bg-surface)] relative shadow-2xl"
            >
              <button
                onClick={() => setActiveModalItem(null)}
                className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent-cyan)] mb-2">
                <Bell className="w-3.5 h-3.5" />
                <span>Feature Notification Dispatch</span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-display)" }}>
                {activeModalItem.title}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mb-6">
                Receive an immediate ping when this capability rolls out to your account.
              </p>

              <form onSubmit={handleNotifySubmit} className="space-y-4">
                <input
                  type="email"
                  required
                  placeholder="your.email@university.edu"
                  value={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.value)}
                  className="w-full bg-[var(--bg-deep)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]"
                />

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveModalItem(null)}
                    className="px-4 py-2 rounded-xl text-xs text-[var(--text-secondary)] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl text-xs font-mono font-bold text-white transition-all disabled:opacity-50"
                    style={{
                      background: "linear-gradient(135deg, #6c5ce7, #00d2ff)",
                    }}
                  >
                    {isSubmitting ? "Subscribing..." : "Notify When Shipped"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RoadmapCard({
  item,
  isNotified,
  onNotifyClick,
}: {
  item: RoadmapItem;
  isNotified: boolean;
  onNotifyClick: () => void;
}) {
  return (
    <div
      className="p-5 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-card-bg)] hover:border-[var(--border-subtle)] transition-all flex flex-col justify-between group"
    >
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--bg-frosted)] text-[var(--accent-cyan)] border border-[var(--border-subtle)]">
            {item.category}
          </span>
        </div>

        <h3 className="text-base font-bold text-white mb-1.5 group-hover:text-[var(--accent-cyan)] transition-colors">
          {item.title}
        </h3>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
          {item.description}
        </p>
      </div>

      <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
        <span className="text-[10px] font-mono text-[var(--text-muted)]">Target: 2026/27</span>

        {isNotified ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#00cec9]">
            <CheckCircle className="w-3 h-3" /> Subscribed
          </span>
        ) : (
          <button
            onClick={onNotifyClick}
            className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[var(--text-secondary)] hover:text-white transition-colors cursor-pointer"
          >
            <Bell className="w-3 h-3 text-[var(--accent-primary)]" />
            <span>Notify me</span>
          </button>
        )}
      </div>
    </div>
  );
}
