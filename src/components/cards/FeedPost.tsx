"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, Sparkles, Share2, MoreHorizontal, Eye, AlertCircle } from "lucide-react";
import type { FeedPostData } from "@/types";
import Link from "next/link";
import NeonBadge from "@/components/ui/NeonBadge";
import { createClient } from "@/utils/supabase/client";
import { RevealEffect } from "@/components/ui/RevealEffect";

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
  const [isSparkLoading, setIsSparkLoading] = useState(false);
  const [isSaveLoading, setIsSaveLoading] = useState(false);

  // Load auth user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUser(user);
    });
  }, []);

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
        .eq("post_id", post.id);
      setSaveCount(svCount ?? 0);

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
            .eq("post_id", post.id)
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
        .eq("post_id", post.id)
        .eq("user_id", user.id);
      if (error) {
        setSaved(wasSaved);
        setSaveCount((c) => wasSaved ? c + 1 : c - 1);
      }
    } else {
      const { error } = await supabase.from("saves").insert({
        user_id: user.id,
        post_id: post.id,
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

  return (
    <motion.article
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
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm font-display transition-colors" style={{ color: "var(--text-primary)" }}>
                {post.creator.name}
              </span>
              <span className="text-xs" style={{ color: "var(--text-secondary)" }}>@{post.creator.handle}</span>
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
          <button className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-black/5" style={{ color: "var(--text-muted)" }}>
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Media */}
      {post.category === "Code" && (
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
      )}

      {post.category === "Writing" && (
        <div className="w-full p-8 md:p-12 relative overflow-hidden" style={{ backgroundColor: "var(--bg-deep)", borderTop: "1px solid var(--glass-border)", borderBottom: "1px solid var(--glass-border)" }}>
          <blockquote className="border-l-4 pl-6 italic text-xl md:text-2xl font-serif leading-relaxed relative z-10" style={{ borderColor: "var(--accent-primary)", color: "var(--text-primary)" }}>
            "{post.caption.length > 200 ? post.caption.substring(0, 200) + '...' : post.caption}"
          </blockquote>
        </div>
      )}

      {(!post.category || ["UI Design", "3D", "Film", "Music", "All"].includes(post.category)) && post.mediaUrl && (
        <div className="w-full aspect-square md:aspect-video relative overflow-hidden group/media" style={{ backgroundColor: "var(--bg-deep)", borderTop: "1px solid var(--glass-border)", borderBottom: "1px solid var(--glass-border)" }}>
          <img src={post.mediaUrl} alt={post.title || "Post media"} className="w-full h-full object-cover transition-transform duration-700 group-hover/media:scale-105" />
        </div>
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

          {/* Right: Share + Spark */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-all"
            >
              <Share2 className="w-4 h-4" />
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
    </motion.article>
  );
}
