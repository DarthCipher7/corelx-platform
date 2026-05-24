"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

const SKILLS_MARQUEE = [
  "UI Design", "Motion", "Three.js", "Blender", "TypeScript", "Rust", "Python",
  "AI/ML", "Brand Identity", "WebGL", "Next.js", "Figma", "Framer", "After Effects",
  "Houdini", "GLSL", "Web3", "Solidity", "React", "Cinema4D", "Substance",
];

function MarqueeRow({ reverse = false }: { reverse?: boolean }) {
  const doubled = [...SKILLS_MARQUEE, ...SKILLS_MARQUEE];
  return (
    <div className="flex overflow-hidden">
      <motion.div
        className="flex gap-3 flex-shrink-0"
        animate={{ x: reverse ? ["0%", "50%"] : ["0%", "-50%"] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      >
        {doubled.map((skill, i) => (
          <span
            key={i}
            className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium"
            style={{
              background: "rgba(108,92,231,0.08)",
              border: "1px solid rgba(108,92,231,0.15)",
              color: "var(--text-secondary)",
              whiteSpace: "nowrap",
            }}
          >
            {skill}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export default function CTASection() {
  return (
    <section className="py-24 px-4 sm:px-6 relative overflow-hidden">
      {/* Background pulse */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 70% at 50% 50%, rgba(108,92,231,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-7xl mx-auto">
        {/* Marquee rows */}
        <div className="flex flex-col gap-3 mb-24 opacity-60">
          <MarqueeRow />
          <MarqueeRow reverse />
        </div>

        {/* CTA block */}
        <motion.div
          className="relative rounded-3xl overflow-hidden text-center p-8 md:p-16"
          style={{
            background:
              "linear-gradient(135deg, rgba(108,92,231,0.15) 0%, rgba(0,210,255,0.08) 50%, rgba(253,121,168,0.08) 100%)",
            border: "1px solid rgba(108,92,231,0.25)",
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "100px" }}
          transition={{ duration: 0.6 }}
        >
          {/* Animated glow orbs inside card */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div
              className="absolute rounded-full blur-3xl"
              style={{
                width: "400px",
                height: "400px",
                top: "-100px",
                left: "-100px",
                background: "radial-gradient(circle, rgba(108,92,231,0.2), transparent 70%)",
                animation: "float 8s ease-in-out infinite",
              }}
            />
            <div
              className="absolute rounded-full blur-3xl"
              style={{
                width: "300px",
                height: "300px",
                bottom: "-80px",
                right: "-80px",
                background: "radial-gradient(circle, rgba(0,210,255,0.15), transparent 70%)",
                animation: "float 10s ease-in-out 3s infinite",
              }}
            />
          </div>

          <div className="relative z-10">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm font-medium"
              style={{
                background: "rgba(108,92,231,0.15)",
                border: "1px solid rgba(108,92,231,0.3)",
                color: "#a29bfe",
              }}
              animate={{ boxShadow: ["0 0 0px rgba(108,92,231,0)", "0 0 20px rgba(108,92,231,0.3)", "0 0 0px rgba(108,92,231,0)"] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Sparkles className="w-4 h-4" />
              Limited Early Access — Join 48,000+ creators
            </motion.div>

            <h2
              className="display-lg mb-6"
              style={{ color: "var(--text-primary)" }}
            >
              Your legacy starts
              <br />
              <span className="gradient-text-cyber">on CORELX</span>
            </h2>

            <p
              className="text-lg max-w-lg mx-auto mb-10"
              style={{ color: "var(--text-secondary)" }}
            >
              Stop scattering your work across a dozen platforms.
              CORELX is your unified identity as a creator — built for the age of AI.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup" className="block sm:inline-block w-full sm:w-auto">
                <motion.div
                  className="btn-primary inline-flex items-center justify-center gap-2 w-full sm:w-auto"
                  style={{ fontSize: "15px", padding: "14px 32px" }}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Sparkles className="w-4 h-4" />
                  Get Early Access
                  <ArrowRight className="w-4 h-4" />
                </motion.div>
              </Link>
              <p className="text-sm" style={{ color: "var(--text-dim)" }}>
                Free forever · No credit card · Ship in 5 minutes
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
