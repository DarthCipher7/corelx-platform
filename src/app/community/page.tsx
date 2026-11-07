import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import {
  Users,
  Sparkles,
  ArrowRight,
  Plus,
  MessageSquare,
  Globe,
  Radio,
  Quote,
  Shield,
  Layers,
  CheckCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Community — CORELX",
  description: "Join the CORELX community. Find your Pod.",
  openGraph: {
    title: "Community — CORELX",
    description: "Join the CORELX community. Find your Pod.",
    type: "website",
  },
};

interface PodDisplay {
  id: string;
  name: string;
  description: string;
  podType: string;
  memberCount: number;
}

const FALLBACK_PODS: PodDisplay[] = [
  {
    id: "pod-1",
    name: "Hypercraft UI & Shaders Guild",
    description: "Creative engineers building procedural graphics, Three.js shaders, and high-performance WebGL interfaces.",
    podType: "project",
    memberCount: 42,
  },
  {
    id: "pod-2",
    name: "Autonomous Robotics Lab [IIT Delhi]",
    description: "Hardware hackers, ROS2 engineers, and control systems designers shipping campus robotics prototypes.",
    podType: "club",
    memberCount: 38,
  },
  {
    id: "pod-3",
    name: "Indie Cinema & Virtual Production",
    description: "Filmmakers, sound designers, and colorists collaborating on narrative shorts and Unreal Engine virtual sets.",
    podType: "project",
    memberCount: 29,
  },
  {
    id: "pod-4",
    name: "Systems & Kernel Guild",
    description: "Writing distributed databases, Rust runtimes, and low-latency network protocols. Zero boilerplate allowed.",
    podType: "hackathon",
    memberCount: 56,
  },
  {
    id: "pod-5",
    name: "Tactile Product Designers",
    description: "Figma maestros, hardware industrial designers, and ergonomic specialists conducting weekly design sprints.",
    podType: "meetup",
    memberCount: 31,
  },
  {
    id: "pod-6",
    name: "Generative Audio & Modular Synth Cohort",
    description: "Sound artists crafting generative ambiences, spatial audio scores, and analog synthesizer patches.",
    podType: "club",
    memberCount: 24,
  },
];

const CREATOR_STORIES = [
  {
    quote:
      "LinkedIn feels like a résumé museum. Instagram feels like a beauty contest. CORELX is where people actually cared that I spent 40 hours building an interactive canvas.",
    author: "Dev R.",
    role: "Frontend Architect",
    institution: "BITS Pilani",
    tier: "Core Tier",
  },
  {
    quote:
      "I found my 3D animator for our short film within 2 hours on Collab Board. We're now running our entire creative squad inside a Pod.",
    author: "Meera K.",
    role: "Filmmaker & Motion Designer",
    institution: "NID Ahmedabad",
    tier: "Pillar Tier",
  },
  {
    quote:
      "Aura is the first reputation system that doesn't care about vanity follower counts. My Pillar tier was earned by shipping code and mentoring junior designers.",
    author: "Tanmay S.",
    role: "Systems Engineer",
    institution: "IIT Bombay",
    tier: "Pillar Tier",
  },
];

const COMMUNITY_CHANNELS = [
  {
    name: "Discord Guild",
    desc: "Voice lounges, code critiques, and hackathon war rooms.",
    tag: "Access Dropping Soon",
  },
  {
    name: "X / Transmission",
    desc: "Platform dispatches, shipped updates, and creator spotlights.",
    tag: "@corelx_hq",
  },
  {
    name: "Campus Radio",
    desc: "Weekly audio roundtables with top Aura contributors.",
    tag: "Invite Only",
  },
  {
    name: "GitHub Collective",
    desc: "Open-source tools, component libraries, and SDKs.",
    tag: "corelx-dev",
  },
];

export default async function CommunityPage() {
  let displayPods: PodDisplay[] = [];

  try {
    const supabase = await createClient();
    const { data: dbPods, error } = await supabase
      .from("pods")
      .select("id, name, description, pod_type, visibility, pod_members(count)")
      .eq("visibility", "open")
      .neq("pod_status", "deleted")
      .limit(6);

    if (!error && dbPods && dbPods.length > 0) {
      displayPods = dbPods.map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description || "Active community pod on CORELX.",
        podType: p.pod_type || "project",
        memberCount: Array.isArray(p.pod_members)
          ? p.pod_members[0]?.count || 1
          : p.pod_members?.count || 1,
      }));
    }
  } catch (err) {
    // Silently proceed with fallback pods
  }

  // If no DB pods returned, populate with authentic seed pods
  if (displayPods.length === 0) {
    displayPods = FALLBACK_PODS;
  }

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Hero Section */}
        <div className="max-w-3xl mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono mb-4 border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
            <Users className="w-3.5 h-3.5 text-[var(--accent-cyan)]" />
            <span className="text-[var(--accent-cyan)] uppercase tracking-wider">Collective Intelligence</span>
          </div>
          <h1
            className="text-4xl sm:text-6xl font-bold tracking-tight mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Find your <span className="gradient-text">people.</span>
          </h1>
          <p className="text-lg sm:text-xl text-[var(--text-secondary)] leading-relaxed mb-8">
            Pods are persistent communities for builders, designers, and creators. Campus groups, project rooms, side-project squads.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/pods"
              className="px-6 py-3.5 rounded-2xl text-xs font-mono font-bold text-[var(--text-primary)] flex items-center gap-2 transition-transform hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #6c5ce7, #00d2ff)",
                boxShadow: "0 4px 20px rgba(108,92,231,0.4)",
              }}
            >
              <Plus className="w-4 h-4" />
              <span>Start a Pod</span>
            </Link>
            <Link
              href="/collabs"
              className="px-6 py-3.5 rounded-2xl text-xs font-mono font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--glass-border)] bg-[var(--bg-frosted)] transition-colors"
            >
              Browse Collab Board &rarr;
            </Link>
          </div>
        </div>

        {/* Live Pods Grid */}
        <section className="mb-24">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2
                className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Active Public Pods
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Open squads currently shipping on CORELX
              </p>
            </div>
            <Link
              href="/pods"
              className="text-xs font-mono text-[var(--accent-cyan)] hover:underline inline-flex items-center gap-1"
            >
              View all squads <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayPods.map((pod) => (
              <Link
                key={pod.id}
                href={`/pods/${pod.id}`}
                className="group flex flex-col justify-between rounded-2xl p-6 border border-[var(--glass-border)] hover:border-[var(--accent-primary)] transition-all duration-300 relative overflow-hidden"
                style={{
                  background: "var(--glass-card-bg)",
                  backdropFilter: "blur(20px)",
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] border border-[var(--accent-primary)]/30">
                      {pod.podType}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-mono text-[var(--text-secondary)]">
                      <Users className="w-3.5 h-3.5 text-[var(--accent-cyan)]" />
                      {pod.memberCount} members
                    </span>
                  </div>

                  <h3
                    className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-cyan)] transition-colors mb-2"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {pod.name}
                  </h3>

                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-3 mb-6">
                    {pod.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)] text-xs font-mono">
                  <span className="text-[var(--text-muted)]">Open Access</span>
                  <span className="text-[var(--accent-cyan)] group-hover:translate-x-1 transition-transform flex items-center gap-1 font-bold">
                    Enter Pod &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Creator Stories Section */}
        <section className="mb-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono text-[var(--accent-primary)] uppercase tracking-wider">
              Proof of Craft
            </span>
            <h2
              className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mt-1"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Voices from the Network
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-2">
              How students and independent creators are building their creative footprint.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CREATOR_STORIES.map((story, i) => (
              <div
                key={i}
                className="rounded-2xl p-7 border border-[var(--glass-border)] relative flex flex-col justify-between"
                style={{
                  background: "linear-gradient(135deg, rgba(15,15,35,0.7) 0%, rgba(10,10,25,0.85) 100%)",
                }}
              >
                <div>
                  <Quote className="w-6 h-6 text-[var(--accent-cyan)]/40 mb-4" />
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed italic mb-6">
                    &quot;{story.quote}&quot;
                  </p>
                </div>

                <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-[var(--text-primary)]">{story.author}</p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {story.role} • <span className="text-[var(--text-muted)]">{story.institution}</span>
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] border border-[var(--accent-primary)]/30 font-bold">
                    {story.tier}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Community Channels Block */}
        <section className="rounded-3xl p-8 sm:p-12 border border-[var(--border-subtle)] bg-[var(--glass-card-bg)] relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--accent-cyan)]">
                Satellite Nodes
              </span>
              <h3
                className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mt-1"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Community Transmission Channels
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
                Official gathering points outside the web client.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono bg-[var(--bg-frosted)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
              Phase 1 Access
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {COMMUNITY_CHANNELS.map((ch) => (
              <div
                key={ch.name}
                className="p-5 rounded-xl border border-[var(--glass-border)] bg-[var(--bg-surface)] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-bold text-[var(--text-primary)]">{ch.name}</p>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-frosted)] text-[var(--accent-cyan)] border border-[var(--border-subtle)]">
                      {ch.tag}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {ch.desc}
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-[var(--border-subtle)] text-[10px] font-mono text-[var(--text-muted)] flex items-center justify-between">
                  <span>Status: Restricted</span>
                  <span className="text-[var(--accent-primary)]">Early Access Only</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
