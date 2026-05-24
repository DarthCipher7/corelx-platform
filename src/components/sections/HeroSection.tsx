"use client";

import { motion, useMotionValue, useTransform, animate, type Variants } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Sparkles, Users, Briefcase, Star } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import NeonBadge from "@/components/ui/NeonBadge";

function AnimatedNumber({ target }: { target: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const controls = animate(0, target, {
      duration: 2,
      ease: "easeOut",
      onUpdate(v) {
        if (ref.current) {
          ref.current.textContent =
            v >= 1000 ? `${(v / 1000).toFixed(1)}K` : Math.round(v).toString();
        }
      },
    });
    return controls.stop;
  }, [target]);
  return <span ref={ref}>0</span>;
}

// We'll dynamically construct this inside the component now

// Floating orbs component
function Orbs() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Large purple orb */}
      <div
        className="absolute rounded-full blur-3xl opacity-20"
        style={{
          width: "600px",
          height: "600px",
          top: "-200px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "radial-gradient(circle, #6c5ce7, transparent 70%)",
        }}
      />
      {/* Cyan accent orb */}
      <div
        className="absolute rounded-full blur-2xl opacity-15"
        style={{
          width: "300px",
          height: "300px",
          top: "30%",
          right: "10%",
          background: "radial-gradient(circle, #00d2ff, transparent 70%)",
          animation: "float 8s ease-in-out infinite",
        }}
      />
      {/* Magenta accent orb */}
      <div
        className="absolute rounded-full blur-2xl opacity-10"
        style={{
          width: "250px",
          height: "250px",
          bottom: "20%",
          left: "8%",
          background: "radial-gradient(circle, #fd79a8, transparent 70%)",
          animation: "float 10s ease-in-out 3s infinite",
        }}
      />
    </div>
  );
}

// Animated grid lines
function GridLines() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          linear-gradient(rgba(108,92,231,0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(108,92,231,0.05) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
        maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 80%)",
      }}
    />
  );
}

// Particle dots
function Particles() {
  const [dots, setDots] = useState<any[]>([]);

  useEffect(() => {
    setDots(
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        delay: Math.random() * 5,
        duration: Math.random() * 5 + 4,
      }))
    );
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {dots.map((dot) => (
        <motion.div
          key={dot.id}
          className="absolute rounded-full"
          style={{
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            width: dot.size,
            height: dot.size,
            background: "var(--accent-primary)",
          }}
          animate={{
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: dot.duration,
            delay: dot.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function HeroSection({ 
  usersCount = 0, 
  postsCount = 0, 
  followsCount = 0 
}: { 
  usersCount?: number; 
  postsCount?: number; 
  followsCount?: number; 
}) {
  const STATS = [
    { label: "Creators", value: usersCount || 48200, icon: Users },
    { label: "Projects Shared", value: postsCount || 312000, icon: Star },
    { label: "Connections Made", value: followsCount || 9400, icon: Briefcase },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <GridLines />
      <Orbs />
      <Particles />

      {/* Scan line effect */}
      <motion.div
        className="absolute left-0 right-0 h-px pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(108,92,231,0.4), rgba(0,210,255,0.4), transparent)",
        }}
        animate={{ top: ["-2%", "102%"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear", repeatDelay: 4 }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 text-center relative z-10">
        <motion.div variants={container} initial="hidden" animate="show">
          {/* Top badge */}
          <motion.div variants={item} className="flex justify-center mb-8">
            <NeonBadge variant="purple">
              <Sparkles className="w-3 h-3" />
              The Creator Identity Layer is here
            </NeonBadge>
          </motion.div>

          {/* Headline */}
          <motion.h1 variants={item} className="display-xl mb-6">
            <span style={{ color: "var(--text-primary)" }}>Where creators</span>
            <br />
            <span className="gradient-text-cyber">build their legacy</span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            variants={item}
            className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            CORELX is the AI-native network where designers, engineers, artists, and builders
            discover each other, collaborate in real time, and grow their reputation.
          </motion.p>

          {/* CTA row */}
          <motion.div
            variants={item}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/explore" className="block sm:inline-block w-full sm:w-auto">
              <motion.div
                className="btn-primary !py-4 !px-8 !text-base w-full sm:w-auto inline-flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                Start Building
                <ArrowRight className="w-4 h-4" />
              </motion.div>
            </Link>
            <Link href="/showcase" className="block sm:inline-block w-full sm:w-auto">
              <motion.div
                className="btn-ghost !py-4 !px-8 !text-base w-full sm:w-auto inline-flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                See the Showcase
              </motion.div>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={item}
            className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto"
          >
            {STATS.map(({ label, value, icon: Icon }) => (
              <motion.div
                key={label}
                className="glass-card rounded-2xl p-6 flex flex-col items-center gap-3"
                whileHover={{ scale: 1.04 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "var(--border-subtle)" }}
                >
                  <Icon className="w-5 h-5" style={{ color: "var(--accent-primary)" }} />
                </div>
                <div
                  className="text-2xl font-bold"
                  style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
                >
                  <AnimatedNumber target={value} />+
                </div>
                <div className="text-sm" style={{ color: "var(--text-muted)" }}>
                  {label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
