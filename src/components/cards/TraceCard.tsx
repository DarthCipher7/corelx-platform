"use client";

import { Heart, MessageSquare, Zap, Clock } from "lucide-react";
import TraceRing from "@/components/ui/TraceRing";

interface TraceCardProps {
  trace: {
    id: string;
    type: string;
    content: string;
    expires_at: string;
    created_at: string;
    users: {
      id: string;
      handle: string;
      display_name: string;
      avatar_url: string;
    };
  };
  onClick?: () => void;
}

const TRACE_TYPES = {
  in_the_zone: { emoji: "🔥", label: "In the zone", color: "from-red-500/20 to-pink-500/10 border-red-500/30 text-red-200" },
  stuck: { emoji: "🧱", label: "Stuck", color: "from-amber-600/20 to-amber-500/10 border-amber-500/30 text-amber-200" },
  just_shipped: { emoji: "🚀", label: "Just shipped", color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-200" },
  looking_for: { emoji: "👀", label: "Looking for", color: "from-blue-500/20 to-cyan-500/10 border-blue-500/30 text-blue-200" },
  thought: { emoji: "💭", label: "Thought", color: "from-purple-500/20 to-indigo-500/10 border-purple-500/30 text-purple-200" },
  working_on: { emoji: "🎯", label: "Working on", color: "from-pink-500/20 to-rose-500/10 border-rose-500/30 text-rose-200" },
  vibe_check: { emoji: "🌙", label: "Vibe check", color: "from-violet-500/20 to-purple-500/10 border-violet-500/30 text-violet-200" }
};

export default function TraceCard({ trace, onClick }: TraceCardProps) {
  const typeConfig = TRACE_TYPES[trace.type as keyof typeof TRACE_TYPES] || {
    emoji: "✦",
    label: "Trace",
    color: "from-white/10 to-white/5 border-white/10 text-white"
  };

  const getTimeLeft = (expiryString: string) => {
    const diff = new Date(expiryString).getTime() - Date.now();
    if (diff <= 0) return "expired";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours > 0) return `${hours}h left`;
    const minutes = Math.floor(diff / (1000 * 60));
    return `${minutes}m left`;
  };

  return (
    <div
      onClick={onClick}
      className="w-full rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden group cursor-pointer"
      style={{
        background: "rgba(14, 14, 36, 0.45)",
        borderColor: "rgba(255, 255, 255, 0.06)",
        backdropFilter: "blur(12px)"
      }}
    >
      {/* Decorative hover glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/0 to-indigo-500/0 group-hover:from-indigo-500/5 group-hover:to-pink-500/5 transition-all duration-500 pointer-events-none" />

      {/* Card Header: Poster and Expiry */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <TraceRing
            userId={trace.users.id}
            avatarUrl={trace.users.avatar_url}
            displayName={trace.users.display_name}
            size="sm"
            hasActiveTrace={true}
          />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white leading-tight group-hover:text-indigo-300 transition-colors">
              {trace.users.display_name}
            </span>
            <span className="text-xs text-[var(--text-secondary)]">
              @{trace.users.handle}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border bg-gradient-to-tr ${typeConfig.color}`}>
            {typeConfig.emoji} {typeConfig.label}
          </span>
          <span className="text-[10px] font-semibold text-[var(--text-muted)] flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-md border border-white/5 shrink-0">
            <Clock className="w-3 h-3 text-[var(--text-muted)]" />
            {getTimeLeft(trace.expires_at)}
          </span>
        </div>
      </div>

      {/* Card Body: Text Content */}
      <div className="mb-4 pl-1 relative z-10">
        <p className="text-sm text-[var(--text-primary)] leading-relaxed italic select-none">
          "{trace.content}"
        </p>
      </div>

      {/* Card Footer: Hints of interactions */}
      <div className="flex items-center gap-4 text-[10px] text-[var(--text-muted)] border-t border-white/5 pt-3.5 mt-2 relative z-10">
        <div className="flex items-center gap-1 group-hover:text-pink-400 transition-colors">
          <Heart className="w-3 h-3" />
          <span>Resonate</span>
        </div>
        <div className="flex items-center gap-1 group-hover:text-indigo-400 transition-colors">
          <MessageSquare className="w-3 h-3" />
          <span>Reply</span>
        </div>
        <div className="flex items-center gap-1 group-hover:text-amber-400 transition-colors">
          <Zap className="w-3 h-3" />
          <span>Collab</span>
        </div>
      </div>
    </div>
  );
}
