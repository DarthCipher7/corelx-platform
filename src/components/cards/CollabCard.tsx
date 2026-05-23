"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, Users, Clock, ArrowRight, X, Send, CheckCircle, Trash2, Archive } from "lucide-react";
import type { CollabRequest } from "@/types";
import NeonBadge from "@/components/ui/NeonBadge";
import Button from "@/components/ui/Button";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

interface CollabCardProps {
  collab: CollabRequest;
  index?: number;
  onApplySuccess?: () => void;
}

const TYPE_CONFIG = {
  paid: { label: "Paid", variant: "emerald" as const },
  collab: { label: "Collab", variant: "purple" as const },
  "open-source": { label: "Open Source", variant: "cyan" as const },
};

export default function CollabCard({ collab, index = 0, onApplySuccess }: CollabCardProps) {
  const typeConf = TYPE_CONFIG[collab.type] || { label: "Collab", variant: "purple" as const };
  const supabase = createClient();
  const router = useRouter();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [pitch, setPitch] = useState("");
  const [portfolioLink, setPortfolioLink] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
    });
  }, []);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (collab.applicants > 0 || collab.collab_status === 'has_responses') {
      alert("Cannot delete collaboration request as it already has responses.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this collab call?")) return;
    const { error } = await supabase.from('collab_calls').delete().eq('id', collab.id);
    if (!error) {
      window.location.reload();
    } else {
      alert(error.message);
    }
  };

  const handleClose = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to close this collab call? No new responses will be allowed.")) return;
    const { error } = await supabase.from('collab_calls').update({ collab_status: 'closed' }).eq('id', collab.id);
    if (!error) {
      window.location.reload();
    } else {
      alert(error.message);
    }
  };

  const handleApplyClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    // Auto-fill profile link if possible
    const { data: profile } = await supabase.from('users').select('handle').eq('id', user.id).single();
    if (profile?.handle) {
      setPortfolioLink(`https://corelx-platform.vercel.app/studio/${profile.handle}`);
    }
    setIsDrawerOpen(true);
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pitch.trim()) return;

    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    // Insert as spark collab intent
    const { error } = await supabase.from('sparks').insert({
      sender_id: user.id,
      recipient_id: collab.creator.id,
      intent_type: 'collab',
      target_id: collab.id,
      target_type: 'collab',
      message: `Collab Application for: "${collab.title}"\n\nPitch: ${pitch}\n\nPortfolio: ${portfolioLink}`
    });

    setSubmitting(false);
    if (!error) {
      setSubmitted(true);
      if (onApplySuccess) onApplySuccess();
      setTimeout(() => {
        setIsDrawerOpen(false);
        setSubmitted(false);
        setPitch("");
      }, 2000);
    } else {
      alert(error.message);
    }
  };

  return (
    <>
      <motion.article
        className="relative rounded-2xl p-5 group cursor-pointer flex flex-col justify-between min-h-[220px]"
        style={{
          background: "var(--glass-card-bg)",
          border: "1px solid var(--border-subtle)",
          boxShadow: "var(--shadow-card)",
        }}
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "100px" }}
        transition={{ duration: 0.5, delay: index * 0.1, ease: [0.4, 0, 0.2, 1] }}
        whileHover={{ borderColor: "rgba(108,92,231,0.3)", y: -2 }}
        onClick={handleApplyClick}
      >
        <div>
          {/* Header */}
          <div className="flex items-start justify-between mb-3 gap-3">
            <h3
              className="font-semibold leading-snug flex-1"
              style={{
                color: "var(--text-primary)",
                fontFamily: "var(--font-display)",
                fontSize: "15px",
              }}
            >
              {collab.title}
            </h3>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {collab.collab_status === 'closed' && (
                <span className="inline-flex items-center text-[10px] font-semibold uppercase px-2 py-0.5 rounded border border-red-500/30 bg-red-500/10 text-red-400">
                  Closed
                </span>
              )}
              {collab.collab_status === 'has_responses' && (
                <span className="inline-flex items-center text-[10px] font-semibold uppercase px-2 py-0.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-400">
                  Active
                </span>
              )}
              <NeonBadge variant={typeConf.variant} size="sm">
                {typeConf.label}
              </NeonBadge>
            </div>
          </div>

          <p
            className="text-xs leading-relaxed mb-4 line-clamp-2"
            style={{ color: "var(--text-muted)" }}
          >
            {collab.description}
          </p>

          {/* Skills needed */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {collab.skills.map((skill) => (
              <span key={skill} className="skill-badge">
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div>
          {/* Meta */}
          <div className="flex items-center gap-4 mb-4">
            {collab.budget && (
              <div className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" style={{ color: "#00cec9" }} />
                <span className="text-xs font-medium" style={{ color: "#00cec9" }}>
                  {collab.budget}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {collab.applicants} applied
              </span>
            </div>
            {collab.deadline && (
              <div className="flex items-center gap-1.5 ml-auto">
                <Clock className="w-3.5 h-3.5" style={{ color: "var(--text-dim)" }} />
                <span className="text-xs" style={{ color: "var(--text-dim)" }}>
                  {new Date(collab.deadline).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-between pt-3"
            style={{ borderTop: "1px solid var(--border-subtle)" }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center font-bold text-[10px] text-white"
                style={{ border: "1px solid rgba(108,92,231,0.3)", backgroundColor: "var(--accent-primary)" }}
              >
                {collab.creator.avatar ? (
                  <img
                    src={collab.creator.avatar}
                    alt={collab.creator.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  (collab.creator.name || collab.creator.handle).charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                  {collab.creator.name}
                </p>
                <p className="text-[10px]" style={{ color: "var(--text-dim)" }}>
                  @{collab.creator.handle}
                </p>
              </div>
            </div>

            {currentUser?.id === collab.creator.id ? (
              <div className="flex gap-2">
                {(collab.collab_status === 'open' || !collab.collab_status) && (
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-red-500/30 text-red-400 bg-red-500/5 hover:bg-red-500/15 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                )}
                {collab.collab_status === 'has_responses' && (
                  <button
                    onClick={handleClose}
                    className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-amber-500/30 text-amber-400 bg-amber-500/5 hover:bg-amber-500/15 transition-all"
                  >
                    <Archive className="w-3.5 h-3.5" /> Close Collab
                  </button>
                )}
              </div>
            ) : collab.collab_status === 'closed' ? (
              <button
                disabled
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg opacity-50 cursor-not-allowed border border-[var(--border-subtle)] text-[var(--text-muted)]"
              >
                Closed
              </button>
            ) : (
              <motion.button
                type="button"
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                style={{
                  color: "var(--accent-primary)",
                  background: "rgba(108,92,231,0.1)",
                  border: "1px solid rgba(108,92,231,0.2)",
                }}
                whileHover={{
                  background: "rgba(108,92,231,0.2)",
                  borderColor: "rgba(108,92,231,0.5)",
                }}
                whileTap={{ scale: 0.97 }}
                onClick={handleApplyClick}
              >
                Apply <ArrowRight className="w-3 h-3" />
              </motion.button>
            )}
          </div>
        </div>
      </motion.article>

      {/* Slide-Up Application Bottom Sheet Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 z-40 backdrop-blur-sm"
              style={{ backgroundColor: "rgba(3, 3, 8, 0.6)" }}
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-50 md:left-auto md:right-8 md:w-96 rounded-t-3xl shadow-2xl flex flex-col"
              style={{
                backgroundColor: "var(--bg-elevated)",
                border: "1px solid var(--glass-border)",
                borderBottom: "none",
                maxHeight: "85vh",
              }}
            >
              <div
                className="p-4 border-b flex justify-between items-center"
                style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-deep)" }}
              >
                <div>
                  <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                    Apply to Collab
                  </h3>
                  <p className="text-[11px] truncate w-64" style={{ color: "var(--text-muted)" }}>
                    {collab.title}
                  </p>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 rounded-full hover:bg-black/10 transition-colors"
                >
                  <X className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                </button>
              </div>

              <div className="p-5 overflow-y-auto">
                {submitted ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <CheckCircle className="w-16 h-16 text-emerald-500 mb-4 animate-bounce" />
                    <h4 className="text-lg font-bold mb-1" style={{ color: "var(--text-primary)" }}>
                      Wavelength Sent!
                    </h4>
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      Your collab request has been transmitted.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmitApplication} className="space-y-4">
                    <div className="bg-[var(--bg-frosted)] border border-[var(--glass-border)] rounded-2xl p-4">
                      <label
                        className="block text-[10px] font-semibold uppercase tracking-wider mb-2"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Pitch Pitch (Max 280 chars)
                      </label>
                      <textarea
                        required
                        maxLength={280}
                        value={pitch}
                        onChange={(e) => setPitch(e.target.value)}
                        className="w-full bg-[var(--bg-deep)] text-[var(--text-primary)] border border-[var(--border-subtle)] focus:border-[var(--accent-secondary)] rounded-xl p-3 resize-none h-28 focus:outline-none focus:ring-1 focus:ring-[var(--accent-secondary)] transition-all text-xs"
                        placeholder="Why are you the missing piece?"
                      />
                      <div className="text-right text-[9px] mt-1" style={{ color: "var(--text-muted)" }}>
                        {pitch.length}/280
                      </div>
                    </div>

                    <div className="bg-[var(--bg-frosted)] border border-[var(--glass-border)] rounded-2xl p-4">
                      <label
                        className="block text-[10px] font-semibold uppercase tracking-wider mb-2"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Portfolio Link
                      </label>
                      <input
                        type="url"
                        value={portfolioLink}
                        onChange={(e) => setPortfolioLink(e.target.value)}
                        className="w-full bg-[var(--bg-deep)] text-[var(--text-primary)] border border-[var(--border-subtle)] focus:border-[var(--accent-secondary)] rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-[var(--accent-secondary)] transition-all text-xs"
                        placeholder="https://yourportfolio.com"
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      disabled={submitting}
                      className="w-full justify-center text-xs py-3"
                      iconRight={<Send className="w-3.5 h-3.5" />}
                    >
                      {submitting ? "Transmitting..." : "Send Wavelength"}
                    </Button>
                  </form>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
