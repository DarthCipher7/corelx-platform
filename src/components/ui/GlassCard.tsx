"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  onClick?: () => void;
}

export default function GlassCard({
  children,
  className,
  hover = false,
  glow = false,
  onClick,
}: GlassCardProps) {
  return (
    <motion.div
      onClick={onClick}
      className={cn(
        "glass-card rounded-2xl overflow-hidden relative",
        hover && "card-hover cursor-pointer",
        glow && "animate-pulse-glow",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "100px" }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
