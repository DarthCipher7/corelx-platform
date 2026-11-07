import type { Metadata } from "next";
import Link from "next/link";
import {
  Sparkles,
  Zap,
  Eye,
  Heart,
  Users,
  Briefcase,
  ArrowRight,
  Mail,
  Code2,
  Compass,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Careers — CORELX",
  description:
    "Join the CORELX team. Build the creator platform for the next generation.",
  openGraph: {
    title: "Careers — CORELX",
    description: "Join the CORELX team. Build the creator platform for the next generation.",
    type: "website",
  },
};

interface OpenRole {
  title: string;
  type: string;
  location: string;
  skills: string[];
  description: string;
}

const VALUES = [
  {
    title: "Move Fast",
    desc: "Prototype ruthlessly. Ship continuously. We favor working software over lengthy committee meetings.",
    icon: Zap,
    color: "#6c5ce7",
  },
  {
    title: "Build in Public",
    desc: "Share progress, celebrate mistakes, and maintain complete transparency with our creator community.",
    icon: Eye,
    color: "#00d2ff",
  },
  {
    title: "Creator-First",
    desc: "Every single feature must empower builders and squads, never optimize for algorithmic rage bait.",
    icon: Heart,
    color: "#fd79a8",
  },
  {
    title: "Small Team, Big Heart",
    desc: "Zero corporate politics. Deep respect for craft. Extreme autonomy with high mutual accountability.",
    icon: Users,
    color: "#00cec9",
  },
];

const OPEN_ROLES: OpenRole[] = [
  {
    title: "Frontend Engineer",
    type: "Part-time / Remote",
    location: "Global Remote (India friendly hours)",
    skills: ["Next.js 16", "React 19", "Framer Motion", "Tailwind CSS v4", "TypeScript"],
    description:
      "Craft fluid micro-interactions, responsive cyber-minimalist layouts, and hardware-accelerated media players for web and mobile.",
  },
  {
    title: "Product Designer",
    type: "Part-time / Contract",
    location: "Global Remote",
    skills: ["Design Systems", "Figma", "Cyber-Minimalism", "Motion Prototyping"],
    description:
      "Design the visual language of Flares, Traces, and Showcase. Define dark-mode surfaces, tactile glass cards, and Aura milestone visuals.",
  },
  {
    title: "Growth & Campus Ambassador",
    type: "Part-time / Hybrid",
    location: "Bangalore / Delhi / Mumbai / Chennai",
    skills: ["Community Building", "Hackathon Activation", "Creator Outreach"],
    description:
      "Activate grassroots campus developer guilds, onboard collegiate design clubs, and curate regional Collab Board bounties.",
  },
  {
    title: "Backend Engineer",
    type: "Part-time / Remote",
    location: "Global Remote",
    skills: ["Supabase", "PostgreSQL", "Edge Functions", "Media Ingestion", "Redis"],
    description:
      "Scale our real-time websocket subscriptions, optimize reputation calculation jobs, and construct video transcoding pipelines.",
  },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-void)] text-[var(--text-primary)] pt-28 pb-32 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div
        className="absolute top-10 left-1/2 -translate-x-1/2 w-[850px] h-[450px] pointer-events-none opacity-20 blur-[140px]"
        style={{
          background: "radial-gradient(circle, #6c5ce7 0%, #00d2ff 60%, transparent 80%)",
        }}
      />
      <div className="absolute inset-0 dot-bg opacity-30 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Hero Section */}
        <div className="max-w-3xl mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono mb-4 border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent-cyan)]" />
            <span className="text-[var(--accent-cyan)] uppercase tracking-wider">Collective Craft</span>
          </div>
          <h1
            className="text-4xl sm:text-6xl font-bold tracking-tight mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Build the platform you <span className="gradient-text">wish existed.</span>
          </h1>
          <p className="text-lg sm:text-xl text-[var(--text-secondary)] leading-relaxed">
            We are a small, tight-knit crew reshaping how the next generation creates, discovers peers, and proves their reputation. No corporate bureaucracy. Just pure craft.
          </p>
        </div>

        {/* Culture / Values Block */}
        <section className="mb-24">
          <div className="mb-10">
            <span className="text-xs font-mono uppercase tracking-wider text-[var(--accent-cyan)]">
              How We Work
            </span>
            <h2
              className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mt-1"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Our Operational Values
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v) => {
              const Icon = v.icon;
              return (
                <div
                  key={v.title}
                  className="p-6 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-card-bg)] flex flex-col justify-between"
                >
                  <div>
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 text-[var(--text-primary)]"
                      style={{
                        background: `linear-gradient(135deg, ${v.color}, #0a0a18)`,
                        boxShadow: `0 0 16px ${v.color}35`,
                      }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-[var(--text-primary)] mb-2">{v.title}</h3>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                      {v.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Open Roles Section (Framed as Open Collaborations) */}
        <section className="mb-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--accent-primary)]">
                Active Openings
              </span>
              <h2
                className="text-2xl sm:text-4xl font-bold text-[var(--text-primary)] mt-1"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Open Collaborations
              </h2>
            </div>
            <p className="text-xs font-mono text-[var(--text-muted)]">
              All roles support flexible, remote student &amp; part-time schedules
            </p>
          </div>

          <div className="space-y-4">
            {OPEN_ROLES.map((role) => (
              <div
                key={role.title}
                className="p-6 sm:p-8 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-card-bg)] hover:border-[var(--accent-primary)] transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="max-w-2xl">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3
                      className="text-xl font-bold text-[var(--text-primary)]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {role.title}
                    </h3>
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] border border-[var(--accent-primary)]/30">
                      {role.type}
                    </span>
                    <span className="text-xs font-mono text-[var(--text-muted)]">
                      {role.location}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
                    {role.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {role.skills.map((s) => (
                      <span
                        key={s}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-deep)] text-[var(--text-secondary)] border border-[var(--border-subtle)]"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <Link
                    href="/collabs"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-mono font-bold text-[var(--text-primary)] transition-transform hover:scale-105 whitespace-nowrap"
                    style={{
                      background: "linear-gradient(135deg, #6c5ce7, #00d2ff)",
                    }}
                  >
                    <span>Apply via Collab Board</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* General Application Block */}
        <section
          className="rounded-3xl p-8 sm:p-12 border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-center relative overflow-hidden"
        >
          <div className="max-w-lg mx-auto">
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-deep)] border border-[var(--border-subtle)] flex items-center justify-center mx-auto mb-3 text-[var(--accent-cyan)]">
              <Mail className="w-5 h-5" />
            </div>
            <h3
              className="text-2xl font-bold text-[var(--text-primary)] mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Don&apos;t see your specific role?
            </h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
              We are constantly scouting for exceptional engineers, shader wizards, motion artists, and community captains.
            </p>
            <a
              href="mailto:careers@corelx.app"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-mono font-bold text-[var(--text-primary)] border border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10 hover:bg-[var(--accent-cyan)]/20 transition-colors"
            >
              <span>Email careers@corelx.app</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
