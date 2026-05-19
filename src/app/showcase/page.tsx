"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, TrendingUp, Clock, Star, Plus } from "lucide-react";
import { MOCK_PROJECTS } from "@/lib/data";
import ProjectCard from "@/components/cards/ProjectCard";
import Button from "@/components/ui/Button";

const SORT_OPTIONS = [
  { label: "Trending", icon: TrendingUp },
  { label: "Recent", icon: Clock },
  { label: "Top Rated", icon: Star },
];

const TAG_FILTERS = [
  "All", "UI Design", "Motion", "3D Art", "WebGL", "AI", "Open Source",
  "Brand", "Interactive", "TypeScript",
];

export default function ShowcasePage() {
  const [activeSort, setActiveSort] = useState("Trending");
  const [activeTag, setActiveTag] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = MOCK_PROJECTS.filter((p) => {
    const matchTag = activeTag === "All" || p.tags.some((t) => t.includes(activeTag));
    const matchSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    return matchTag && matchSearch;
  });

  return (
    <div className="min-h-screen pt-24 pb-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="label-mono mb-3">Creator Showcase</p>
          <h1 className="display-lg mb-4" style={{ color: "var(--text-primary)" }}>
            Work that{" "}
            <span className="gradient-text-warm">inspires</span>
          </h1>
          <p className="text-base max-w-lg" style={{ color: "var(--text-secondary)" }}>
            Explore thousands of projects from the world&apos;s most talented creators.
          </p>
        </motion.div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              id="showcase-search"
              className="input-nova pl-11"
              placeholder="Search projects…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {/* Sort */}
          <div className="flex gap-2">
            {SORT_OPTIONS.map(({ label, icon: Icon }) => (
              <button
                key={label}
                onClick={() => setActiveSort(label)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  background:
                    activeSort === label
                      ? "rgba(108,92,231,0.15)"
                      : "rgba(10,10,30,0.6)",
                  border:
                    activeSort === label
                      ? "1px solid rgba(108,92,231,0.4)"
                      : "1px solid var(--glass-border)",
                  color:
                    activeSort === label ? "#a29bfe" : "var(--text-muted)",
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tag filters */}
        <div className="flex flex-wrap gap-2 mb-10">
          {TAG_FILTERS.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
              style={{
                background:
                  activeTag === tag
                    ? "var(--accent-primary)"
                    : "rgba(10,10,30,0.6)",
                color: activeTag === tag ? "#fff" : "var(--text-secondary)",
                border:
                  activeTag === tag
                    ? "1px solid var(--accent-primary)"
                    : "1px solid var(--glass-border)",
              }}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>

        {filtered.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center p-12 mt-8 rounded-2xl bg-[var(--bg-frosted)] border border-[var(--glass-border)] backdrop-blur-xl text-center"
          >
            <div className="w-16 h-16 rounded-full bg-[var(--bg-deep)] border border-[var(--border-subtle)] flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(108,92,231,0.2)]">
              <span className="text-2xl">🧊</span>
            </div>
            <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2 tracking-tight">
              A blank canvas awaits.
            </h3>
            <p className="text-[var(--text-secondary)] mb-8 max-w-sm">
              Drop your best work here to establish your identity in the network.
            </p>
            <Button 
              variant="primary" 
              iconRight={<Plus className="w-4 h-4" />}
              onClick={() => window.location.href = "/feed"}
            >
              Upload Project
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
