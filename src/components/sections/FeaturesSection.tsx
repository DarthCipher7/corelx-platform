"use client";

import { motion } from "framer-motion";
import {
  IconVideo,
  IconSparkles,
  IconStar,
  IconUsers,
  IconBriefcase,
  IconLayoutGrid,
  IconBolt,
  IconShield,
} from "@tabler/icons-react";

export default function FeaturesSection() {
  return (
    <section className="py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Signature ✦ section transition divider */}
      <div className="max-w-7xl mx-auto mb-16 flex items-center justify-start gap-4">
        <div className="flex items-center gap-2.5 px-3.5 py-1 rounded-full border border-[rgba(108,92,231,0.25)] bg-[rgba(15,15,35,0.7)] backdrop-blur-md">
          <span className="text-[#00d2ff] text-xs">✦</span>
          <span className="label-mono !text-[11px] text-[var(--text-secondary)]">
            CORE ARCHITECTURE
          </span>
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-[rgba(108,92,231,0.25)] to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Section header: Left-aligned, NOT centered */}
        <div className="mb-14 text-left max-w-3xl">
          <p className="label-mono mb-3">Platform</p>
          <h2 className="display-lg text-[var(--text-primary)] tracking-tight">
            Everything a creator needs.
            <br />
            <span className="gradient-text">Nothing more.</span>
          </h2>
        </div>

        {/* BENTO GRID:
            Row 1: Flares (2 cols) | Aura (1 col)
            Row 2: Collab Board (1 col) | Pods (2 cols)
            Row 3: Traces (1 col) | Showcase (1 col) | Reach (1 col)
            SafeMode: full-width bottom card (3 cols)
        */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* 1. FLARES (Row 1: wide, 2 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ scale: 1.02 }}
            className="group relative rounded-2xl p-7 lg:col-span-2 overflow-hidden glass-card transition-all duration-300 hover:border-[#6c5ce7] hover:shadow-[0_0_30px_rgba(108,92,231,0.25)] flex flex-col justify-between"
          >
            {/* Ambient hover glow */}
            <div
              className="absolute -top-16 -right-16 w-44 h-44 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl pointer-events-none"
              style={{ background: "rgba(108,92,231,0.3)" }}
            />

            <div>
              <div className="flex items-center justify-between mb-6">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center border"
                  style={{
                    background: "rgba(108,92,231,0.12)",
                    borderColor: "rgba(108,92,231,0.35)",
                    boxShadow: "0 0 16px rgba(108,92,231,0.2)",
                  }}
                >
                  <IconVideo className="w-5 h-5 text-[#a29bfe]" />
                </div>
                <span className="font-mono text-xs uppercase tracking-wider text-[var(--text-dim)] group-hover:text-[#a29bfe] transition-colors">
                  01 // VERTICAL
                </span>
              </div>

              <h3
                className="text-xl font-bold mb-2 text-[var(--text-primary)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Flares
              </h3>
              <p className="text-sm leading-relaxed text-[var(--text-secondary)] max-w-lg">
                Short-form vertical video. Your story in 60 seconds.
              </p>
            </div>

            {/* Hover micro-demo: Pulse play button + audio bars */}
            <div className="mt-8 pt-4 border-t border-[rgba(255,255,255,0.05)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[rgba(108,92,231,0.2)] border border-[rgba(108,92,231,0.4)] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <div className="w-0 h-0 border-y-[4px] border-y-transparent border-l-[8px] border-l-[#a29bfe] ml-0.5" />
                </div>
                <div className="flex items-end gap-1 h-4">
                  {[40, 75, 55, 90, 60, 85, 45].map((h, i) => (
                    <span
                      key={i}
                      className="w-1 rounded-full bg-[#6c5ce7] opacity-60 group-hover:opacity-100 transition-all duration-300"
                      style={{
                        height: `${h}%`,
                        animation: `pulse-glow 1.5s ease-in-out ${i * 0.15}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
              <span className="font-mono text-xs text-[#00d2ff] opacity-80 group-hover:opacity-100">
                0:60 MAX ✦
              </span>
            </div>
          </motion.div>

          {/* 2. AURA (Row 1: 1 col) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ scale: 1.02 }}
            className="group relative rounded-2xl p-7 lg:col-span-1 overflow-hidden glass-card transition-all duration-300 hover:border-[#fdcb6e] hover:shadow-[0_0_30px_rgba(253,203,110,0.2)] flex flex-col justify-between"
          >
            <div
              className="absolute -top-16 -right-16 w-36 h-36 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl pointer-events-none"
              style={{ background: "rgba(253,203,110,0.25)" }}
            />

            <div>
              <div className="flex items-center justify-between mb-6">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center border"
                  style={{
                    background: "rgba(253,203,110,0.12)",
                    borderColor: "rgba(253,203,110,0.35)",
                    boxShadow: "0 0 16px rgba(253,203,110,0.2)",
                  }}
                >
                  <IconStar className="w-5 h-5 text-[#fdcb6e]" />
                </div>
                <span className="font-mono text-xs uppercase tracking-wider text-[var(--text-dim)] group-hover:text-[#fdcb6e] transition-colors">
                  02 // REPUTATION
                </span>
              </div>

              <h3
                className="text-xl font-bold mb-2 text-[var(--text-primary)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Aura
              </h3>
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                Reputation earned, not bought. Five tiers: New → Rising → Trusted → Core → Pillar.
              </p>
            </div>

            {/* Hover micro-demo: 5 tier dots that light up */}
            <div className="mt-8 pt-4 border-t border-[rgba(255,255,255,0.05)]">
              <div className="flex items-center justify-between gap-1">
                {[
                  { name: "New", color: "#a8a8c4" },
                  { name: "Rising", color: "#6c5ce7" },
                  { name: "Trusted", color: "#00d2ff" },
                  { name: "Core", color: "#fd79a8" },
                  { name: "Pillar", color: "#fdcb6e" },
                ].map((tier) => (
                  <div key={tier.name} className="flex flex-col items-center gap-1.5 flex-1">
                    <span
                      className="w-2.5 h-2.5 rounded-full transition-all duration-300 group-hover:scale-125"
                      style={{
                        backgroundColor: tier.color,
                        boxShadow: `0 0 8px ${tier.color}`,
                      }}
                    />
                    <span className="font-mono text-[9px] text-[var(--text-dim)] group-hover:text-[var(--text-secondary)]">
                      {tier.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* 3. COLLAB BOARD (Row 2: 1 col) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ scale: 1.02 }}
            className="group relative rounded-2xl p-7 lg:col-span-1 overflow-hidden glass-card transition-all duration-300 hover:border-[#fd79a8] hover:shadow-[0_0_30px_rgba(253,121,168,0.2)] flex flex-col justify-between"
          >
            <div
              className="absolute -top-16 -right-16 w-36 h-36 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl pointer-events-none"
              style={{ background: "rgba(253,121,168,0.25)" }}
            />

            <div>
              <div className="flex items-center justify-between mb-6">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center border"
                  style={{
                    background: "rgba(253,121,168,0.12)",
                    borderColor: "rgba(253,121,168,0.35)",
                    boxShadow: "0 0 16px rgba(253,121,168,0.2)",
                  }}
                >
                  <IconBriefcase className="w-5 h-5 text-[#fd79a8]" />
                </div>
                <span className="font-mono text-xs uppercase tracking-wider text-[var(--text-dim)] group-hover:text-[#fd79a8] transition-colors">
                  03 // TEAMS
                </span>
              </div>

              <h3
                className="text-xl font-bold mb-2 text-[var(--text-primary)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Collab Board
              </h3>
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                Post what you need. Find who you need. Ship together.
              </p>
            </div>

            {/* Hover micro-demo: Live match badge */}
            <div className="mt-8 pt-4 border-t border-[rgba(255,255,255,0.05)]">
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[rgba(253,121,168,0.08)] border border-[rgba(253,121,168,0.2)]">
                <span className="font-mono text-[11px] text-[var(--text-primary)]">
                  Need: Founding Designer
                </span>
                <span className="font-mono text-[10px] text-[#fd79a8] font-semibold group-hover:translate-x-1 transition-transform">
                  99% MATCH ✦
                </span>
              </div>
            </div>
          </motion.div>

          {/* 4. PODS (Row 2: wide, 2 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ scale: 1.02 }}
            className="group relative rounded-2xl p-7 lg:col-span-2 overflow-hidden glass-card transition-all duration-300 hover:border-[#00d2ff] hover:shadow-[0_0_30px_rgba(0,210,255,0.2)] flex flex-col justify-between"
          >
            <div
              className="absolute -top-16 -right-16 w-44 h-44 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl pointer-events-none"
              style={{ background: "rgba(0,210,255,0.25)" }}
            />

            <div>
              <div className="flex items-center justify-between mb-6">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center border"
                  style={{
                    background: "rgba(0,210,255,0.12)",
                    borderColor: "rgba(0,210,255,0.35)",
                    boxShadow: "0 0 16px rgba(0,210,255,0.2)",
                  }}
                >
                  <IconUsers className="w-5 h-5 text-[#00d2ff]" />
                </div>
                <span className="font-mono text-xs uppercase tracking-wider text-[var(--text-dim)] group-hover:text-[#00d2ff] transition-colors">
                  04 // SQUADS
                </span>
              </div>

              <h3
                className="text-xl font-bold mb-2 text-[var(--text-primary)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Pods
              </h3>
              <p className="text-sm leading-relaxed text-[var(--text-secondary)] max-w-lg">
                Persistent communities. Campus groups, project rooms, squads.
              </p>
            </div>

            {/* Hover micro-demo: Room pill & avatar stack */}
            <div className="mt-8 pt-4 border-t border-[rgba(255,255,255,0.05)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00d2ff] animate-ping" />
                <span className="font-mono text-xs text-[var(--text-secondary)]">
                  /corelx-builders
                </span>
              </div>
              <div className="flex items-center -space-x-2">
                {["#6c5ce7", "#00d2ff", "#fd79a8", "#fdcb6e"].map((c, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full border-2 border-[var(--bg-void)] flex items-center justify-center text-[10px] font-mono text-white font-bold group-hover:translate-x-0.5 transition-transform"
                    style={{ backgroundColor: c }}
                  >
                    ✦
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* 5. TRACES (Row 3: 1 col) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ scale: 1.02 }}
            className="group relative rounded-2xl p-7 lg:col-span-1 overflow-hidden glass-card transition-all duration-300 hover:border-[#00cec9] hover:shadow-[0_0_30px_rgba(0,206,201,0.2)] flex flex-col justify-between"
          >
            <div
              className="absolute -top-16 -right-16 w-36 h-36 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl pointer-events-none"
              style={{ background: "rgba(0,206,201,0.25)" }}
            />

            <div>
              <div className="flex items-center justify-between mb-6">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center border"
                  style={{
                    background: "rgba(0,206,201,0.12)",
                    borderColor: "rgba(0,206,201,0.35)",
                    boxShadow: "0 0 16px rgba(0,206,201,0.2)",
                  }}
                >
                  <IconSparkles className="w-5 h-5 text-[#00cec9]" />
                </div>
                <span className="font-mono text-xs uppercase tracking-wider text-[var(--text-dim)] group-hover:text-[#00cec9] transition-colors">
                  05 // EPHEMERAL
                </span>
              </div>

              <h3
                className="text-xl font-bold mb-2 text-[var(--text-primary)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Traces
              </h3>
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                Ephemeral moments. Here now, gone tomorrow.
              </p>
            </div>

            {/* Hover micro-demo: 24h countdown ring */}
            <div className="mt-8 pt-4 border-t border-[rgba(255,255,255,0.05)] flex items-center justify-between">
              <span className="font-mono text-[11px] text-[var(--text-muted)] group-hover:text-[#00cec9] transition-colors">
                24H DISSOLVE
              </span>
              <div className="w-5 h-5 rounded-full border border-dashed border-[#00cec9] animate-spin" />
            </div>
          </motion.div>

          {/* 6. SHOWCASE (Row 3: 1 col) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ scale: 1.02 }}
            className="group relative rounded-2xl p-7 lg:col-span-1 overflow-hidden glass-card transition-all duration-300 hover:border-[#a29bfe] hover:shadow-[0_0_30px_rgba(162,155,254,0.2)] flex flex-col justify-between"
          >
            <div
              className="absolute -top-16 -right-16 w-36 h-36 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl pointer-events-none"
              style={{ background: "rgba(162,155,254,0.25)" }}
            />

            <div>
              <div className="flex items-center justify-between mb-6">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center border"
                  style={{
                    background: "rgba(162,155,254,0.12)",
                    borderColor: "rgba(162,155,254,0.35)",
                    boxShadow: "0 0 16px rgba(162,155,254,0.2)",
                  }}
                >
                  <IconLayoutGrid className="w-5 h-5 text-[#a29bfe]" />
                </div>
                <span className="font-mono text-xs uppercase tracking-wider text-[var(--text-dim)] group-hover:text-[#a29bfe] transition-colors">
                  06 // PORTFOLIO
                </span>
              </div>

              <h3
                className="text-xl font-bold mb-2 text-[var(--text-primary)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Showcase
              </h3>
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                A living portfolio. Your best work, automatically curated.
              </p>
            </div>

            {/* Hover micro-demo: Mini gallery tiles */}
            <div className="mt-8 pt-4 border-t border-[rgba(255,255,255,0.05)]">
              <div className="grid grid-cols-3 gap-1.5">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-7 rounded bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] group-hover:border-[rgba(162,155,254,0.4)] transition-all flex items-center justify-center"
                  >
                    <span className="text-[9px] font-mono text-[var(--text-dim)] group-hover:text-[#a29bfe]">
                      ✦
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* 7. REACH (Row 3: 1 col) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ scale: 1.02 }}
            className="group relative rounded-2xl p-7 lg:col-span-1 overflow-hidden glass-card transition-all duration-300 hover:border-[#00d2ff] hover:shadow-[0_0_30px_rgba(0,210,255,0.2)] flex flex-col justify-between"
          >
            <div
              className="absolute -top-16 -right-16 w-36 h-36 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl pointer-events-none"
              style={{ background: "rgba(0,210,255,0.25)" }}
            />

            <div>
              <div className="flex items-center justify-between mb-6">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center border"
                  style={{
                    background: "rgba(0,210,255,0.12)",
                    borderColor: "rgba(0,210,255,0.35)",
                    boxShadow: "0 0 16px rgba(0,210,255,0.2)",
                  }}
                >
                  <IconBolt className="w-5 h-5 text-[#00d2ff]" />
                </div>
                <span className="font-mono text-xs uppercase tracking-wider text-[var(--text-dim)] group-hover:text-[#00d2ff] transition-colors">
                  07 // TELEMETRY
                </span>
              </div>

              <h3
                className="text-xl font-bold mb-2 text-[var(--text-primary)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Reach
              </h3>
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                Direct, relevant, no noise.
              </p>
            </div>

            {/* Hover micro-demo: Signal ping telemetry */}
            <div className="mt-8 pt-4 border-t border-[rgba(255,255,255,0.05)] flex items-center justify-between">
              <span className="font-mono text-[11px] text-[var(--text-muted)] group-hover:text-[#00d2ff] transition-colors">
                DIRECT DISTRIBUTION
              </span>
              <span className="font-mono text-xs text-[#00d2ff]">100% ✦</span>
            </div>
          </motion.div>

          {/* 8. SAFEMODE (Row 4: full-width bottom card, 3 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ scale: 1.01 }}
            className="group relative rounded-2xl p-7 lg:col-span-3 overflow-hidden glass-card transition-all duration-300 hover:border-[#6c5ce7] hover:shadow-[0_0_35px_rgba(108,92,231,0.22)]"
          >
            <div
              className="absolute -top-20 right-1/4 w-60 h-60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl pointer-events-none"
              style={{ background: "rgba(108,92,231,0.25)" }}
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-start sm:items-center gap-5">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center border shrink-0"
                  style={{
                    background: "rgba(108,92,231,0.12)",
                    borderColor: "rgba(108,92,231,0.35)",
                    boxShadow: "0 0 16px rgba(108,92,231,0.2)",
                  }}
                >
                  <IconShield className="w-6 h-6 text-[#a29bfe]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3
                      className="text-xl font-bold text-[var(--text-primary)]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      SafeMode
                    </h3>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#00cec9] px-2 py-0.5 rounded-full bg-[rgba(0,206,201,0.1)] border border-[rgba(0,206,201,0.2)]">
                      Active
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed">
                    Your space, your rules. Privacy controls, three-strike enforcement.
                  </p>
                </div>
              </div>

              {/* Hover micro-demo: Three-strike safety indicator */}
              <div className="flex items-center gap-4 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-[rgba(255,255,255,0.06)]">
                <div className="flex items-center gap-2">
                  {[1, 2, 3].map((strike) => (
                    <div
                      key={strike}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] group-hover:border-[rgba(108,92,231,0.3)] transition-all"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00cec9]" />
                      <span className="font-mono text-[10px] text-[var(--text-muted)] group-hover:text-[var(--text-primary)]">
                        L{strike}
                      </span>
                    </div>
                  ))}
                </div>
                <span className="font-mono text-xs text-[#00d2ff]">ENFORCED ✦</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
