"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Building, MapPin, Globe, Users, MessageSquare, Award, ArrowLeft, Check, X, Inbox, Briefcase, BarChart2 } from "lucide-react";
import Button from "@/components/ui/Button";
import NeonBadge from "@/components/ui/NeonBadge";
import OfficialTag from "@/components/ui/OfficialTag";
import { createClient } from "@/utils/supabase/client";

interface CompanyClientProps {
  companyUser: any;
  currentUser: any;
  isAdmin: boolean;
  initialReachMessages: any[];
  initialCollabs: any[];
}

export default function CompanyClient({
  companyUser,
  currentUser,
  isAdmin,
  initialReachMessages,
  initialCollabs,
}: CompanyClientProps) {
  const router = useRouter();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<"about" | "collabs" | "reach" | "analytics">("about");
  const [reachMessages, setReachMessages] = useState<any[]>(initialReachMessages);
  const [collabs, setCollabs] = useState<any[]>(initialCollabs);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Send Reach state (for external creators visiting this company)
  const [showReachModal, setShowReachModal] = useState(false);
  const [reachContent, setReachContent] = useState("");
  const [reachTag, setReachTag] = useState("Internship");
  const [sendingReach, setSendingReach] = useState(false);
  const [reachError, setReachError] = useState<string | null>(null);
  const [reachSuccess, setReachSuccess] = useState(false);

  const company = companyUser.company_accounts?.[0] || {};
  const isCreator = currentUser && currentUser.id !== companyUser.id;

  const handleReachStatus = async (reachId: string, newStatus: "connected" | "archived") => {
    setProcessingId(reachId);
    const { error } = await supabase
      .from("reach_messages")
      .update({ status: newStatus })
      .eq("id", reachId);

    if (!error) {
      setReachMessages(prev =>
        prev.map(r => r.id === reachId ? { ...r, status: newStatus } : r)
      );
    }
    setProcessingId(null);
  };

  const handleSendReach = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reachContent.trim() || sendingReach) return;

    setSendingReach(true);
    setReachError(null);

    const { error } = await supabase
      .from("reach_messages")
      .insert({
        sender_id: currentUser.id,
        company_id: companyUser.id,
        content: reachContent.trim(),
        topic_tag: reachTag,
        status: "pending",
      });

    if (error) {
      setReachError(error.message);
    } else {
      setReachSuccess(true);
      setReachContent("");
      setTimeout(() => {
        setShowReachModal(false);
        setReachSuccess(false);
      }, 2000);
    }
    setSendingReach(false);
  };

  return (
    <div className="min-h-screen pb-32">
      {/* Cover Banner */}
      <div className="h-64 w-full relative bg-gradient-to-tr from-cyan-950 via-gray-900 to-black">
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--bg-void), transparent)" }} />
        <button
          onClick={() => router.back()}
          className="absolute top-24 left-6 z-20 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 hover:bg-white/10 text-white font-medium text-sm backdrop-blur-md transition-all group shadow-lg cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative -mt-24">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-6 md:items-end mb-12">
          <div className="w-32 h-32 rounded-3xl shrink-0 p-[2px] bg-gradient-to-br from-cyan-400 to-blue-500 shadow-2xl relative">
            <div className="w-full h-full rounded-3xl overflow-hidden bg-[var(--bg-void)] flex items-center justify-center text-4xl font-bold text-white">
              {companyUser.avatar_url ? (
                <img src={companyUser.avatar_url} alt={companyUser.display_name} className="w-full h-full object-cover" />
              ) : (
                companyUser.display_name?.charAt(0) || companyUser.handle.charAt(0).toUpperCase()
              )}
            </div>
          </div>

          <div className="flex-1 pb-2">
            <div className="flex flex-wrap items-center gap-2.5 mb-1">
              <h1 className="text-3xl font-display font-bold text-white">{companyUser.display_name || companyUser.handle}</h1>
              <OfficialTag entityId={companyUser.id} />
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center gap-1">
                🏢 {company.industry || "Technology"}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <p className="font-medium text-lg text-cyan-400">@{companyUser.handle}</p>
              <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
              <div className="text-xs font-semibold px-2.5 py-0.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
                ✦ Verified Company
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)]">
              <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {company.size_range || "1-10"} employees</span>
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {companyUser.tagline?.split("•")[1]?.trim() || "Remote"}</span>
              {company.website && (
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white transition-colors">
                  <Globe className="w-4 h-4" /> Website
                </a>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 pb-2">
            {isCreator && company.reach_enabled && (
              <Button onClick={() => setShowReachModal(true)} className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-semibold shadow-lg">
                🚀 Send Reach
              </Button>
            )}
          </div>
        </div>

        {/* Tab Selection */}
        <div className="border-b border-[var(--border-subtle)] mb-8 flex gap-6 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("about")}
            className={`pb-4 text-base font-medium relative transition-all whitespace-nowrap ${
              activeTab === "about" ? "text-white" : "text-[var(--text-secondary)] hover:text-white"
            }`}
          >
            About
            {activeTab === "about" && (
              <motion.div layoutId="companyTabUnderline" className="absolute bottom-0 inset-x-0 h-0.5 bg-cyan-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("collabs")}
            className={`pb-4 text-base font-medium relative transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "collabs" ? "text-white" : "text-[var(--text-secondary)] hover:text-white"
            }`}
          >
            <Briefcase className="w-4 h-4" /> Collab Calls ({collabs.length})
            {activeTab === "collabs" && (
              <motion.div layoutId="companyTabUnderline" className="absolute bottom-0 inset-x-0 h-0.5 bg-cyan-400" />
            )}
          </button>
          {isAdmin && (
            <>
              <button
                onClick={() => setActiveTab("reach")}
                className={`pb-4 text-base font-medium relative transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === "reach" ? "text-white" : "text-[var(--text-secondary)] hover:text-white"
                }`}
              >
                <Inbox className="w-4 h-4" /> Reach Inbox ({reachMessages.filter(r => r.status === "pending").length})
                {activeTab === "reach" && (
                  <motion.div layoutId="companyTabUnderline" className="absolute bottom-0 inset-x-0 h-0.5 bg-cyan-400" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className={`pb-4 text-base font-medium relative transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === "analytics" ? "text-white" : "text-[var(--text-secondary)] hover:text-white"
                }`}
              >
                <BarChart2 className="w-4 h-4" /> Talent Analytics
                {activeTab === "analytics" && (
                  <motion.div layoutId="companyTabUnderline" className="absolute bottom-0 inset-x-0 h-0.5 bg-cyan-400" />
                )}
              </button>
            </>
          )}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {/* ABOUT */}
          {activeTab === "about" && (
            <motion.div
              key="about-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="rounded-2xl p-6 shadow-xl border border-[var(--border-subtle)] bg-[var(--bg-frosted)]">
                <h3 className="text-lg font-display font-semibold text-white mb-3">Company Overview</h3>
                <p className="text-base text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                  {companyUser.tagline?.split("•")[0]?.trim() || "No detailed description provided."}
                </p>
              </div>

              {/* Reach requirements card */}
              {company.reach_enabled && (
                <div className="rounded-2xl p-6 border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-transparent">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-cyan-400 mb-2">Talent Reach Gateway</h4>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
                    This company has enabled the direct talent Reach gateway. Verified builders matching the criteria can send direct pitches bypassing traditional screening.
                  </p>
                  <div className="flex gap-6 items-center">
                    <div>
                      <span className="text-[10px] text-white/40 uppercase block">Min Aura Score</span>
                      <span className="text-lg font-bold text-white font-mono">{company.reach_threshold || 200}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-white/40 uppercase block">Accepting Topics</span>
                      <span className="text-xs font-semibold text-cyan-300">{company.reach_topic_tags?.join(", ") || "All focus areas"}</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* COLLABS */}
          {activeTab === "collabs" && (
            <motion.div
              key="collabs-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {collabs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {collabs.map((collab) => (
                    <div key={collab.id} className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-frosted)] relative flex flex-col justify-between">
                      <div>
                        <h4 className="text-lg font-bold text-white mb-1.5">{collab.title}</h4>
                        <p className="text-xs text-[var(--text-muted)] uppercase font-mono tracking-wider mb-4">
                          Role: {collab.role_type || "Builder"} • {collab.location || "Remote"}
                        </p>
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-3 mb-6">
                          {collab.description}
                        </p>
                      </div>
                      <Button variant="ghost" className="w-full justify-center">View Call Details</Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 rounded-2xl border border-dashed border-[var(--border-subtle)]">
                  <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-40 text-cyan-400" />
                  <h3 className="text-lg font-medium text-white mb-1">No Open Collabs</h3>
                  <p className="text-sm text-[var(--text-secondary)] font-medium">When this company hosts active projects or hires, they'll list here.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* REACH INBOX */}
          {activeTab === "reach" && isAdmin && (
            <motion.div
              key="reach-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {reachMessages.filter(r => r.status === "pending").length > 0 ? (
                <div className="space-y-4">
                  {reachMessages.filter(r => r.status === "pending").map((reach) => {
                    const sender = reach.sender_profile || {};
                    return (
                      <div key={reach.id} className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-frosted)] flex flex-col md:flex-row justify-between gap-6">
                        <div className="flex-1 space-y-4 min-w-0">
                          {/* Sender Info */}
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full overflow-hidden bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold shrink-0">
                              {sender.avatar_url ? (
                                <img src={sender.avatar_url} alt={sender.display_name} className="w-full h-full object-cover" />
                              ) : (
                                sender.display_name?.charAt(0) || sender.handle.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-sm text-white truncate hover:text-cyan-300 cursor-pointer" onClick={() => router.push(`/studio/${sender.handle}`)}>
                                  {sender.display_name || sender.handle}
                                </span>
                                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono font-semibold">
                                  {sender.pulse_score || 150} Aura
                                </span>
                              </div>
                              <span className="text-xs text-[var(--text-muted)] truncate block mt-0.5">{sender.tagline || "Creator"}</span>
                            </div>
                          </div>

                          {/* Message Content */}
                          <div>
                            <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 block mb-1">Topic: {reach.topic_tag}</span>
                            <p className="text-sm text-white leading-relaxed whitespace-pre-line p-4 rounded-xl bg-black/40 border border-white/5">{reach.content}</p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex md:flex-col justify-end gap-3 self-end md:self-center shrink-0">
                          <button
                            onClick={() => handleReachStatus(reach.id, "connected")}
                            disabled={processingId === reach.id}
                            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-all disabled:opacity-50 active:scale-95"
                          >
                            <Check className="w-4 h-4" /> Accept & Connect
                          </button>
                          <button
                            onClick={() => handleReachStatus(reach.id, "archived")}
                            disabled={processingId === reach.id}
                            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold text-xs transition-all disabled:opacity-50 active:scale-95"
                          >
                            <X className="w-4 h-4" /> Archive
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-24 rounded-2xl border border-dashed border-[var(--border-subtle)]">
                  <Inbox className="w-12 h-12 mx-auto mb-4 opacity-40 text-cyan-400" />
                  <h3 className="text-lg font-medium text-white mb-1">Reach Inbox Clean</h3>
                  <p className="text-sm text-[var(--text-secondary)]">No pending direct talent Reach messages at the moment.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* ANALYTICS */}
          {activeTab === "analytics" && isAdmin && (
            <motion.div
              key="analytics-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Stat Card 1 */}
              <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-frosted)] flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-4">Talent Funnel</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-white/80">Incoming Reach</span>
                        <span className="text-white/50">12 pitches</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-400" style={{ width: "100%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-white/80">Approved Connections</span>
                        <span className="text-white/50">4 approved (+15 Aura points issued)</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400" style={{ width: "33%" }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stat Card 2 (SVG Custom Bar Chart) */}
              <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-frosted)] flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-4">Applicant Aura Distribution</h4>
                  <div className="h-32 flex items-end justify-between gap-4 pt-4 border-b border-white/10 px-2">
                    <div className="flex flex-col items-center gap-1.5 flex-1">
                      <div className="w-full bg-cyan-500/20 border border-cyan-500/40 rounded-t-md h-[40%]" />
                      <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase">Rising</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 flex-1">
                      <div className="w-full bg-violet-500/20 border border-violet-500/40 rounded-t-md h-[70%]" />
                      <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase">Trusted</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 flex-1">
                      <div className="w-full bg-amber-500/20 border border-amber-500/40 rounded-t-md h-[25%]" />
                      <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase">Core</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SEND REACH MODAL */}
        <AnimatePresence>
          {showReachModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowReachModal(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative w-full max-w-md rounded-2xl border border-cyan-500/20 bg-[#070b0d]/90 backdrop-blur-xl text-white shadow-2xl flex flex-col p-6 z-10"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-display font-semibold flex items-center gap-2 text-cyan-400 animate-pulse">
                    🚀 Direct Talent Reach
                  </h3>
                  <button onClick={() => setShowReachModal(false)} className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {reachSuccess ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                      <Check className="w-6 h-6 text-emerald-400" />
                    </div>
                    <span className="text-sm font-semibold text-white">Reach Message Sent Successfully!</span>
                    <span className="text-xs text-[var(--text-muted)] mt-1">If they connect, you will unlock a direct DM thread.</span>
                  </div>
                ) : (
                  <form onSubmit={handleSendReach} className="space-y-4">
                    {reachError && (
                      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                        {reachError}
                      </div>
                    )}

                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400/80 block mb-1">Topic / Category</label>
                      <select
                        required
                        value={reachTag}
                        onChange={(e) => setReachTag(e.target.value)}
                        className="w-full bg-black/50 border border-cyan-500/20 rounded-xl p-3 text-white outline-none focus:border-cyan-500"
                      >
                        <option value="Internship">Internship Opportunity</option>
                        <option value="Full-time">Full-time Role</option>
                        <option value="Freelance">Freelance Contract</option>
                        <option value="Collaboration">Collaboration / Co-create</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400/80 block mb-1">Your Pitch / Proposal</label>
                      <textarea
                        required
                        value={reachContent}
                        onChange={(e) => setReachContent(e.target.value)}
                        placeholder="Introduce yourself, link your best projects, and explain why you'd be a great match..."
                        rows={5}
                        maxLength={1000}
                        className="w-full bg-black/50 border border-cyan-500/20 rounded-xl p-3 text-white placeholder-gray-600 outline-none focus:border-cyan-500 resize-none text-sm leading-relaxed"
                      />
                    </div>

                    <div className="pt-2 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setShowReachModal(false)}
                        className="flex-1 py-3 rounded-xl font-semibold text-white bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={sendingReach || !reachContent.trim()}
                        className="flex-1 py-3 rounded-xl font-semibold text-black bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
                      >
                        {sendingReach ? "Sending..." : "Send Pitch"}
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
