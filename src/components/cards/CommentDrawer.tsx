"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, MessageSquare, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

interface CommentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postOwnerId: string;
  targetType?: "post" | "flare";
  onCommentAdded?: () => void;
}

export default function CommentDrawer({ isOpen, onClose, postId, postOwnerId, targetType = "post", onCommentAdded }: CommentDrawerProps) {
  const supabase = createClient();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUser(user));
  }, [supabase]);

  useEffect(() => {
    if (isOpen) {
      loadComments();
    }
  }, [isOpen, postId]);

  const loadComments = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('comments')
      .select('*, users(handle, display_name, avatar_url)')
      .eq('target_type', targetType)
      .eq('target_id', postId)
      .order('created_at', { ascending: true });
      
    if (data) setComments(data);
    setLoading(false);
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !currentUser || isSubmitting) return;

    setIsSubmitting(true);
    const { error } = await supabase.from('comments').insert({
      user_id: currentUser.id,
      target_type: targetType,
      target_id: postId,
      content: content.trim()
    });

    if (!error) {
      setContent("");
      await loadComments();
      onCommentAdded?.();
    }
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[var(--bg-void)]/60 backdrop-blur-md p-0 sm:p-4"
        onClick={onClose}
      >
        <motion.div 
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full sm:max-w-xl h-[70vh] sm:h-[600px] bg-[var(--bg-deep)] border-t sm:border border-[var(--glass-border)] sm:rounded-3xl flex flex-col shadow-2xl relative"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[var(--accent-primary)]" />
              Comments
            </h3>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-primary)]" />
              </div>
            ) : comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)]">
                <MessageSquare className="w-12 h-12 mb-4 opacity-50" />
                <p>No comments yet. Be the first to spark a conversation!</p>
              </div>
            ) : (
              comments.map(comment => (
                <div key={comment.id} className="flex gap-3">
                  <Link href={`/studio/${comment.users?.handle}`}>
                    <img 
                      src={comment.users?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.users?.handle}`} 
                      className="w-10 h-10 rounded-full object-cover border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] transition-colors" 
                      alt={comment.users?.handle}
                    />
                  </Link>
                  <div className="flex-1">
                    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl rounded-tl-sm px-4 py-3">
                      <div className="flex items-baseline justify-between mb-1">
                        <Link href={`/studio/${comment.users?.handle}`} className="text-sm font-semibold text-white hover:text-[var(--accent-primary)] transition-colors">
                          {comment.users?.display_name || comment.users?.handle}
                        </Link>
                        <span className="text-[10px] text-[var(--text-muted)]">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-deep)] sm:rounded-b-3xl">
            {currentUser ? (
              <form onSubmit={handleSubmit} className="flex items-end gap-3">
                <div className="flex-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] focus-within:border-[var(--accent-primary)] rounded-2xl overflow-hidden transition-colors">
                  <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full bg-transparent p-3 text-sm text-white placeholder-[var(--text-muted)] focus:outline-none resize-none custom-scrollbar"
                    rows={1}
                    style={{ minHeight: '48px', maxHeight: '120px' }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                  />
                </div>
                <button 
                  type="submit"
                  disabled={!content.trim() || isSubmitting}
                  className={`p-3 rounded-full flex-shrink-0 transition-all ${
                    content.trim() 
                      ? "bg-[var(--accent-primary)] text-white shadow-[0_0_15px_var(--accent-primary-glow)] hover:bg-[#5b4bc4]" 
                      : "bg-[var(--bg-surface)] text-[var(--text-muted)]"
                  }`}
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </form>
            ) : (
              <div className="text-center py-2">
                <p className="text-sm text-[var(--text-muted)]">
                  <Link href="/login" className="text-[var(--accent-primary)] hover:underline">Log in</Link> to join the conversation.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
