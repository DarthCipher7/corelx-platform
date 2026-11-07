"use client";

import { motion, animate, type Variants } from "framer-motion";
import { useEffect, useRef } from "react";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import Link from "next/link";

function AnimatedNumber({ target }: { target: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const controls = animate(0, target, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(v) {
        if (ref.current) {
          ref.current.textContent =
            v >= 1000 ? `${(v / 1000).toFixed(1)}K` : Math.round(v).toLocaleString();
        }
      },
    });
    return () => controls.stop();
  }, [target]);
  return <span ref={ref}>0</span>;
}

const leftContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const leftItemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const rightCardVariants: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.7,
      delay: 0.2,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export default function HeroSection({
  usersCount = 0,
  postsCount = 0,
  followsCount = 0,
}: {
  usersCount?: number;
  postsCount?: number;
  followsCount?: number;
}) {
  const STATS = [
    { label: "Verified Creators", value: usersCount || 48200 },
    { label: "Projects Shared", value: postsCount || 312000 },
    { label: "Connections Made", value: followsCount || 9400 },
  ];

  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden pt-28 pb-20 noise">
      {/* Background layer: Single subtle top-left radial glow + perspective 3D grid */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Single subtle radial glow anchored strictly to TOP-LEFT */}
        <div
          className="absolute -top-32 -left-32 w-[680px] h-[680px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 25% 25%, rgba(108, 92, 231, 0.22) 0%, rgba(0, 210, 255, 0.06) 45%, transparent 70%)",
            filter: "blur(50px)",
          }}
        />

        {/* Large ambient ✦ star element as decorative light source */}
        <div
          className="absolute -top-12 left-1/4 -translate-x-1/2 pointer-events-none opacity-[0.06] text-[#6c5ce7]"
          aria-hidden="true"
        >
          <svg
            width="540"
            height="540"
            viewBox="0 0 100 100"
            fill="currentColor"
            className="animate-spin"
            style={{ animationDuration: "120s" }}
          >
            <path d="M50 0 C50 35 35 50 0 50 C35 50 50 65 50 100 C50 65 65 50 100 50 C65 50 50 35 50 0 Z" />
          </svg>
        </div>

        {/* Subtle 3D Perspective Grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            perspective: "1000px",
            transformStyle: "preserve-3d",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(108,92,231,0.06) 1px, transparent 1px),
                linear-gradient(90deg, rgba(108,92,231,0.06) 1px, transparent 1px)
              `,
              backgroundSize: "60px 60px",
              transform: "rotateX(22deg) translateY(-40px) scale(1.05)",
              transformOrigin: "top center",
              maskImage:
                "radial-gradient(ellipse 95% 85% at 30% 20%, black 25%, transparent 80%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 95% 85% at 30% 20%, black 25%, transparent 80%)",
            }}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* LEFT COLUMN: Asymmetric, left-aligned headline & copy */}
          <motion.div
            variants={leftContainerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 flex flex-col items-start text-left"
          >
            {/* Top brand badge with signature ✦ */}
            <motion.div variants={leftItemVariants} className="mb-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[rgba(108,92,231,0.3)] bg-[rgba(108,92,231,0.08)] backdrop-blur-md">
                <span className="text-[#00d2ff] text-xs">✦</span>
                <span className="label-mono !text-[11px] text-[var(--text-secondary)]">
                  The Creator Identity Layer
                </span>
              </div>
            </motion.div>

            {/* Headline: Max 2 lines with ✦ device */}
            <motion.h1
              variants={leftItemVariants}
              className="display-xl text-[var(--text-primary)] mb-4 tracking-tight"
            >
              Build your legend
              <span className="text-[#00d2ff] inline-block ml-2 drop-shadow-[0_0_20px_rgba(0,210,255,0.6)]">
                ✦
              </span>
            </motion.h1>

            {/* Sub-headline: Max 2 lines */}
            <motion.p
              variants={leftItemVariants}
              className="text-lg sm:text-xl font-normal leading-relaxed text-[var(--text-secondary)] max-w-xl mb-9"
            >
              Your work. Your reputation. Your community. All in one place.
            </motion.p>

            {/* CTAs: Left-aligned */}
            <motion.div
              variants={leftItemVariants}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-14"
            >
              <Link href="/explore">
                <button className="btn-primary !py-3.5 !px-8 !text-sm w-full sm:w-auto flex items-center justify-center gap-2.5">
                  <span>Start building</span>
                  <span className="text-[#00d2ff] text-xs">✦</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </button>
              </Link>
              <Link href="/explore">
                <button className="btn-ghost !py-3.5 !px-8 !text-sm w-full sm:w-auto flex items-center justify-center gap-2">
                  <span>Explore creators</span>
                </button>
              </Link>
            </motion.div>

            {/* Stats row: Monospace numbers, horizontal dividers between, smaller labels */}
            <motion.div
              variants={leftItemVariants}
              className="w-full pt-8 border-t border-[rgba(255,255,255,0.06)]"
            >
              <div className="flex flex-col sm:flex-row sm:items-center divide-y sm:divide-y-0 sm:divide-x divide-[rgba(255,255,255,0.08)]">
                {STATS.map(({ label, value }, idx) => (
                  <div
                    key={label}
                    className={`py-3 sm:py-0 ${
                      idx === 0
                        ? "sm:pr-8"
                        : idx === 1
                        ? "sm:px-8"
                        : "sm:pl-8"
                    }`}
                  >
                    <div className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                      <AnimatedNumber target={value} />+
                    </div>
                    <div className="text-[11px] font-mono tracking-wider uppercase text-[var(--text-muted)] mt-1">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* RIGHT COLUMN: Animated mock of real product creator card */}
          <motion.div
            variants={rightCardVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-5 w-full flex justify-center lg:justify-end"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-full max-w-md relative rounded-2xl glass-strong border border-[rgba(255,255,255,0.09)] p-6 sm:p-7 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.8),0_0_36px_rgba(108,92,231,0.14)]"
            >
              {/* Subtle card light accent */}
              <div
                className="absolute -top-16 -right-16 w-36 h-36 rounded-full pointer-events-none opacity-40 blur-2xl"
                style={{ background: "radial-gradient(circle, #6c5ce7, transparent 70%)" }}
              />

              {/* Card top utility bar */}
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-[rgba(255,255,255,0.06)]">
                <div className="flex items-center gap-2">
                  <span className="text-[#00d2ff] text-xs">✦</span>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
                    CORELX IDENTITY
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[rgba(0,206,201,0.1)] border border-[rgba(0,206,201,0.25)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00cec9] animate-pulse" />
                  <span className="font-mono text-[10px] text-[#00cec9] uppercase tracking-wider">
                    Online
                  </span>
                </div>
              </div>

              {/* Profile Header */}
              <div className="flex items-start gap-4 mb-5">
                {/* Avatar with gradient Aura ring */}
                <div className="relative shrink-0">
                  <div
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-[2px] transition-transform duration-300 group-hover:scale-105"
                    style={{
                      background:
                        "linear-gradient(135deg, #6c5ce7 0%, #00d2ff 50%, #a29bfe 100%)",
                      boxShadow: "0 0 16px rgba(108, 92, 231, 0.45)",
                    }}
                  >
                    <div className="w-full h-full rounded-full overflow-hidden bg-[var(--bg-elevated)]">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"
                        alt="Aanya Sharma"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  {/* Status dot */}
                  <span
                    className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#00cec9] border-2 border-[var(--bg-void)] shadow-[0_0_8px_#00cec9]"
                    aria-label="Online"
                  />
                </div>

                {/* Identity info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3
                      className="font-semibold text-lg sm:text-xl truncate text-[var(--text-primary)]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      Aanya Sharma
                    </h3>
                    <CheckCircle2 className="w-4 h-4 text-[#00d2ff] shrink-0" />
                  </div>
                  <p className="font-mono text-xs text-[var(--text-secondary)] mb-2.5">
                    @aanya.creates
                  </p>
                  {/* Aura Badge */}
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[rgba(108,92,231,0.15)] border border-[rgba(108,92,231,0.35)] text-[11px] font-mono text-[#a29bfe]">
                    <span>Rising</span>
                    <span className="text-[#00d2ff]">✦</span>
                  </div>
                </div>
              </div>

              {/* 3 Skill Tags */}
              <div className="flex flex-wrap gap-2 mb-5">
                {["UI/UX", "Figma", "Motion"].map((skill) => (
                  <span
                    key={skill}
                    className="skill-badge !text-xs !py-1 !px-3 font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Simplified Stat Row */}
              <div className="grid grid-cols-2 gap-3 py-3 px-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] mb-5">
                <div>
                  <div className="font-mono text-lg font-bold text-[var(--text-primary)]">
                    142
                  </div>
                  <div className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-mono">
                    Posts
                  </div>
                </div>
                <div className="border-l border-[rgba(255,255,255,0.06)] pl-4">
                  <div className="font-mono text-lg font-bold text-[var(--text-primary)]">
                    2.8K
                  </div>
                  <div className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-mono">
                    Followers
                  </div>
                </div>
              </div>

              {/* Real UI action buttons */}
              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[linear-gradient(135deg,#6c5ce7,#a29bfe)] text-white text-xs font-semibold font-mono tracking-wide hover:opacity-95 shadow-[0_4px_16px_rgba(108,92,231,0.35)] transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Connect</span>
                  <span className="text-[#00d2ff]">✦</span>
                </button>
                <button
                  type="button"
                  className="py-2.5 px-4 rounded-xl bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.08)] text-[var(--text-secondary)] text-xs font-mono transition-colors"
                >
                  Showcase
                </button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
