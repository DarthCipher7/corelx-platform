"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Flame, Play } from "lucide-react";
import { Flare } from "@/types";

interface FlareCardProps {
  flare: Flare;
  onClick: () => void;
  index: number;
}

export default function FlareCard({ flare, onClick, index }: FlareCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Safe check if playback is blocked or not fully loaded
      });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <motion.div
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative aspect-[9/16] rounded-2xl overflow-hidden cursor-pointer bg-[var(--bg-deep)] border border-[var(--glass-border)] group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4) }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      style={{
        boxShadow: isHovered
          ? "0 12px 30px rgba(108, 92, 231, 0.15), 0 0 1px 1px var(--accent-primary)"
          : "none",
      }}
    >
      {/* Video Loop on Hover */}
      <video
        ref={videoRef}
        src={flare.media_url}
        poster={flare.thumbnail_url}
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* Static image thumbnail overlay when not hovered */}
      {flare.thumbnail_url && (
        <img
          src={flare.thumbnail_url}
          alt={flare.caption || "Flare"}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 pointer-events-none ${
            isHovered ? "opacity-0" : "opacity-100"
          }`}
        />
      )}

      {/* Dim/Glow overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(3,3,8,0.85)] via-[rgba(3,3,8,0.2)] to-[rgba(3,3,8,0.4)] transition-opacity duration-300 opacity-80 group-hover:opacity-90" />

      {/* Play Icon Badge */}
      <div className="absolute top-4 left-4 p-2 rounded-full bg-[rgba(14,14,36,0.6)] border border-[rgba(255,255,255,0.08)] text-white backdrop-blur-md opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all">
        <Play className="w-3.5 h-3.5 fill-white text-white" />
      </div>

      {/* Spark count overlay top right */}
      <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1.5 rounded-full bg-[rgba(108,92,231,0.15)] border border-[rgba(108,92,231,0.3)] text-[var(--accent-primary)] font-mono text-xs backdrop-blur-md">
        <Flame className="w-3.5 h-3.5 fill-[var(--accent-primary)]" />
        <span>{flare.spark_count || 0}</span>
      </div>

      {/* Bottom Details Overlay */}
      <div className="absolute inset-x-4 bottom-4 flex flex-col gap-2 pointer-events-none">
        <div className="flex items-center gap-2">
          {flare.users?.avatar_url ? (
            <img
              src={flare.users.avatar_url}
              alt={flare.users.display_name || flare.users.handle}
              className="w-6 h-6 rounded-full object-cover border border-[rgba(255,255,255,0.15)]"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-[10px] font-bold text-white">
              {flare.users?.handle[0].toUpperCase()}
            </div>
          )}
          <span className="text-xs font-semibold text-white truncate">
            {flare.users?.display_name || flare.users?.handle}
          </span>
        </div>

        {flare.caption && (
          <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
            {flare.caption}
          </p>
        )}

        <div className="flex flex-wrap gap-1 mt-1">
          {flare.tags.slice(0, 2).map((t) => (
            <span
              key={t}
              className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.04)] text-[rgba(255,255,255,0.6)]"
            >
              #{t.toLowerCase()}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
