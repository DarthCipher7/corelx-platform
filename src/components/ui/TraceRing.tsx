"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

interface TraceRingProps {
  userId: string;
  avatarUrl?: string;
  displayName?: string;
  size?: "sm" | "md" | "lg" | "xl";
  hasActiveTrace?: boolean;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

const SIZES = {
  sm: {
    container: "w-[38px] h-[38px]",
    spacer: "p-[1.5px]",
    avatar: "w-[33px] h-[33px]",
    text: "text-xs"
  },
  md: {
    container: "w-[48px] h-[48px]",
    spacer: "p-[2px]",
    avatar: "w-[42px] h-[42px]",
    text: "text-sm"
  },
  lg: {
    container: "w-[66px] h-[66px]",
    spacer: "p-[2.5px]",
    avatar: "w-[59px] h-[59px]",
    text: "text-lg"
  },
  xl: {
    container: "w-[92px] h-[92px]",
    spacer: "p-[3px]",
    avatar: "w-[84px] h-[84px]",
    text: "text-3xl"
  }
};

export default function TraceRing({
  userId,
  avatarUrl,
  displayName,
  size = "md",
  hasActiveTrace,
  onClick,
  className = "",
  children
}: TraceRingProps) {
  const supabase = createClient();
  const [active, setActive] = useState(hasActiveTrace ?? false);
  const sizeConfig = SIZES[size];

  useEffect(() => {
    if (hasActiveTrace !== undefined) {
      setActive(hasActiveTrace);
      return;
    }

    if (!userId) return;

    const checkTrace = async () => {
      try {
        const { data, error } = await supabase
          .from("traces")
          .select("id")
          .eq("user_id", userId)
          .gt("expires_at", new Date().toISOString())
          .limit(1);

        if (!error) {
          setActive((data && data.length > 0) ?? false);
        }
      } catch (err) {
        console.error("Error checking active trace:", err);
      }
    };

    checkTrace();

    // Subscribe to Postgres Changes for this user's traces
    const channel = supabase
      .channel(`trace-ring-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "traces",
          filter: `user_id=eq.${userId}`
        },
        () => {
          checkTrace();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, hasActiveTrace, supabase]);

  const ringStyle = active
    ? {
        background: "linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)",
        boxShadow: "0 0 10px rgba(99, 102, 241, 0.45)"
      }
    : {
        background: "rgba(255, 255, 255, 0.08)"
      };

  return (
    <motion.div
      onClick={onClick}
      className={`rounded-full inline-block shrink-0 relative ${onClick ? "cursor-pointer" : "cursor-default"} ${className}`}
      style={ringStyle}
      whileHover={onClick ? { scale: 1.03 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      transition={{ duration: 0.2 }}
    >
      <div className={`${sizeConfig.container} rounded-full`}>
        {/* Inner spacer for gap */}
        <div
          className="w-full h-full rounded-full flex items-center justify-center"
          style={{ padding: active ? "2.5px" : "1.5px", backgroundColor: "var(--bg-void)" }}
        >
          {children ? (
            <div className="w-full h-full rounded-full overflow-hidden relative flex items-center justify-center">
              {children}
            </div>
          ) : (
            <div
              className={`${sizeConfig.avatar} rounded-full overflow-hidden relative flex items-center justify-center font-bold text-white uppercase`}
              style={{ backgroundColor: "var(--bg-frosted)" }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName || "User"} className="w-full h-full object-cover" />
              ) : (
                displayName?.charAt(0) || "U"
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
