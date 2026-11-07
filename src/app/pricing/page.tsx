"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Check,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  Mail,
  Zap,
  Lock,
  Layers,
  Users,
} from "lucide-react";

const FREE_FEATURES = [
  "Unlimited Flares (60s short-form vertical video)",
  "Traces (24-hour ephemeral work-in-progress drops)",
  "Full Pod community hosting (Open and Invite-only rooms)",
  "Collab Board publishing and 1-tap project applications",
  "Showcase living portfolio with custom @handle URL",
  "Aura reputation tracking across all 5 verifiable tiers",
  "Reach Inbox with smart collaborator compatibility filters",
  "SafeMode geolocation privacy & 3-strike integrity shield",
];

const FAQS = [
  {
    q: "Is CORELX really free right now?",
    a: "Yes. Every core tool — Flares, Traces, Showcase, Pods, Collab Board, and the Aura engine — is completely free during our early access phase. There are no trial periods, hidden credit card prompts, or artificial feature walls.",
  },
  {
    q: "What happens to my account when paid tiers launch?",
    a: "Your early access status is permanently recognized. Early access creators keep their verified @handles, accumulated Aura scores, earned Badges, and living Showcase portfolios with zero interruption.",
  },
  {
    q: "Can someone purchase Aura or pay for a higher reputation tier?",
    a: "Never. Aura cannot be bought, transferred, or gamed. It is calculated strictly through verified peer collaboration, code/design output, and community contribution. Paid tiers will focus on advanced storage, custom domains, and enterprise campus integrations — never reputation.",
  },
  {
    q: "Will student clubs and campus societies always be free?",
    a: "Yes. Supporting student builders and campus grassroots communities is the foundational mission of CORELX. Standard Pods and student community spaces will remain free for college clubs.",
  },
  {
    q: "What will future premium features look like?",
    a: "Future additions will center around high-power pro workflows: 4K lossless media vaults, custom portfolio domain linking (yourname.com), deep analytics on reach and collabs, and verified institutional enterprise dashboards for universities and hiring partners.",
  },
];

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [waitlistStatus, setWaitlistStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      setErrorMessage("Please enter a valid email address.");
      setWaitlistStatus("error");
      return;
    }

    setWaitlistStatus("loading");
    // Simulated waitlist capture (TODO: Wire to Supabase waitlist table)
    setTimeout(() => {
      setWaitlistStatus("success");
      setEmail("");
    }, 700);
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-void)] text-[var(--text-primary)] pt-28 pb-32 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div
        className="absolute top-10 left-1/2 -translate-x-1/2 w-[750px] h-[450px] pointer-events-none opacity-20 blur-[140px]"
        style={{
          background: "radial-gradient(circle, #6c5ce7 0%, #00d2ff 60%, transparent 80%)",
        }}
      />
      <div className="absolute inset-0 dot-bg opacity-30 pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono mb-4 border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent-cyan)]" />
            <span className="text-[var(--accent-cyan)] uppercase tracking-wider">Early Access Phase</span>
          </div>
          <h1
            className="text-4xl sm:text-6xl font-bold tracking-tight mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Free while we <span className="gradient-text">build together.</span>
          </h1>
          <p className="text-lg sm:text-xl text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto">
            CORELX is free during early access. Paid features are coming — and you&apos;ll be the first to know.
          </p>
        </div>

        {/* Early Access Creator Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-2xl mx-auto mb-20"
        >
          <div
            className="relative rounded-3xl p-8 sm:p-12 border border-[var(--border-glow)] overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(15,15,35,0.95) 0%, rgba(10,10,25,0.98) 100%)",
              boxShadow: "0 25px 60px rgba(0,0,0,0.6), 0 0 30px rgba(108,92,231,0.25)",
            }}
          >
            {/* Top decorative gradient rim */}
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{
                background: "linear-gradient(90deg, #6c5ce7, #00d2ff, #fd79a8)",
              }}
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-[var(--border-subtle)]">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[var(--accent-cyan)]/15 text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/30">
                  FOUNDING PASS
                </span>
                <h2
                  className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mt-2"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Early Access Creator
                </h2>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Full unrestricted platform capability for student builders &amp; creators.
                </p>
              </div>

              <div className="text-left sm:text-right">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl sm:text-5xl font-extrabold text-[var(--text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
                    $0
                  </span>
                  <span className="text-sm font-mono text-[var(--text-muted)]">/ forever free</span>
                </div>
                <p className="text-[11px] font-mono text-[var(--accent-cyan)] mt-0.5">Early Cohort Tier</p>
              </div>
            </div>

            {/* Feature Checklist */}
            <div className="space-y-3.5 mb-8">
              <p className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] mb-2">
                Included in Early Access:
              </p>
              {FREE_FEATURES.map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[var(--accent-primary)]/20 border border-[var(--accent-primary)]/40 flex items-center justify-center flex-shrink-0 mt-0.5 text-[var(--accent-cyan)]">
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="text-sm text-[var(--text-primary)] leading-relaxed">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <Link
              href="/signup"
              className="w-full py-4 px-6 rounded-2xl font-bold text-sm text-[var(--text-primary)] flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.99]"
              style={{
                background: "linear-gradient(135deg, #6c5ce7, #00d2ff)",
                boxShadow: "0 8px 30px rgba(108,92,231,0.45)",
              }}
            >
              <span>Claim Your Creator Handle</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <p className="text-center text-[11px] font-mono text-[var(--text-muted)] mt-4">
              Instant activation • No payment card required • Verified college profile
            </p>
          </div>
        </motion.div>

        {/* Waitlist for Future Premium Features */}
        <div
          className="rounded-3xl p-8 sm:p-10 border border-[var(--glass-border)] bg-[var(--glass-card-bg)] max-w-2xl mx-auto mb-20 text-center relative overflow-hidden"
        >
          <div className="max-w-md mx-auto">
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center mx-auto mb-3 text-[var(--accent-cyan)]">
              <Mail className="w-5 h-5" />
            </div>
            <h3
              className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Want early access to premium features?
            </h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
              Drop your email to receive private previews of custom domains, advanced analytics, and Pro creator tooling before anyone else.
            </p>

            <form onSubmit={handleWaitlistSubmit} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="your.email@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-[var(--bg-deep)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-all"
                />
                <button
                  type="submit"
                  disabled={waitlistStatus === "loading"}
                  className="px-6 py-3 rounded-xl text-xs font-mono font-bold text-[var(--text-primary)] transition-all disabled:opacity-50 whitespace-nowrap"
                  style={{
                    background: "linear-gradient(135deg, #6c5ce7, #00d2ff)",
                  }}
                >
                  {waitlistStatus === "loading" ? "Registering..." : "Join VIP Waitlist"}
                </button>
              </div>

              {waitlistStatus === "error" && (
                <p className="text-xs text-[var(--accent-magenta)] text-left">{errorMessage}</p>
              )}

              {waitlistStatus === "success" && (
                <div className="p-3 rounded-xl bg-[#00cec9]/15 border border-[#00cec9]/30 text-xs text-[var(--text-primary)]">
                  ✓ Priority spot confirmed! We will dispatch an invite as premium tooling ships.
                </div>
              )}
            </form>
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-2xl mx-auto">
          <h3
            className="text-2xl sm:text-3xl font-bold text-center mb-8 text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Frequently Asked Questions
          </h3>

          <div className="space-y-3">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-surface)] overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 group"
                  >
                    <span className="text-sm sm:text-base font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-cyan)] transition-colors">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[var(--text-secondary)] transition-transform duration-200 flex-shrink-0 ${
                        isOpen ? "rotate-180 text-[var(--accent-cyan)]" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-5 pb-5 pt-1 text-sm text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-subtle)]">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
