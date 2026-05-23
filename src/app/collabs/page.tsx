"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, DollarSign, Users, Zap, X } from "lucide-react";
import { MOCK_COLLABS } from "@/lib/data";
import CollabCard from "@/components/cards/CollabCard";
import { RevealEffect } from "@/components/ui/RevealEffect";
import Button from "@/components/ui/Button";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

const TYPE_FILTERS = [
  { label: "All", value: "all" },
  { label: "Paid", value: "paid" },
  { label: "Collab", value: "collab" },
  { label: "Open Source", value: "open-source" },
];

export default function CollabsPage() {
  const supabase = createClient();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState("all");
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Database data
  const [dbCollabs, setDbCollabs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal form states
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [collabType, setCollabType] = useState<"paid" | "collab" | "open-source">("collab");
  const [budget, setBudget] = useState("");
  const [timeCommitment, setTimeCommitment] = useState("");
  const [spots, setSpots] = useState(1);
  const [skillsInput, setSkillsInput] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUser(user);
    });
    fetchCollabs();
  }, []);

  const fetchCollabs = async () => {
    try {
      setLoading(true);
      // Query collab calls and join profiles
      const { data, error } = await supabase
        .from('collab_calls')
        .select(`
          id,
          title,
          description,
          type,
          budget,
          skills,
          time_commitment,
          spots,
          created_at,
          user_id,
          collab_status,
          users (
            id,
            display_name,
            handle,
            avatar_url,
            tagline
          )
        `)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setDbCollabs(data);
      } else {
        console.warn("Could not query DB collab calls (migration may not be applied yet):", error?.message);
      }
    } catch (err) {
      console.error("Failed fetching live collab calls:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      router.push("/login");
      return;
    }

    setIsPosting(true);
    const parsedSkills = skillsInput
      .split(",")
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const insertData = {
      user_id: currentUser.id,
      title,
      description,
      type: collabType,
      budget: collabType === "paid" ? budget : null,
      time_commitment: timeCommitment || null,
      spots: Number(spots) || 1,
      skills: parsedSkills
    };

    const { data, error } = await supabase
      .from('collab_calls')
      .insert(insertData)
      .select(`
        id, title, description, type, budget, skills, time_commitment, spots, created_at, user_id, collab_status,
        users ( id, display_name, handle, avatar_url, tagline )
      `)
      .single();

    setIsPosting(false);

    if (!error && data) {
      setDbCollabs(prev => [data, ...prev]);
      setIsPostModalOpen(false);
      // Reset form
      setTitle("");
      setDescription("");
      setCollabType("collab");
      setBudget("");
      setTimeCommitment("");
      setSpots(1);
      setSkillsInput("");
    } else {
      alert(error?.message || "Failed to post collab");
    }
  };

  // Map database structures to fit CollabRequest interface
  const formattedDbCollabs = dbCollabs.map((collab: any) => ({
    id: collab.id,
    title: collab.title,
    description: collab.description || "",
    skills: collab.skills || [],
    type: (collab.type || "collab") as "paid" | "collab" | "open-source",
    budget: collab.budget || undefined,
    deadline: collab.time_commitment || undefined,
    applicants: collab.collab_status === 'has_responses' ? 1 : 0,
    collab_status: collab.collab_status || 'open',
    creator: {
      id: collab.users?.id || collab.user_id,
      name: collab.users?.display_name || "Creator",
      handle: collab.users?.handle || "creator",
      avatar: collab.users?.avatar_url || "",
      verified: false
    }
  }));

  // Combine with mock collabs for rich network visual density
  const allCollabs = [...formattedDbCollabs, ...MOCK_COLLABS];

  // Perform search and filter logic
  const filtered = allCollabs.filter((c) => {
    const matchType = activeType === "all" || c.type === activeType;
    const matchSearch =
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase()) ||
      c.skills.some((s: string) => s.toLowerCase().includes(search.toLowerCase()));
    return matchType && matchSearch;
  });

  // Calculate dynamic stats
  const activeRequestsCount = allCollabs.length;
  const avgBudgetStr = "$4.5K"; // Normalized representational stat

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
          
          <Button 
            variant="primary"
            className="flex-shrink-0"
            iconRight={<Plus className="w-4 h-4" />}
            onClick={() => {
              if (!currentUser) router.push("/login");
              else setIsPostModalOpen(true);
            }}
          >
            Post a Collab
          </Button>
        </div>

        {/* Quick stats */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div
            className="rounded-2xl p-4 flex items-center gap-3"
            style={{
              background: "var(--bg-frosted)",
              backdropFilter: "blur(8px)",
              border: "1px solid var(--glass-border)",
            }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--border-subtle)" }}>
              <Zap className="w-4 h-4" style={{ color: "var(--accent-primary)" }} />
            </div>
            <div>
              <p className="text-base font-bold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
                {activeRequestsCount}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Active Requests
              </p>
            </div>
          </div>

          <div
            className="rounded-2xl p-4 flex items-center gap-3"
            style={{
              background: "var(--bg-frosted)",
              backdropFilter: "blur(8px)",
              border: "1px solid var(--glass-border)",
            }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--border-subtle)" }}>
              <DollarSign className="w-4 h-4" style={{ color: "var(--accent-primary)" }} />
            </div>
            <div>
              <p className="text-base font-bold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
                {avgBudgetStr}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Avg. Budget
              </p>
            </div>
          </div>

          <div
            className="rounded-2xl p-4 flex items-center gap-3"
            style={{
              background: "var(--bg-frosted)",
              backdropFilter: "blur(8px)",
              border: "1px solid var(--glass-border)",
            }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--border-subtle)" }}>
              <Users className="w-4 h-4" style={{ color: "var(--accent-primary)" }} />
            </div>
            <div>
              <p className="text-base font-bold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
                {allCollabs.length * 3 + 120}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Creators Available
              </p>
            </div>
          </div>
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
            <CollabCard 
              key={collab.id} 
              collab={collab} 
              index={i} 
              onApplySuccess={fetchCollabs}
            />
          ))}
        </div>

        {/* SPEC EMPTY STATE: No active wavelengths */}
        {filtered.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center p-12 mt-8 rounded-2xl bg-[var(--bg-frosted)] border border-[var(--glass-border)] backdrop-blur-xl text-center"
          >
            <div className="w-16 h-16 rounded-full bg-[var(--bg-deep)] border border-[var(--border-subtle)] flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(108,92,231,0.2)]">
              <span className="text-2xl">🤝</span>
            </div>
            <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2 tracking-tight">
              No active wavelengths.
            </h3>
            <p className="text-[var(--text-secondary)] mb-8 max-w-sm">
              No open collabs match your skills right now. Be the first to start one.
            </p>
            <Button variant="primary" onClick={() => setIsPostModalOpen(true)}>
              Start a Collab
            </Button>
          </motion.div>
        )}
      </div>

      {/* Post a Collab Modal Form */}
      <AnimatePresence>
        {isPostModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsPostModalOpen(false)}
              className="absolute inset-0 backdrop-blur-sm"
              style={{ backgroundColor: "rgba(3,3,8,0.7)" }}
            />
            
            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden p-6 max-h-[90vh] overflow-y-auto"
              style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--glass-border)" }}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-display font-bold" style={{ color: "var(--text-primary)" }}>
                  Initiate Collab Call
                </h3>
                <button 
                  onClick={() => setIsPostModalOpen(false)}
                  className="p-2 rounded-full transition-colors"
                  style={{ color: "var(--text-secondary)", backgroundColor: "var(--bg-frosted)" }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <form onSubmit={handlePostSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Need Senior React Native developer for spatial design app"
                    className="w-full bg-[var(--bg-deep)] text-[var(--text-primary)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] text-sm"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Description</label>
                  <textarea
                    required
                    placeholder="Describe the opportunity, goals, and who you're looking for..."
                    rows={4}
                    className="w-full resize-none bg-[var(--bg-deep)] text-[var(--text-primary)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] text-sm"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Collab Type</label>
                    <select
                      className="w-full bg-[var(--bg-deep)] text-[var(--text-primary)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] rounded-xl p-3 focus:outline-none text-sm"
                      value={collabType}
                      onChange={(e: any) => setCollabType(e.target.value)}
                    >
                      <option value="collab">Partnership (Collab)</option>
                      <option value="paid">Paid Project</option>
                      <option value="open-source">Open Source</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Time Commitment</label>
                    <input
                      type="text"
                      placeholder="e.g. 2-4 weeks, 10h/wk"
                      className="w-full bg-[var(--bg-deep)] text-[var(--text-primary)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] text-sm"
                      value={timeCommitment}
                      onChange={(e) => setTimeCommitment(e.target.value)}
                    />
                  </div>
                </div>

                {collabType === "paid" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Budget</label>
                    <input
                      type="text"
                      placeholder="e.g. $2,000 - $5,000"
                      className="w-full bg-[var(--bg-deep)] text-[var(--text-primary)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] text-sm"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                    />
                  </motion.div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Spots Open</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      className="w-full bg-[var(--bg-deep)] text-[var(--text-primary)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] text-sm"
                      value={spots}
                      onChange={(e) => setSpots(Number(e.target.value))}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Skills needed (Comma-separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. React, UI Design, Web3"
                      className="w-full bg-[var(--bg-deep)] text-[var(--text-primary)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] text-sm"
                      value={skillsInput}
                      onChange={(e) => setSkillsInput(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end pt-4 gap-3">
                  <Button type="button" variant="ghost" onClick={() => setIsPostModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" disabled={isPosting}>
                    {isPosting ? "Transmitting..." : "Initiate Call"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
