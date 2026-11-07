"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Sparkles, Image as ImageIcon } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CATEGORIES = [
  "Design",
  "Illustration",
  "Photography",
  "Video",
  "Motion",
  "Music",
  "Social Media",
  "Writing",
  "Code",
  "AI",
  "3D",
  "Gaming",
  "Art",
  "Fashion",
  "Freelance",
  "Sponsorships",
];

export default function CreatePostModal({
  isOpen,
  onClose,
  onSuccess,
}: CreatePostModalProps) {
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [mediaUrl, setPostMediaUrl] = useState("");
  const [category, setCategory] = useState("Design");
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setIsPosting(true);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { error: postErr } = await supabase.from("posts").insert({
        user_id: user.id,
        title: title.trim(),
        caption: caption.trim() || null,
        media_url: mediaUrl.trim() || null,
        category,
      });

      if (postErr) throw postErr;

      setTitle("");
      setCaption("");
      setPostMediaUrl("");
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error("Error creating post:", err);
      setError(err.message || "Failed to create post");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Sheet */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="relative w-full max-w-lg glass-thick rounded-3xl p-6 shadow-[var(--elevation-4)] border border-[var(--glass-border)] z-10"
        >
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <span className="text-[var(--accent-primary)] text-sm">✦</span>
              <h3 className="font-display font-bold text-lg text-[var(--text-primary)]">
                Create Project / Post
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-[var(--bg-frosted)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {error && (
            <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-mono !text-[10px] text-[var(--text-secondary)] block mb-1.5">
                PROJECT TITLE *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What did you build or design?"
                className="w-full bg-[var(--bg-deep)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
              />
            </div>

            <div>
              <label className="label-mono !text-[10px] text-[var(--text-secondary)] block mb-1.5">
                CAPTION & CONTEXT
              </label>
              <textarea
                rows={3}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Tell the community about your process, stack, or inspiration..."
                className="w-full bg-[var(--bg-deep)] border border-[var(--border-subtle)] rounded-xl p-4 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors resize-none"
              />
            </div>

            <div>
              <label className="label-mono !text-[10px] text-[var(--text-secondary)] block mb-1.5">
                MEDIA OR PREVIEW URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setPostMediaUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[var(--bg-deep)] border border-[var(--border-subtle)] rounded-xl pl-10 pr-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
                />
                <ImageIcon className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="label-mono !text-[10px] text-[var(--text-secondary)] block mb-1.5">
                CATEGORY
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[var(--bg-deep)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-mono font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPosting}
                className="btn-primary !py-2.5 !px-6 !text-xs"
              >
                {isPosting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <span>Publish Work ✦</span>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
