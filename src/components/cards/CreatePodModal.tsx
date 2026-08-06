"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { X, Loader2, CheckCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { PodType } from "@/types";
import Button from "@/components/ui/Button";

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

interface CreatePodModalProps {
  onClose: () => void;
  onCreated: (pod: any) => void;
  currentUserId: string | null;
  userCollege: any;
}

export default function CreatePodModal({
  onClose,
  onCreated,
  currentUserId,
  userCollege,
}: CreatePodModalProps) {
  const supabase = createClient();
  const router = useRouter();

  const [podName, setPodName] = useState("");
  const [podType, setPodType] = useState<PodType>("project");
  const [visibility, setVisibility] = useState<"open" | "request" | "invite">("open");
  const [maxMembers, setMaxMembers] = useState("");
  const [roleTagsInput, setRoleTagsInput] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  // Duration states
  const [durationType, setDurationType] = useState<"unlimited" | "window" | "relative">("unlimited");
  const [startsAt, setStartsAt] = useState(() => {
    const now = new Date();
    const pad = (n: number) => (n < 10 ? "0" + n : n);
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  });
  const [endsAt, setEndsAt] = useState("");
  const [relativeDuration, setRelativeDuration] = useState("4h");

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

    let finalStartsAt: string | null = null;
    let finalEndsAt: string | null = null;

    if (durationType === "window") {
      if (endsAt && new Date(endsAt) <= new Date(startsAt)) {
        alert("Ends At must be after Starts At");
        setSubmitting(false);
        return;
      }
      finalStartsAt = new Date(startsAt).toISOString();
      finalEndsAt = endsAt ? new Date(endsAt).toISOString() : null;
    } else if (durationType === "relative") {
      finalStartsAt = new Date().toISOString();
      const msMap = {
        "1h": 1 * 60 * 60 * 1000,
        "4h": 4 * 60 * 60 * 1000,
        "1d": 24 * 60 * 60 * 1000,
        "3d": 3 * 24 * 60 * 60 * 1000,
        "1w": 7 * 24 * 60 * 60 * 1000,
        "1m": 30 * 24 * 60 * 60 * 1000,
        "6m": 180 * 24 * 60 * 60 * 1000,
      } as Record<string, number>;
      const addedMs = msMap[relativeDuration] || (4 * 60 * 60 * 1000);
      finalEndsAt = new Date(Date.now() + addedMs).toISOString();
    }

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
      duration_type: durationType,
      starts_at: finalStartsAt,
      ends_at: finalEndsAt,
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
                    {(["open", "request", "invite"] as const).map((vis) => (
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
                          {vis === "open" ? "🔓 Open" : vis === "request" ? "📩 Request" : "🔒 Invite"}
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

                {/* Duration Picker */}
                <div className="rounded-2xl p-4 border border-[var(--border-subtle)] bg-[var(--bg-deep)] space-y-3">
                  <FieldLabel>Pod Existence / Duration</FieldLabel>
                  <div
                    className="flex rounded-xl p-1 gap-1 w-full"
                    style={{ background: "var(--bg-deep)", border: "1px solid var(--border-subtle)" }}
                  >
                    {(
                      [
                        { id: "unlimited", label: "🌐 Unlimited", hint: "Exists indefinitely" },
                        { id: "window", label: "📅 Custom Window", hint: "Start & end times" },
                        { id: "relative", label: "⏳ Set Duration", hint: "Expires after a set time" },
                      ] as const
                    ).map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setDurationType(t.id)}
                        className="relative flex-1 py-2 rounded-lg text-xs font-semibold transition-all text-center"
                        style={{
                          color:
                            durationType === t.id
                              ? "var(--text-primary)"
                              : "var(--text-muted)",
                        }}
                      >
                        {durationType === t.id && (
                          <motion.span
                            layoutId="duration-pill"
                            className="absolute inset-0 rounded-lg"
                            style={{ background: "var(--accent-primary)" }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        )}
                        <span className="relative z-10">{t.label}</span>
                      </button>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    {durationType === "window" && (
                      <motion.div
                        key="window-inputs"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2"
                      >
                        <div>
                          <label className="text-[10px] text-[var(--text-muted)] font-semibold uppercase block mb-1">Starts At *</label>
                          <input
                            type="datetime-local"
                            required
                            className="w-full bg-[var(--bg-deep)] text-[var(--text-primary)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] transition-all"
                            value={startsAt}
                            onChange={(e) => setStartsAt(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-[var(--text-muted)] font-semibold uppercase block mb-1">Ends At *</label>
                          <input
                            type="datetime-local"
                            required
                            className="w-full bg-[var(--bg-deep)] text-[var(--text-primary)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] transition-all"
                            value={endsAt}
                            onChange={(e) => setEndsAt(e.target.value)}
                          />
                        </div>
                      </motion.div>
                    )}

                    {durationType === "relative" && (
                      <motion.div
                        key="relative-inputs"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pt-2"
                      >
                        <label className="text-[10px] text-[var(--text-muted)] font-semibold uppercase block mb-1">Choose Duration *</label>
                        <select
                          className="w-full bg-[var(--bg-deep)] text-[var(--text-primary)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] transition-all"
                          value={relativeDuration}
                          onChange={(e) => setRelativeDuration(e.target.value)}
                        >
                          <option value="1h" className="bg-[var(--bg-deep)]">1 Hour</option>
                          <option value="4h" className="bg-[var(--bg-deep)]">4 Hours</option>
                          <option value="1d" className="bg-[var(--bg-deep)]">1 Day (24 hrs)</option>
                          <option value="3d" className="bg-[var(--bg-deep)]">3 Days</option>
                          <option value="1w" className="bg-[var(--bg-deep)]">1 Week (7 days)</option>
                          <option value="1m" className="bg-[var(--bg-deep)]">1 Month</option>
                          <option value="6m" className="bg-[var(--bg-deep)]">6 Months</option>
                        </select>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
