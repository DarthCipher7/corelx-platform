"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import {
  Sun,
  Moon,
  Sparkles,
  Layers,
  Palette,
  Type,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2,
  Copy,
  Check,
} from "lucide-react";

export default function DesignSystemClient() {
  const { theme, setTheme } = useTheme();
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(id);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const AURA_TIERS = [
    {
      tier: "New",
      desc: "Fresh builders joining the network",
      darkFinish: "Muted chrome silver with subtle luminescence",
      lightFinish: "Polished platinum with high-specular edge",
      darkColor: "#a8a8c4",
      lightColor: "#716f8a",
      gradient: "linear-gradient(135deg, #a8a8c4, #e5e5f0)",
    },
    {
      tier: "Rising",
      desc: "Proven consistency & initial collabs",
      darkFinish: "Electric violet glow",
      lightFinish: "Vivid amethyst jewel tone",
      darkColor: "#6c5ce7",
      lightColor: "#5742e6",
      gradient: "linear-gradient(135deg, #5742e6, #8c7cf0)",
    },
    {
      tier: "Trusted",
      desc: "High collaboration signal & safe interactions",
      darkFinish: "Neon cyan laser pulse",
      lightFinish: "Cerulean sapphire glass ring",
      darkColor: "#00d2ff",
      lightColor: "#027fa8",
      gradient: "linear-gradient(135deg, #027fa8, #38bdf8)",
    },
    {
      tier: "Core",
      desc: "Essential pillars of community creation",
      darkFinish: "Hot magenta neon radiation",
      lightFinish: "Pearlescent rose quartz & ruby luster",
      darkColor: "#fd79a8",
      lightColor: "#d82b6b",
      gradient: "linear-gradient(135deg, #d82b6b, #fb7185)",
    },
    {
      tier: "Pillar",
      desc: "Top 0.1% network anchors & mentors",
      darkFinish: "Golden flame plasma corona",
      lightFinish: "24K Imperial topaz metallic mirror",
      darkColor: "#fdcb6e",
      lightColor: "#b86800",
      gradient: "linear-gradient(135deg, #b86800, #f59e0b)",
    },
  ];

  const ELEVATION_TIERS = [
    {
      level: "Level 0",
      name: "Canvas Ground",
      token: "var(--bg-void)",
      role: "Backdrop surface. Tinted with faint violet hue in light mode.",
      shadow: "none / recessed",
    },
    {
      level: "Level 1",
      name: "Resting Surface",
      token: "var(--elevation-1)",
      role: "Feed cards, grid items, resting panels.",
      shadow: "Dual-shadow (tight contact + brand ambient) + 1px top highlight",
    },
    {
      level: "Level 2",
      name: "Hovered / Floating",
      token: "var(--elevation-2)",
      role: "Hover states, floating navigation headers, sticky toolbars.",
      shadow: "Elevated depth with violet ambient spill",
    },
    {
      level: "Level 3",
      name: "Popovers & Flyouts",
      token: "var(--elevation-3)",
      role: "Dropdown menus, notification popovers, contextual tooltips.",
      shadow: "Deep ambient projection with crisp specular edge",
    },
    {
      level: "Level 4",
      name: "Modals & Dialogs",
      token: "var(--elevation-4)",
      role: "Focal overlays, creation studios, full modal sheets.",
      shadow: "Maximum dramatic lift with light-blocking backdrop occlusion",
    },
  ];

  return (
    <div className="min-h-screen pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 border-b border-[var(--border-subtle)] pb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] mb-4">
            <span className="text-[var(--accent-cyan)] text-xs">✦</span>
            <span className="label-mono !text-[11px] text-[var(--text-secondary)]">
              SPECIFICATION & TOKENS
            </span>
          </div>
          <h1 className="display-lg text-[var(--text-primary)] tracking-tight">
            CORELX <span className="gradient-text">Design System</span>
          </h1>
          <p className="text-base sm:text-lg text-[var(--text-secondary)] mt-2 max-w-2xl">
            Luminous cyber-minimalism engineered for dual-theme excellence. OKLCH color ramps,
            5-tier tinted elevation, tactile glass, and verifiable Aura tier finishes.
          </p>
        </div>

        {/* Live Theme Controller */}
        <div className="flex items-center gap-3 p-1.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-[var(--elevation-1)]">
          <button
            onClick={() => setTheme("light")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all ${
              theme === "light"
                ? "bg-[var(--accent-primary)] text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Sun className="w-3.5 h-3.5" /> Light Mode
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all ${
              theme === "dark"
                ? "bg-[var(--accent-primary)] text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Moon className="w-3.5 h-3.5" /> Dark Mode
          </button>
        </div>
      </div>

      {/* SECTION 1: 5-LEVEL ELEVATION SYSTEM */}
      <section className="mb-20">
        <div className="flex items-center gap-3 mb-8">
          <Layers className="w-5 h-5 text-[var(--accent-primary)]" />
          <h2 className="text-2xl font-bold font-display text-[var(--text-primary)]">
            5-Level Tinted Elevation Hierarchy
          </h2>
        </div>
        <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-3xl">
          In CORELX Light Mode, elevation cannot rely solely on black drop shadows. Each level combines
          a tight contact shadow, an ambient brand-tinted spill, and a 1px top specular highlight.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
          {ELEVATION_TIERS.map((tier, idx) => (
            <div
              key={tier.level}
              className={`rounded-2xl p-6 transition-all duration-300 border border-[var(--glass-border)] bg-[var(--bg-surface)] ${
                idx === 0
                  ? "elevation-0"
                  : idx === 1
                  ? "elevation-1"
                  : idx === 2
                  ? "elevation-2"
                  : idx === 3
                  ? "elevation-3"
                  : "elevation-4"
              }`}
            >
              <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--accent-cyan)] mb-1">
                {tier.level}
              </div>
              <h3 className="font-display font-semibold text-base text-[var(--text-primary)] mb-2">
                {tier.name}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mb-4 leading-relaxed">
                {tier.role}
              </p>
              <div className="pt-3 border-t border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-muted)]">
                {tier.shadow}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: 4-TIER LIQUID-GLASS MATERIAL SYSTEM */}
      <section className="mb-20">
        <div className="flex items-center gap-3 mb-8">
          <Layers className="w-5 h-5 text-[var(--accent-cyan)]" />
          <h2 className="text-2xl font-bold font-display text-[var(--text-primary)]">
            4-Tier Liquid-Glass Material System
          </h2>
        </div>
        <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-3xl">
          Engineered for refractive realism over our L 93.5% mist canvas. Features 1px top-left specular rims,
          high-saturation backdrop blurs, and strict performance limits (≤ 3 layers per viewport).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="rounded-2xl p-6 glass-thin border border-[var(--glass-thin-border)]">
            <span className="label-mono !text-[10px] text-[var(--accent-primary)] mb-1 block">
              TIER 1 // THIN
            </span>
            <h3 className="font-display font-bold text-base text-[var(--text-primary)] mb-2">
              Micro Chrome
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mb-4">
              12px blur, 45% fill. For tab pills, floating tags, and quick-action chips.
            </p>
            <div className="pt-3 border-t border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-muted)]">
              blur(12px) saturate(180%)
            </div>
          </div>

          <div className="rounded-2xl p-6 glass-regular border border-[var(--glass-border)]">
            <span className="label-mono !text-[10px] text-[var(--accent-cyan)] mb-1 block">
              TIER 2 // REGULAR
            </span>
            <h3 className="font-display font-bold text-base text-[var(--text-primary)] mb-2">
              Body & Shell
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mb-4">
              24px blur, 65% fill + 1px specular rim. For bottom tab bar, cards, and header.
            </p>
            <div className="pt-3 border-t border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-muted)]">
              blur(24px) saturate(200%)
            </div>
          </div>

          <div className="rounded-2xl p-6 glass-thick border border-[var(--glass-strong-border)]">
            <span className="label-mono !text-[10px] text-[var(--accent-magenta)] mb-1 block">
              TIER 3 // THICK
            </span>
            <h3 className="font-display font-bold text-base text-[var(--text-primary)] mb-2">
              Sheets & Modals
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mb-4">
              36px blur, 84% fill. High opacity prevents background bleed in draggable drawers.
            </p>
            <div className="pt-3 border-t border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-muted)]">
              blur(36px) saturate(210%)
            </div>
          </div>

          <div className="rounded-2xl p-6 glass-tinted border border-[var(--glass-tinted-border)]">
            <span className="label-mono !text-[10px] text-[var(--accent-amber)] mb-1 block">
              TIER 4 // TINTED
            </span>
            <h3 className="font-display font-bold text-base text-[var(--text-primary)] mb-2">
              Chromatic Glass
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mb-4">
              28px blur with subtle violet-cyan tint. For Aura milestone celebrations and banners.
            </p>
            <div className="pt-3 border-t border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-muted)]">
              blur(28px) saturate(190%) + tint
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: AURA REPUTATION TIERS */}
      <section className="mb-20">
        <div className="flex items-center gap-3 mb-8">
          <Sparkles className="w-5 h-5 text-[var(--accent-cyan)]" />
          <h2 className="text-2xl font-bold font-display text-[var(--text-primary)]">
            Aura Tier Finishes (Dual-Theme Parity)
          </h2>
        </div>
        <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-3xl">
          Aura reflects earned network contribution across 5 locked tiers. Light mode introduces
          jeweled, specular finishes matching the electric radiance of dark mode.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
          {AURA_TIERS.map((tier) => (
            <div
              key={tier.tier}
              className="rounded-2xl p-6 glass-card border border-[var(--glass-border)] flex flex-col justify-between"
            >
              <div>
                {/* Visual Ring Demo */}
                <div className="flex justify-center mb-5">
                  <div
                    className="w-16 h-16 rounded-full p-[2.5px] flex items-center justify-center transition-transform hover:scale-105"
                    style={{ background: tier.gradient }}
                  >
                    <div className="w-full h-full rounded-full bg-[var(--bg-elevated)] flex items-center justify-center font-bold text-xs text-[var(--text-primary)]">
                      ✦
                    </div>
                  </div>
                </div>

                <div className="text-center mb-4">
                  <h3 className="font-display font-bold text-lg text-[var(--text-primary)]">
                    {tier.tier}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    {tier.desc}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--border-subtle)] space-y-1.5 text-[11px] font-mono">
                <div className="text-[var(--text-muted)]">
                  <span className="text-[var(--text-primary)] font-semibold">Finish:</span>{" "}
                  {theme === "light" ? tier.lightFinish : tier.darkFinish}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: BUTTON & INTERACTION SYSTEM */}
      <section className="mb-20">
        <div className="flex items-center gap-3 mb-8">
          <Zap className="w-5 h-5 text-[var(--accent-magenta)]" />
          <h2 className="text-2xl font-bold font-display text-[var(--text-primary)]">
            Tactile Controls & Material Buttons
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Primary */}
          <div className="p-7 rounded-2xl glass-card border border-[var(--glass-border)]">
            <span className="label-mono !text-[10px] text-[var(--accent-primary)] mb-2 block">
              ACTION PRIMARY
            </span>
            <h3 className="font-display font-semibold text-base text-[var(--text-primary)] mb-2">
              Luminous Pill
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mb-6">
              Features specular top bevel reflection, brand gradient fill, and tinted contact shadow.
            </p>
            <div className="flex items-center gap-3">
              <button className="btn-primary">
                <span>Start building</span>
                <span className="text-[var(--accent-cyan)] text-xs">✦</span>
              </button>
            </div>
          </div>

          {/* Ghost */}
          <div className="p-7 rounded-2xl glass-card border border-[var(--glass-border)]">
            <span className="label-mono !text-[10px] text-[var(--text-muted)] mb-2 block">
              SECONDARY GHOST
            </span>
            <h3 className="font-display font-semibold text-base text-[var(--text-primary)] mb-2">
              Hairline Pill
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mb-6">
              Translucent resting surface with crisp border-subtle and smooth hover fill.
            </p>
            <div className="flex items-center gap-3">
              <button className="btn-ghost">
                <span>Explore creators</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Cyber / Monospace */}
          <div className="p-7 rounded-2xl glass-card border border-[var(--glass-border)]">
            <span className="label-mono !text-[10px] text-[var(--accent-cyan)] mb-2 block">
              TELEMETRY ACTION
            </span>
            <h3 className="font-display font-semibold text-base text-[var(--text-primary)] mb-2">
              Monospace Terminal
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mb-6">
              Cyan perimeter glow with high-contrast text and inset illumination.
            </p>
            <div className="flex items-center gap-3">
              <button className="btn-cyber">
                <span>INIT_TRANSMISSION</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: COLOR RAMPS & WCAG METRICS */}
      <section>
        <div className="flex items-center gap-3 mb-8">
          <Palette className="w-5 h-5 text-[var(--accent-emerald)]" />
          <h2 className="text-2xl font-bold font-display text-[var(--text-primary)]">
            Semantic OKLCH Ramp & Accessibility
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse rounded-2xl overflow-hidden glass-card border border-[var(--glass-border)]">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-deep)] text-xs font-mono text-[var(--text-muted)] uppercase">
                <th className="p-4">Token Name</th>
                <th className="p-4">Visual Swatch</th>
                <th className="p-4">Role</th>
                <th className="p-4">WCAG Standard</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)] text-xs font-mono">
              <tr>
                <td className="p-4 font-bold text-[var(--text-primary)]">--text-primary</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md border border-[var(--border-subtle)] bg-[var(--text-primary)] inline-block" />
                    <span>Deep Ink / Void Glow</span>
                  </div>
                </td>
                <td className="p-4 text-[var(--text-secondary)]">Headlines, main titles, core actions</td>
                <td className="p-4 text-emerald-500 font-bold">15.2:1 (Passes AAA)</td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-[var(--text-primary)]">--text-secondary</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md border border-[var(--border-subtle)] bg-[var(--text-secondary)] inline-block" />
                    <span>Slate Ink</span>
                  </div>
                </td>
                <td className="p-4 text-[var(--text-secondary)]">Body text, descriptions, navigation</td>
                <td className="p-4 text-emerald-500 font-bold">7.4:1 (Passes AAA)</td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-[var(--text-primary)]">--accent-primary</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md border border-[var(--border-subtle)] bg-[var(--accent-primary)] inline-block" />
                    <span>Electric Violet</span>
                  </div>
                </td>
                <td className="p-4 text-[var(--text-secondary)]">Primary CTAs, active indicators, brand accent</td>
                <td className="p-4 text-emerald-500 font-bold">6.1:1 (Passes AA)</td>
              </tr>
              <tr>
                <td className="p-4 font-bold text-[var(--text-primary)]">--accent-cyan</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md border border-[var(--border-subtle)] bg-[var(--accent-cyan)] inline-block" />
                    <span>Azure Sapphire</span>
                  </div>
                </td>
                <td className="p-4 text-[var(--text-secondary)]">✦ Star accent, verified checks, telemetry</td>
                <td className="p-4 text-emerald-500 font-bold">4.8:1 (Passes AA)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
