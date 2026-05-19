"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const supabase = createClient();
  const router = useRouter();
  
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open & listen for ESC
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 100);
      
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  // Debounced Search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const searchUsers = async () => {
      const searchTerm = `%${query.trim()}%`;
      const { data } = await supabase
        .from('users')
        .select('id, handle, display_name, avatar_url, tagline')
        .or(`handle.ilike.${searchTerm},display_name.ilike.${searchTerm}`)
        .limit(10);
      
      setResults(data || []);
      setLoading(false);
    };

    const timer = setTimeout(searchUsers, 300);
    return () => clearTimeout(timer);
  }, [query, supabase]);

  const handleResultClick = (handle: string) => {
    onClose();
    router.push(`/studio/${handle}`);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col bg-[var(--bg-void)]/90 backdrop-blur-2xl"
      >
        {/* Header Search Area */}
        <div className="w-full max-w-3xl mx-auto pt-24 px-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-8 right-6 p-2 rounded-full bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="relative flex items-center">
            <Search className="absolute left-6 w-8 h-8 text-[var(--accent-primary)]" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search creators..."
              className="w-full bg-[var(--bg-deep)] border border-[var(--glass-border)] rounded-full py-6 pl-20 pr-8 text-2xl font-display font-medium text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] shadow-[0_0_40px_rgba(108,92,231,0.15)] transition-all"
            />
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1 w-full max-w-3xl mx-auto px-6 mt-8 overflow-y-auto custom-scrollbar pb-24">
          {loading && (
            <div className="flex justify-center mt-12">
              <Loader2 className="w-8 h-8 text-[var(--accent-primary)] animate-spin" />
            </div>
          )}

          {!loading && query.trim() && results.length === 0 && (
            <div className="flex flex-col items-center justify-center mt-24 text-center">
              <div className="w-16 h-16 rounded-full bg-[var(--bg-deep)] border border-[var(--border-subtle)] flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(108,92,231,0.2)]">
                <Search className="w-6 h-6 text-[var(--text-muted)]" />
              </div>
              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Signal lost.</h3>
              <p className="text-[var(--text-secondary)]">We couldn't find anyone matching those exact frequencies.</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              {results.map((user) => (
                <div 
                  key={user.id}
                  onClick={() => handleResultClick(user.handle)}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--bg-surface)] border border-transparent hover:border-[var(--glass-border)] hover:bg-[rgba(255,255,255,0.02)] cursor-pointer transition-all group"
                >
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.handle} className="w-14 h-14 rounded-full object-cover border border-[var(--border-subtle)]" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-[var(--bg-deep)] border border-[var(--border-subtle)] flex items-center justify-center text-lg font-medium text-white">
                      {user.handle[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-semibold text-white group-hover:text-[var(--accent-primary)] transition-colors truncate">
                      {user.display_name || user.handle}
                    </h4>
                    <p className="text-sm text-[var(--text-muted)] truncate">
                      @{user.handle} {user.tagline && `• ${user.tagline}`}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
