"use client";

import { motion } from "framer-motion";
import { Users, Lock, Unlock, CheckCircle } from "lucide-react";
import Button from "@/components/ui/Button";

export interface PodCardProps {
  id: string;
  name: string;
  podType: "hackathon" | "class" | "club" | "project";
  description?: string;
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
}

/* ─── Pod type config ─────────────────────────────────────────── */
const POD_TYPE_CONFIG = {
  hackathon: {
    emoji: "⚡",
    label: "Hackathon",
    color: "rgba(108,92,231,0.15)",
    border: "rgba(108,92,231,0.35)",
    text: "#a29bfe",
    glow: "rgba(108,92,231,0.12)",
  },
  class: {
    emoji: "📖",
    label: "Class",
    color: "rgba(59,130,246,0.15)",
    border: "rgba(59,130,246,0.35)",
    text: "#60a5fa",
    glow: "rgba(59,130,246,0.10)",
  },
  club: {
    emoji: "🎯",
    label: "Club",
    color: "rgba(16,185,129,0.15)",
    border: "rgba(16,185,129,0.35)",
    text: "#34d399",
    glow: "rgba(16,185,129,0.10)",
  },
  project: {
    emoji: "🛠️",
    label: "Project",
    color: "rgba(249,115,22,0.15)",
    border: "rgba(249,115,22,0.35)",
    text: "#fb923c",
    glow: "rgba(249,115,22,0.10)",
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
}: PodCardProps) {
  const typeConf = POD_TYPE_CONFIG[podType];

  const handleJoin = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isMember && onJoin) onJoin(id);
  };

  return (
    <motion.article
      className="relative flex flex-col rounded-2xl p-5 backdrop-blur-xl cursor-default"
      style={{
        background: "var(--bg-frosted)",
        border: "1px solid var(--glass-border)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
        minHeight: "240px",
      }}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "80px" }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{
        y: -4,
        borderColor: typeConf.border,
        boxShadow: `0 8px 32px ${typeConf.glow}, 0 2px 8px rgba(0,0,0,0.5)`,
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

        {/* Visibility badge */}
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
      </div>

      {/* ── Pod name ───────────────────────────────────────────── */}
      <h3
        className="text-lg font-bold leading-snug mb-1"
        style={{
          color: "var(--text-primary)",
          fontFamily: "var(--font-display)",
        }}
      >
        {name}
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
