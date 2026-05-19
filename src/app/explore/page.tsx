"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, ChevronDown, Flame } from "lucide-react";
import { MOCK_CREATORS, SKILLS_ALL, MOCK_FLARES } from "@/lib/data";
import CreatorCard from "@/components/cards/CreatorCard";
import FlareCard from "@/components/cards/FlareCard";
import FlaresViewer from "@/components/explore/FlaresViewer";
import NeonBadge from "@/components/ui/NeonBadge";
import { createClient } from "@/utils/supabase/client";
import Button from "@/components/ui/Button";
import { Flare } from "@/types";

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
  const [viewMode, setViewMode] = useState<"flares" | "creators">("flares");
  const [search, setSearch] = useState("");
  const [activeRole, setActiveRole] = useState("All");
  const [activeSkills, setActiveSkills] = useState<string[]>([]);
  const [creators, setCreators] = useState<any[]>([]);
  const [flares, setFlares] = useState<Flare[]>([]);
  const [selectedFlareIndex, setSelectedFlareIndex] = useState<number | null>(null);
  
  const supabase = createClient();

  // Load creators and flares
  useEffect(() => {
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

        // Load flares
        const { data: flareData } = await supabase
          .from("flares")
          .select(`
            id,
            user_id,
            media_url,
            thumbnail_url,
            caption,
            tags,
            duration_seconds,
            created_at,
            users (
              display_name,
              handle,
              avatar_url
            )
          `)
          .order("created_at", { ascending: false });

        let sparkCounts: Record<string, number> = {};
        if (flareData && flareData.length > 0) {
          const flareIds = flareData.map(f => f.id);
          const { data: flareSparks } = await supabase
            .from('sparks')
            .select('target_id')
            .in('target_id', flareIds)
            .eq('target_type', 'flare');
            
          flareSparks?.forEach(s => {
            sparkCounts[s.target_id] = (sparkCounts[s.target_id] || 0) + 1;
          });
        }

        if (flareData && flareData.length > 0) {
          // Format with correct user typing
          const formattedFlares: Flare[] = flareData.map((f: any) => {
            const authorUser = Array.isArray(f.users) ? f.users[0] : f.users;
            return {
              id: f.id,
              user_id: f.user_id,
              media_url: f.media_url,
              thumbnail_url: f.thumbnail_url || undefined,
              caption: f.caption || undefined,
              tags: f.tags || [],
              duration_seconds: f.duration_seconds || undefined,
              created_at: f.created_at,
              spark_count: sparkCounts[f.id] || 0,
              users: authorUser ? {
                display_name: authorUser.display_name || undefined,
                handle: authorUser.handle,
                avatar_url: authorUser.avatar_url || undefined
              } : undefined
            };
          });
          setFlares(formattedFlares);
        } else {
          // Fallback to beautiful mock flares
          setFlares(MOCK_FLARES);
        }
      } catch (e) {
        console.error("Error loading explore data:", e);
        setFlares(MOCK_FLARES);
      }
    }
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

  // Filter flares
  const filteredFlares = flares.filter((f) => {
    const matchSearch =
      !search ||
      (f.caption && f.caption.toLowerCase().includes(search.toLowerCase())) ||
      f.tags.some(t => t.toLowerCase().includes(search.toLowerCase())) ||
      (f.users?.display_name && f.users.display_name.toLowerCase().includes(search.toLowerCase())) ||
      f.users?.handle.toLowerCase().includes(search.toLowerCase());
      
    const matchSkills =
      activeSkills.length === 0 ||
      activeSkills.some((s) => f.tags.some(t => t.toLowerCase() === s.toLowerCase()));
      
    return matchSearch && matchSkills;
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
            <h1 className="display-sm text-white font-bold tracking-tight">
              {viewMode === "flares" ? "Trending Flares 🔥" : "Explore Creators 👥"}
            </h1>
          </motion.div>
          
          {/* Glassmorphic Selector */}
          <motion.div
            className="flex items-center p-1 rounded-xl bg-[var(--bg-frosted)] border border-[var(--glass-border)] backdrop-blur-md self-start md:self-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={() => setViewMode("flares")}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-1.5 ${
                viewMode === "flares"
                  ? "bg-white text-[#030308] shadow-[0_4px_15px_rgba(255,255,255,0.15)]"
                  : "text-[var(--text-secondary)] hover:text-white"
              }`}
            >
              Flares 🔥
            </button>
            <button
              onClick={() => setViewMode("creators")}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-1.5 ${
                viewMode === "creators"
                  ? "bg-white text-[#030308] shadow-[0_4px_15px_rgba(255,255,255,0.15)]"
                  : "text-[var(--text-secondary)] hover:text-white"
              }`}
            >
              Creators 👥
            </button>
          </motion.div>
        </div>

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
              placeholder={viewMode === "flares" ? "Search flares by tags, captions, or creator handles..." : "Search creators by name, skill, or role…"}
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

        {/* Role filter pills (only for creators) */}
        {viewMode === "creators" && (
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
        )}

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
        <p className="text-sm mb-6 font-mono" style={{ color: "var(--text-muted)" }}>
          {viewMode === "flares" ? (
            `${filteredFlares.length} Flare${filteredFlares.length !== 1 ? "s" : ""} circulating`
          ) : (
            `${filteredCreators.length} Creator${filteredCreators.length !== 1 ? "s" : ""} connected`
          )}
        </p>

        {/* Dynamic content rendering */}
        <AnimatePresence mode="wait">
          {viewMode === "flares" ? (
            <motion.div
              key="flares-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              {filteredFlares.length > 0 ? (
                filteredFlares.map((flare, i) => (
                  <FlareCard
                    key={flare.id}
                    flare={flare}
                    index={i}
                    onClick={() => setSelectedFlareIndex(i)}
                  />
                ))
              ) : (
                <EmptyState onClear={() => {
                  setSearch("");
                  setActiveSkills([]);
                }} />
              )}
            </motion.div>
          ) : (
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
          )}
        </AnimatePresence>

        {/* Immersive Vertical Swipe Viewer Overlay */}
        {selectedFlareIndex !== null && (
          <FlaresViewer
            flares={filteredFlares}
            initialIndex={selectedFlareIndex}
            onClose={() => setSelectedFlareIndex(null)}
          />
        )}
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

