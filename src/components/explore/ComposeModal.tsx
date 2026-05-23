"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Globe, Home, ShieldAlert, Sparkles, ChevronDown, Check } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostSuccess?: () => void;
}

const TRACE_TYPES = [
  { id: "in_the_zone", emoji: "🔥", label: "In the zone", desc: "Deep focus, flow state, shipping mode" },
  { id: "stuck", emoji: "🧱", label: "Stuck", desc: "Blocked on a problem, open to help" },
  { id: "just_shipped", emoji: "🚀", label: "Just shipped", desc: "Milestone, launch, finish line" },
  { id: "looking_for", emoji: "👀", label: "Looking for", desc: "Needs a collab, feedback, a skill" },
  { id: "thought", emoji: "💭", label: "Thought", desc: "Passing idea, question, observation" },
  { id: "working_on", emoji: "🎯", label: "Working on", desc: "What I'm focused on this week" },
  { id: "vibe_check", emoji: "🌙", label: "Vibe check", desc: "Mood, energy, the feeling right now" }
];

const EXPIRIES = [
  { label: "6h", hours: 6 },
  { label: "12h", hours: 12 },
  { label: "24h", hours: 24 }
];

export default function ComposeModal({ isOpen, onClose, onPostSuccess }: ComposeModalProps) {
  const supabase = createClient();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [type, setType] = useState("in_the_zone");
  const [content, setContent] = useState("");
  const [scope, setScope] = useState<"public" | "pod_only">("public");
  const [expiryHours, setExpiryHours] = useState(24);
  
  // Pod integration
  const [userPods, setUserPods] = useState<any[]>([]);
  const [selectedPodId, setSelectedPodId] = useState<string | null>(null);
  const [isPodDropdownOpen, setIsPodDropdownOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    async function loadUserAndPods() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUser(user);

      // Load user's pods
      const { data, error } = await supabase
        .from("pod_members")
        .select("pod_id, pods:pods(id, name)")
        .eq("user_id", user.id);

      if (!error && data) {
        const pods = data.map((item: any) => item.pods).filter(Boolean);
        setUserPods(pods);
        if (pods.length > 0) {
          setSelectedPodId(pods[0].id);
        }
      }
    }
    if (isOpen) {
      loadUserAndPods();
      // Reset state
      setContent("");
      setType("in_the_zone");
      setScope("public");
      setExpiryHours(24);
      setErrorText("");
    }
  }, [isOpen, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setErrorText("You must be logged in to post a Trace.");
      return;
    }
    if (!content.trim()) {
      setErrorText("Trace content cannot be empty.");
      return;
    }
    if (content.length > 140) {
      setErrorText("Trace content exceeds 140 characters.");
      return;
    }
    if (scope === "pod_only" && !selectedPodId) {
      setErrorText("Please select a Pod to post this Trace in.");
      return;
    }

    setSubmitting(true);
    setErrorText("");

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiryHours);

    try {
      const { error } = await supabase.from("traces").insert({
        user_id: currentUser.id,
        type,
        content: content.trim(),
        scope,
        pod_id: scope === "pod_only" ? selectedPodId : null,
        expires_at: expiresAt.toISOString()
      });

      if (error) throw error;

      if (onPostSuccess) onPostSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error creating trace:", err);
      setErrorText(err.message || "Failed to post trace. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedTypeObj = TRACE_TYPES.find((t) => t.id === type) || TRACE_TYPES[0];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/75 backdrop-blur-md" 
        onClick={onClose} 
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="w-full max-w-xl rounded-2xl border relative overflow-hidden flex flex-col max-h-[90vh] shadow-2xl"
        style={{
          background: "rgba(10, 10, 20, 0.95)",
          borderColor: "rgba(255, 255, 255, 0.08)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)"
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">✦</span>
            </div>
            <div>
              <h2 className="text-md font-bold text-white flex items-center gap-1.5">
                Leave a Trace
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">Gone in 24 hours. Gone but remembered.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all text-[var(--text-secondary)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          {errorText && (
            <div className="p-3.5 rounded-xl border border-red-500/20 bg-red-500/10 flex items-start gap-2 text-red-200 text-xs">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorText}</span>
            </div>
          )}

          {/* Step 1: Pick Type */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Select Trace Type</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TRACE_TYPES.map((t) => {
                const isSelected = type === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.id)}
                    className="p-3 rounded-xl border text-left transition-all flex flex-col gap-1 hover:bg-white/5 group"
                    style={{
                      backgroundColor: isSelected ? "rgba(108, 92, 231, 0.12)" : "transparent",
                      borderColor: isSelected ? "var(--accent-primary)" : "rgba(255, 255, 255, 0.05)"
                    }}
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform duration-250 w-fit">{t.emoji}</span>
                    <span className="text-xs font-semibold text-white">{t.label}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-[var(--text-muted)] mt-1 italic">
              {selectedTypeObj.emoji} {selectedTypeObj.label} &mdash; {selectedTypeObj.desc}
            </p>
          </div>

          {/* Step 2: Content Text Area */}
          <div className="flex flex-col gap-2 relative">
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">What's happening?</span>
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value.slice(0, 140))}
                placeholder='e.g., stuck on this 2am gradient bug, styling is painful...'
                rows={3}
                className="w-full rounded-xl p-4 bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-all resize-none pr-12"
              />
              <span 
                className={`absolute bottom-3 right-3 text-xs font-medium ${
                  content.length >= 130 ? "text-amber-400" : "text-[var(--text-muted)]"
                }`}
              >
                {140 - content.length}
              </span>
            </div>
          </div>

          {/* Step 3: Scope and Expiry Picker in a Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Scope Selector */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Visibility Scope</span>
              <div className="flex bg-white/5 border border-white/5 rounded-xl p-1 gap-1">
                <button
                  type="button"
                  onClick={() => setScope("public")}
                  className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  style={{
                    backgroundColor: scope === "public" ? "rgba(255, 255, 255, 0.08)" : "transparent",
                    color: scope === "public" ? "#fff" : "var(--text-secondary)"
                  }}
                >
                  <Globe className="w-3.5 h-3.5" />
                  Public
                </button>
                <button
                  type="button"
                  onClick={() => setScope("pod_only")}
                  className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  style={{
                    backgroundColor: scope === "pod_only" ? "rgba(255, 255, 255, 0.08)" : "transparent",
                    color: scope === "pod_only" ? "#fff" : "var(--text-secondary)"
                  }}
                >
                  <Home className="w-3.5 h-3.5" />
                  Pod Only
                </button>
              </div>

              {/* Pod Dropdown (only if pod_only and user has pods) */}
              {scope === "pod_only" && (
                <div className="relative mt-1">
                  {userPods.length > 0 ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setIsPodDropdownOpen(!isPodDropdownOpen)}
                        className="w-full flex items-center justify-between py-2 px-3.5 bg-white/5 border border-white/10 rounded-xl text-xs font-medium text-white hover:bg-white/8 transition-all"
                      >
                        <span>
                          {userPods.find((p) => p.id === selectedPodId)?.name || "Select a Pod..."}
                        </span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <AnimatePresence>
                        {isPodDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="absolute z-20 top-full left-0 right-0 mt-1 max-h-36 overflow-y-auto rounded-xl border border-white/10 shadow-xl"
                            style={{ background: "rgba(15, 15, 30, 0.98)", backdropFilter: "blur(12px)" }}
                          >
                            {userPods.map((p) => {
                              const isSelected = selectedPodId === p.id;
                              return (
                                <button
                                  key={p.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedPodId(p.id);
                                    setIsPodDropdownOpen(false);
                                  }}
                                  className="w-full flex items-center justify-between px-3.5 py-2 hover:bg-white/5 text-left text-xs text-white"
                                >
                                  <span>{p.name}</span>
                                  {isSelected && <Check className="w-3.5 h-3.5 text-[var(--accent-primary)]" />}
                                </button>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <div className="text-[11px] text-amber-300 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                      You aren't in any Pods. Post to Public instead!
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Expiry Selector */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Expires In</span>
              <div className="flex bg-white/5 border border-white/5 rounded-xl p-1 gap-1">
                {EXPIRIES.map((exp) => {
                  const isSelected = expiryHours === exp.hours;
                  return (
                    <button
                      key={exp.hours}
                      type="button"
                      onClick={() => setExpiryHours(exp.hours)}
                      className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center transition-all"
                      style={{
                        backgroundColor: isSelected ? "rgba(255, 255, 255, 0.08)" : "transparent",
                        color: isSelected ? "#fff" : "var(--text-secondary)"
                      }}
                    >
                      {exp.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between border-t border-white/5 pt-5 mt-2">
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-medium">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>+2 Aura for posting (daily cap: 1)</span>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-bold text-xs hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              {submitting ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Posting...
                </>
              ) : (
                "Post Trace"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
