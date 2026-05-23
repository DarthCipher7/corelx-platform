"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import CreatorCard from "@/components/cards/CreatorCard";
import { createClient } from "@/utils/supabase/client";
import Button from "@/components/ui/Button";
import { SKILLS_ALL } from "@/lib/data";
import TraceStrip from "@/components/explore/TraceStrip";

const FILTER_ROLES = [
  "All",
  "Designer", "Illustrator", "Graphic Artist", "Poster Maker",
  "Photographer", "Videographer", "Video Editor", "Motion Designer", "Short Film Maker",
  "Musician", "Music Producer", "Sound Designer",
  "Content Creator", "Social Media Manager", "Copywriter", "Blogger",
  "3D Artist", "Animator", "Game Designer", "Game Tester",
  "Engineer", "AI Engineer", "Creative Developer",
  "Freelancer", "Brand Strategist", "Fashion Designer",
];

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const [activeRole, setActiveRole] = useState("All");
  const [activeSkills, setActiveSkills] = useState<string[]>([]);
  const [creators, setCreators] = useState<any[]>([]);
  
  const supabase = createClient();

  // Load creators
  async function loadData() {
    try {
      // Load creators
      const { data: userData } = await supabase
        .from("users")
        .select(`
          id,
          handle,
          display_name,
          avatar_url,
          tagline,
          availability_status,
          created_at,
          skills (
            skill_name
          )
        `);
      
      if (userData) {
        setCreators(userData.map(u => ({
          id: u.id,
          name: u.display_name || u.handle,
          handle: u.handle,
          avatar: u.avatar_url || "",
          role: u.tagline || "Creator",
          bio: "",
          skills: u.skills ? u.skills.map((s: any) => s.skill_name) : [],
          followers: 0,
          following: 0,
          projects: 0,
          verified: false,
          online: u.availability_status === 'Available for work',
          coverGradient: "linear-gradient(135deg, #6c5ce7 0%, #a29bfe 50%, #00d2ff 100%)",
          location: "",
          joinedYear: new Date(u.created_at).getFullYear(),
          socialLinks: {}
        })));
      }
    } catch (e) {
      console.error("Error loading explore data:", e);
    }
  }

  useEffect(() => {
    loadData();
  }, [supabase]);

  // Filter creators
  const filteredCreators = creators.filter((c) => {
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
        
        {/* Dual Mode View Controller header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-[var(--border-subtle)] pb-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p className="label-mono mb-2 text-[var(--accent-primary)] flex items-center gap-1.5">
              <span>✦</span> Discovery Network
            </p>
            <h1 className="display-sm text-[var(--text-primary)] font-bold tracking-tight">
              Explore Creators 👥
            </h1>
          </motion.div>
        </div>

        {/* Trending now Traces strip */}
        <TraceStrip isExploreTrending={true} className="mb-8" />

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
              style={{ backdropFilter: "blur(8px)" }}
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
                    : "var(--glass-bg)",
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

        {/* Skill / Tag multi-select */}
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
                  : "var(--glass-bg)",
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
        <p className="text-sm mb-6 font-mono" style={{ color: "var(--text-muted)" }}>
          {`${filteredCreators.length} Creator${filteredCreators.length !== 1 ? "s" : ""} connected`}
        </p>

        {/* Dynamic content rendering */}
        <AnimatePresence mode="wait">
          <motion.div
            key="creators-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredCreators.length > 0 ? (
              filteredCreators.map((creator, i) => (
                <CreatorCard key={creator.id} creator={creator} index={i} />
              ))
            ) : (
              <EmptyState onClear={() => {
                setSearch("");
                setActiveRole("All");
                setActiveSkills([]);
              }} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="col-span-full flex flex-col items-center justify-center p-12 mt-8 rounded-2xl bg-[var(--bg-frosted)] border border-[var(--glass-border)] backdrop-blur-xl text-center"
    >
      <div className="w-16 h-16 rounded-full bg-[var(--bg-deep)] border border-[var(--border-subtle)] flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(108,92,231,0.2)]">
        <span className="text-2xl">📡</span>
      </div>
      <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2 tracking-tight">
        Signal lost.
      </h3>
      <p className="text-[var(--text-secondary)] mb-8 max-w-sm">
        We couldn't find anything matching those exact frequencies.
      </p>
      <Button variant="ghost" onClick={onClear}>
        Clear Filters
      </Button>
    </motion.div>
  );
}
