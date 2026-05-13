"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, Sparkles, Share2, MoreHorizontal, MessageSquare, Briefcase, AlertCircle } from "lucide-react";
import type { FeedPostData } from "@/types";
import Link from "next/link";
import NeonBadge from "@/components/ui/NeonBadge";
import { createClient } from "@/utils/supabase/client";
import { useEffect } from "react";
import { RevealEffect } from "@/components/ui/RevealEffect";

interface FeedPostProps {
  post: FeedPostData;
  index?: number;
}

export default function FeedPost({ post, index = 0 }: FeedPostProps) {
  const [sparkOpen, setSparkOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showToast, setShowToast] = useState(false);
  
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUser(user);
    });
  }, []);

  const requireAuth = (action: () => void) => {
    if (!user) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }
    action();
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

      {/* Media / Custom Renders based on Category */}
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
                (
                <br />
                {'    '}
                <span className="text-blue-300">&lt;div </span>
                <span className="text-sky-300">className</span>=
                <span className="text-orange-300">"glass-card"</span>
                <span className="text-blue-300">&gt;</span>
                <br />
                {'      '}
                <span className="text-gray-100">{post.caption ? (post.caption.length > 50 ? post.caption.substring(0, 50) + "..." : post.caption) : "Hello World!"}</span>
                <br />
                {'    '}
                <span className="text-blue-300">&lt;/div&gt;</span>
                <br />
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
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cream-paper.png')" }} />
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
                    <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Please log in to perform this action.</p>
                  </div>
                  <Link href="/login" className="ml-2 text-xs font-medium px-3 py-1.5 rounded-lg pointer-events-auto transition-colors" style={{ color: "var(--accent-primary)", backgroundColor: "var(--glass-hover)" }}>
                    Log In
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            className={`flex items-center gap-2 text-sm transition-colors ${saved ? 'text-cyan-400' : 'text-white/50 hover:text-white'}`}
            onClick={() => requireAuth(() => setSaved(!saved))}
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
            <span className="font-medium">{saved ? post.saves + 1 : post.saves}</span>
          </button>

          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-all">
              <Share2 className="w-4 h-4" />
            </button>
            
            <div className="relative">
              <motion.button 
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                style={{ backgroundColor: "var(--glass-hover)", border: "1px solid var(--border-subtle)", color: "var(--accent-primary)" }}
                whileHover={{ scale: 1.02, backgroundColor: "var(--glass-bg)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => requireAuth(() => setSparkOpen(!sparkOpen))}
              >
                <Sparkles className="w-4 h-4" />
                Spark
              </motion.button>
              
              <AnimatePresence>
                {sparkOpen && (
                  <motion.div 
                    className="absolute bottom-full right-0 mb-3 w-56 rounded-xl p-2 shadow-2xl z-20"
                    style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--glass-border)" }}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex flex-col gap-1">
                      <button className="flex items-center gap-3 w-full text-left p-2.5 rounded-lg text-sm transition-all" style={{ color: "var(--text-primary)" }} onClick={() => setSparkOpen(false)}>
                        <MessageSquare className="w-4 h-4" style={{ color: "var(--accent-cyan)" }} />
                        Quick Chat
                      </button>
                      <button className="flex items-center gap-3 w-full text-left p-2.5 rounded-lg text-sm transition-all" style={{ color: "var(--text-primary)" }} onClick={() => setSparkOpen(false)}>
                        <Briefcase className="w-4 h-4" style={{ color: "var(--accent-primary)" }} />
                        Pitch Project
                      </button>
                      <button className="flex items-center gap-3 w-full text-left p-2.5 rounded-lg text-sm transition-all" style={{ color: "var(--text-primary)" }} onClick={() => setSparkOpen(false)}>
                        <Sparkles className="w-4 h-4" style={{ color: "var(--accent-amber)" }} />
                        Remix This
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
      </RevealEffect>
    </motion.article>
  );
}
