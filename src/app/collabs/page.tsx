"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, DollarSign, Users, Zap } from "lucide-react";
import { MOCK_COLLABS } from "@/lib/data";
import CollabCard from "@/components/cards/CollabCard";
import NeonBadge from "@/components/ui/NeonBadge";
import { RevealEffect } from "@/components/ui/RevealEffect";

const TYPE_FILTERS = [
  { label: "All", value: "all" },
  { label: "Paid", value: "paid" },
  { label: "Collab", value: "collab" },
  { label: "Open Source", value: "open-source" },
];

const STATS = [
  { icon: Zap, label: "Active Requests", value: "142" },
  { icon: DollarSign, label: "Avg. Budget", value: "$4.2K" },
  { icon: Users, label: "Creators Available", value: "2.8K" },
];

export default function CollabsPage() {
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState("all");

  const filtered = MOCK_COLLABS.filter((c) => {
    const matchType = activeType === "all" || c.type === activeType;
    const matchSearch =
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="min-h-screen pt-24 pb-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="label-mono mb-3">Collaboration Board</p>
            <h1 className="display-lg mb-4" style={{ color: "var(--text-primary)" }}>
              Find your next{" "}
              <span className="gradient-text">collab</span>
            </h1>
            <p className="text-base max-w-lg" style={{ color: "var(--text-secondary)" }}>
              Browse open collaboration requests from creators building the future.
            </p>
          </motion.div>
          <motion.button
            className="btn-primary flex-shrink-0"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Plus className="w-4 h-4" />
            Post a Collab
          </motion.button>
        </div>

        {/* Quick stats */}
        <motion.div
          className="grid grid-cols-3 gap-4 mb-10"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {STATS.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="rounded-2xl p-4 flex items-center gap-3"
              style={{
                background: "var(--bg-frosted)",
                backdropFilter: "blur(8px)",
                border: "1px solid var(--glass-border)",
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--border-subtle)" }}
              >
                <Icon className="w-4 h-4" style={{ color: "var(--accent-primary)" }} />
              </div>
              <div>
                <p
                  className="text-base font-bold"
                  style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}
                >
                  {value}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {label}
                </p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              id="collabs-search"
              className="input-nova pl-11"
              style={{ background: "var(--bg-frosted)", color: "var(--text-primary)", backdropFilter: "blur(8px)" }}
              placeholder="Search collabs by title or skill…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {TYPE_FILTERS.map(({ label, value }) => (
              <RevealEffect key={value} className="rounded-xl overflow-hidden">
                <button
                  onClick={() => setActiveType(value)}
                  className="w-full h-full px-4 py-2.5 text-sm font-medium transition-all"
                  style={{
                    background:
                      activeType === value
                        ? "var(--accent-primary-glow)"
                        : "var(--bg-frosted)",
                    backdropFilter: "blur(8px)",
                    border:
                      activeType === value
                        ? "1px solid var(--accent-primary)"
                        : "1px solid var(--glass-border)",
                    color:
                      activeType === value ? "var(--text-primary)" : "var(--text-muted)",
                  }}
                >
                  {label}
                </button>
              </RevealEffect>
            ))}
          </div>
        </div>

        {/* Results */}
        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
          {filtered.length} open request{filtered.length !== 1 ? "s" : ""}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((collab, i) => (
            <CollabCard key={collab.id} collab={collab} index={i} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-24">
            <p className="text-4xl mb-4" style={{ filter: "grayscale(1) opacity(0.4)" }}>
              🤝
            </p>
            <p style={{ color: "var(--text-muted)" }}>No collabs match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
