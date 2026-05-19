"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MOCK_FEED_POSTS } from "@/lib/data";
import FeedPost from "@/components/cards/FeedPost";
import Button from "@/components/ui/Button";
import { createClient } from "@/utils/supabase/client";
import { X, Image as ImageIcon } from "lucide-react";
import { FeedPostData } from "@/types";

const FILTERS = ["All", "UI Design", "Code", "Film", "Music", "3D", "Writing"];

export default function FeedPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [user, setUser] = useState<any>(null);
  const [dbPosts, setDbPosts] = useState<any[]>([]);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postCaption, setPostCaption] = useState("");
  const [postMediaUrl, setPostMediaUrl] = useState("");
  const [postCategory, setPostCategory] = useState("UI Design");
  const [isPosting, setIsPosting] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUser(user);
    });
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [activeFilter]);

  const fetchPosts = async () => {
    let query = supabase
      .from('feed_posts')
      .select(`
        id,
        title,
        caption,
        media_url,
        category,
        created_at,
        user_id,
        users (
          handle,
          display_name,
          avatar_url,
          tagline
        )
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    if (activeFilter !== "All") {
      query = query.eq('category', activeFilter);
    }
      
    const { data, error } = await query;
      
    if (data) {
      setDbPosts(data);
    }
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsPosting(true);
    
    const { data, error } = await supabase.from('feed_posts').insert({
      user_id: user.id,
      title: postTitle,
      caption: postCaption,
      media_url: postMediaUrl,
      category: postCategory
    }).select(`
      id, title, caption, media_url, category, created_at, user_id,
      users ( handle, display_name, avatar_url, tagline )
    `).single();
    
    setIsPosting(false);
    
    if (!error && data) {
      setIsPostModalOpen(false);
      setPostTitle("");
      setPostCaption("");
      setPostMediaUrl("");
      setPostCategory("UI Design");
      // Optimistically prepend
      if (activeFilter === "All" || activeFilter === postCategory) {
        setDbPosts(prev => [data, ...prev]);
      }
    } else {
      alert(error?.message || "Error posting");
    }
  };

  const combinedPosts: FeedPostData[] = [
    ...dbPosts.map(p => ({
      id: p.id,
      type: "work_post" as const,
      creator: {
        id: p.user_id,
        name: p.users?.display_name || "Unknown",
        handle: p.users?.handle || "unknown",
        avatar: p.users?.avatar_url || "",
        verified: false,
        role: p.users?.tagline || "Creator"
      },
      timestamp: new Date(p.created_at).toLocaleDateString(),
      title: p.title,
      caption: p.caption,
      mediaUrl: p.media_url,
      tags: [],
      saves: 0,
      category: p.category
    })),
    ...(activeFilter === "All" ? MOCK_FEED_POSTS : MOCK_FEED_POSTS.filter((p: any) => p.category === activeFilter))
  ];

  return (
    <div className="min-h-screen pt-24 pb-32">
      {/* Sticky Filter Bar */}
      <div className="sticky top-16 z-30 w-full backdrop-blur-md border-b py-4 mb-8" style={{ backgroundColor: "var(--glass-bg)", borderColor: "var(--border-subtle)" }}>
        <div className="max-w-[680px] mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 -mb-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                className="whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all"
                style={{
                  backgroundColor: activeFilter === f ? "var(--text-primary)" : "var(--border-subtle)",
                  color: activeFilter === f ? "var(--bg-void)" : "var(--text-secondary)"
                }}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[680px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col">
          {combinedPosts.map((post, i) => (
            <FeedPost key={post.id} post={post} index={i} />
          ))}
        </div>

        {/* End State */}
        <motion.div 
          className="mt-16 text-center py-12 border-t"
          style={{ borderColor: "var(--border-subtle)" }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="w-16 h-16 rounded-full border flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: "var(--accent-primary-glow)", borderColor: "var(--accent-primary)" }}>
            <span className="text-2xl">✨</span>
          </div>
          <h2 className="font-display font-bold text-2xl mb-2" style={{ color: "var(--text-primary)" }}>
            You're caught up.
          </h2>
          <p className="mb-8 max-w-sm mx-auto" style={{ color: "var(--text-secondary)" }}>
            You've seen all the latest updates from your network. Now go build something amazing.
          </p>
          {user ? (
            <Button variant="primary" className="mx-auto" onClick={() => setIsPostModalOpen(true)}>
              Post your work
            </Button>
          ) : (
            <Button variant="primary" className="mx-auto" onClick={() => window.location.href = '/login'}>
              Join to Post
            </Button>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {isPostModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsPostModalOpen(false)}
              className="absolute inset-0 backdrop-blur-sm"
              style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden p-6"
              style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--glass-border)" }}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-display font-bold" style={{ color: "var(--text-primary)" }}>Create Post</h3>
                <button 
                  onClick={() => setIsPostModalOpen(false)}
                  className="p-2 rounded-full transition-colors"
                  style={{ color: "var(--text-secondary)", backgroundColor: "var(--bg-frosted)" }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <form onSubmit={handlePostSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Title your work..."
                    className="w-full text-lg font-bold bg-transparent border-none focus:outline-none focus:ring-0 px-0"
                    style={{ color: "var(--text-primary)" }}
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                  />
                </div>
                <div>
                  <textarea
                    required
                    placeholder="Share the story behind this..."
                    rows={4}
                    className="w-full resize-none bg-transparent border-none focus:outline-none focus:ring-0 px-0 text-sm"
                    style={{ color: "var(--text-secondary)" }}
                    value={postCaption}
                    onChange={(e) => setPostCaption(e.target.value)}
                  />
                </div>
                
                <div className="pt-4 border-t" style={{ borderColor: "var(--border-subtle)" }}>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Category</label>
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
                    {FILTERS.filter(f => f !== "All").map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setPostCategory(f)}
                        className="whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                        style={{
                          backgroundColor: postCategory === f ? "var(--accent-primary)" : "var(--bg-frosted)",
                          color: postCategory === f ? "#ffffff" : "var(--text-secondary)",
                          border: `1px solid ${postCategory === f ? "var(--accent-primary)" : "var(--glass-border)"}`
                        }}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t" style={{ borderColor: "var(--border-subtle)" }}>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Media URL (Optional)</label>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: "var(--bg-frosted)" }}>
                      <ImageIcon className="w-5 h-5 text-purple-400" />
                    </div>
                    <input
                      type="url"
                      placeholder="https://example.com/image.png"
                      className="flex-1 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-400 transition-colors"
                      style={{ backgroundColor: "var(--bg-deep)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
                      value={postMediaUrl}
                      onChange={(e) => setPostMediaUrl(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end pt-4">
                  <Button variant="primary" disabled={isPosting}>
                    {isPosting ? "Posting..." : "Post to Feed"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
