"use client";

import { motion } from "framer-motion";
import {
  Layers,
  Sparkles,
  MessageSquare,
  Trophy,
  ShieldCheck,
  Globe,
} from "lucide-react";

const FEATURES = [
  {
    icon: Layers,
    title: "Creator Portfolio Engine",
    description:
      "A living portfolio that auto-curates your best work, tells your story, and evolves with your skills.",
    color: "#6c5ce7",
    glow: "rgba(108,92,231,0.2)",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Discovery",
    description:
      "Our semantic matching algorithm surfaces creators and collabs that align with your actual work and goals.",
    color: "#00d2ff",
    glow: "rgba(0,210,255,0.2)",
  },
  {
    icon: MessageSquare,
    title: "Real-Time Collab Rooms",
    description:
      "Brainstorm, share files, and ship projects together in persistent collab spaces built for async-first teams.",
    color: "#fd79a8",
    glow: "rgba(253,121,168,0.2)",
  },
  {
    icon: Trophy,
    title: "Reputation Score",
    description:
      "An on-chain reputation system that tracks your contributions, collaborations, and community impact.",
    color: "#fdcb6e",
    glow: "rgba(253,203,110,0.2)",
  },
  {
    icon: ShieldCheck,
    title: "Verified Credentials",
    description:
      "Link your GitHub, Dribbble, and academic credentials to build a verified, tamper-proof identity.",
    color: "#00cec9",
    glow: "rgba(0,206,201,0.2)",
  },
  {
    icon: Globe,
    title: "Global Creator Map",
    description:
      "Browse creators by location, skill, or vibe. Find your city's scene or go fully remote.",
    color: "#a29bfe",
    glow: "rgba(162,155,254,0.2)",
  },
];

export default function FeaturesSection() {
  return (
    <section
      className="py-24 px-4 sm:px-6 relative"
      style={{
        background:
          "radial-gradient(ellipse 100% 60% at 50% 0%, rgba(108,92,231,0.06) 0%, transparent 70%)",
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="label-mono mb-4">Platform Features</p>
          <h2 className="display-lg mb-6" style={{ color: "var(--text-primary)" }}>
            Built for how creators
            <br />
            <span className="gradient-text">actually work</span>
          </h2>
          <p
            className="text-base max-w-xl mx-auto"
            style={{ color: "var(--text-secondary)" }}
          >
            CORELX combines portfolio, network, and collaboration tools into one
            seamless layer — no more juggling six different platforms.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="relative rounded-2xl p-6 group overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, rgba(15,15,35,0.9) 0%, rgba(10,10,25,0.95) 100%)",
                border: "1px solid rgba(255,255,255,0.04)",
              }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "100px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ borderColor: `${feature.color}40`, y: -4 }}
            >
              {/* Corner glow on hover */}
              <div
                className="absolute -top-12 -left-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl pointer-events-none"
                style={{ background: feature.glow }}
              />

              {/* Icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 relative"
                style={{
                  background: `${feature.glow}`,
                  border: `1px solid ${feature.color}30`,
                }}
              >
                <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
              </div>

              <h3
                className="text-base font-semibold mb-3"
                style={{
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-display)",
                }}
              >
                {feature.title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--text-muted)" }}
              >
                {feature.description}
              </p>

              {/* Bottom accent line */}
              <div
                className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: `linear-gradient(90deg, transparent, ${feature.color}, transparent)`,
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
