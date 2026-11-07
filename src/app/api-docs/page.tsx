"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal,
  Code2,
  Lock,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  Cpu,
  ArrowRight,
  Send,
  AlertTriangle,
} from "lucide-react";

interface PlannedEndpoint {
  method: "GET" | "POST";
  path: string;
  desc: string;
  tags: string[];
}

const PLANNED_ENDPOINTS: PlannedEndpoint[] = [
  {
    method: "GET",
    path: "/v1/users/:handle",
    desc: "Fetch public creator profiles, campus institutional verification, earned Badges, and Showcase artifacts.",
    tags: ["Identity", "Public"],
  },
  {
    method: "GET",
    path: "/v1/pods",
    desc: "Query public community pods, active squad rosters, member counts, and open collaboration roles.",
    tags: ["Community", "Public"],
  },
  {
    method: "GET",
    path: "/v1/aura/:userId",
    desc: "Retrieve verifiable Aura reputation metrics, tier status (New → Pillar), and contribution score breakdowns.",
    tags: ["Reputation", "Public"],
  },
  {
    method: "GET",
    path: "/v1/collabs",
    desc: "Filter and stream active Collab Board requests by software stack, required skill tags, and campus hub.",
    tags: ["Collab", "Public"],
  },
  {
    method: "POST",
    path: "/v1/users/:id/follow",
    desc: "Manage creative social graph relationships and subscribe to creator Flare releases via webhooks.",
    tags: ["Social", "Authenticated"],
  },
  {
    method: "GET",
    path: "/v1/showcase/:handle",
    desc: "Access structured portfolio items, interactive WebGL canvas embeds, and validated proof of work records.",
    tags: ["Showcase", "Public"],
  },
];

export default function ApiDocsPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    project: "",
  });
  const [formStatus, setFormStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [copiedCode, setCopiedCode] = useState(false);

  const sampleSnippet = `// Planned CORELX TypeScript SDK preview
import { CorelxClient } from '@corelx/sdk';

const corelx = new CorelxClient({
  apiKey: process.env.CORELX_API_KEY,
});

// Fetch creator reputation & showcase
const creator = await corelx.users.get('maya_ui');
console.log(creator.auraTier); // "Pillar"
console.log(creator.campus);   // "IIT Delhi"`;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(sampleSnippet);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.project) {
      setFormStatus("error");
      return;
    }

    setFormStatus("loading");
    // TODO: Wire to Supabase developer waitlist table
    setTimeout(() => {
      setFormStatus("success");
      setFormData({ name: "", email: "", project: "" });
    }, 800);
  };

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
        <div className="max-w-3xl mb-16">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
              <Terminal className="w-3.5 h-3.5 text-[var(--accent-cyan)]" />
              <span className="text-[var(--accent-cyan)] uppercase tracking-wider">Developer Interface</span>
            </div>

            {/* Glowing amber status badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-[#fdcb6e]/15 text-[#fdcb6e] border border-[#fdcb6e]/40 shadow-[0_0_12px_rgba(253,203,110,0.3)]">
              <span className="w-2 h-2 rounded-full bg-[#fdcb6e] animate-pulse" />
              <span>API Status: In Development</span>
            </div>
          </div>

          <h1
            className="text-4xl sm:text-6xl font-bold tracking-tight mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Build on <span className="gradient-text">CORELX.</span>
          </h1>
          <p className="text-lg sm:text-xl text-[var(--text-secondary)] leading-relaxed">
            The CORELX API is in private development. Apply for early access to build portfolio sync tools, university bot integrations, and collaborative campus apps.
          </p>
        </div>

        {/* Code Preview + Architecture Callout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20 items-stretch">
          <div className="lg:col-span-7 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-deep)] p-5 sm:p-6 overflow-hidden relative">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <span className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="text-xs font-mono text-[var(--text-muted)] ml-2">preview.ts</span>
              </div>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 text-xs font-mono text-[var(--text-secondary)] hover:text-white transition-colors"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#00cec9]" />
                    <span className="text-[#00cec9]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy SDK Preview</span>
                  </>
                )}
              </button>
            </div>

            <pre className="text-xs sm:text-sm font-mono text-[var(--text-secondary)] overflow-x-auto leading-relaxed">
              <code>{sampleSnippet}</code>
            </pre>
          </div>

          <div
            className="lg:col-span-5 rounded-2xl p-6 sm:p-8 border border-[var(--glass-border)] bg-[var(--glass-card-bg)] flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent-cyan)] mb-4">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-display)" }}>
                Cryptographic Identity Engine
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
                Designed for high throughput edge querying. Retrieve verified proof-of-work records, Aura ratings, and campus student directory data with sub-25ms response latencies.
              </p>
            </div>

            <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono">
              <span className="text-[var(--text-muted)]">Auth: Ed25519 Bearer</span>
              <span className="text-[var(--accent-cyan)]">REST + WebSocket</span>
            </div>
          </div>
        </div>

        {/* Planned Endpoints Section */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2
                className="text-2xl sm:text-3xl font-bold text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Planned Endpoints
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Scheduled for private developer access in Phase 2
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[#fdcb6e]">
              Planned, not yet available
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PLANNED_ENDPOINTS.map((endpoint, i) => (
              <div
                key={i}
                className="p-5 rounded-xl border border-[var(--glass-border)] bg-[var(--bg-surface)] flex flex-col justify-between relative group hover:border-[var(--border-subtle)] transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          endpoint.method === "GET"
                            ? "bg-[var(--accent-cyan)]/15 text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/30"
                            : "bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] border border-[var(--accent-primary)]/30"
                        }`}
                      >
                        {endpoint.method}
                      </span>
                      <code className="text-xs font-mono font-bold text-white">{endpoint.path}</code>
                    </div>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
                    {endpoint.desc}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)] text-[10px] font-mono text-[var(--text-muted)]">
                  <div className="flex gap-1.5">
                    {endpoint.tags.map((tag) => (
                      <span key={tag} className="px-1.5 py-0.5 rounded bg-[var(--bg-deep)]">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-[#fdcb6e]/90 font-medium">Planned</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Early Access Form */}
        <section
          className="rounded-3xl p-8 sm:p-12 border border-[var(--border-glow)] max-w-2xl mx-auto text-center relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(15,15,35,0.95) 0%, rgba(10,10,25,0.98) 100%)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
          }}
        >
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)]/20 border border-[var(--accent-primary)]/40 flex items-center justify-center text-[var(--accent-cyan)] mx-auto mb-4">
            <Lock className="w-5 h-5" />
          </div>

          <h3
            className="text-2xl sm:text-3xl font-bold text-white mb-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Apply for Developer Early Access
          </h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-8 max-w-lg mx-auto">
            Tell us about your campus tool, bot, or integration. We grant private API keys in weekly batches.
          </p>

          <AnimatePresence>
            {formStatus === "success" ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-2xl bg-[#00cec9]/15 border border-[#00cec9]/40 text-center text-white"
              >
                <CheckCircle2 className="w-8 h-8 text-[#00cec9] mx-auto mb-2" />
                <h4 className="text-base font-bold">Application Registered</h4>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  We have queued your project for the developer sandbox. Check your inbox for our invite batch.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider mb-1.5 text-[var(--text-secondary)]">
                      Developer Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Kabir Sen"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[var(--bg-deep)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider mb-1.5 text-[var(--text-secondary)]">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="kabir@dev.in"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[var(--bg-deep)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider mb-1.5 text-[var(--text-secondary)]">
                    What are you building?
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your planned application, hackathon project, or integration..."
                    value={formData.project}
                    onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                    className="w-full bg-[var(--bg-deep)] border border-[var(--border-subtle)] rounded-xl p-4 text-sm text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] resize-none"
                  />
                </div>

                {formStatus === "error" && (
                  <p className="text-xs text-[var(--accent-magenta)]">Please complete all fields.</p>
                )}

                <button
                  type="submit"
                  disabled={formStatus === "loading"}
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] disabled:opacity-50"
                  style={{
                    background: "linear-gradient(135deg, #6c5ce7, #00d2ff)",
                    boxShadow: "0 0 20px rgba(108,92,231,0.4)",
                  }}
                >
                  {formStatus === "loading" ? (
                    "Transmitting Application..."
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Join Developer Waitlist</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
}
