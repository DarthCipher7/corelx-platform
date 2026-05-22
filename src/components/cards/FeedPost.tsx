"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, Sparkles, Share2, MoreHorizontal, Eye, AlertCircle, MessageSquare, Flag, Loader2, CheckCircle } from "lucide-react";
import type { FeedPostData } from "@/types";
import Link from "next/link";
import NeonBadge from "@/components/ui/NeonBadge";
import { createClient } from "@/utils/supabase/client";
import { RevealEffect } from "@/components/ui/RevealEffect";
import CommentDrawer from "./CommentDrawer";
import MediaPlayer from "@/components/ui/MediaPlayer";
import BugReportLog from "@/components/cards/BugReportLog";

interface FeedPostProps {
  post: FeedPostData;
  index?: number;
}

export default function FeedPost({ post, index = 0 }: FeedPostProps) {
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [showToast, setShowToast] = useState(false);

  // Real interaction state
  const [sparked, setSparked] = useState(false);
  const [sparkCount, setSparkCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [saveCount, setSaveCount] = useState(0);
  const [viewCount, setViewCount] = useState(post.views ?? 0);
  const [commentCount, setCommentCount] = useState(0);
  const [isSparkLoading, setIsSparkLoading] = useState(false);
  const [isSaveLoading, setIsSaveLoading] = useState(false);

  const [commentDrawerOpen, setCommentDrawerOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("spam");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const articleRef = useRef<HTMLDivElement>(null);

  // Load auth user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUser(user);
    });
  }, []);

  // Intersection Observer for 60% visibility for 1s
  useEffect(() => {
    const observerElement = articleRef.current;
    if (!observerElement) return;

    let timer: any = null;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            timer = setTimeout(async () => {
              const { data: { user: authUser } } = await supabase.auth.getUser();
              if (authUser) {
                await supabase.from("post_impressions").upsert({
                  user_id: authUser.id,
                  post_id: post.id
                }, { onConflict: "user_id,post_id" });
              }
            }, 1000);
          } else {
            if (timer) {
              clearTimeout(timer);
              timer = null;
            }
          }
        });
      },
      {
        threshold: 0.6
      }
    );

    observer.observe(observerElement);

    return () => {
      observer.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [post.id]);

  // Load real spark + save counts and user state
  useEffect(() => {
    async function loadInteractions() {
      // Count sparks on this post
      const { count: sCount } = await supabase
        .from("sparks")
        .select("*", { count: "exact", head: true })
        .eq("target_type", "post")
        .eq("target_id", post.id);
      setSparkCount(sCount ?? 0);

      // Count saves on this post
      const { count: svCount } = await supabase
        .from("saves")
        .select("*", { count: "exact", head: true })
        .eq("target_type", "post")
        .eq("target_id", post.id);
      setSaveCount(svCount ?? 0);

      // Count comments
      const { count: cCount } = await supabase
        .from("comments")
        .select("*", { count: "exact", head: true })
        .eq("target_type", "post")
        .eq("target_id", post.id);
      setCommentCount(cCount ?? 0);

      // Check if current user has sparked / saved
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const [{ data: sparkRow }, { data: saveRow }] = await Promise.all([
          supabase
            .from("sparks")
            .select("id")
            .eq("target_type", "post")
            .eq("target_id", post.id)
            .eq("sender_id", authUser.id)
            .maybeSingle(),
          supabase
            .from("saves")
            .select("id")
            .eq("target_type", "post")
            .eq("target_id", post.id)
            .eq("user_id", authUser.id)
            .maybeSingle(),
        ]);
        setSparked(!!sparkRow);
        setSaved(!!saveRow);
      }
    }

    loadInteractions();

    // Increment view count once on mount via RPC (fire-and-forget)
    supabase.rpc("increment_post_view", { post_id: post.id }).then(() => {
      setViewCount((v) => v + 1);
    });
  }, [post.id]);

  const requireAuth = (action: () => void) => {
    if (!user) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }
    action();
  };

  const handleSparkToggle = useCallback(async () => {
    if (!user || isSparkLoading) return;
    setIsSparkLoading(true);

    // Optimistic update
    const wasSparkd = sparked;
    setSparked(!wasSparkd);
    setSparkCount((c) => wasSparkd ? c - 1 : c + 1);

    if (wasSparkd) {
      // Delete the spark
      const { error } = await supabase
        .from("sparks")
        .delete()
        .eq("target_type", "post")
        .eq("target_id", post.id)
        .eq("sender_id", user.id);
      if (error) {
        // Rollback on failure
        setSparked(wasSparkd);
        setSparkCount((c) => wasSparkd ? c + 1 : c - 1);
      }
    } else {
      // Insert a spark
      const { error } = await supabase.from("sparks").insert({
        sender_id: user.id,
        target_type: "post",
        target_id: post.id,
        status: "accepted", // Post sparks are instant, no handshake needed
      });
      if (error) {
        // Rollback on failure
        setSparked(wasSparkd);
        setSparkCount((c) => wasSparkd ? c + 1 : c - 1);
      }
    }

    setIsSparkLoading(false);
  }, [user, sparked, post.id, isSparkLoading, supabase]);

  const handleSaveToggle = useCallback(async () => {
    if (!user || isSaveLoading) return;
    setIsSaveLoading(true);

    // Optimistic update
    const wasSaved = saved;
    setSaved(!wasSaved);
    setSaveCount((c) => wasSaved ? c - 1 : c + 1);

    if (wasSaved) {
      const { error } = await supabase
        .from("saves")
        .delete()
        .eq("target_type", "post")
        .eq("target_id", post.id)
        .eq("user_id", user.id);
      if (error) {
        setSaved(wasSaved);
        setSaveCount((c) => wasSaved ? c + 1 : c - 1);
      }
    } else {
      const { error } = await supabase.from("saves").insert({
        user_id: user.id,
        target_type: "post",
        target_id: post.id,
      });
      if (error) {
        setSaved(wasSaved);
        setSaveCount((c) => wasSaved ? c + 1 : c - 1);
      }
    }

    setIsSaveLoading(false);
  }, [user, saved, post.id, isSaveLoading, supabase]);

  const handleShare = () => {
    const url = `${window.location.origin}/studio/${post.creator.handle}`;
    navigator.clipboard.writeText(url);
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || reportSubmitting) return;
    setReportSubmitting(true);
    
    const { error } = await supabase.from('reports').insert({
      reporter_id: user.id,
      target_type: 'post',
      target_id: post.id,
      reason: reportReason,
      details: reportDetails
    });
    
    setReportSubmitting(false);
    if (!error) {
      setReportSuccess(true);
      setTimeout(() => {
        setReportSuccess(false);
        setReportModalOpen(false);
        setReportDetails("");
      }, 2000);
    }
  };


  return (
    <motion.article
      ref={articleRef}
      className="border rounded-2xl overflow-hidden shadow-2xl mb-8 relative group"
      style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--glass-border)" }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "100px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.1, 0.3) }}
    >
      <RevealEffect>
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <Link href={`/studio/${post.creator.handle}`} className="flex items-center gap-3 group/author">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 group-hover/author:border-white/30 transition-colors">
            <img src={post.creator.avatar} alt={post.creator.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-sm font-display transition-colors" style={{ color: "var(--text-primary)" }}>
                {post.creator.name}
              </span>
              {post.creator.verified && (
                <CheckCircle className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/20 drop-shadow-[0_0_4px_rgba(34,211,238,0.5)] shrink-0 animate-pulse" />
              )}
              <span className="text-xs" style={{ color: "var(--text-secondary)" }}>@{post.creator.handle}</span>
              {post.creator.college && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center gap-0.5">
                  {post.creator.college.hub_type === 'society' ? '🏡' : post.creator.college.hub_type === 'corporate' ? '🏢' : '🏫'} {post.creator.college.short_name || post.creator.college.name}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{post.creator.role.split("&")[0].trim()}</span>
              <span className="w-1 h-1 rounded-full" style={{ backgroundColor: "var(--border-subtle)" }} />
              <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{post.timestamp}</span>
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {post.type === "trending_creator_spotlight" && (
            <NeonBadge variant="purple" size="sm">Spotlight</NeonBadge>
          )}
          {post.type === "collab_call" && (
            <NeonBadge variant="cyan" size="sm">Collab</NeonBadge>
          )}
          <div className="relative">
            <button onClick={() => setDropdownOpen(!dropdownOpen)} className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-black/5" style={{ color: "var(--text-muted)" }}>
              <MoreHorizontal className="w-4 h-4" />
            </button>
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 mt-2 w-36 bg-[var(--bg-deep)] border border-[var(--glass-border)] rounded-xl overflow-hidden shadow-2xl z-20"
                >
                  <button 
                    onClick={() => { setDropdownOpen(false); requireAuth(() => setReportModalOpen(true)); }}
                    className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-[var(--bg-surface)] transition-colors flex items-center gap-2"
                  >
                    <Flag className="w-4 h-4" />
                    Report
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Media */}
      {post.category === "Gaming" && post.bug_details ? (
        <div className="w-full p-4" style={{ backgroundColor: "var(--bg-deep)", borderTop: "1px solid var(--glass-border)", borderBottom: "1px solid var(--glass-border)" }}>
          <BugReportLog
            title={post.bug_details.title}
            severity={post.bug_details.severity}
            platforms={post.bug_details.platforms}
            steps={post.bug_details.steps}
            stackTrace={post.bug_details.stackTrace}
            screenshotUrl={post.bug_details.screenshotUrl || post.mediaUrl}
          />
        </div>
      ) : (post.category === "Video" || post.category === "Film") && post.mediaUrl ? (
        <div className="w-full p-4" style={{ backgroundColor: "var(--bg-deep)", borderTop: "1px solid var(--glass-border)", borderBottom: "1px solid var(--glass-border)" }}>
          <MediaPlayer mediaUrl={post.mediaUrl} category="Video" title={post.title} artistName={post.creator.name} />
        </div>
      ) : post.category === "Music" && post.mediaUrl ? (
        <div className="w-full p-4" style={{ backgroundColor: "var(--bg-deep)", borderTop: "1px solid var(--glass-border)", borderBottom: "1px solid var(--glass-border)" }}>
          <MediaPlayer mediaUrl={post.mediaUrl} category="Music" title={post.title} artistName={post.creator.name} />
        </div>
      ) : post.category === "Code" ? (
        <div className="w-full p-6 relative overflow-hidden" style={{ backgroundColor: "var(--bg-deep)", borderTop: "1px solid var(--glass-border)", borderBottom: "1px solid var(--glass-border)" }}>
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: "radial-gradient(circle at 80% 20%, var(--accent-primary) 0%, transparent 40%)" }} />
          <div className="rounded-xl overflow-hidden shadow-2xl relative" style={{ backgroundColor: "#1e1e1e", border: "1px solid var(--border-subtle)" }}>
            <div className="flex items-center px-4 py-3 bg-[#2d2d2d] border-b border-[#3d3d3d]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="ml-4 text-xs font-mono text-gray-400">app.tsx</span>
            </div>
            <pre className="p-4 text-sm font-mono overflow-x-auto text-gray-300">
              <code>
                <span className="text-pink-400">export function </span>
                <span className="text-blue-400">Component</span>() {'{\n'}
                {'  '}
                <span className="text-pink-400">return </span>
                (<br />{'    '}<span className="text-blue-300">&lt;div </span>
                <span className="text-sky-300">className</span>=
                <span className="text-orange-300">"glass-card"</span>
                <span className="text-blue-300">&gt;</span><br />
                {'      '}<span className="text-gray-100">{post.caption ? (post.caption.length > 50 ? post.caption.substring(0, 50) + "..." : post.caption) : "Hello World!"}</span><br />
                {'    '}<span className="text-blue-300">&lt;/div&gt;</span><br />
                  );
                <br />
                {'}'}
              </code>
            </pre>
          </div>
        </div>
      ) : post.category === "Writing" ? (
        <div className="w-full p-8 md:p-12 relative overflow-hidden" style={{ backgroundColor: "var(--bg-deep)", borderTop: "1px solid var(--glass-border)", borderBottom: "1px solid var(--glass-border)" }}>
          <blockquote className="border-l-4 pl-6 italic text-xl md:text-2xl font-serif leading-relaxed relative z-10" style={{ borderColor: "var(--accent-primary)", color: "var(--text-primary)" }}>
            "{post.caption.length > 200 ? post.caption.substring(0, 200) + '...' : post.caption}"
          </blockquote>
        </div>
      ) : (
        post.mediaUrl && (
          <div className="w-full aspect-square md:aspect-video relative overflow-hidden group/media" style={{ backgroundColor: "var(--bg-deep)", borderTop: "1px solid var(--glass-border)", borderBottom: "1px solid var(--glass-border)" }}>
            <img src={post.mediaUrl} alt={post.title || "Post media"} className="w-full h-full object-cover transition-transform duration-700 group-hover/media:scale-105" />
          </div>
        )
      )}

      {/* Content */}
      <div className="p-5">
        {post.title && (
          <h3 className="font-display font-semibold text-lg mb-2" style={{ color: "var(--text-primary)" }}>
            {post.title}
          </h3>
        )}
        {post.category !== "Writing" && (
          <p className="text-sm leading-relaxed mb-4 line-clamp-3" style={{ color: "var(--text-secondary)" }}>
            {post.caption}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-5">
          {post.tags.map((tag) => (
            <span key={tag} className="skill-badge text-xs px-2.5 py-1">
              {tag}
            </span>
          ))}
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-white/5 relative">

          <AnimatePresence>
            {showToast && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute bottom-full left-0 right-0 mb-4 flex justify-center pointer-events-none"
              >
                <div className="shadow-2xl rounded-xl px-4 py-3 flex items-center gap-3" style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--glass-border)" }}>
                  <AlertCircle className="w-5 h-5" style={{ color: "var(--accent-primary)" }} />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Login required</p>
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Please log in to interact.</p>
                  </div>
                  <Link href="/login" className="ml-2 text-xs font-medium px-3 py-1.5 rounded-lg pointer-events-auto transition-colors" style={{ color: "var(--accent-primary)", backgroundColor: "var(--glass-hover)" }}>
                    Log In
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Left: Save + Views */}
          <div className="flex items-center gap-4">
            <button
              className={`flex items-center gap-1.5 text-sm transition-colors ${saved ? 'text-cyan-400' : 'text-white/50 hover:text-white'}`}
              onClick={() => requireAuth(handleSaveToggle)}
              disabled={isSaveLoading}
            >
              <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
              <span className="font-medium font-mono text-xs">{saveCount}</span>
            </button>

            <span className="flex items-center gap-1.5 text-xs font-mono" style={{ color: "var(--text-muted)" }}>
              <Eye className="w-3.5 h-3.5" />
              {viewCount}
            </span>
          </div>

          {/* Right: Share + Comment + Spark */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-all"
            >
              <Share2 className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setCommentDrawerOpen(true)}
              className="flex items-center gap-1.5 text-white/50 hover:text-white transition-all px-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="font-mono text-xs">{commentCount}</span>
            </button>

            <div className="relative">
              <motion.button
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                style={{
                  backgroundColor: sparked ? "var(--accent-primary-glow)" : "var(--glass-hover)",
                  border: "1px solid",
                  borderColor: sparked ? "var(--accent-primary)" : "var(--border-subtle)",
                  color: sparked ? "var(--text-primary)" : "var(--accent-primary)"
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => requireAuth(handleSparkToggle)}
                disabled={isSparkLoading}
              >
                <Sparkles className={`w-4 h-4 ${sparked ? "fill-current" : ""}`} />
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={sparkCount}
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="font-mono text-xs min-w-[24px] text-center"
                  >
                    {sparkCount > 0 ? sparkCount : "Spark"}
                  </motion.span>
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
      </RevealEffect>
      
      <CommentDrawer 
        isOpen={commentDrawerOpen} 
        onClose={() => setCommentDrawerOpen(false)} 
        postId={post.id} 
        postOwnerId={post.creator.id || ''} 
        onCommentAdded={() => setCommentCount(c => c + 1)} 
      />

      {/* Report Modal */}
      <AnimatePresence>
        {reportModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setReportModalOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-sm bg-[var(--bg-deep)] border border-[var(--glass-border)] rounded-2xl p-6 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {reportSuccess ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                    <Flag className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Report Submitted</h3>
                  <p className="text-sm text-[var(--text-secondary)]">We'll review within 48 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleReport}>
                  <h3 className="text-lg font-semibold text-white mb-4">Report Post</h3>
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] block mb-2">Reason</label>
                      <select 
                        value={reportReason}
                        onChange={e => setReportReason(e.target.value)}
                        className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[var(--accent-primary)]"
                      >
                        <option value="spam">Spam</option>
                        <option value="stolen_work">Stolen Work</option>
                        <option value="harmful">Harmful Content</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] block mb-2">Details (Optional)</label>
                      <textarea 
                        value={reportDetails}
                        onChange={e => setReportDetails(e.target.value)}
                        className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[var(--accent-primary)] resize-none h-20 custom-scrollbar"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => setReportModalOpen(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:text-white transition-colors">
                      Cancel
                    </button>
                    <button type="submit" disabled={reportSubmitting} className="px-4 py-2 rounded-xl text-sm font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors flex items-center gap-2">
                      {reportSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Report"}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.article>
  );
}
