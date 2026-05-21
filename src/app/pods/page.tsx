"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  X,
  Users,
  Zap,
  BookOpen,
  Target,
  Wrench,
  CheckCircle,
  Loader2,
} from "lucide-react";
import PodCard, { PodCardProps } from "@/components/cards/PodCard";
import { PodType } from "@/types";
import Button from "@/components/ui/Button";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

/* ─── Filter tabs ─────────────────────────────────────────────── */
const FILTER_TABS = [
  { label: "All", value: "all" },
  { label: "🤝 Meetup", value: "meetup" },
  { label: "⚡ Hackathon", value: "hackathon" },
  { label: "📖 Class", value: "class" },
  { label: "🎯 Club", value: "club" },
  { label: "⚽ Sports", value: "sports" },
  { label: "🎮 Gaming", value: "gaming" },
  { label: "🏆 Tournament", value: "tournament" },
  { label: "🛠️ Project", value: "project" },
] as const;

type FilterValue = (typeof FILTER_TABS)[number]["value"];

/* ─── Mock pods (shown when DB has no data yet) ───────────────── */
const MOCK_PODS: Omit<PodCardProps, "onJoin">[] = [
  {
    id: "mock-1",
    name: "IIT Madras Inter-Hostel Chess Tournament",
    podType: "tournament",
    description:
      "Official campus brackets. Register your hostel team here. Prizes up to 15k INR.",
    memberCount: 24,
    maxMembers: 64,
    roleTags: ["Inter-hostel", "Prizes"],
    visibility: "open",
    creator: { handle: "chess_pres", displayName: "Aravind S" },
    isMember: false,
    hub: { name: "IIT Madras", shortName: "IIT Madras", hubType: "college" },
    index: 0,
  },
  {
    id: "mock-2",
    name: "Prestige Palms Tennis Tournament",
    podType: "tournament",
    description:
      "Mixed doubles weekend tournament for Sherwood & Prestige residents at Court A.",
    memberCount: 8,
    maxMembers: 16,
    roleTags: ["Mixed doubles", "Court A"],
    visibility: "open",
    creator: { handle: "rohit_g", displayName: "Rohit Goel" },
    isMember: false,
    hub: { name: "Prestige Palms Residential Society", shortName: "Prestige Palms", hubType: "society" },
    index: 1,
  },
  {
    id: "mock-3",
    name: "VIT FIFA 26 Campus Tournament",
    podType: "gaming",
    description:
      "Gaming pod for registration, matchups and coordination for the VIT FIFA lan event.",
    memberCount: 18,
    maxMembers: 32,
    roleTags: ["FIFA 26", "LAN event"],
    visibility: "open",
    creator: { handle: "gamer_vit", displayName: "Varun Nair" },
    isMember: false,
    hub: { name: "Vellore Institute of Technology", shortName: "VIT", hubType: "college" },
    index: 2,
  },
  {
    id: "mock-4",
    name: "CS301 Study Group",
    podType: "class",
    description:
      "Weekly problem-set sessions, exam prep and concept reviews for Algorithms & Complexity.",
    memberCount: 12,
    maxMembers: 20,
    roleTags: ["Meeting Thursdays 5pm"],
    visibility: "open",
    creator: { handle: "priya_m", displayName: "Priya Mehta" },
    isMember: false,
    hub: { name: "Vellore Institute of Technology", shortName: "VIT", hubType: "college" },
    index: 3,
  },
];

/* ─── Stat card ───────────────────────────────────────────────── */
function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}) {
  return (
    <div
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
        {icon}
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
  );
}

/* ─── Inline label helper ─────────────────────────────────────── */
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label
      className="block text-[10px] font-semibold uppercase tracking-wider mb-2"
      style={{ color: "var(--text-muted)" }}
    >
      {children}
    </label>
  );
}

const INPUT_CLS =
  "w-full bg-[var(--bg-deep)] text-[var(--text-primary)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] text-sm transition-all";

/* ─── CreatePodModal ──────────────────────────────────────────── */
function CreatePodModal({
  onClose,
  onCreated,
  currentUserId,
  userCollege,
}: {
  onClose: () => void;
  onCreated: (pod: any) => void;
  currentUserId: string | null;
  userCollege: any;
}) {
  const supabase = createClient();
  const router = useRouter();

  const [podName, setPodName] = useState("");
  const [podType, setPodType] = useState<PodType>("project");
  const [visibility, setVisibility] = useState<"open" | "invite">("open");
  const [maxMembers, setMaxMembers] = useState("");
  const [roleTagsInput, setRoleTagsInput] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  // Hub states
  const [selectedCollege, setSelectedCollege] = useState<any>(userCollege);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchingColleges, setSearchingColleges] = useState(false);
  const [isCreatingHub, setIsCreatingHub] = useState(false);

  // Custom Hub Form States
  const [newHubName, setNewHubName] = useState("");
  const [newHubShortName, setNewHubShortName] = useState("");
  const [newHubType, setNewHubType] = useState<"college" | "society" | "corporate" | "other">("college");
  const [newHubCity, setNewHubCity] = useState("");

  // Search Colleges/Hubs
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const searchHubs = async () => {
      setSearchingColleges(true);
      const { data } = await supabase
        .from("colleges")
        .select("id, name, short_name, hub_type, email_domain")
        .or(`name.ilike.%${searchQuery.trim()}%,short_name.ilike.%${searchQuery.trim()}%`)
        .limit(5);
      setSearchResults(data || []);
      setSearchingColleges(false);
    };
    const debounceId = setTimeout(searchHubs, 300);
    return () => clearTimeout(debounceId);
  }, [searchQuery, supabase]);

  const handleSelectHub = (college: any) => {
    setSelectedCollege(college);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleCreateHub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHubName.trim()) return;
    setSubmitting(true);
    
    // Check if name already exists
    const { data: existing } = await supabase
      .from('colleges')
      .select('id, name, short_name, hub_type, email_domain')
      .eq('name', newHubName.trim())
      .maybeSingle();

    if (existing) {
      setSelectedCollege(existing);
      setIsCreatingHub(false);
      setSubmitting(false);
      return;
    }

    const { data: newCollege, error } = await supabase
      .from('colleges')
      .insert({
        name: newHubName.trim(),
        short_name: newHubShortName.trim() || null,
        hub_type: newHubType,
        city: newHubCity.trim() || null,
        is_verified: true
      })
      .select()
      .single();

    if (!error && newCollege) {
      setSelectedCollege(newCollege);
      setIsCreatingHub(false);
      setNewHubName("");
      setNewHubShortName("");
      setNewHubCity("");
    } else {
      console.error("Hub creation error:", error);
      alert(error?.message || "Failed to create hub");
    }
    setSubmitting(false);
  };

  const POD_TYPES: { value: PodType; label: string; emoji: string }[] = [
    { value: "meetup", label: "Meetup", emoji: "🤝" },
    { value: "hackathon", label: "Hackathon", emoji: "⚡" },
    { value: "class", label: "Class", emoji: "📖" },
    { value: "club", label: "Club", emoji: "🎯" },
    { value: "sports", label: "Sports", emoji: "⚽" },
    { value: "gaming", label: "Gaming", emoji: "🎮" },
    { value: "tournament", label: "Tournament", emoji: "🏆" },
    { value: "project", label: "Project", emoji: "🛠️" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) {
      router.push("/login");
      return;
    }

    setSubmitting(true);
    const parsedTags = roleTagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const payload = {
      creator_id: currentUserId,
      college_id: selectedCollege?.id || null,
      name: podName,
      pod_type: podType,
      description: description || null,
      visibility,
      max_members: maxMembers ? Number(maxMembers) : null,
      role_tags: parsedTags,
      is_active: true,
    };

    const { data, error } = await supabase
      .from("pods")
      .insert(payload)
      .select("*, creator:users!pods_creator_id_fkey(handle, display_name, avatar_url)")
      .single();

    setSubmitting(false);
    if (!error && data) {
      setDone(true);
      setTimeout(() => {
        onCreated(data);
        onClose();
      }, 1400);
    } else {
      console.error("Pod creation error:", error?.message);
      alert(error?.message || "Failed to create pod.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 backdrop-blur-sm"
        style={{ backgroundColor: "rgba(3,3,8,0.75)" }}
      />

      {/* Modal body */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
        className="relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
        style={{
          backgroundColor: "var(--bg-deep)",
          border: "1px solid var(--glass-border)",
          maxHeight: "92vh",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <div>
            <h3
              className="text-lg font-bold"
              style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}
            >
              Create a Pod
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              Start your crew. Ship something real.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{
              background: "var(--bg-frosted)",
              border: "1px solid var(--glass-border)",
              color: "var(--text-secondary)",
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: "calc(92vh - 72px)" }}>
          <AnimatePresence mode="wait">
            {done ? (
              <motion.div
                key="done"
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                  style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.3)" }}
                >
                  <CheckCircle className="w-8 h-8" style={{ color: "#34d399" }} />
                </div>
                <h4
                  className="text-xl font-bold mb-1"
                  style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}
                >
                  Pod Launched!
                </h4>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Your pod is live. Time to find your crew.
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="p-6 space-y-5"
              >
                {/* Pod Name */}
                <div>
                  <FieldLabel>Pod Name *</FieldLabel>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HackMIT 2026 Squad"
                    className={INPUT_CLS}
                    value={podName}
                    onChange={(e) => setPodName(e.target.value)}
                  />
                </div>

                {/* Campus / Community Hub Tag */}
                <div className="rounded-2xl p-4 border border-[var(--border-subtle)] bg-[var(--bg-deep)] space-y-3">
                  <div className="flex items-center justify-between">
                    <FieldLabel>Hub Tag (Displays next to Pod name)</FieldLabel>
                    {!isCreatingHub && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCollege(null);
                          setSearchQuery("");
                        }}
                        className="text-xs font-semibold text-[var(--accent-primary)] hover:underline"
                      >
                        {selectedCollege ? "Change" : "Search Hub"}
                      </button>
                    )}
                  </div>

                  {isCreatingHub ? (
                    <div className="space-y-3 p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-deep)]">
                      <p className="text-xs font-semibold text-[var(--text-primary)]">Create Custom Hub Tag</p>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-[var(--text-muted)] font-semibold uppercase block mb-1">Hub Name *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. IIT Bombay"
                            className="w-full bg-[var(--bg-deep)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-lg p-2 text-xs focus:outline-none focus:border-[var(--accent-primary)]"
                            value={newHubName}
                            onChange={(e) => setNewHubName(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-[var(--text-muted)] font-semibold uppercase block mb-1">Short Tag *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. IITB"
                            className="w-full bg-[var(--bg-deep)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-lg p-2 text-xs focus:outline-none focus:border-[var(--accent-primary)]"
                            value={newHubShortName}
                            onChange={(e) => setNewHubShortName(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-[var(--text-muted)] font-semibold uppercase block mb-1">Hub Type</label>
                          <select
                            className="w-full bg-[var(--bg-deep)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-lg p-2 text-xs focus:outline-none focus:border-[var(--accent-primary)]"
                            value={newHubType}
                            onChange={(e) => setNewHubType(e.target.value as any)}
                          >
                            <option value="college">🏫 College</option>
                            <option value="society">🏡 Society</option>
                            <option value="corporate">🏢 Corporate</option>
                            <option value="other">🌐 Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] text-[var(--text-muted)] font-semibold uppercase block mb-1">City</label>
                          <input
                            type="text"
                            placeholder="e.g. Mumbai"
                            className="w-full bg-[var(--bg-deep)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-lg p-2 text-xs focus:outline-none focus:border-[var(--accent-primary)]"
                            value={newHubCity}
                            onChange={(e) => setNewHubCity(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsCreatingHub(false)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--border-subtle)] text-[var(--text-secondary)]"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleCreateHub}
                          disabled={submitting || !newHubName.trim()}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--accent-primary)] text-white hover:opacity-90 disabled:opacity-50"
                        >
                          {submitting ? "Creating..." : "Apply Tag"}
                        </button>
                      </div>
                    </div>
                  ) : selectedCollege ? (
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-[var(--glass-border)] bg-[var(--bg-frosted)]">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl bg-[var(--border-subtle)]">
                        {selectedCollege.hub_type === "society"
                          ? "🏡"
                          : selectedCollege.hub_type === "corporate"
                          ? "🏢"
                          : selectedCollege.hub_type === "other"
                          ? "🌐"
                          : "🏫"}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[var(--text-primary)]">{selectedCollege.name}</p>
                        <p className="text-xs text-[var(--text-muted)]">
                          Short Tag: <span className="font-mono text-[var(--accent-primary)]">{selectedCollege.short_name || "None"}</span>
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search colleges, residential societies, corporate spaces..."
                          className="w-full bg-[var(--bg-deep)] text-[var(--text-primary)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] rounded-xl p-3 focus:outline-none text-sm transition-all pr-10"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchingColleges && (
                          <div className="absolute right-3 top-3.5">
                            <Loader2 className="w-4 h-4 animate-spin text-[var(--text-muted)]" />
                          </div>
                        )}
                      </div>

                      {searchResults.length > 0 && (
                        <div className="rounded-xl border border-[var(--border-subtle)] overflow-hidden bg-[var(--bg-deep)] divide-y divide-[var(--border-subtle)]">
                          {searchResults.map((hub: any) => (
                            <button
                              key={hub.id}
                              type="button"
                              onClick={() => handleSelectHub(hub)}
                              className="w-full text-left p-3 hover:bg-[var(--bg-frosted)] flex items-center justify-between text-xs transition-colors"
                            >
                              <div>
                                <span className="font-semibold text-[var(--text-primary)]">{hub.name}</span>
                                {hub.short_name && (
                                  <span className="ml-2 font-mono text-[var(--accent-primary)]">({hub.short_name})</span>
                                )}
                              </div>
                              <span className="text-[var(--text-muted)] text-[10px] uppercase font-bold tracking-wider">
                                {hub.hub_type === "society" ? "Society" : hub.hub_type === "corporate" ? "Corp" : "Campus"}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCollege(null);
                            setSearchQuery("");
                          }}
                          className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                        >
                          🌐 Keep Global Net (No Tag)
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsCreatingHub(true)}
                          className="text-xs font-semibold text-[var(--accent-primary)] hover:underline"
                        >
                          + Create Custom Hub Tag
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Pod Type — radio row */}
                <div>
                  <FieldLabel>Pod Type *</FieldLabel>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {POD_TYPES.map(({ value, label, emoji }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setPodType(value)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium border transition-all text-left"
                        style={{
                          background:
                            podType === value
                              ? "rgba(108,92,231,0.14)"
                              : "var(--bg-deep)",
                          borderColor:
                            podType === value
                              ? "rgba(108,92,231,0.5)"
                              : "var(--border-subtle)",
                          color:
                            podType === value
                              ? "var(--text-primary)"
                              : "var(--text-secondary)",
                        }}
                      >
                        <span>{emoji}</span>
                        {label}
                        {podType === value && (
                          <span
                            className="ml-auto w-3.5 h-3.5 rounded-full flex items-center justify-center"
                            style={{ background: "var(--accent-primary)" }}
                          >
                            <svg
                              viewBox="0 0 8 8"
                              fill="white"
                              className="w-2 h-2"
                            >
                              <circle cx="4" cy="4" r="2" />
                            </svg>
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Visibility toggle */}
                <div>
                  <FieldLabel>Visibility *</FieldLabel>
                  <div
                    className="inline-flex rounded-xl p-1 gap-1"
                    style={{ background: "var(--bg-deep)", border: "1px solid var(--border-subtle)" }}
                  >
                    {(["open", "invite"] as const).map((vis) => (
                      <button
                        key={vis}
                        type="button"
                        onClick={() => setVisibility(vis)}
                        className="relative px-4 py-2 rounded-lg text-sm font-medium transition-all"
                        style={{
                          color:
                            visibility === vis
                              ? "var(--text-primary)"
                              : "var(--text-muted)",
                        }}
                      >
                        {visibility === vis && (
                          <motion.span
                            layoutId="vis-pill"
                            className="absolute inset-0 rounded-lg"
                            style={{ background: "var(--accent-primary)" }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        )}
                        <span className="relative z-10">
                          {vis === "open" ? "🔓 Open" : "🔒 Invite Only"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <FieldLabel>Description</FieldLabel>
                  <textarea
                    rows={3}
                    placeholder="What's this pod about? What will members build together?"
                    className={`${INPUT_CLS} resize-none`}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {/* Max members + role tags (2-col) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FieldLabel>Max Members</FieldLabel>
                    <input
                      type="number"
                      min={2}
                      max={100}
                      placeholder="e.g. 10"
                      className={INPUT_CLS}
                      value={maxMembers}
                      onChange={(e) => setMaxMembers(e.target.value)}
                    />
                  </div>
                  <div>
                    <FieldLabel>Role Tags (comma-separated)</FieldLabel>
                    <input
                      type="text"
                      placeholder="Backend dev, Designer…"
                      className={INPUT_CLS}
                      value={roleTagsInput}
                      onChange={(e) => setRoleTagsInput(e.target.value)}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-1">
                  <Button type="button" variant="ghost" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" loading={submitting}>
                    {submitting ? "Launching…" : "Launch Pod"}
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────────── */
export default function PodsPage() {
  const supabase = createClient();
  const router = useRouter();

  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");
  const [dbPods, setDbPods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userCollege, setUserCollege] = useState<any>(null);
  const [scopeFilter, setScopeFilter] = useState<"local" | "global">("local");
  const [userMemberships, setUserMemberships] = useState<Set<string>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);

  /* ── Auth + initial fetch ───────────────────────────────────── */
  useEffect(() => {
    const initPage = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      let collegeIdToQuery = null;
      
      if (user) {
        // Query full profile including college details
        const { data: profile } = await supabase
          .from("users")
          .select("*, colleges(*)")
          .eq("id", user.id)
          .single();
          
        if (profile) {
          setCurrentUser(profile);
          fetchMemberships(user.id);
          if (profile.colleges) {
            setUserCollege(profile.colleges);
            collegeIdToQuery = profile.colleges.id;
          }
        }
      }
      
      // If user isn't logged in or doesn't have a hub, default to global view
      const defaultScope = collegeIdToQuery ? scopeFilter : "global";
      if (!collegeIdToQuery && scopeFilter === "local") {
        setScopeFilter("global");
      }
      
      await fetchPods(collegeIdToQuery, defaultScope);
    };

    initPage();
  }, [scopeFilter]);

  const fetchPods = async (collegeId: string | null = null, currentScope: "local" | "global" = "local") => {
    setLoading(true);
    try {
      let query = supabase
        .from("pods")
        .select(
          "*, creator:users!pods_creator_id_fkey(handle, display_name, avatar_url), colleges(*), pod_members(count)"
        )
        .neq("pod_status", "deleted");

      const targetCollegeId = collegeId || userCollege?.id;
      if (currentScope === "local" && targetCollegeId) {
        query = query.eq("college_id", targetCollegeId);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (!error && data) {
        setDbPods(data);
      } else {
        console.warn("Pods fetch warning:", error?.message);
        setDbPods([]);
      }
    } catch (err) {
      console.error("fetchPods error:", err);
      setDbPods([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberships = async (userId: string) => {
    const { data } = await supabase
      .from("pod_members")
      .select("pod_id")
      .eq("user_id", userId);
    if (data) {
      setUserMemberships(new Set(data.map((m: any) => m.pod_id)));
    }
  };

  /* ── Join handler ───────────────────────────────────────────── */
  const handleJoin = async (podId: string) => {
    if (!currentUser) {
      router.push("/login");
      return;
    }
    const { error } = await supabase
      .from("pod_members")
      .insert({ pod_id: podId, user_id: currentUser.id });
    if (!error) {
      setUserMemberships((prev) => new Set([...prev, podId]));
    } else {
      console.error("Join error:", error.message);
    }
  };

  /* ── Map DB rows → PodCardProps ─────────────────────────────── */
  const mapDbPod = (pod: any, idx: number): Omit<PodCardProps, "onJoin"> => ({
    id: pod.id,
    name: pod.name,
    podType: pod.pod_type ?? "project",
    description: pod.description ?? "",
    memberCount:
      Array.isArray(pod.pod_members)
        ? pod.pod_members[0]?.count ?? 0
        : (pod.pod_members?.count ?? 0),
    maxMembers: pod.max_members ?? undefined,
    roleTags: pod.role_tags ?? [],
    visibility: pod.visibility ?? "open",
    creator: {
      handle: pod.creator?.handle ?? "unknown",
      displayName: pod.creator?.display_name ?? "Creator",
      avatarUrl: pod.creator?.avatar_url ?? undefined,
    },
    isMember: userMemberships.has(pod.id),
    hub: pod.colleges ? {
      name: pod.colleges.name,
      shortName: pod.colleges.short_name,
      hubType: pod.colleges.hub_type,
    } : undefined,
    index: idx,
    podStatus: pod.pod_status,
  });

  /* ── Combine live + mock; filter ────────────────────────────── */
  const useMocks = !loading && dbPods.length === 0;
  const allPods: Omit<PodCardProps, "onJoin">[] = useMocks
    ? MOCK_PODS
    : dbPods.map(mapDbPod);

  const filtered =
    activeFilter === "all"
      ? allPods
      : allPods.filter((p) => p.podType === activeFilter);

  /* ── Stats ──────────────────────────────────────────────────── */
  const totalMembers = allPods.reduce((acc, p) => acc + p.memberCount, 0);
  const openPods = allPods.filter((p) => p.visibility === "open").length;

  return (
    <div className="min-h-screen pt-24 pb-28 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* ── Page header ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8"
        >
          <div>
            {/* Label mono pill */}
            <span
              className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full border mb-4"
              style={{
                background: "rgba(108,92,231,0.10)",
                borderColor: "rgba(108,92,231,0.30)",
                color: "var(--accent-primary)",
                fontFamily: "var(--font-mono)",
              }}
            >
              <Zap className="w-2.5 h-2.5" />
              Campus Layer · Community Pods
            </span>

            <h1
              className="text-4xl font-bold tracking-tight leading-none mb-3"
              style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}
            >
              Community Pods 🏡
            </h1>
            <p className="text-base max-w-md" style={{ color: "var(--text-secondary)" }}>
              Find your crew. Study, play, compete, or build together.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-shrink-0">
            {/* Hub Selector Tab Toggle */}
            {userCollege && (
              <div
                className="inline-flex rounded-xl p-1 gap-1"
                style={{
                  background: "var(--bg-frosted)",
                  border: "1px solid var(--glass-border)",
                }}
              >
                <button
                  onClick={() => setScopeFilter("local")}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
                  style={{
                    background:
                      scopeFilter === "local" ? "var(--accent-primary)" : "transparent",
                    color: scopeFilter === "local" ? "#fff" : "var(--text-muted)",
                  }}
                >
                  <span>
                    {userCollege.hub_type === "society"
                      ? "🏡"
                      : userCollege.hub_type === "corporate"
                      ? "🏢"
                      : "🏫"}
                  </span>
                  {userCollege.short_name || userCollege.name}
                </button>
                <button
                  onClick={() => setScopeFilter("global")}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
                  style={{
                    background:
                      scopeFilter === "global" ? "var(--accent-primary)" : "transparent",
                    color: scopeFilter === "global" ? "#fff" : "var(--text-muted)",
                  }}
                >
                  🌐 Global Net
                </button>
              </div>
            )}

            <Button
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => {
                if (!currentUser) router.push("/login");
                else setShowCreateModal(true);
              }}
            >
              Create Pod
            </Button>
          </div>
        </motion.div>

        {/* ── Stats row ───────────────────────────────────────── */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          <StatCard
            icon={<Zap className="w-4 h-4" style={{ color: "var(--accent-primary)" }} />}
            value={allPods.length}
            label="Active Pods"
          />
          <StatCard
            icon={<Users className="w-4 h-4" style={{ color: "var(--accent-secondary)" }} />}
            value={totalMembers}
            label="Total Members"
          />
          <StatCard
            icon={<BookOpen className="w-4 h-4" style={{ color: "#fb923c" }} />}
            value={openPods}
            label="Open to Join"
          />
        </motion.div>

        {/* ── Filter tabs (horizontally scrollable) ───────────── */}
        <motion.div
          className="relative mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.12 }}
        >
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
            {FILTER_TABS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setActiveFilter(value)}
                className="relative flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                style={{
                  color:
                    activeFilter === value
                      ? "var(--text-primary)"
                      : "var(--text-muted)",
                }}
              >
                {/* Animated active pill */}
                {activeFilter === value && (
                  <motion.span
                    layoutId="pod-filter-pill"
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: "var(--bg-frosted)",
                      border: "1px solid rgba(108,92,231,0.35)",
                    }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{label}</span>
              </button>
            ))}
          </div>

          {/* Active underline accent */}
          <div
            className="absolute bottom-0 left-0 right-0 h-px"
            style={{ background: "var(--border-subtle)" }}
          />
        </motion.div>

        {/* ── Results count ────────────────────────────────────── */}
        <p className="text-xs mb-5" style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          {loading ? "Loading pods…" : `${filtered.length} pod${filtered.length !== 1 ? "s" : ""} found`}
          {useMocks && !loading && (
            <span
              className="ml-2 px-2 py-0.5 rounded-full text-[10px] border"
              style={{
                background: "rgba(253,203,110,0.08)",
                borderColor: "rgba(253,203,110,0.25)",
                color: "#fdcb6e",
              }}
            >
              Example data
            </span>
          )}
        </p>

        {/* ── Pod grid ─────────────────────────────────────────── */}
        {loading ? (
          /* Skeleton loader */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="rounded-2xl p-5 animate-pulse"
                style={{
                  background: "var(--bg-frosted)",
                  border: "1px solid var(--glass-border)",
                  height: "240px",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex gap-2 mb-4">
                  <div className="h-5 w-20 rounded-full" style={{ background: "var(--border-subtle)" }} />
                  <div className="h-5 w-16 rounded-full ml-auto" style={{ background: "var(--border-subtle)" }} />
                </div>
                <div className="h-5 w-3/4 rounded-lg mb-2" style={{ background: "var(--border-subtle)" }} />
                <div className="h-4 w-full rounded-lg mb-1" style={{ background: "var(--border-subtle)" }} />
                <div className="h-4 w-5/6 rounded-lg" style={{ background: "var(--border-subtle)" }} />
              </motion.div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center p-16 rounded-2xl text-center"
            style={{
              background: "var(--bg-frosted)",
              border: "1px solid var(--glass-border)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
              style={{
                background: "var(--bg-deep)",
                border: "1px solid var(--border-subtle)",
                boxShadow: "0 0 32px rgba(108,92,231,0.15)",
              }}
            >
              <Target className="w-7 h-7" style={{ color: "var(--text-muted)" }} />
            </div>
            <h3
              className="text-xl font-semibold mb-2 tracking-tight"
              style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}
            >
              No pods here yet.
            </h3>
            <p className="text-sm mb-8 max-w-xs" style={{ color: "var(--text-secondary)" }}>
              Be the first to launch a{" "}
              {activeFilter !== "all" ? activeFilter : ""} pod on this campus.
            </p>
            <Button
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => {
                if (!currentUser) router.push("/login");
                else setShowCreateModal(true);
              }}
            >
              Create Pod
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {filtered.map((pod, i) => (
                <PodCard
                  key={pod.id}
                  {...pod}
                  index={i}
                  isMember={
                    useMocks ? false : userMemberships.has(pod.id)
                  }
                  onJoin={handleJoin}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── CreatePodModal portal ────────────────────────────── */}
      <AnimatePresence>
        {showCreateModal && (
          <CreatePodModal
            onClose={() => setShowCreateModal(false)}
            currentUserId={currentUser?.id ?? null}
            userCollege={userCollege}
            onCreated={(newPod) => {
              setDbPods((prev) => [newPod, ...prev]);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
