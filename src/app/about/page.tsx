"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  Flame,
  Clock,
  Users,
  Compass,
  Code2,
  Heart,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-void)] text-[var(--text-primary)] pt-28 pb-32 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div
        className="absolute top-10 left-1/2 -translate-x-1/2 w-[900px] h-[500px] pointer-events-none opacity-20 blur-[150px]"
        style={{
          background: "radial-gradient(circle, #6c5ce7 0%, #00d2ff 60%, transparent 80%)",
        }}
      />
      <div className="absolute inset-0 dot-bg opacity-30 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Hero Section */}
        <header className="mb-20 sm:mb-28">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono mb-6 border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent-cyan)]" />
            <span className="text-[var(--accent-cyan)] uppercase tracking-wider">Manifesto</span>
          </div>

          <h1
            className="text-4xl sm:text-7xl font-bold tracking-tight mb-8 leading-[1.08]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            We built CORELX because{" "}
            <span className="gradient-text">creators deserved better.</span>
          </h1>

          <p className="text-xl sm:text-2xl text-[var(--text-secondary)] font-normal leading-relaxed max-w-3xl">
            Identity shouldn&apos;t be a corporate résumé. Reputation shouldn&apos;t be bought with blue checks. Creative work shouldn&apos;t drown under algorithmic noise.
          </p>
        </header>

        {/* Section 1: The Problem */}
        <section className="mb-24 space-y-6">
          <span className="text-xs font-mono uppercase tracking-widest text-[var(--accent-cyan)] block">
            01 / The Fragmentation Trap
          </span>
          <h2
            className="text-2xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Shattered across a dozen tabs.
          </h2>

          <div className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed space-y-5">
            <p>
              If you are a student or young creator today, your creative life is scattered across five different corporate silos that never speak to each other.
            </p>
            <p>
              You post stiff headshots and hollow career updates on LinkedIn to appease corporate recruiters. You post aesthetic stories on Instagram for your friends. You commit code to GitHub that nobody outside engineering knows how to evaluate. You upload visual drafts to Dribbble or Behance, where they get buried under agency case studies. And when you want to actually build something real on your campus, you are stuck scrambling through a chaotic WhatsApp group with 400 unread messages.
            </p>
            <p className="text-[var(--text-primary)] font-medium">
              None of these platforms talk to each other. More critically: none of them understand what a builder actually is.
            </p>
          </div>
        </section>

        {/* Large Editorial Pull Quote */}
        <div
          className="my-20 p-8 sm:p-14 rounded-3xl border border-[var(--border-glow)] relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(15,15,35,0.85) 0%, rgba(10,10,25,0.95) 100%)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
          }}
        >
          <div
            className="absolute top-0 right-0 w-64 h-64 opacity-20 blur-3xl pointer-events-none"
            style={{ background: "#00d2ff" }}
          />
          <blockquote className="relative z-10 text-2xl sm:text-3xl font-semibold text-[var(--text-primary)] leading-relaxed tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            &ldquo;Where a designer at a tier-3 college has the exact same visibility as one at an elite institute. Where output speaks louder than institutional pedigree.&rdquo;
          </blockquote>
          <p className="text-xs font-mono text-[var(--accent-cyan)] mt-6 uppercase tracking-wider">
            — The Founding Premise
          </p>
        </div>

        {/* Section 2: The Mission */}
        <section className="mb-24 space-y-6">
          <span className="text-xs font-mono uppercase tracking-widest text-[var(--accent-primary)] block">
            02 / The Mission
          </span>
          <h2
            className="text-2xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            One unified identity layer.
          </h2>

          <div className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed space-y-5">
            <p>
              CORELX was built to be the single source of truth for the creative generation. One surface where your skills, living work, verifiable reputation, and squad workspaces live together seamlessly.
            </p>
            <p>
              We believe discovery shouldn&apos;t depend on who you know or what university name is stamped on your badge. If an 18-year-old self-taught animator in Kochi produces mind-bending 3D motion work, they should be discovered with the exact same velocity as an engineering graduate in Bangalore.
            </p>
          </div>
        </section>

        {/* Section 3: The Architecture */}
        <section className="mb-24 space-y-8">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#00cec9] block mb-2">
              03 / The Integrated Stack
            </span>
            <h2
              className="text-2xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Everything connected. Nothing siloed.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--glass-border)]">
              <div className="flex items-center gap-2 text-[var(--accent-primary)] font-bold mb-2">
                <Flame className="w-4 h-4" />
                <h3 className="text-base">Flares &amp; Traces</h3>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Vertical video for real craft timelapses, paired with 24-hour ephemeral sparks for zero permanent clutter.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--glass-border)]">
              <div className="flex items-center gap-2 text-[var(--accent-cyan)] font-bold mb-2">
                <Layers className="w-4 h-4" />
                <h3 className="text-base">Showcase</h3>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                A living portfolio that auto-curates your best builds, WebGL shaders, repositories, and case studies into one custom handle.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--glass-border)]">
              <div className="flex items-center gap-2 text-[#fd79a8] font-bold mb-2">
                <Users className="w-4 h-4" />
                <h3 className="text-base">Pods</h3>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Persistent squad rooms and campus club workspaces replacing chaotic WhatsApp chat groups with structured feeds.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--glass-border)]">
              <div className="flex items-center gap-2 text-[#fdcb6e] font-bold mb-2">
                <Shield className="w-4 h-4" />
                <h3 className="text-base">Aura &amp; Collabs</h3>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Verifiable reputation earned through peer collaboration and shipping, powering smart matchmaking on Collab Board.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Who It's For */}
        <section className="mb-24 space-y-6">
          <span className="text-xs font-mono uppercase tracking-widest text-[#fd79a8] block">
            04 / The Builders
          </span>
          <h2
            className="text-2xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Who we build for.
          </h2>

          <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
            CORELX is for the people who make things. Designers pushing typographic boundaries. Engineers architecting distributed protocols. Filmmakers staging virtual productions. Sound designers programming modular synthesizers. Writers documenting emerging culture. Anyone creating something that matters.
          </p>
        </section>

        {/* Section 5: The Team */}
        <section className="mb-28 p-8 sm:p-12 rounded-3xl border border-[var(--border-subtle)] bg-[var(--glass-card-bg)]">
          <span className="text-xs font-mono uppercase tracking-widest text-[var(--accent-cyan)] block mb-2">
            05 / Core Conviction
          </span>
          <h2
            className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            A small team with big conviction.
          </h2>

          <div className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed space-y-4">
            <p>
              We are not a bloated corporate committee optimizing for ad clickthrough rates. We are a small, hyper-focused team of engineers, designers, and campus alumni who experienced firsthand how painful it is to be a young creator navigating outdated professional networks.
            </p>
            <p>
              We ship quickly. We iterate in the open. And we listen obsessively to every single student builder in the network.
            </p>
          </div>

          <div className="pt-6 mt-6 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono">
            <span className="text-[var(--text-muted)]">Operating from Bangalore &amp; Remote</span>
            <span className="text-[var(--accent-cyan)]">Built for the Global Web</span>
          </div>
        </section>

        {/* Primary CTA */}
        <div className="text-center pt-8 border-t border-[var(--border-subtle)]">
          <h3
            className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Build your legacy on <span className="gradient-text">CORELX.</span>
          </h3>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-lg mx-auto mb-8">
            Early access is open for student builders, campus collectives, and creative squads.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-bold text-[var(--text-primary)] transition-transform hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #6c5ce7, #00d2ff)",
              boxShadow: "0 0 25px rgba(108,92,231,0.5)",
            }}
          >
            <span>Claim Your Creator Handle</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
