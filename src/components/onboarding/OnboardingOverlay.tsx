"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  X,
  ArrowRight,
  ChevronRight,
  Globe,
  MessageSquare,
  Pin,
  Calendar,
  CheckCircle,
  Paperclip,
  Send,
  Sparkles,
  MapPin,
  Flame,
  ArrowLeft,
  Loader2,
  Lock,
  Heart,
  Mic,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import Button from "@/components/ui/Button";

export default function OnboardingOverlay({ isStaticPage = false }: { isStaticPage?: boolean }) {
  const supabase = createClient();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(isStaticPage);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [user, setUser] = useState<any>(null);
  
  // Invite processing states
  const [inviteType, setInviteType] = useState<string | null>(null);
  const [inviteId, setInviteId] = useState<string | null>(null);
  const [joinedName, setJoinedName] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState(false);

  // Particle tracking state for Slide 1
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);
  const particleIdRef = useRef(0);

  // Typewriter simulated states for Slide 2
  const [simulatedMessage, setSimulatedMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string; isPinned?: boolean }[]>([
    { sender: "Alice", text: "Welcome to our collab space!" },
    { sender: "Bob", text: "Ready to build the future? ⚡" },
  ]);
  const [pinHighlight, setPinHighlight] = useState(false);

  // GPS verification state for Slide 3
  const [gpsScan, setGpsScan] = useState("idle"); // idle | scanning | verified

  // DM attachment upload spinner state for Slide 4
  const [dmUploadState, setDmUploadState] = useState("idle"); // idle | uploading | finished

  // 1. Initial configuration check
  useEffect(() => {
    if (isStaticPage) {
      setIsOpen(true);
    } else {
      // Check local storage and session storage
      const introSeen = localStorage.getItem("corelx_intro_seen") === "true";
      const pendingType = sessionStorage.getItem("pending_invite_type");
      const pendingId = sessionStorage.getItem("pending_invite_id");

      setInviteType(pendingType);
      setInviteId(pendingId);

      // Show onboarding if never seen before, OR if there is an active invite they just accepted
      if (!introSeen || (pendingType && pendingId)) {
        setIsOpen(true);
      }
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUser(user);
    });
  }, [isStaticPage]);

  // 2. Auto-Join engine trigger
  useEffect(() => {
    if (user && inviteType && inviteId && !joinSuccess && !joining) {
      triggerAutoJoin(user.id, inviteType, inviteId);
    }
  }, [user, inviteType, inviteId]);

  const triggerAutoJoin = async (userId: string, type: string, id: string) => {
    setJoining(true);
    try {
      if (type === "pod") {
        // Fetch Pod details
        const { data: podData } = await supabase
          .from("pods")
          .select("name")
          .eq("id", id)
          .single();

        if (podData) {
          setJoinedName(podData.name);
          // Check if already member
          const { data: existingMember } = await supabase
            .from("pod_members")
            .select("id")
            .eq("pod_id", id)
            .eq("user_id", userId)
            .maybeSingle();

          if (!existingMember) {
            await supabase.from("pod_members").insert({
              pod_id: id,
              user_id: userId,
              role: "member",
            });
          }
          setJoinSuccess(true);
        }
      } else if (type === "event") {
        // Fetch Event details
        const { data: eventData } = await supabase
          .from("events")
          .select("title, trust_tier")
          .eq("id", id)
          .single();

        if (eventData) {
          setJoinedName(eventData.title);
          const rsvpStatus = eventData.trust_tier === "guarded" ? "pending" : "attending";
          const verifiedCampus = eventData.trust_tier === "checked" || eventData.trust_tier === "guarded";

          await supabase.from("event_rsvps").upsert(
            {
              event_id: id,
              user_id: userId,
              status: rsvpStatus,
              verified_campus: verifiedCampus,
            },
            { onConflict: "event_id,user_id" }
          );
          setJoinSuccess(true);
        }
      }
    } catch (err) {
      console.error("Auto-join failed:", err);
    } finally {
      setJoining(false);
    }
  };

  // 3. Interactive simulation triggers per slide
  useEffect(() => {
    if (currentSlide === 2) {
      // Simulating typing on Slide 2
      setSimulatedMessage("");
      setPinHighlight(false);
      const textToType = "Ship the MVP by tonight! 🚀";
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex < textToType.length) {
          setSimulatedMessage((prev) => prev + textToType.charAt(currentIndex));
          currentIndex++;
        } else {
          clearInterval(interval);
          // Send simulated message after typing
          setTimeout(() => {
            setChatMessages((prev) => [
              ...prev,
              { sender: "You", text: textToType },
            ]);
            setSimulatedMessage("");
            // Highlight pin event
            setTimeout(() => {
              setPinHighlight(true);
              setChatMessages((prev) =>
                prev.map((msg, i) =>
                  i === prev.length - 1 ? { ...msg, isPinned: true } : msg
                )
              );
            }, 800);
          }, 600);
        }
      }, 70);

      return () => {
        clearInterval(interval);
        setChatMessages([
          { sender: "Alice", text: "Welcome to our collab space!" },
          { sender: "Bob", text: "Ready to build the future? ⚡" },
        ]);
      };
    }

    if (currentSlide === 6) {
      // Simulating Geofenced GPS Check-in on Slide 6
      setGpsScan("scanning");
      const scanTimer = setTimeout(() => {
        setGpsScan("verified");
      }, 3500);

      return () => {
        clearTimeout(scanTimer);
        setGpsScan("idle");
      };
    }
  }, [currentSlide]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (currentSlide !== 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newParticle = {
      id: particleIdRef.current++,
      x,
      y,
    };

    setParticles((prev) => [...prev.slice(-15), newParticle]);
  };

  const handleDismiss = () => {
    if (isStaticPage) {
      router.push("/");
      return;
    }
    localStorage.setItem("corelx_intro_seen", "true");
    sessionStorage.removeItem("pending_invite_type");
    sessionStorage.removeItem("pending_invite_id");
    setIsOpen(false);
    
    // Redirect if they accepted an invite and successfully joined
    if (joinSuccess && inviteType && inviteId) {
      if (inviteType === "pod") {
        router.push(`/pods/${inviteId}`);
      } else if (inviteType === "event") {
        router.push(`/events/${inviteId}`);
      }
    }
  };

  const skipIntro = () => {
    if (isStaticPage) {
      router.push("/");
      return;
    }
    setCurrentSlide(7);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 sm:p-6 overflow-hidden">
      {/* Dynamic Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-45 pointer-events-none" />

      {/* Main glassmorphic wrapper */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-5xl h-[85vh] max-h-[750px] rounded-3xl border border-[var(--glass-border)] bg-[#030308]/85 shadow-[0_0_80px_rgba(108,92,231,0.15)] flex flex-col md:flex-row overflow-hidden backdrop-blur-2xl"
      >
        {/* Skip button in corner */}
        {currentSlide < 7 && (
          <button
            onClick={skipIntro}
            className="absolute top-6 right-6 z-30 text-xs font-mono text-[var(--text-muted)] hover:text-white transition-colors flex items-center gap-1 cursor-pointer bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl hover:bg-white/10"
          >
            Skip Intro <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}

        {/* ── LEFT PANE: DESCRIPTION & CONTROLS ────────────────── */}
        <div className="flex-[4] p-8 sm:p-12 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[var(--glass-border)] relative">
          {/* Subtle logo glow */}
          <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-[var(--accent-primary)] opacity-10 blur-[80px] pointer-events-none" />

          {/* Corelx Brand Icon */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#6c5ce7] to-[#00d2ff] flex items-center justify-center font-display font-black text-white text-sm shadow-[0_0_15px_rgba(108,92,231,0.5)]">
              C
            </div>
            <span className="font-display font-bold text-sm tracking-wider text-white">CORELX</span>
            {joinSuccess && (
              <span className="ml-2 text-[9px] font-mono font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 px-2 py-0.5 rounded-full">
                INVITE RESOLVED
              </span>
            )}
          </div>

          {/* Slide Text Content */}
          <div className="my-auto space-y-4">
            <AnimatePresence mode="wait">
              {currentSlide === 1 && (
                <motion.div
                  key="slide1"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  className="space-y-4"
                >
                  <span className="text-[10px] font-mono text-[var(--accent-primary)] tracking-widest uppercase block font-bold">
                    ✦ The Creator Grid
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-display font-black text-white leading-tight tracking-tight">
                    A Premium Collaborative Network
                  </h2>
                  <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed font-normal">
                    Welcome to Corelx, a high-fidelity hub tailored for designers, engineers, developers, and makers. Explore, showcase work, and build next-generation projects inside localized campus hubs.
                  </p>
                </motion.div>
              )}

              {currentSlide === 2 && (
                <motion.div
                  key="slide2"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  className="space-y-4"
                >
                  <span className="text-[10px] font-mono text-amber-400 tracking-widest uppercase block font-bold">
                    👥 Permanent Collaboration
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-display font-black text-white leading-tight tracking-tight">
                    Pods & Aesthetic DMs
                  </h2>
                  <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed font-normal">
                    Create permanent groups called Pods for hackathons, classes, or startups. Pin roadmaps, lock properties, and message collaborators directly with custom-styled chat bubbles and media attachments (up to 50MB).
                  </p>
                </motion.div>
              )}

              {currentSlide === 3 && (
                <motion.div
                  key="slide3"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  className="space-y-4"
                >
                  <span className="text-[10px] font-mono text-pink-400 tracking-widest uppercase block font-bold">
                    ✦ Ephemeral Moments
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-display font-black text-white leading-tight tracking-tight">
                    Traces ✦ Fades in 24h
                  </h2>
                  <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed font-normal">
                    Share honest, contextual snippets of your daily process: "Stuck on this bug," "Just shipped," or "Vibe check." Not a highlight reel. Support for rich media attachment sharing (picture, video, and audio).
                  </p>
                </motion.div>
              )}

              {currentSlide === 4 && (
                <motion.div
                  key="slide4"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  className="space-y-4"
                >
                  <span className="text-[10px] font-mono text-cyan-400 tracking-widest uppercase block font-bold">
                    🔥 Reputation Engine
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-display font-black text-white leading-tight tracking-tight">
                    Aura & Activity Score
                  </h2>
                  <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed font-normal">
                    Your reputation score dynamically updates based on contribution: earn +2 Aura for posting traces, +5 for milestone resonances (10+), and +3 when your trace leads to a collab application. View full event history logs.
                  </p>
                </motion.div>
              )}

              {currentSlide === 5 && (
                <motion.div
                  key="slide5"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  className="space-y-4"
                >
                  <span className="text-[10px] font-mono text-purple-400 tracking-widest uppercase block font-bold">
                    🛡️ Verified Verification
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-display font-black text-white leading-tight tracking-tight">
                    Official Identity
                  </h2>
                  <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed font-normal">
                    Stand out with verifiable entities and official roles. Earn verified status badges, official category tags, and campus-validated affiliations to establish credibility and security across the grid.
                  </p>
                </motion.div>
              )}

              {currentSlide === 6 && (
                <motion.div
                  key="slide6"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  className="space-y-4"
                >
                  <span className="text-[10px] font-mono text-emerald-400 tracking-widest uppercase block font-bold">
                    🗓️ Geofenced Verification
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-display font-black text-white leading-tight tracking-tight">
                    Campus & Tech Events
                  </h2>
                  <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed font-normal">
                    Organize tech events with geofenced GPS verification. Ensure physical presence before RSVP check-in approval. Tiers range from Open meetings to highly Guarded creator match-ups.
                  </p>
                </motion.div>
              )}

              {currentSlide === 7 && (
                <motion.div
                  key="slide7"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  className="space-y-4"
                >
                  <span className="text-[10px] font-mono text-indigo-400 tracking-widest uppercase block font-bold">
                    🏁 System Activation
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-display font-black text-white leading-tight tracking-tight">
                    Setup Complete
                  </h2>
                  {joining ? (
                    <div className="flex items-center gap-2.5 py-2">
                      <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                      <p className="text-sm text-cyan-300 font-mono">Resolving pending invite credentials...</p>
                    </div>
                  ) : joinSuccess ? (
                    <div className="p-4 rounded-2xl border border-cyan-500/20 bg-cyan-950/15 backdrop-blur-md space-y-2">
                      <p className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 fill-cyan-400/20" /> Invitation Secured
                      </p>
                      <p className="text-sm text-white font-semibold">
                        Successfully joined: <span className="text-cyan-300">"{joinedName}"</span>
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        Click the button below to launch into the portal and join the conversation.
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed font-normal">
                      Your workspace is ready. Tap launch to dive into the Discovery Feed, inspect community collab calls, share flares, post traces, and build your reputation.
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Row / Footer */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
            {/* Slide Indicator Dots */}
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((s) => (
                <button
                  key={s}
                  onClick={() => setCurrentSlide(s)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    currentSlide === s ? "w-6 bg-white" : "w-1.5 bg-white/20 hover:bg-white/40"
                  }`}
                />
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center gap-2">
              {currentSlide > 1 && (
                <button
                  onClick={() => setCurrentSlide((prev) => prev - 1)}
                  className="p-2.5 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-all text-xs cursor-pointer flex items-center justify-center"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}

              {currentSlide < 7 ? (
                <Button
                  variant="primary"
                  className="flex items-center gap-1.5 text-xs py-2.5 px-5 shadow-[0_0_15px_rgba(108,92,231,0.3)]"
                  onClick={() => setCurrentSlide((prev) => prev + 1)}
                >
                  Next Slide <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  variant="primary"
                  className="flex items-center gap-1.5 text-xs py-2.5 px-6 bg-gradient-to-r from-[#6c5ce7] to-[#00d2ff] text-white border-none shadow-[0_0_20px_rgba(0,210,255,0.3)] animate-pulse"
                  onClick={handleDismiss}
                >
                  {joinSuccess ? "Launch to Destination 🚀" : "Launch Grid ⚡"}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANE: LIVE APP MOCKUP PANEL ────────────────── */}
        <div className="flex-[5] bg-[#030307] relative flex items-center justify-center p-6 sm:p-10 select-none overflow-hidden">
          {/* Neon Grid Light in Mockup Pane */}
          <div className="absolute inset-0 bg-radial-gradient from-[rgba(108,92,231,0.06)] via-transparent to-transparent pointer-events-none" />

          <AnimatePresence mode="wait">
            {/* SLIDE 1 MOCKUP: Holographic Globe & Node Grid */}
            {currentSlide === 1 && (
              <motion.div
                key="mockup1"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full h-full flex flex-col items-center justify-center relative cursor-crosshair"
                onMouseMove={handleMouseMove}
              >
                {/* Globe/Node Centerpiece */}
                <div className="relative w-44 h-44 rounded-full border border-white/5 flex items-center justify-center bg-[rgba(108,92,231,0.02)]">
                  {/* Outer Orbit */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border border-dashed border-[rgba(108,92,231,0.15)]"
                  />
                  {/* Dynamic Nodes */}
                  <div className="absolute w-2 h-2 rounded-full bg-cyan-400 top-4 left-1/4 animate-ping" />
                  <div className="absolute w-2 h-2 rounded-full bg-[#6c5ce7] bottom-8 right-6 animate-pulse" />
                  <div className="absolute w-1.5 h-1.5 rounded-full bg-white top-1/2 right-4" />
                  <div className="absolute w-1.5 h-1.5 rounded-full bg-cyan-400 top-1/4 right-1/4" />

                  {/* Pulsing center glow */}
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#6c5ce7] to-[#00d2ff] flex items-center justify-center text-white/95 font-semibold text-lg shadow-[0_0_30px_rgba(108,92,231,0.4)]"
                  >
                    <Globe className="w-6 h-6 animate-pulse" />
                  </motion.div>
                </div>

                <div className="mt-8 text-center">
                  <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
                    INTERACTIVE MOCKUP PANEL
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 font-medium italic">
                    Hover over pane to emit glowing creator nodes
                  </p>
                </div>

                {/* Glowing Particles */}
                {particles.map((p) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0.8, scale: 1.5 }}
                    animate={{ opacity: 0, scale: 0.2 }}
                    transition={{ duration: 0.8 }}
                    className="absolute w-2 h-2 rounded-full bg-cyan-400 pointer-events-none"
                    style={{ left: p.x, top: p.y }}
                  />
                ))}
              </motion.div>
            )}

            {/* SLIDE 2 MOCKUP: Collaborative Pod & Pin Message Highlight */}
            {currentSlide === 2 && (
              <motion.div
                key="mockup2"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-[340px] rounded-2xl border border-[var(--glass-border)] bg-[#0d0d15]/90 overflow-hidden shadow-2xl flex flex-col"
              >
                {/* Mock Header */}
                <div className="p-3 border-b border-white/5 flex items-center justify-between bg-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono bg-purple-500/20 text-[#a29bfe] px-2 py-0.5 rounded border border-purple-500/20">
                      project
                    </span>
                    <span className="text-xs font-bold text-white">Nova MVP Pod</span>
                  </div>
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                </div>

                {/* Pinned announcement panel (animated highlight) */}
                <AnimatePresence>
                  {pinHighlight && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-2 border-b border-amber-500/20 bg-amber-500/5 flex items-start gap-2 relative overflow-hidden"
                      style={{
                        boxShadow: "0 0 15px rgba(245,158,11,0.15) inset",
                      }}
                    >
                      {/* Gold pulse line */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />
                      <Pin className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5 rotate-45" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">
                          PINNED ROADMAP ANNOUNCEMENT
                        </p>
                        <p className="text-[10px] text-white font-medium truncate">
                          Ship the MVP by tonight! 🚀
                        </p>
                      </div>
                      <span className="text-[8px] text-[var(--text-muted)] font-mono uppercase mt-0.5">
                        active
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Mock Messages Container */}
                <div className="flex-1 p-3 space-y-2.5 min-h-[160px] overflow-y-auto">
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex flex-col ${
                        msg.sender === "You" ? "items-end" : "items-start"
                      }`}
                    >
                      <span className="text-[8px] text-[var(--text-muted)] mb-0.5">
                        {msg.sender}
                      </span>
                      <div
                        className={`text-xs px-2.5 py-1.5 rounded-xl max-w-[85%] ${
                          msg.sender === "You"
                            ? "bg-purple-600 text-white rounded-tr-none"
                            : "bg-white/5 border border-white/10 text-gray-300 rounded-tl-none"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}

                  {/* Simulated typing bubble */}
                  {simulatedMessage && (
                    <div className="flex flex-col items-end">
                      <span className="text-[8px] text-[var(--text-muted)] mb-0.5">
                        You
                      </span>
                      <div className="text-xs px-2.5 py-1.5 rounded-xl rounded-tr-none bg-purple-600/35 text-white/80 font-mono italic">
                        {simulatedMessage}
                        <span className="animate-pulse">|</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Input panel */}
                <div className="p-2 border-t border-white/5 bg-black/40 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
                    <Paperclip className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 h-7 bg-white/5 border border-white/10 rounded-lg px-2 text-[10px] text-white/60 flex items-center font-mono">
                    {simulatedMessage ? "" : "Message #Nova MVP..."}
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center text-white">
                    <Send className="w-3.5 h-3.5" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* SLIDE 3 MOCKUP: Traces ✦ Ephemeral Moments */}
            {currentSlide === 3 && (
              <motion.div
                key="mockup3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-[340px] rounded-2xl border border-[var(--glass-border)] bg-[#0a0a14]/95 p-4 shadow-2xl flex flex-col space-y-4 relative"
              >
                {/* Story header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-[10px] text-pink-400 font-bold font-mono">
                      L
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Luna Voss</p>
                      <p className="text-[9px] text-[var(--text-muted)] font-mono">@lunavisuals</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-pink-500/10 border border-pink-500/20 text-pink-400 px-2 py-0.5 rounded-full">
                    ✦ fades in 12h
                  </span>
                </div>

                {/* Content type tag */}
                <div className="flex items-center gap-2">
                  <span className="text-lg">🧱</span>
                  <span className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                    stuck
                  </span>
                </div>

                {/* Content text */}
                <p className="text-xs text-white leading-relaxed italic">
                  "styling 3D glassmorphic cards at 2am, gradients are throwing off index..."
                </p>

                {/* Media element preview: Audio Player mockup */}
                <div className="rounded-xl border border-white/10 bg-black/40 p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 shrink-0">
                      <Mic className="w-4 h-4 animate-pulse" />
                    </div>
                    <div>
                      <p className="text-[9px] text-white font-semibold">audio_trace.mp3</p>
                      <p className="text-[8px] text-[var(--text-muted)] font-mono">AUDIO • 1.2 MB</p>
                    </div>
                  </div>
                  {/* Mock waveforms */}
                  <div className="flex items-end gap-0.5 h-6">
                    <div className="w-0.5 bg-pink-400 h-3 animate-pulse" style={{ animationDelay: "0.1s" }} />
                    <div className="w-0.5 bg-pink-400 h-5 animate-pulse" style={{ animationDelay: "0.3s" }} />
                    <div className="w-0.5 bg-pink-400 h-2 animate-pulse" style={{ animationDelay: "0.5s" }} />
                    <div className="w-0.5 bg-pink-400 h-4 animate-pulse" style={{ animationDelay: "0.2s" }} />
                    <div className="w-0.5 bg-pink-400 h-3 animate-pulse" style={{ animationDelay: "0.4s" }} />
                  </div>
                </div>

                {/* Reactions */}
                <div className="flex items-center justify-between border-t border-white/5 pt-2">
                  <motion.div
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="flex items-center gap-1.5 text-pink-400 bg-pink-500/10 border border-pink-500/20 px-3 py-1 rounded-full text-[10px] font-bold"
                  >
                    <Heart className="w-3.5 h-3.5 fill-pink-400" />
                    <span>14 Resonated</span>
                  </motion.div>
                  <span className="text-[8px] text-[var(--text-muted)] font-mono">
                    Aura Reward Active (+5)
                  </span>
                </div>
              </motion.div>
            )}

            {/* SLIDE 4 MOCKUP: Aura Score & History Logs */}
            {currentSlide === 4 && (
              <motion.div
                key="mockup4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-[340px] rounded-2xl border border-[var(--glass-border)] bg-[#0d0d15]/95 p-4 shadow-2xl flex flex-col space-y-4"
              >
                {/* Aura Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-[10px] font-mono text-[var(--accent-primary)] font-bold tracking-widest uppercase">
                    aura telemetry
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>

                {/* Score Big Display */}
                <div className="text-center py-2 relative overflow-hidden bg-white/3 rounded-xl border border-white/5">
                  <motion.div
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute -inset-10 bg-radial-gradient from-indigo-500/10 via-transparent to-transparent pointer-events-none"
                  />
                  <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-mono">
                    total reputation
                  </p>
                  <h1 className="text-4xl font-display font-black text-white mt-1 shadow-glow flex items-center justify-center gap-1.5">
                    <span>🔥</span> 754 <span className="text-xs font-mono text-cyan-400 font-bold bg-cyan-500/10 border border-cyan-500/30 px-1.5 py-0.5 rounded-full">+8 today</span>
                  </h1>
                  <p className="text-[9px] font-semibold text-purple-300 font-mono uppercase tracking-wider mt-1.5">
                    LEVEL 4 • RATED SENIOR MAKER
                  </p>
                </div>

                {/* History list */}
                <div className="space-y-2">
                  <p className="text-[9px] text-[var(--text-muted)] font-mono uppercase tracking-wider">
                    Recent Reputation Events
                  </p>
                  <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                    <div className="p-1.5 rounded bg-white/5 border border-white/5 flex items-center justify-between text-[10px]">
                      <span className="text-white font-medium">Trace Posted (+2 Cap)</span>
                      <span className="text-cyan-400 font-mono font-bold">+2 Aura</span>
                    </div>
                    <div className="p-1.5 rounded bg-white/5 border border-white/5 flex items-center justify-between text-[10px]">
                      <span className="text-white font-medium">10+ Resonates Milestone</span>
                      <span className="text-pink-400 font-mono font-bold">+5 Aura</span>
                    </div>
                    <div className="p-1.5 rounded bg-white/5 border border-white/5 flex items-center justify-between text-[10px]">
                      <span className="text-white font-medium">Collab Applied from Trace</span>
                      <span className="text-purple-400 font-mono font-bold">+3 Aura</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SLIDE 5 MOCKUP: Official Identity & Verification */}
            {currentSlide === 5 && (
              <motion.div
                key="mockup5"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-[340px] rounded-2xl border border-[var(--glass-border)] bg-[#0d0d15]/95 p-4 shadow-2xl flex flex-col space-y-4"
              >
                {/* Verification Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-[10px] font-mono text-cyan-400 font-bold tracking-widest uppercase">
                    verified identity layers
                  </span>
                  <span className="text-[9px] font-mono text-emerald-400 font-bold">SECURE GRID</span>
                </div>

                {/* Profile Card Mockup */}
                <div className="p-4 rounded-xl border border-white/5 bg-white/3 flex flex-col items-center text-center space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-cyan-500/10 to-transparent blur-xl pointer-events-none" />
                  
                  {/* Avatar with Verified check badge */}
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-500 p-0.5 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                      <div className="w-full h-full rounded-full bg-[#0d0d15] flex items-center justify-center text-white text-xl font-bold">
                        K
                      </div>
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-[#0d0d15] rounded-full flex items-center justify-center p-0.5">
                      <CheckCircle className="w-4 h-4 fill-cyan-500 text-[#0d0d15]" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center justify-center gap-1.5">
                      Kira Nakamura
                    </h3>
                    <p className="text-[10px] text-[var(--text-muted)] font-mono">@kira.dev</p>
                  </div>

                  {/* Vetted Entity Tag Badge */}
                  <div className="flex items-center gap-2 mt-1">
                    <div className="px-2.5 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-[10px] font-semibold tracking-wider uppercase shadow-[0_0_10px_rgba(6,182,212,0.15)] flex items-center gap-1">
                      <span>🛡️ Vetted Entity</span>
                    </div>
                    <div className="px-2.5 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-[10px] font-semibold tracking-wider uppercase flex items-center gap-1">
                      <span>AI ENGINEER</span>
                    </div>
                  </div>

                  {/* Campus details */}
                  <p className="text-[10px] text-[var(--text-secondary)] font-mono flex items-center justify-center gap-1">
                    MIT Tech Hub • <span className="text-emerald-400">Verified Campus</span>
                  </p>
                </div>
              </motion.div>
            )}

            {/* SLIDE 6 MOCKUP: Tech Event Detail Card & Pulse GPS Radar */}
            {currentSlide === 6 && (
              <motion.div
                key="mockup6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-[340px] rounded-2xl border border-[var(--glass-border)] bg-[#0d0d15]/95 overflow-hidden shadow-2xl p-4 space-y-4"
              >
                {/* Event Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    💡 Hackathon
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                      CHECKED TIER
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white leading-snug">
                    AI Agent Summit 2026
                  </h3>
                  <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">
                    A collaborative hackathon targeting generative coding agents. Food provided, physical presence required.
                  </p>
                </div>

                {/* GPS Radar sweep container */}
                <div className="h-32 border border-white/5 bg-black/40 rounded-xl relative flex flex-col items-center justify-center overflow-hidden">
                  <AnimatePresence>
                    {gpsScan === "scanning" && (
                      <>
                        {/* Radar sweep circles */}
                        <motion.div
                          initial={{ scale: 0, opacity: 0.8 }}
                          animate={{ scale: 2.2, opacity: 0 }}
                          transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                          className="absolute w-14 h-14 rounded-full border border-cyan-400/50 pointer-events-none"
                        />
                        <motion.div
                          initial={{ scale: 0, opacity: 0.8 }}
                          animate={{ scale: 2.2, opacity: 0 }}
                          transition={{ duration: 1.8, delay: 0.9, repeat: Infinity, ease: "easeOut" }}
                          className="absolute w-14 h-14 rounded-full border border-cyan-400/50 pointer-events-none"
                        />
                        <MapPin className="w-6 h-6 text-cyan-400 animate-bounce relative z-10" />
                        <span className="text-[9px] font-mono text-cyan-300 font-bold mt-2 animate-pulse relative z-10">
                          VERIFYING CAMPUS COORDINATES...
                        </span>
                      </>
                    )}

                    {gpsScan === "verified" && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center text-center p-2"
                      >
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 mb-2">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                          Campus Geofence Verified
                        </span>
                        <span className="text-[9px] text-[var(--text-muted)] mt-0.5">
                          RSVP APPROVED • ACCESS GRANTED
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* SLIDE 7 MOCKUP: Setup Complete & Pulse CTA Button */}
            {currentSlide === 7 && (
              <motion.div
                key="mockup7"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-[340px] flex flex-col items-center justify-center text-center space-y-6 relative"
              >
                {/* Glowing holographic activation badge */}
                <div className="relative">
                  {/* External pulse halos */}
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2.2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full border-2 border-cyan-400 pointer-events-none blur-sm"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 2.2, delay: 1.1, repeat: Infinity }}
                    className="absolute inset-0 rounded-full border border-purple-500 pointer-events-none blur-md"
                  />

                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#6c5ce7] via-[#00d2ff] to-[#a29bfe] flex items-center justify-center text-white shadow-[0_0_30px_rgba(6,182,212,0.5)]">
                    <Sparkles className="w-8 h-8 animate-spin" style={{ animationDuration: "12s" }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-mono text-[var(--accent-primary)] font-bold tracking-widest uppercase">
                    CORELX ACTIVATE
                  </p>
                  <h3 className="text-base font-bold text-white">
                    Workspace Configured
                  </h3>
                  <p className="text-[10px] text-[var(--text-muted)] max-w-[200px] mx-auto leading-relaxed">
                    Encryption protocols loaded. Campus routing tables updated. Initial handshake completed.
                  </p>
                </div>

                <button
                  onClick={handleDismiss}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-xs font-mono font-bold tracking-wider text-white rounded-xl shadow-[0_0_20px_rgba(108,92,231,0.4)] border border-white/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  INITIALIZE CORE GRID
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
