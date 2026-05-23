"use client";

import { motion } from "framer-motion";
import { Users, Lock, Unlock, CheckCircle, Clock } from "lucide-react";
import Button from "@/components/ui/Button";
import OfficialTag from "@/components/ui/OfficialTag";

import { useRouter } from "next/navigation";

export interface PodCardProps {
  id: string;
  name: string;
  podType:
    | "hackathon"
    | "class"
    | "club"
    | "project"
    | "meetup"
    | "sports"
    | "gaming"
    | "tournament";
  description?: string;
  podStatus?: "active" | "archived" | "deleted";
  memberCount: number;
  maxMembers?: number;
  roleTags: string[];
  visibility: "open" | "invite";
  creator: {
    handle: string;
    displayName: string;
    avatarUrl?: string;
  };
  isMember?: boolean;
  onJoin?: (podId: string) => void;
  index?: number;
  hub?: {
    name: string;
    shortName?: string;
    hubType?: "college" | "society" | "corporate";
  };
  startsAt?: string;
  endsAt?: string;
}

/* ─── Pod type config ─────────────────────────────────────────── */
const POD_TYPE_CONFIG = {
  hackathon: {
    emoji: "⚡",
    label: "Hackathon",
    color: "var(--cat-hackathon-bg)",
    border: "var(--cat-hackathon-border)",
    text: "var(--cat-hackathon-text)",
    glow: "var(--accent-primary-glow)",
  },
  class: {
    emoji: "📖",
    label: "Class",
    color: "var(--cat-academic-bg)",
    border: "var(--cat-academic-border)",
    text: "var(--cat-academic-text)",
    glow: "var(--cat-academic-border)",
  },
  club: {
    emoji: "🎯",
    label: "Club",
    color: "var(--cat-club-bg)",
    border: "var(--cat-club-border)",
    text: "var(--cat-club-text)",
    glow: "var(--cat-club-border)",
  },
  project: {
    emoji: "🛠️",
    label: "Project",
    color: "var(--cat-project-bg)",
    border: "var(--cat-project-border)",
    text: "var(--cat-project-text)",
    glow: "var(--cat-project-border)",
  },
  meetup: {
    emoji: "🤝",
    label: "Meetup",
    color: "var(--cat-meetup-bg)",
    border: "var(--cat-meetup-border)",
    text: "var(--cat-meetup-text)",
    glow: "var(--cat-meetup-border)",
  },
  sports: {
    emoji: "⚽",
    label: "Sports",
    color: "var(--cat-sports-bg)",
    border: "var(--cat-sports-border)",
    text: "var(--cat-sports-text)",
    glow: "var(--cat-sports-border)",
  },
  gaming: {
    emoji: "🎮",
    label: "Gaming",
    color: "var(--cat-gaming-bg)",
    border: "var(--cat-gaming-border)",
    text: "var(--cat-gaming-text)",
    glow: "var(--cat-gaming-border)",
  },
  tournament: {
    emoji: "🏆",
    label: "Tournament",
    color: "var(--cat-tournament-bg)",
    border: "var(--cat-tournament-border)",
    text: "var(--cat-tournament-text)",
    glow: "var(--cat-tournament-border)",
  },
} as const;

/* ─── Avatar initials ─────────────────────────────────────────── */
function AvatarFallback({ name }: { name: string }) {
  return (
    <span className="text-[10px] font-bold text-white">
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

function formatRemainingTime(endsAtStr: string) {
  const endsAt = new Date(endsAtStr);
  const diffMs = endsAt.getTime() - Date.now();
  if (diffMs <= 0) return "Expired";
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHrs < 24) {
    if (diffHrs === 0) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${diffMins}m left`;
    }
    return `${diffHrs}h left`;
  }
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) {
    return `${diffDays}d left`;
  }
  return endsAt.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function PodCard({
  id,
  name,
  podType,
  description,
  memberCount,
  maxMembers,
  roleTags,
  visibility,
  creator,
  isMember = false,
  onJoin,
  index = 0,
  hub,
  podStatus = 'active',
  startsAt,
  endsAt,
}: PodCardProps) {
  const typeConf = POD_TYPE_CONFIG[podType] || POD_TYPE_CONFIG.project;
  const router = useRouter();

  const handleJoin = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isMember && onJoin && podStatus !== 'archived') onJoin(id);
  };

  return (
    <motion.article
      onClick={() => router.push(`/pods/${id}`)}
      className="relative flex flex-col rounded-2xl p-5 backdrop-blur-xl cursor-pointer"
      style={{
        background: "var(--bg-frosted)",
        border: "1px solid var(--glass-border)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
        minHeight: "240px",
        opacity: podStatus === 'archived' ? 0.75 : 1,
      }}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "80px" }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{
        y: -4,
        borderColor: podStatus === 'archived' ? "var(--glass-border)" : typeConf.border,
        boxShadow: podStatus === 'archived'
          ? "0 4px 24px rgba(0,0,0,0.4)"
          : `0 8px 32px ${typeConf.glow}, 0 2px 8px rgba(0,0,0,0.5)`,
      }}
    >
      {/* ── Top badges row ─────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {/* Pod type badge */}
        <span
          className="inline-flex items-center gap-1 rounded-full text-[11px] font-semibold px-2.5 py-0.5 border"
          style={{
            background: typeConf.color,
            borderColor: typeConf.border,
            color: typeConf.text,
          }}
        >
          {typeConf.emoji} {typeConf.label}
        </span>

        {/* Hub badge (shows if browsing globally or if pod is from a specific hub) */}
        {hub && (
          <span
            className="inline-flex items-center gap-1 rounded-full text-[11px] font-medium px-2.5 py-0.5 border"
            style={{
              background: "rgba(255,255,255,0.05)",
              borderColor: "var(--border-subtle)",
              color: "var(--text-secondary)",
            }}
          >
            <span>
              {hub.hubType === "society" ? "🏡" : hub.hubType === "corporate" ? "🏢" : "🏫"}
            </span>
            {hub.shortName || hub.name}
          </span>
        )}

        {/* Duration badge */}
        {endsAt && (
          <span
            className="inline-flex items-center gap-1 rounded-full text-[11px] font-medium px-2.5 py-0.5 border"
            style={{
              background: "rgba(108,92,231,0.08)",
              borderColor: "rgba(108,92,231,0.25)",
              color: "#a29bfe",
            }}
          >
            <Clock className="w-2.5 h-2.5 animate-pulse" />
            {formatRemainingTime(endsAt)}
          </span>
        )}

        {/* Archived / Visibility badge */}
        {podStatus === 'archived' ? (
          <span
            className="inline-flex items-center gap-1 rounded-full text-[11px] font-semibold px-2.5 py-0.5 border ml-auto"
            style={{
              background: "rgba(239, 68, 68, 0.10)",
              borderColor: "rgba(239, 68, 68, 0.30)",
              color: "#ef4444",
            }}
          >
            <Lock className="w-2.5 h-2.5" />
            Archived
          </span>
        ) : (
          <span
            className="inline-flex items-center gap-1 rounded-full text-[11px] font-semibold px-2.5 py-0.5 border ml-auto"
            style={{
              background: "rgba(253,203,110,0.10)",
              borderColor: "rgba(253,203,110,0.30)",
              color: "#fdcb6e",
            }}
          >
            {visibility === "open" ? (
              <>
                <Unlock className="w-2.5 h-2.5" />
                Open
              </>
            ) : (
              <>
                <Lock className="w-2.5 h-2.5" />
                Invite Only
              </>
            )}
          </span>
        )}
      </div>

      {/* ── Pod name ───────────────────────────────────────────── */}
      <h3
        className="text-lg font-bold leading-snug mb-1 flex items-center gap-1.5 flex-wrap"
        style={{
          color: "var(--text-primary)",
          fontFamily: "var(--font-display)",
        }}
      >
        {name}
        <OfficialTag entityId={id} />
      </h3>

      {/* ── Description ────────────────────────────────────────── */}
      {description && (
        <p
          className="text-sm leading-relaxed line-clamp-2 mb-3"
          style={{ color: "var(--text-secondary)" }}
        >
          {description}
        </p>
      )}

      {/* ── Role tags ──────────────────────────────────────────── */}
      {roleTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {roleTags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full border"
              style={{
                background: "var(--bg-deep)",
                borderColor: "var(--border-subtle)",
                color: "var(--text-secondary)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* ── Spacer pushes footer down ───────────────────────────── */}
      <div className="flex-1" />

      {/* ── Footer ─────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between pt-3 mt-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        {/* Member count + creator */}
        <div className="flex items-center gap-3">
          {/* Members */}
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              {maxMembers ? `${memberCount} / ${maxMembers}` : `${memberCount}`}{" "}
              {memberCount === 1 ? "member" : "members"}
            </span>
          </div>

          {/* Creator avatar + handle */}
          <div className="flex items-center gap-1.5">
            <div
              className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
              style={{
                background: "var(--accent-primary)",
                border: "1px solid rgba(108,92,231,0.4)",
              }}
            >
              {creator.avatarUrl ? (
                <img
                  src={creator.avatarUrl}
                  alt={creator.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <AvatarFallback name={creator.displayName} />
              )}
            </div>
            <span
              className="text-[11px] font-medium"
              style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
            >
              @{creator.handle}
            </span>
          </div>
        </div>

        {/* Join button */}
        {isMember ? (
          <span
            className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full border"
            style={{
              background: "rgba(16,185,129,0.10)",
              borderColor: "rgba(16,185,129,0.30)",
              color: "#34d399",
            }}
          >
            <CheckCircle className="w-3 h-3" />
            Member
          </span>
        ) : visibility === "invite" ? (
          <motion.button
            onClick={handleJoin}
            className="text-xs font-semibold px-3 py-1.5 rounded-full border transition-all"
            style={{
              background: "rgba(253,203,110,0.08)",
              borderColor: "rgba(253,203,110,0.30)",
              color: "#fdcb6e",
            }}
            whileHover={{
              background: "rgba(253,203,110,0.16)",
              borderColor: "rgba(253,203,110,0.55)",
            }}
            whileTap={{ scale: 0.96 }}
          >
            Request to Join
          </motion.button>
        ) : (
          <motion.button
            onClick={handleJoin}
            className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
            style={{
              background: "var(--accent-primary)",
              color: "#fff",
              border: "1px solid rgba(108,92,231,0.5)",
            }}
            whileHover={{
              background: "var(--accent-primary-hover)",
              boxShadow: "0 0 16px rgba(108,92,231,0.45)",
            }}
            whileTap={{ scale: 0.96 }}
          >
            Join Pod
          </motion.button>
        )}
      </div>
    </motion.article>
  );
}
