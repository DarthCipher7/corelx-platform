"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import { MOCK_CREATORS, SKILLS_ALL } from "@/lib/data";
import CreatorCard from "@/components/cards/CreatorCard";
import NeonBadge from "@/components/ui/NeonBadge";

const FILTER_ROLES = [
  "All", "Designer", "Engineer", "3D Artist", "Motion Designer",
  "AI Engineer", "Brand Strategist", "Creative Developer",
];

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const [activeRole, setActiveRole] = useState("All");
  const [activeSkills, setActiveSkills] = useState<string[]>([]);

  const filtered = MOCK_CREATORS.filter((c) => {
    const matchSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.handle.toLowerCase().includes(search.toLowerCase()) ||
      c.role.toLowerCase().includes(search.toLowerCase());
    const matchRole =
      activeRole === "All" ||
      c.role.toLowerCase().includes(activeRole.toLowerCase());
    const matchSkills =
      activeSkills.length === 0 ||
      activeSkills.some((s) => c.skills.includes(s));
    return matchSearch && matchRole && matchSkills;
  });

  const toggleSkill = (skill: string) =>
    setActiveSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );

  return (
    <div className="min-h-screen pt-24 pb-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Page header */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="label-mono mb-3">Creator Network</p>
          <h1 className="display-lg mb-4" style={{ color: "var(--text-primary)" }}>
            Explore creators
          </h1>
          <p style={{ color: "var(--text-secondary)" }} className="text-base max-w-lg">
            Discover designers, engineers, artists, and builders from around the world.
          </p>
        </motion.div>

        {/* Search + filter bar */}
        <motion.div
          className="mb-8 flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              id="explore-search"
              className="input-nova pl-11"
              style={{ background: "var(--bg-frosted)", color: "var(--text-primary)", backdropFilter: "blur(8px)" }}
              placeholder="Search creators by name, skill, or role…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all"
            style={{
              background: "var(--bg-frosted)",
              backdropFilter: "blur(8px)",
              border: "1px solid var(--glass-border)",
              color: "var(--text-secondary)",
            }}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </motion.div>

        {/* Role filter pills */}
        <motion.div
          className="flex flex-wrap gap-2 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          {FILTER_ROLES.map((role) => (
            <button
              key={role}
              onClick={() => setActiveRole(role)}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
              style={{
                background:
                  activeRole === role
                    ? "var(--text-primary)"
                    : "var(--bg-frosted)",
                backdropFilter: "blur(8px)",
                color: activeRole === role ? "var(--bg-void)" : "var(--text-secondary)",
                border:
                  activeRole === role
                    ? "1px solid var(--text-primary)"
                    : "1px solid var(--glass-border)",
                boxShadow:
                  activeRole === role ? "var(--shadow-glow-sm)" : "none",
              }}
            >
              {role}
            </button>
          ))}
        </motion.div>

        {/* Skill multi-select */}
        <motion.div
          className="flex flex-wrap gap-1.5 mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {SKILLS_ALL.slice(0, 14).map((skill) => (
            <button
              key={skill}
              onClick={() => toggleSkill(skill)}
              className="skill-badge transition-all"
              style={{
                background: activeSkills.includes(skill)
                  ? "var(--accent-primary-glow)"
                  : "var(--bg-frosted)",
                backdropFilter: "blur(8px)",
                borderColor: activeSkills.includes(skill)
                  ? "var(--accent-primary)"
                  : "var(--glass-border)",
                color: activeSkills.includes(skill) ? "var(--text-primary)" : "var(--text-secondary)",
              }}
            >
              {skill}
            </button>
          ))}
        </motion.div>

        {/* Results count */}
        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
          {filtered.length} creator{filtered.length !== 1 ? "s" : ""} found
        </p>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((creator, i) => (
              <CreatorCard key={creator.id} creator={creator} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <p
              className="text-5xl mb-4"
              style={{ filter: "grayscale(1) opacity(0.4)" }}
            >
              🔍
            </p>
            <p style={{ color: "var(--text-muted)" }}>
              No creators match your filters. Try broadening your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
