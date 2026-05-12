"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MOCK_FEED_POSTS } from "@/lib/data";
import FeedPost from "@/components/cards/FeedPost";
import Button from "@/components/ui/Button";

const FILTERS = ["All", "UI Design", "Code", "Film", "Music", "3D", "Writing"];

export default function FeedPage() {
  const [activeFilter, setActiveFilter] = useState("All");

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
          {MOCK_FEED_POSTS.map((post, i) => (
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
          <Button variant="primary" className="mx-auto">
            Post your work
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
