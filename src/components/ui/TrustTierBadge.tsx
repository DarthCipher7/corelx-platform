"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tier = "open" | "checked" | "guarded";

interface TrustTierBadgeProps {
  tier: Tier;
  showLabel?: boolean;
  size?: "sm" | "md";
}

// ─── Tier Config ──────────────────────────────────────────────────────────────

const TIER_CONFIG: Record<
  Tier,
  {
    icon: string;
    label: string;
    bg: string;
    border: string;
    tooltip: string;
  }
> = {
  open: {
    icon: "🔓",
    label: "Open",
    bg: "rgba(0,255,128,0.15)",
    border: "rgba(0,255,128,0.3)",
    tooltip: "Anyone on campus can join",
  },
  checked: {
    icon: "🛡️",
    label: "Checked",
    bg: "rgba(0,206,201,0.15)",
    border: "rgba(0,206,201,0.3)",
    tooltip: "Campus location verified at join",
  },
  guarded: {
    icon: "🔒",
    label: "Guarded",
    bg: "rgba(108,92,231,0.15)",
    border: "rgba(108,92,231,0.3)",
    tooltip: "Organiser approval required",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function TrustTierBadge({
  tier,
  showLabel = true,
  size = "md",
}: TrustTierBadgeProps) {
  const [hovered, setHovered] = useState(false);
  const config = TIER_CONFIG[tier];

  const textSize = size === "sm" ? "text-[10px]" : "text-xs";
  const iconSize = size === "sm" ? "text-[11px]" : "text-sm";
  const px = size === "sm" ? "px-2 py-0.5" : "px-2.5 py-1";

  return (
    <div className="relative inline-flex" style={{ isolation: "isolate" }}>
      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`inline-flex items-center gap-1 rounded-full font-medium cursor-default select-none ${px}`}
        style={{
          background: config.bg,
          border: `1px solid ${config.border}`,
        }}
      >
        <span className={iconSize} aria-hidden="true">
          {config.icon}
        </span>
        {showLabel && (
          <span className={`${textSize} font-medium text-white/80 font-mono`}>
            {config.label}
          </span>
        )}
      </motion.div>

      {/* Tooltip */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            key="tooltip"
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute bottom-full left-1/2 mb-2 z-50 pointer-events-none"
            style={{ transform: "translateX(-50%)" }}
          >
            <div
              className="whitespace-nowrap rounded-lg px-3 py-1.5 text-[11px] font-medium text-white/90 backdrop-blur-xl"
              style={{
                background: "rgba(10,10,15,0.92)",
                border: `1px solid ${config.border}`,
                boxShadow: `0 4px 20px rgba(0,0,0,0.5), 0 0 0 1px ${config.border}`,
              }}
            >
              {config.tooltip}
              {/* Caret */}
              <span
                className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-px"
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: "5px solid transparent",
                  borderRight: "5px solid transparent",
                  borderTop: `5px solid ${config.border}`,
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
