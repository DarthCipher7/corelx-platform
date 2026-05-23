"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

// Global cache to avoid redundant database calls for lists/feeds
const verificationCache = new Map<string, string | null>();
const pendingRequests = new Map<string, any>();

async function fetchVerification(entityId: string): Promise<string | null> {
  if (verificationCache.has(entityId)) {
    return verificationCache.get(entityId) ?? null;
  }
  if (pendingRequests.has(entityId)) {
    return pendingRequests.get(entityId) ?? null;
  }

  const supabase = createClient();
  const promise = supabase
    .from("entity_verification")
    .select("tag_type")
    .eq("entity_id", entityId)
    .eq("status", "approved")
    .maybeSingle()
    .then(({ data, error }) => {
      if (error) {
        console.warn("Failed to fetch entity verification for:", entityId, error);
        return null;
      }
      const type = data?.tag_type || null;
      verificationCache.set(entityId, type);
      pendingRequests.delete(entityId);
      return type;
    });

  pendingRequests.set(entityId, promise);
  return promise as any;
}

export type TagType = "institution" | "organisation" | "club" | "creator";

interface OfficialTagProps {
  entityId?: string;
  customTagType?: TagType;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const TAG_CONFIG: Record<
  TagType,
  {
    color: string;
    label: string;
    description: string;
    shadow: string;
  }
> = {
  institution: {
    color: "#3b82f6", // Blue
    label: "Verified Institution",
    description: "Universities, colleges, and academic institutions.",
    shadow: "rgba(59, 130, 246, 0.4)",
  },
  organisation: {
    color: "#10b981", // Green
    label: "Verified Organisation",
    description: "Companies, NGOs, and official entities.",
    shadow: "rgba(16, 185, 129, 0.4)",
  },
  club: {
    color: "#8b5cf6", // Purple
    label: "Verified Club",
    description: "Official student clubs and councils vouched by their institution.",
    shadow: "rgba(139, 92, 246, 0.4)",
  },
  creator: {
    color: "#f59e0b", // Gold
    label: "Verified Creator",
    description: "Open community creators and organizers at scale.",
    shadow: "rgba(245, 158, 11, 0.4)",
  },
};

export default function OfficialTag({
  entityId,
  customTagType,
  size = "md",
  className = "",
}: OfficialTagProps) {
  const [tagType, setTagType] = useState<TagType | null>(customTagType || null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (customTagType) {
      setTagType(customTagType);
      return;
    }
    if (!entityId) {
      setTagType(null);
      return;
    }

    let isMounted = true;
    fetchVerification(entityId).then((type) => {
      if (isMounted) {
        setTagType(type as TagType | null);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [entityId, customTagType]);

  if (!tagType) return null;

  const config = TAG_CONFIG[tagType];
  const sizeClasses =
    size === "sm"
      ? "text-xs px-0.5"
      : size === "lg"
      ? "text-lg px-1.5"
      : "text-sm px-1";

  return (
    <span
      className={`relative inline-flex items-center select-none ${className}`}
      style={{ isolation: "isolate" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ✦ Star */}
      <motion.span
        className={`font-semibold cursor-default inline-block ${sizeClasses}`}
        style={{
          color: config.color,
          textShadow: `0 0 8px ${config.shadow}`,
        }}
        whileHover={{ scale: 1.25, rotate: 90 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        ✦
      </motion.span>

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
              className="rounded-xl px-3.5 py-2 text-left backdrop-blur-xl border w-64 shadow-2xl flex flex-col gap-0.5"
              style={{
                background: "rgba(10, 10, 15, 0.94)",
                borderColor: "rgba(255, 255, 255, 0.08)",
                boxShadow: `0 8px 30px rgba(0,0,0,0.7), 0 0 0 1px rgba(255, 255, 255, 0.05)`,
              }}
            >
              <span
                className="text-xs font-bold font-display"
                style={{ color: config.color }}
              >
                {config.label}
              </span>
              <span className="text-[11px] text-white/70 leading-relaxed font-sans font-normal">
                {config.description}
              </span>
              {/* Caret */}
              <span
                className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-px"
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: "5px solid transparent",
                  borderRight: "5px solid transparent",
                  borderTop: `5px solid rgba(10, 10, 15, 0.94)`,
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}
