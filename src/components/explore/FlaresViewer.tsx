"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Flame, MessageSquare, Share2, Volume2, VolumeX, ArrowLeft } from "lucide-react";
import { Flare } from "@/types";
import Link from "next/link";

interface FlaresViewerProps {
  flares: Flare[];
  initialIndex: number;
  onClose: () => void;
}

export default function FlaresViewer({ flares, initialIndex, onClose }: FlaresViewerProps) {
  const [globalMuted, setGlobalMuted] = useState(true);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll to initial index on mount
  useEffect(() => {
    if (containerRef.current) {
      const children = containerRef.current.children;
      if (children[initialIndex]) {
        children[initialIndex].scrollIntoView({ behavior: "auto" });
      }
    }
  }, [initialIndex]);

  // Handle scroll to detect active flare index
  const handleScroll = () => {
    if (!containerRef.current) return;
    const scrollPos = containerRef.current.scrollTop;
    const viewportHeight = containerRef.current.clientHeight;
    const index = Math.round(scrollPos / viewportHeight);
    if (index >= 0 && index < flares.length && index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#030308] flex items-center justify-center overflow-hidden">
      {/* Mobile back / close button */}
      <button
        onClick={onClose}
        className="absolute top-6 left-6 z-50 p-3 rounded-full bg-[rgba(14,14,36,0.6)] border border-[rgba(255,255,255,0.08)] text-white hover:bg-[rgba(255,255,255,0.1)] backdrop-blur-md transition-all"
        aria-label="Back"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      {/* Global mute/unmute feedback indicator at top right */}
      <button
        onClick={() => setGlobalMuted(!globalMuted)}
        className="absolute top-6 right-6 z-50 p-3 rounded-full bg-[rgba(14,14,36,0.6)] border border-[rgba(255,255,255,0.08)] text-white hover:bg-[rgba(255,255,255,0.1)] backdrop-blur-md transition-all"
      >
        {globalMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </button>

      {/* Vertical Snap Scroll Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="w-full h-full max-w-[450px] aspect-[9/16] overflow-y-scroll scroll-snap-y-mandatory scrollbar-none flex flex-col relative"
        style={{
          scrollSnapType: "y mandatory",
          height: "100dvh",
        }}
      >
        {flares.map((flare, idx) => (
          <FlareItem
            key={flare.id}
            flare={flare}
            isActive={idx === activeIndex}
            isMuted={globalMuted}
            toggleMute={() => setGlobalMuted(!globalMuted)}
          />
        ))}
      </div>
    </div>
  );
}

interface FlareItemProps {
  flare: Flare;
  isActive: boolean;
  isMuted: boolean;
  toggleMute: () => void;
}

function FlareItem({ flare, isActive, isMuted, toggleMute }: FlareItemProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [sparked, setSparked] = useState(false);
  const [sparkCount, setSparkCount] = useState(flare.spark_count || 0);
  const [showHeartOverlay, setShowHeartOverlay] = useState(false);
  const [shareText, setShareText] = useState("Share");

  // Handle play/pause based on active state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      // Small timeout to allow transition to settle
      const timer = setTimeout(() => {
        video.play().catch((err) => console.log("Video auto-play blocked: ", err));
      }, 50);
      return () => clearTimeout(timer);
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [isActive]);

  const handleSparkToggle = () => {
    if (sparked) {
      setSparkCount(prev => prev - 1);
    } else {
      setSparkCount(prev => prev + 1);
      setShowHeartOverlay(true);
      setTimeout(() => setShowHeartOverlay(false), 800);
    }
    setSparked(!sparked);
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/studio/${flare.users?.handle}?flare=${flare.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setShareText("Copied! ✦");
      setTimeout(() => setShareText("Share"), 2000);
    });
  };

  return (
    <div
      className="w-full h-full relative flex-shrink-0 flex items-center justify-center scroll-snap-align-start bg-[#030308]"
      style={{
        scrollSnapAlign: "start",
        height: "100dvh",
      }}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        src={flare.media_url}
        poster={flare.thumbnail_url}
        muted={isMuted}
        loop
        playsInline
        onClick={toggleMute}
        className="w-full h-full object-cover cursor-pointer"
      />

      {/* Double tap / Heart burst overlay */}
      <AnimatePresence>
        {showHeartOverlay && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            className="absolute z-30 pointer-events-none"
          >
            <Flame className="w-24 h-24 text-[var(--accent-primary)] fill-[var(--accent-primary)] filter drop-shadow-[0_0_20px_rgba(108,92,231,0.8)]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom overlay for background dimming to keep typography legible */}
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(3,3,8,0.95)] via-transparent to-transparent pointer-events-none" />

      {/* Vertical actions right stack */}
      <div className="absolute right-4 bottom-24 z-20 flex flex-col gap-5 items-center">
        {/* Spark Button */}
        <button
          onClick={handleSparkToggle}
          className="flex flex-col items-center gap-1 group"
        >
          <div
            className={`p-3.5 rounded-full backdrop-blur-md border transition-all duration-300 ${
              sparked
                ? "bg-[rgba(108,92,231,0.25)] border-[var(--accent-primary)] shadow-[0_0_15px_rgba(108,92,231,0.4)]"
                : "bg-[rgba(14,14,36,0.6)] border-[rgba(255,255,255,0.08)] hover:border-[var(--accent-primary)] hover:bg-[rgba(108,92,231,0.1)]"
            }`}
          >
            <Flame
              className={`w-6 h-6 transition-all duration-300 ${
                sparked
                  ? "text-[var(--accent-primary)] fill-[var(--accent-primary)] scale-110"
                  : "text-white group-hover:text-[var(--accent-primary)]"
              }`}
            />
          </div>
          <span className="text-xs font-mono text-[var(--text-secondary)]">
            {sparkCount}
          </span>
        </button>

        {/* Comment Button */}
        <button className="flex flex-col items-center gap-1 group">
          <div className="p-3.5 rounded-full bg-[rgba(14,14,36,0.6)] border border-[rgba(255,255,255,0.08)] backdrop-blur-md hover:border-[var(--accent-secondary)] hover:bg-[rgba(0,210,255,0.1)] transition-all">
            <MessageSquare className="w-6 h-6 text-white group-hover:text-[var(--accent-secondary)] transition-all" />
          </div>
          <span className="text-xs font-mono text-[var(--text-secondary)]">Comments</span>
        </button>

        {/* Share Button */}
        <button onClick={handleShare} className="flex flex-col items-center gap-1 group">
          <div className="p-3.5 rounded-full bg-[rgba(14,14,36,0.6)] border border-[rgba(255,255,255,0.08)] backdrop-blur-md hover:border-white hover:bg-[rgba(255,255,255,0.1)] transition-all">
            <Share2 className="w-6 h-6 text-white group-hover:text-white transition-all" />
          </div>
          <span className="text-[10px] font-mono text-[var(--text-secondary)] whitespace-nowrap">
            {shareText}
          </span>
        </button>
      </div>

      {/* Info Overlay (Bottom Left) */}
      <div className="absolute left-4 right-20 bottom-8 z-20 pointer-events-auto">
        <Link
          href={`/studio/${flare.users?.handle}`}
          className="flex items-center gap-2 mb-3.5 hover:opacity-80 transition-all inline-flex"
        >
          {flare.users?.avatar_url ? (
            <img
              src={flare.users.avatar_url}
              alt={flare.users.display_name || flare.users.handle}
              className="w-9 h-9 rounded-full object-cover border border-[rgba(255,255,255,0.2)]"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-sm font-semibold text-white">
              {flare.users?.handle[0].toUpperCase()}
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white flex items-center gap-1">
              {flare.users?.display_name || flare.users?.handle}
              <span className="text-xs font-normal text-[rgba(255,255,255,0.5)]">
                @{flare.users?.handle}
              </span>
            </span>
          </div>
        </Link>

        {flare.caption && (
          <p className="text-sm text-[rgba(255,255,255,0.95)] line-clamp-3 leading-relaxed mb-3">
            {flare.caption}
          </p>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {flare.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-mono px-2 py-0.5 rounded bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.04)] text-[rgba(255,255,255,0.7)]"
            >
              #{tag.replace(/\s+/g, "").toLowerCase()}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
