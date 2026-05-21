"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MapPin, Clock, Users, Check, Shield } from "lucide-react";
import TrustTierBadge from "@/components/ui/TrustTierBadge";

// ─── Types ────────────────────────────────────────────────────────────────────

interface EventCardProps {
  id: string;
  title: string;
  category: "sports" | "music" | "academic" | "social" | "misc" | "hackathon" | "competition" | "informal" | "formal";
  trustTier: "open" | "checked" | "guarded";
  locationName?: string;
  startsAt: string; // ISO string
  endsAt: string;   // ISO string
  currentHeadcount: number;
  maxHeadcount?: number;
  organiser: {
    handle: string;
    displayName: string;
    avatarUrl?: string;
  };
  rsvpStatus?: "none" | "pending" | "attending" | "declined";
  onRsvp?: (eventId: string) => void;
  expiresAt?: string;
}

// ─── Category Config ──────────────────────────────────────────────────────────

const CATEGORY_CONFIG = {
  sports: {
    label: "Sports",
    bg: "var(--cat-sports-bg)",
    border: "var(--cat-sports-border)",
    textClass: "text-[var(--cat-sports-text)]",
    dot: "var(--cat-sports-dot)",
  },
  music: {
    label: "Music",
    bg: "var(--cat-music-bg)",
    border: "var(--cat-music-border)",
    textClass: "text-[var(--cat-music-text)]",
    dot: "var(--cat-music-dot)",
  },
  academic: {
    label: "Academic",
    bg: "var(--cat-academic-bg)",
    border: "var(--cat-academic-border)",
    textClass: "text-[var(--cat-academic-text)]",
    dot: "var(--cat-academic-dot)",
  },
  social: {
    label: "Social",
    bg: "var(--cat-social-bg)",
    border: "var(--cat-social-border)",
    textClass: "text-[var(--cat-social-text)]",
    dot: "var(--cat-social-dot)",
  },
  misc: {
    label: "Misc",
    bg: "var(--cat-misc-bg)",
    border: "var(--cat-misc-border)",
    textClass: "text-[var(--cat-misc-text)]",
    dot: "var(--cat-misc-dot)",
  },
  hackathon: {
    label: "Hackathon",
    bg: "var(--cat-hackathon-bg)",
    border: "var(--cat-hackathon-border)",
    textClass: "text-[var(--cat-hackathon-text)]",
    dot: "var(--cat-hackathon-dot)",
  },
  competition: {
    label: "Competition",
    bg: "var(--cat-competition-bg)",
    border: "var(--cat-competition-border)",
    textClass: "text-[var(--cat-competition-text)]",
    dot: "var(--cat-competition-dot)",
  },
  informal: {
    label: "Informal",
    bg: "var(--cat-informal-bg)",
    border: "var(--cat-informal-border)",
    textClass: "text-[var(--cat-informal-text)]",
    dot: "var(--cat-informal-dot)",
  },
  formal: {
    label: "Formal",
    bg: "var(--cat-formal-bg)",
    border: "var(--cat-formal-border)",
    textClass: "text-[var(--cat-formal-text)]",
    dot: "var(--cat-formal-dot)",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatEventTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  if (isToday) return `Today ${timeStr}`;

  const dayStr = date.toLocaleDateString("en-US", { weekday: "short" });
  return `${dayStr} ${timeStr}`;
}

function getExpiryInfo(
  expiresAt?: string
): { label: string; isUrgent: boolean } | null {
  if (!expiresAt) return null;
  const now = Date.now();
  const expiry = new Date(expiresAt).getTime();
  const diffMs = expiry - now;
  if (diffMs <= 0 || diffMs > 6 * 60 * 60 * 1000) return null;

  const totalMins = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  const label =
    hours > 0 ? `Expires in ${hours}h ${mins}m` : `Expires in ${mins}m`;
  return { label, isUrgent: true };
}

function getHeadcountColor(ratio: number): string {
  if (ratio < 0.5) return "#22c55e"; // green
  if (ratio < 0.8) return "#eab308"; // yellow
  return "#f97316";                   // orange-red
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({
  src,
  handle,
  size = 24,
}: {
  src?: string;
  handle: string;
  size?: number;
}) {
  const initial = (handle[0] ?? "?").toUpperCase();
  const style = { width: size, height: size, flexShrink: 0 as const };

  if (src) {
    return (
      <img
        src={src}
        alt={handle}
        className="rounded-full object-cover"
        style={{
          ...style,
          border: "1.5px solid rgba(255,255,255,0.12)",
        }}
      />
    );
  }

  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-bold"
      style={{
        ...style,
        background:
          "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
        fontSize: size * 0.42,
        border: "1.5px solid rgba(255,255,255,0.12)",
      }}
    >
      {initial}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function EventCard({
  id,
  title,
  category,
  trustTier,
  locationName,
  startsAt,
  endsAt: _endsAt,
  currentHeadcount,
  maxHeadcount,
  organiser,
  rsvpStatus = "none",
  onRsvp,
  expiresAt,
}: EventCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const cat = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.misc;
  const expiry = useMemo(() => getExpiryInfo(expiresAt), [expiresAt]);

  // Headcount
  const isFull =
    maxHeadcount !== undefined && currentHeadcount >= maxHeadcount;
  const headcountRatio =
    maxHeadcount ? currentHeadcount / maxHeadcount : 0;
  const barColor = getHeadcountColor(headcountRatio);

  // RSVP button config
  const needsVerify =
    rsvpStatus === "none" && (trustTier === "checked" || trustTier === "guarded");

  const rsvpConfig = useMemo(() => {
    switch (rsvpStatus) {
      case "attending":
        return {
          label: "✓ Going",
          bg: "rgba(34,197,94,0.15)",
          border: "rgba(34,197,94,0.4)",
          textClass: "text-green-400",
          disabled: true,
        };
      case "pending":
        return {
          label: "Pending...",
          bg: "rgba(255,255,255,0.05)",
          border: "rgba(255,255,255,0.12)",
          textClass: "text-white/40",
          disabled: true,
        };
      case "declined":
        return {
          label: "Declined",
          bg: "rgba(239,68,68,0.1)",
          border: "rgba(239,68,68,0.3)",
          textClass: "text-red-400",
          disabled: true,
        };
      default:
        return {
          label: needsVerify ? "Join (verified)" : "Join",
          bg: "rgba(108,92,231,0.25)",
          border: "rgba(108,92,231,0.5)",
          textClass: "text-[var(--accent-primary)]",
          disabled: isFull,
        };
    }
  }, [rsvpStatus, needsVerify, isFull]);

  return (
    <motion.article
      onClick={() => router.push(`/events/${id}`)}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative rounded-2xl p-5 backdrop-blur-xl flex flex-col gap-4 overflow-hidden"
      style={{
        background: "var(--bg-frosted)",
        border: "1px solid var(--glass-border)",
        boxShadow: isHovered
          ? "0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(108,92,231,0.15), inset 0 1px 0 rgba(255,255,255,0.04)"
          : "0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.02)",
        transition: "box-shadow 0.25s ease",
      }}
    >
      {/* Subtle glow orb on hover */}
      <motion.div
        className="absolute -top-12 -right-12 w-40 h-40 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${cat.dot}22 0%, transparent 70%)`,
          opacity: isHovered ? 1 : 0,
          transition: "opacity 0.35s ease",
        }}
      />

      {/* ── Row 1: Category + Trust Tier ── */}
      <div className="flex items-center justify-between gap-2">
        {/* Category badge */}
        <div
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1"
          style={{
            background: cat.bg,
            border: `1px solid ${cat.border}`,
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: cat.dot }}
          />
          <span
            className={`text-xs font-mono font-semibold tracking-wide ${cat.textClass}`}
          >
            {cat.label}
          </span>
        </div>

        <TrustTierBadge tier={trustTier} showLabel size="sm" />
      </div>

      {/* ── Row 2: Title ── */}
      <h3
        className="text-white text-lg font-bold leading-snug"
        style={{ fontFamily: "var(--font-display, inherit)" }}
      >
        {title}
      </h3>

      {/* ── Row 3: Location + Time + Expiry ── */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {locationName && (
          <div className="flex items-center gap-1.5 text-xs text-white/50">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-white/35" />
            <span className="truncate max-w-[120px]">{locationName}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-xs text-white/50">
          <Clock className="w-3.5 h-3.5 flex-shrink-0 text-white/35" />
          <span>{formatEventTime(startsAt)}</span>
        </div>

        {/* Expiry badge */}
        {expiry && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5"
            style={{
              background: "rgba(239,68,68,0.15)",
              border: "1px solid rgba(239,68,68,0.35)",
            }}
          >
            <span className="w-1 h-1 rounded-full bg-red-400 animate-pulse" />
            <span className="text-[10px] font-mono font-semibold text-red-400">
              {expiry.label}
            </span>
          </motion.div>
        )}
      </div>

      {/* ── Row 4: Headcount ── */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-white/50">
            <Users className="w-3.5 h-3.5 text-white/35" />
            {maxHeadcount !== undefined ? (
              <span>
                <span className="text-white/75 font-semibold">
                  {currentHeadcount}
                </span>
                <span className="text-white/30"> / {maxHeadcount} going</span>
              </span>
            ) : (
              <span>
                <span className="text-white/75 font-semibold">
                  {currentHeadcount}
                </span>
                <span className="text-white/30"> going</span>
              </span>
            )}
          </div>

          {isFull && (
            <span
              className="text-[10px] font-mono font-bold tracking-widest px-2 py-0.5 rounded-full"
              style={{
                background: "rgba(239,68,68,0.15)",
                border: "1px solid rgba(239,68,68,0.4)",
                color: "#f87171",
              }}
            >
              FULL
            </span>
          )}
        </div>

        {/* Progress bar */}
        {maxHeadcount !== undefined && !isFull && (
          <div
            className="h-1 w-full rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(headcountRatio * 100, 100)}%`,
              }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
              style={{
                background: `linear-gradient(90deg, ${barColor}bb, ${barColor})`,
                boxShadow: `0 0 8px ${barColor}66`,
              }}
            />
          </div>
        )}
      </div>

      {/* ── Row 5: Organiser + RSVP ── */}
      <div className="flex items-center justify-between gap-3 pt-0.5">
        {/* Organiser */}
        <div className="flex items-center gap-2 min-w-0">
          <Avatar
            src={organiser.avatarUrl}
            handle={organiser.handle}
            size={24}
          />
          <span className="text-xs text-white/40 font-mono truncate">
            @{organiser.handle}
          </span>
        </div>

        {/* RSVP button */}
        <motion.button
          whileHover={
            !rsvpConfig.disabled ? { scale: 1.04 } : {}
          }
          whileTap={!rsvpConfig.disabled ? { scale: 0.96 } : {}}
          disabled={rsvpConfig.disabled}
          onClick={(e) => {
            e.stopPropagation();
            if (!rsvpConfig.disabled && onRsvp) onRsvp(id);
          }}
          className={`
            inline-flex items-center gap-1.5 rounded-full px-3 py-1.5
            text-xs font-semibold font-mono tracking-wide
            transition-all duration-200 flex-shrink-0
            ${rsvpConfig.disabled ? "cursor-not-allowed" : "cursor-pointer hover:brightness-110"}
            ${rsvpConfig.textClass}
          `}
          style={{
            background: rsvpConfig.bg,
            border: `1px solid ${rsvpConfig.border}`,
            boxShadow: !rsvpConfig.disabled
              ? `0 0 12px ${rsvpConfig.border}55`
              : "none",
          }}
        >
          {rsvpStatus === "attending" && (
            <Check className="w-3 h-3 flex-shrink-0" />
          )}
          {needsVerify && rsvpStatus === "none" && (
            <Shield className="w-3 h-3 flex-shrink-0" />
          )}
          {rsvpConfig.label}
        </motion.button>
      </div>
    </motion.article>
  );
}
