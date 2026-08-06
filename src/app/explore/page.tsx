"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, Loader2, Sparkles } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

import CompactIndividualCard from "@/components/cards/CompactIndividualCard";
import OrgCompactCard from "@/components/cards/OrgCompactCard";
import CompanyCard from "@/components/cards/CompanyCard";
import Button from "@/components/ui/Button";
import TraceStrip from "@/components/explore/TraceStrip";

const TABS = [
  { id: "individuals", label: "Individuals", color: "#22d3ee" }, // cyan
  { id: "pods", label: "Comms/Clubs", color: "#a78bfa" }, // purple
  { id: "companies", label: "Companies", color: "#ffffff" } // neon-white
];

// Aura tiers definition for filter values
const AURA_TIERS = ["All", "Pillar", "Core", "Trusted", "Rising", "New"];
const POD_SIZES = [
  { id: "", label: "All Sizes" },
  { id: "small", label: "Small (<10)" },
  { id: "medium", label: "Medium (10-50)" },
  { id: "large", label: "Large (50+)" }
];
const POD_VISIBILITIES = [
  { id: "", label: "All Policies" },
  { id: "open", label: "Open Join" },
  { id: "gated", label: "Gated Hub" }
];
const POD_ACTIVITIES = [
  { id: "", label: "All Activities" },
  { id: "high", label: "High Activity" },
  { id: "medium", label: "Medium Activity" },
  { id: "low", label: "Low Activity" }
];
const INDUSTRIES = ["All", "Tech", "Design", "Finance", "Healthcare", "Education", "Media"];
const REACH_THRESHOLDS = [
  { id: "", label: "Any Gate" },
  { id: "200", label: "< 200 Aura" },
  { id: "500", label: "< 500 Aura" },
  { id: "700", label: "< 700 Aura" }
];

function ExplorePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL States
  const urlTab = searchParams.get("tab") || "individuals";
  const urlQ = searchParams.get("q") || "";

  // Component states
  const [activeTab, setActiveTab] = useState(urlTab);
  const [search, setSearch] = useState(urlQ);
  const [debouncedSearch, setDebouncedSearch] = useState(urlQ);
  const [showFilters, setShowFilters] = useState(true);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<any[]>([]);

  // Filter states: Individuals
  const [auraFilter, setAuraFilter] = useState("All");
  const [collabFilter, setCollabFilter] = useState(false);

  // Filter states: Pods
  const [podSizeFilter, setPodSizeFilter] = useState("");
  const [podVisFilter, setPodVisFilter] = useState("");
  const [podActFilter, setPodActFilter] = useState("");

  // Filter states: Companies
  const [industryFilter, setIndustryFilter] = useState("All");
  const [hiringFilter, setHiringFilter] = useState(false);
  const [thresholdFilter, setThresholdFilter] = useState("");

  // Handle search input debouncing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Sync tab & search parameters to the browser URL
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("tab", activeTab);
    if (debouncedSearch) {
      params.set("q", debouncedSearch);
    }
    router.replace(`/explore?${params.toString()}`);
  }, [activeTab, debouncedSearch, router]);

  // Fetch results from endpoint
  const fetchResults = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("entity_type", activeTab);
      if (debouncedSearch) {
        params.set("q", debouncedSearch);
      }

      // Add active tab-specific filters
      if (activeTab === "individuals") {
        if (auraFilter !== "All") params.set("aura", auraFilter);
        if (collabFilter) params.set("collab", "true");
      } else if (activeTab === "pods") {
        if (podSizeFilter) params.set("size", podSizeFilter);
        if (podVisFilter) params.set("visibility", podVisFilter);
        if (podActFilter) params.set("activity", podActFilter);
      } else if (activeTab === "companies") {
        if (industryFilter !== "All") params.set("industry", industryFilter);
        if (hiringFilter) params.set("hiring", "true");
        if (thresholdFilter) params.set("threshold", thresholdFilter);
      }

      const response = await fetch(`/api/explore?${params.toString()}`);
      const data = await response.json();
      setResults(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load explore results:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [
    activeTab,
    debouncedSearch,
    auraFilter,
    collabFilter,
    podSizeFilter,
    podVisFilter,
    podActFilter,
    industryFilter,
    hiringFilter,
    thresholdFilter
  ]);

  // Trigger search on changes
  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // Tab colors
  const activeColor = TABS.find((t) => t.id === activeTab)?.color || "#ffffff";

  // Reset filters
  const resetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setAuraFilter("All");
    setCollabFilter(false);
    setPodSizeFilter("");
    setPodVisFilter("");
    setPodActFilter("");
    setIndustryFilter("All");
    setHiringFilter(false);
    setThresholdFilter("");
  };

  return (
    <div className="min-h-screen pt-24 pb-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-[var(--border-subtle)] pb-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p className="label-mono mb-2 text-[var(--accent-primary)] flex items-center gap-1.5">
              <span>✦</span> Unified discovery hub
            </p>
            <h1 className="display-sm text-[var(--text-primary)] font-bold tracking-tight">
              Explore Network 📡
            </h1>
          </motion.div>
        </div>

        {/* Trending Traces Strip */}
        <TraceStrip isExploreTrending={true} className="mb-8" />

        {/* Unified Search Input Top-Bar */}
        <motion.div
          className="mb-6 flex gap-3 items-stretch"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors"
              style={{ color: search ? activeColor : "var(--text-muted)" }}
            />
            <input
              id="explore-search"
              className="input-nova pl-11 h-full py-3.5 bg-white/[0.03] border-white/10 hover:border-white/20 focus:border-white/30 text-white rounded-xl placeholder-white/30 transition-all font-sans text-sm outline-none"
              style={{ backdropFilter: "blur(8px)" }}
              placeholder={`Search ${activeTab === "pods" ? "comms/clubs" : activeTab} by name, keywords, or tags...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-medium transition-all border"
            style={{
              background: showFilters ? `${activeColor}15` : "var(--bg-frosted)",
              backdropFilter: "blur(8px)",
              borderColor: showFilters ? `${activeColor}40` : "var(--glass-border)",
              color: showFilters ? activeColor : "var(--text-secondary)",
            }}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </motion.div>

        {/* Entity Switcher segment controller tabs */}
        <div className="relative flex p-1 mb-8 rounded-xl bg-white/5 border border-white/10 max-w-md w-full">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setActiveTab(t.id);
                // Clear state filters for other tabs, keep search term
              }}
              className="relative flex-1 py-2 text-center text-sm font-bold transition-all rounded-lg outline-none"
            >
              {t.id === activeTab && (
                <motion.div
                  layoutId="activeTabOutline"
                  className="absolute inset-0 rounded-lg shadow-lg"
                  style={{
                    background: `${t.color}12`,
                    border: `1.5px solid ${t.color}40`,
                    boxShadow: `0 0 16px ${t.color}15`,
                  }}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <span
                className="relative z-10 transition-colors duration-250 font-display"
                style={{
                  color: t.id === activeTab ? t.color : "rgba(255, 255, 255, 0.45)",
                  textShadow: t.id === activeTab ? `0 0 8px ${t.color}40` : "none",
                }}
              >
                {t.label}
              </span>
            </button>
          ))}
        </div>

        {/* Adaptive filter chips layout */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden mb-8"
            >
              <div
                className="flex flex-wrap gap-2.5 p-4 rounded-xl border"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  borderColor: "var(--border-subtle)"
                }}
              >
                {activeTab === "individuals" && (
                  <>
                    {/* Aura Tiers */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-mono text-[var(--text-muted)] mr-1">Reputation:</span>
                      {AURA_TIERS.map((tier) => (
                        <button
                          key={tier}
                          onClick={() => setAuraFilter(tier)}
                          className="px-3 py-1 rounded-full text-xs font-semibold border transition-all"
                          style={{
                            background: auraFilter === tier ? "rgba(34, 211, 238, 0.15)" : "transparent",
                            borderColor: auraFilter === tier ? "#22d3ee" : "rgba(255,255,255,0.1)",
                            color: auraFilter === tier ? "#22d3ee" : "rgba(255,255,255,0.6)"
                          }}
                        >
                          {tier}
                        </button>
                      ))}
                    </div>

                    <div className="h-4 w-px bg-white/10 self-center hidden sm:block" />

                    {/* Available for collabs check */}
                    <button
                      onClick={() => setCollabFilter(!collabFilter)}
                      className="px-3.5 py-1 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5"
                      style={{
                        background: collabFilter ? "rgba(34, 211, 238, 0.15)" : "transparent",
                        borderColor: collabFilter ? "#22d3ee" : "rgba(255,255,255,0.1)",
                        color: collabFilter ? "#22d3ee" : "rgba(255,255,255,0.6)"
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      Available for Work
                    </button>
                  </>
                )}

                {activeTab === "pods" && (
                  <>
                    {/* Pod Visibilities */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-mono text-[var(--text-muted)] mr-1">Access:</span>
                      {POD_VISIBILITIES.map((vis) => (
                        <button
                          key={vis.id}
                          onClick={() => setPodVisFilter(vis.id)}
                          className="px-3 py-1 rounded-full text-xs font-semibold border transition-all"
                          style={{
                            background: podVisFilter === vis.id ? "rgba(167, 139, 250, 0.15)" : "transparent",
                            borderColor: podVisFilter === vis.id ? "#a78bfa" : "rgba(255,255,255,0.1)",
                            color: podVisFilter === vis.id ? "#a78bfa" : "rgba(255,255,255,0.6)"
                          }}
                        >
                          {vis.label}
                        </button>
                      ))}
                    </div>

                    <div className="h-4 w-px bg-white/10 self-center hidden sm:block" />

                    {/* Pod Sizes */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-mono text-[var(--text-muted)] mr-1">Crew Size:</span>
                      {POD_SIZES.map((sz) => (
                        <button
                          key={sz.id}
                          onClick={() => setPodSizeFilter(sz.id)}
                          className="px-3 py-1 rounded-full text-xs font-semibold border transition-all"
                          style={{
                            background: podSizeFilter === sz.id ? "rgba(167, 139, 250, 0.15)" : "transparent",
                            borderColor: podSizeFilter === sz.id ? "#a78bfa" : "rgba(255,255,255,0.1)",
                            color: podSizeFilter === sz.id ? "#a78bfa" : "rgba(255,255,255,0.6)"
                          }}
                        >
                          {sz.label}
                        </button>
                      ))}
                    </div>

                    <div className="h-4 w-px bg-white/10 self-center hidden sm:block" />

                    {/* Pod Activities */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-mono text-[var(--text-muted)] mr-1">Pulse:</span>
                      {POD_ACTIVITIES.map((act) => (
                        <button
                          key={act.id}
                          onClick={() => setPodActFilter(act.id)}
                          className="px-3 py-1 rounded-full text-xs font-semibold border transition-all"
                          style={{
                            background: podActFilter === act.id ? "rgba(167, 139, 250, 0.15)" : "transparent",
                            borderColor: podActFilter === act.id ? "#a78bfa" : "rgba(255,255,255,0.1)",
                            color: podActFilter === act.id ? "#a78bfa" : "rgba(255,255,255,0.6)"
                          }}
                        >
                          {act.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {activeTab === "companies" && (
                  <>
                    {/* Industries */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-mono text-[var(--text-muted)] mr-1">Sector:</span>
                      {INDUSTRIES.map((ind) => (
                        <button
                          key={ind}
                          onClick={() => setIndustryFilter(ind)}
                          className="px-3 py-1 rounded-full text-xs font-semibold border transition-all"
                          style={{
                            background: industryFilter === ind ? "rgba(255, 255, 255, 0.15)" : "transparent",
                            borderColor: industryFilter === ind ? "#ffffff" : "rgba(255,255,255,0.1)",
                            color: industryFilter === ind ? "#ffffff" : "rgba(255,255,255,0.6)"
                          }}
                        >
                          {ind}
                        </button>
                      ))}
                    </div>

                    <div className="h-4 w-px bg-white/10 self-center hidden sm:block" />

                    {/* Reach Thresholds */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-mono text-[var(--text-muted)] mr-1">Reach Threshold:</span>
                      {REACH_THRESHOLDS.map((th) => (
                        <button
                          key={th.id}
                          onClick={() => setThresholdFilter(th.id)}
                          className="px-3 py-1 rounded-full text-xs font-semibold border transition-all"
                          style={{
                            background: thresholdFilter === th.id ? "rgba(255, 255, 255, 0.15)" : "transparent",
                            borderColor: thresholdFilter === th.id ? "#ffffff" : "rgba(255,255,255,0.1)",
                            color: thresholdFilter === th.id ? "#ffffff" : "rgba(255,255,255,0.6)"
                          }}
                        >
                          {th.label}
                        </button>
                      ))}
                    </div>

                    <div className="h-4 w-px bg-white/10 self-center hidden sm:block" />

                    {/* Hiring Toggle */}
                    <button
                      onClick={() => setHiringFilter(!hiringFilter)}
                      className="px-3.5 py-1 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5"
                      style={{
                        background: hiringFilter ? "rgba(255, 255, 255, 0.15)" : "transparent",
                        borderColor: hiringFilter ? "#ffffff" : "rgba(255,255,255,0.1)",
                        color: hiringFilter ? "#ffffff" : "rgba(255,255,255,0.6)"
                      }}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Active Reach Gateway
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results grid rendering */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading-spinner"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-primary)] mb-4" />
              <p className="text-xs font-mono text-[var(--text-muted)]">Aligning discovery frequencies...</p>
            </motion.div>
          ) : results.length > 0 ? (
            <motion.div
              key={`${activeTab}-grid`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`grid gap-5 ${
                activeTab === "pods"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" // slightly larger Pod cards
                  : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" // compact profile cards
              }`}
            >
              {results.map((item, idx) => {
                if (activeTab === "individuals") {
                  return (
                    <CompactIndividualCard key={item.id} creator={item} index={idx} />
                  );
                } else if (activeTab === "pods") {
                  return (
                    <OrgCompactCard key={item.id} {...item} index={idx} />
                  );
                } else if (activeTab === "companies") {
                  return (
                    <CompanyCard key={item.id} company={item} index={idx} />
                  );
                }
                return null;
              })}
            </motion.div>
          ) : (
            <EmptyState onClear={resetFilters} />
          )}
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
        We couldn't find anything matching those search parameters on this wavelength.
      </p>
      <Button variant="ghost" onClick={onClear}>
        Reset Exploration Search
      </Button>
    </motion.div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-24 pb-24 px-4 sm:px-6 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-primary)] mb-4" />
        <p className="text-xs font-mono text-[var(--text-muted)]">Aligning discovery frequencies...</p>
      </div>
    }>
      <ExplorePageContent />
    </Suspense>
  );
}
