"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Heart, MessageSquare, Zap, ShieldAlert, Flag, Check, Flame } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import TraceRing from "@/components/ui/TraceRing";

interface TraceViewerProps {
  isOpen: boolean;
  onClose: () => void;
  userTraces: Array<{
    user: {
      id: string;
      handle: string;
      display_name: string;
      avatar_url: string;
    };
    traces: Array<{
      id: string;
      type: string;
      content: string;
      scope: string;
      pod_id?: string;
      expires_at: string;
      created_at: string;
    }>;
  }>;
  initialUserIndex?: number;
  initialTraceIndex?: number;
}

const TRACE_TYPES = {
  in_the_zone: { emoji: "🔥", label: "In the zone" },
  stuck: { emoji: "🧱", label: "Stuck" },
  just_shipped: { emoji: "🚀", label: "Just shipped" },
  looking_for: { emoji: "👀", label: "Looking for" },
  thought: { emoji: "💭", label: "Thought" },
  working_on: { emoji: "🎯", label: "Working on" },
  vibe_check: { emoji: "🌙", label: "Vibe check" }
};

const TRACE_DURATION_MS = 6000; // 6 seconds per trace

export default function TraceViewer({
  isOpen,
  onClose,
  userTraces,
  initialUserIndex = 0,
  initialTraceIndex = 0
}: TraceViewerProps) {
  const supabase = createClient();
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Navigation states
  const [userIndex, setUserIndex] = useState(initialUserIndex);
  const [traceIndex, setTraceIndex] = useState(initialTraceIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Interactive sheets / overlays
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showCollabInput, setShowCollabInput] = useState(false);
  const [collabPitch, setCollabPitch] = useState("");
  const [showReportSheet, setShowReportSheet] = useState(false);
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);

  // States for reactions
  const [hasResonated, setHasResonated] = useState(false);
  const [resonateCount, setResonateCount] = useState(0);
  const [submittingReaction, setSubmittingReaction] = useState(false);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [submittingCollab, setSubmittingCollab] = useState(false);

  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const activeUserData = userTraces[userIndex];
  const activeTrace = activeUserData?.traces[traceIndex];
  const isOwner = currentUser?.id === activeUserData?.user.id;

  // Load user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
    });
  }, [supabase]);

  // Handle active trace changes, fetch reaction stats
  useEffect(() => {
    if (!activeTrace || !currentUser) return;

    // Reset interaction overlays
    setShowReplyInput(false);
    setReplyText("");
    setShowCollabInput(false);
    setCollabPitch("");
    setShowReportSheet(false);
    setReportSubmitted(false);

    // Fetch if user has resonated & total resonate count if owner
    const fetchReactions = async () => {
      // Check resonate state
      const { data: userReact } = await supabase
        .from("trace_reactions")
        .select("id")
        .eq("trace_id", activeTrace.id)
        .eq("user_id", currentUser.id)
        .eq("reaction_type", "resonate")
        .limit(1);

      setHasResonated(!!(userReact && userReact.length > 0));

      // If owner, fetch total count of resonates
      if (currentUser.id === activeUserData.user.id) {
        const { count } = await supabase
          .from("trace_reactions")
          .select("*", { count: "exact", head: true })
          .eq("trace_id", activeTrace.id)
          .eq("reaction_type", "resonate");
        setResonateCount(count || 0);
      }
    };

    fetchReactions();
    setProgress(0);
  }, [userIndex, traceIndex, activeTrace, currentUser, activeUserData, supabase]);

  // Progress bar timer loop
  useEffect(() => {
    if (!isOpen || isPaused || showReplyInput || showCollabInput || showReportSheet) return;

    const interval = 30; // Update every 30ms
    const step = (interval / TRACE_DURATION_MS) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isOpen, isPaused, userIndex, traceIndex, showReplyInput, showCollabInput, showReportSheet]);

  if (!isOpen || !activeUserData || !activeTrace) return null;

  const handleNext = () => {
    if (traceIndex < activeUserData.traces.length - 1) {
      setTraceIndex(traceIndex + 1);
    } else if (userIndex < userTraces.length - 1) {
      setUserIndex(userIndex + 1);
      setTraceIndex(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (traceIndex > 0) {
      setTraceIndex(traceIndex - 1);
    } else if (userIndex > 0) {
      setUserIndex(userIndex - 1);
      setTraceIndex(userTraces[userIndex - 1].traces.length - 1);
    }
  };

  const handleScreenClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // If clicking inside input fields or buttons, ignore
    if ((e.target as HTMLElement).closest("button, input, textarea, form")) return;

    const width = window.innerWidth;
    const clickX = e.clientX;

    if (clickX < width / 3) {
      handlePrev();
    } else {
      handleNext();
    }
  };

  // Long press handler for report
  const handleTouchStart = () => {
    setIsPaused(true);
    longPressTimer.current = setTimeout(() => {
      setShowReportSheet(true);
    }, 800); // 800ms hold
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  // Human-readable countdown
  const getTimeLeft = (expiryString: string) => {
    const diff = new Date(expiryString).getTime() - Date.now();
    if (diff <= 0) return "expired";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours > 0) return `${hours}h left`;
    const minutes = Math.floor(diff / (1000 * 60));
    return `${minutes}m left`;
  };

  // Actions: Resonate Toggle
  const handleResonate = async () => {
    if (!currentUser || submittingReaction) return;
    setSubmittingReaction(true);

    try {
      if (hasResonated) {
        // Remove reaction
        await supabase
          .from("trace_reactions")
          .delete()
          .eq("trace_id", activeTrace.id)
          .eq("user_id", currentUser.id)
          .eq("reaction_type", "resonate");
        setHasResonated(false);
        if (isOwner) setResonateCount((c) => Math.max(0, c - 1));
      } else {
        // Add reaction
        await supabase.from("trace_reactions").insert({
          trace_id: activeTrace.id,
          user_id: currentUser.id,
          reaction_type: "resonate"
        });
        setHasResonated(true);
        if (isOwner) setResonateCount((c) => c + 1);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingReaction(false);
    }
  };

  // Actions: Reply DM
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !replyText.trim() || submittingReply) return;
    setSubmittingReply(true);

    try {
      // 1. Log the reaction row
      await supabase.from("trace_reactions").insert({
        trace_id: activeTrace.id,
        user_id: currentUser.id,
        reaction_type: "reply"
      });

      // 2. Send private message
      const prefix = `[Replied to your Trace: "${activeTrace.content.slice(0, 40)}..."]\n\n`;
      const { error } = await supabase.from("messages").insert({
        sender_id: currentUser.id,
        recipient_id: activeUserData.user.id,
        content: `${prefix}${replyText.trim()}`
      });

      if (error) throw error;

      setShowReplyInput(false);
      setReplyText("");
    } catch (err) {
      console.error("Reply failed:", err);
    } finally {
      setSubmittingReply(false);
    }
  };

  // Actions: Collab Request Spark
  const handleSendCollab = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !collabPitch.trim() || submittingCollab) return;
    setSubmittingCollab(true);

    try {
      // 1. Log the reaction row
      await supabase.from("trace_reactions").insert({
        trace_id: activeTrace.id,
        user_id: currentUser.id,
        reaction_type: "collab_request"
      });

      // 2. Send Collab spark
      const pitchMsg = `I saw your Trace about: "${activeTrace.content.slice(0, 40)}..."\n\nPitch: ${collabPitch.trim()}`;
      const { error } = await supabase.from("sparks").insert({
        sender_id: currentUser.id,
        recipient_id: activeUserData.user.id,
        intent_type: "collab",
        trace_id: activeTrace.id,
        source: "trace_collab_request",
        message: pitchMsg
      });

      if (error) throw error;

      setShowCollabInput(false);
      setCollabPitch("");
    } catch (err) {
      console.error("Collab Spark failed:", err);
    } finally {
      setSubmittingCollab(false);
    }
  };

  // Actions: Report Trace
  const handleReportTrace = async () => {
    if (reportSubmitting) return;
    setReportSubmitting(true);

    try {
      const { error } = await supabase
        .from("traces")
        .update({ reported_at: new Date().toISOString() })
        .eq("id", activeTrace.id);

      if (error) throw error;
      setReportSubmitted(true);
      setTimeout(() => {
        setShowReportSheet(false);
        handleNext();
      }, 1500);
    } catch (e) {
      console.error("Failed to report trace:", e);
    } finally {
      setReportSubmitting(false);
    }
  };

  const typeConfig = TRACE_TYPES[activeTrace.type as keyof typeof TRACE_TYPES] || { emoji: "✦", label: "Trace" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      {/* Full screen viewport container */}
      <div
        className="w-full max-w-lg h-full relative flex flex-col justify-between overflow-hidden p-6 select-none bg-radial-gradient"
        style={{
          background: "radial-gradient(circle at center, #0f0c24 0%, #030308 100%)"
        }}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={handleScreenClick}
      >
        {/* Top: Progress Bars & Info header */}
        <div className="w-full flex flex-col gap-4 z-10">
          {/* Progress Indicators */}
          <div className="flex gap-1.5 w-full">
            {activeUserData.traces.map((t, idx) => {
              let widthVal = "0%";
              if (idx < traceIndex) widthVal = "100%";
              else if (idx === traceIndex) widthVal = `${progress}%`;

              return (
                <div key={t.id} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-400 to-pink-400 transition-all duration-30"
                    style={{ width: widthVal }}
                  />
                </div>
              );
            })}
          </div>

          {/* User Details header */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <TraceRing
                userId={activeUserData.user.id}
                avatarUrl={activeUserData.user.avatar_url}
                displayName={activeUserData.user.display_name}
                size="sm"
                hasActiveTrace={true}
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white leading-tight">
                  {activeUserData.user.display_name}
                </span>
                <span className="text-xs text-[var(--text-secondary)]">
                  @{activeUserData.user.handle}
                </span>
              </div>
              <span className="text-white/20 text-xs">•</span>
              <span className="text-xs text-indigo-300 font-medium shrink-0 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
                {typeConfig.emoji} {typeConfig.label}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
                {getTimeLeft(activeTrace.expires_at)}
              </span>
              <button
                onClick={onClose}
                className="p-1 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Center: Main Content display */}
        <div className="flex-1 flex flex-col justify-center items-center py-10 px-4 text-center z-10 max-w-sm mx-auto">
          {/* Cyber decoration background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full blur-[100px] pointer-events-none opacity-20 bg-indigo-500" />
          
          <span className="text-5xl mb-6 select-none animate-bounce">{typeConfig.emoji}</span>
          <h1
            className="text-lg sm:text-xl font-medium tracking-wide leading-relaxed text-white whitespace-pre-wrap select-text break-words"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            "{activeTrace.content}"
          </h1>

          {/* Reaction velocity milestone details for owner */}
          {isOwner && resonateCount > 0 && (
            <div className="mt-8 flex items-center gap-1.5 px-3 py-1 bg-pink-500/10 border border-pink-500/20 rounded-full text-pink-300 text-xs font-semibold">
              <Heart className="w-3.5 h-3.5 fill-pink-300" />
              <span>{resonateCount} Resonated {resonateCount >= 10 ? "(+5 Aura Active!)" : `(${10 - resonateCount} more to +5 Aura)`}</span>
            </div>
          )}
        </div>

        {/* Bottom: Action bar & scope label */}
        <div className="w-full flex flex-col gap-4 z-10">
          {/* Scope Indicator */}
          {activeTrace.scope === "pod_only" && (
            <div className="text-[11px] font-semibold text-amber-300 flex items-center justify-center gap-1 self-center bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
              <span>🏠 Pod only</span>
            </div>
          )}

          {/* Buttons row */}
          {!isOwner && (
            <div className="flex gap-3 w-full">
              {/* Resonate */}
              <button
                onClick={handleResonate}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border font-bold text-xs transition-all cursor-pointer"
                style={{
                  background: hasResonated ? "rgba(236, 72, 153, 0.12)" : "rgba(255,255,255,0.03)",
                  borderColor: hasResonated ? "#ec4899" : "rgba(255,255,255,0.08)",
                  color: hasResonated ? "#ec4899" : "var(--text-primary)"
                }}
              >
                <Heart className={`w-4 h-4 ${hasResonated ? "fill-pink-500" : ""}`} />
                Resonate
              </button>

              {/* Reply */}
              <button
                onClick={() => {
                  setIsPaused(true);
                  setShowReplyInput(true);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white/3 border border-white/8 hover:bg-white/8 font-bold text-xs text-white transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                Reply
              </button>

              {/* Collab? */}
              <button
                onClick={() => {
                  setIsPaused(true);
                  setShowCollabInput(true);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 font-bold text-xs text-white hover:shadow-lg transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-white" />
                Collab?
              </button>
            </div>
          )}
        </div>

        {/* Modal: Reply DM Sheets */}
        <AnimatePresence>
          {showReplyInput && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="absolute inset-x-0 bottom-0 z-20 rounded-t-2xl p-6 border-t"
              style={{
                background: "rgba(10, 10, 20, 0.98)",
                borderColor: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(20px)"
              }}
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Reply directly</span>
                <button
                  onClick={() => {
                    setShowReplyInput(false);
                    setIsPaused(false);
                  }}
                  className="p-1 rounded bg-white/5 text-[var(--text-secondary)] hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <form onSubmit={handleSendReply} className="flex gap-2 w-full">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type a private message..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[var(--accent-primary)]"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={submittingReply || !replyText.trim()}
                  className="p-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center justify-center"
                >
                  {submittingReply ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal: Collab application pitch sheet */}
        <AnimatePresence>
          {showCollabInput && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="absolute inset-x-0 bottom-0 z-20 rounded-t-2xl p-6 border-t"
              style={{
                background: "rgba(10, 10, 20, 0.98)",
                borderColor: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(20px)"
              }}
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  Apply to Collab
                </span>
                <button
                  onClick={() => {
                    setShowCollabInput(false);
                    setIsPaused(false);
                  }}
                  className="p-1 rounded bg-white/5 text-[var(--text-secondary)] hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <form onSubmit={handleSendCollab} className="flex flex-col gap-3 w-full">
                <textarea
                  value={collabPitch}
                  onChange={(e) => setCollabPitch(e.target.value)}
                  placeholder="Pitch yourself! What are you building? How can you help?"
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[var(--accent-primary)] resize-none"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={submittingCollab || !collabPitch.trim()}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 hover:shadow-lg font-bold text-xs text-white transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {submittingCollab ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Submit Collab Request (+3 Poster Aura)
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trust & Safety: Long Press Report drawer */}
        <AnimatePresence>
          {showReportSheet && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="absolute inset-x-0 bottom-0 z-30 rounded-t-2xl p-6 border-t"
              style={{
                background: "rgba(20, 10, 10, 0.98)",
                borderColor: "rgba(220,53,69,0.3)",
                backdropFilter: "blur(20px)"
              }}
            >
              <div className="flex justify-between items-center mb-5">
                <span className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  Content Moderation Panel
                </span>
                <button
                  onClick={() => setShowReportSheet(false)}
                  className="p-1 rounded bg-white/5 text-[var(--text-secondary)] hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {reportSubmitted ? (
                <div className="py-6 flex flex-col items-center justify-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-300">
                    <Check className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-green-300 font-semibold mt-2">Report Submitted Successfully</span>
                  <p className="text-[10px] text-[var(--text-muted)]">Content will be preserved for review.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Flag this Trace for inappropriate or toxic content. Flagged traces are preserved for moderator review for 7 days post-expiry.
                  </p>
                  <button
                    onClick={handleReportTrace}
                    disabled={reportSubmitting}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    {reportSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Flag className="w-4 h-4 fill-white" />
                        Report and Hide Trace
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
