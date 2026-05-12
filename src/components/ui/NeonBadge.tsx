"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface NeonBadgeProps {
  children: React.ReactNode;
  variant?: "purple" | "cyan" | "magenta" | "amber" | "emerald";
  size?: "sm" | "md";
  className?: string;
}

const variantStyles = {
  purple: "bg-[rgba(108,92,231,0.12)] border-[rgba(108,92,231,0.3)] text-[#a29bfe]",
  cyan: "bg-[rgba(0,210,255,0.1)] border-[rgba(0,210,255,0.3)] text-[#00d2ff]",
  magenta: "bg-[rgba(253,121,168,0.1)] border-[rgba(253,121,168,0.3)] text-[#fd79a8]",
  amber: "bg-[rgba(253,203,110,0.1)] border-[rgba(253,203,110,0.3)] text-[#fdcb6e]",
  emerald: "bg-[rgba(0,206,201,0.1)] border-[rgba(0,206,201,0.3)] text-[#00cec9]",
};

const sizeStyles = {
  sm: "text-[10px] px-2 py-0.5",
  md: "text-xs px-3 py-1",
};

export default function NeonBadge({
  children,
  variant = "purple",
  size = "md",
  className,
}: NeonBadgeProps) {
  return (
    <motion.span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      whileHover={{ scale: 1.05 }}
    >
      {children}
    </motion.span>
  );
}
