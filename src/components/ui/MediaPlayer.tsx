"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MediaPlayerProps {
  mediaUrl: string;
  category: "Video" | "Film" | "Music";
  title?: string;
  artistName?: string;
}

export default function MediaPlayer({ mediaUrl, category, title = "Untitled", artistName = "Creator" }: MediaPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const mediaRef = category === "Music" ? audioRef : videoRef;

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const media = mediaRef.current;
    if (!media) return;

    if (isPlaying) {
      media.pause();
      setIsPlaying(false);
    } else {
      media.play().catch(err => console.log("Playback error:", err));
      setIsPlaying(true);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const media = mediaRef.current;
    if (!media) return;

    media.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    const media = mediaRef.current;
    if (!media) return;
    setCurrentTime(media.currentTime);
    if (media.duration) {
      setProgress((media.currentTime / media.duration) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    const media = mediaRef.current;
    if (!media) return;
    setDuration(media.duration);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const media = mediaRef.current;
    const progressBar = progressBarRef.current;
    if (!media || !progressBar || !duration) return;

    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newProgress = Math.max(0, Math.min(1, clickX / width));
    
    media.currentTime = newProgress * duration;
    setProgress(newProgress * 100);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Video Auto-pause on unmount
  useEffect(() => {
    return () => {
      const media = mediaRef.current;
      if (media) media.pause();
    };
  }, []);

  if (category === "Music") {
    return (
      <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] w-full">
        <audio
          ref={audioRef}
          src={mediaUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        />
        
        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] flex shrink-0 items-center justify-center hover:bg-[var(--accent-primary)]/20 transition-all duration-300 active:scale-95"
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current translate-x-[1px]" />}
        </button>

        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <div className="flex justify-between items-baseline gap-2">
            <span className="text-sm font-semibold text-[var(--text-primary)] truncate">
              {title}
            </span>
            <span className="text-xs text-[var(--text-secondary)] font-mono shrink-0">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          <span className="text-xs text-[var(--text-secondary)] truncate">
            {artistName}
          </span>
          
          {/* Waveform representation */}
          <div 
            ref={progressBarRef}
            onClick={handleProgressClick}
            className="h-8 rounded-md bg-gradient-to-r from-[var(--accent-primary)]/20 via-[var(--accent-secondary)]/20 to-[var(--bg-deep)] border border-[var(--border-subtle)]/50 relative overflow-hidden cursor-pointer mt-1 group"
          >
            {/* Wave lines overlay (simulated waveform) */}
            <div className="absolute inset-0 flex items-center justify-between px-2 gap-[2px] opacity-40 pointer-events-none">
              {[20, 60, 45, 80, 50, 30, 70, 90, 40, 60, 85, 30, 55, 75, 40, 20, 50, 70, 60, 35, 45, 80, 90, 50, 30, 75, 60, 40, 25, 50].map((h, i) => (
                <div 
                  key={i} 
                  className="w-[3px] bg-white rounded-full transition-all duration-300"
                  style={{ 
                    height: `${h}%`,
                    backgroundColor: progress > (i / 30) * 100 ? "var(--accent-primary)" : "white"
                  }}
                />
              ))}
            </div>

            {/* Overlaid sliding progress glow */}
            <div 
              className="absolute top-0 bottom-0 left-0 bg-[var(--accent-primary)]/10 border-r border-[var(--accent-primary)] transition-all duration-75 pointer-events-none"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Video Layout (Video / Film categories)
  return (
    <div 
      className="relative w-full aspect-video rounded-xl overflow-hidden bg-black group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <video
        ref={videoRef}
        src={mediaUrl}
        className="w-full h-full object-cover cursor-pointer"
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        playsInline
      />

      {/* Hover-to-Play Center Overlay */}
      <AnimatePresence>
        {!isPlaying && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={togglePlay}
            className="absolute inset-0 bg-black/30 backdrop-blur-[1px] flex items-center justify-center cursor-pointer z-10"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white backdrop-blur-md shadow-2xl transition-colors hover:bg-white/20"
            >
              <Play className="w-8 h-8 fill-current translate-x-[2px]" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Control Bar */}
      <div 
        className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col gap-2 transition-all duration-300 z-20 pointer-events-auto ${
          isHovered || !isPlaying ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
        }`}
      >
        {/* Progress Bar Row */}
        <div 
          ref={progressBarRef}
          onClick={handleProgressClick}
          className="h-1.5 bg-white/20 hover:h-2.5 relative rounded-full cursor-pointer transition-all duration-200 group/progress flex items-center"
        >
          <div 
            className="bg-[var(--accent-primary)] h-full rounded-full transition-all duration-75 relative"
            style={{ width: `${progress}%` }}
          >
            {/* Glowing Knob */}
            <div 
              className="w-3.5 h-3.5 bg-white rounded-full absolute -right-1.5 -top-1 opacity-0 group-hover/progress:opacity-100 transition-opacity duration-200 shadow-[0_0_8px_var(--accent-primary)] border-2 border-[var(--accent-primary)] cursor-pointer"
            />
          </div>
        </div>

        {/* Action Controls Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={togglePlay}
              className="text-white hover:text-[var(--accent-primary)] transition-colors active:scale-95"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            </button>

            <button 
              onClick={toggleMute}
              className="text-white hover:text-[var(--accent-primary)] transition-colors active:scale-95"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            <span className="text-xs font-mono text-[var(--text-muted)] select-none">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <button 
            onClick={(e) => {
              e.stopPropagation();
              videoRef.current?.requestFullscreen().catch(err => console.log("Fullscreen error:", err));
            }}
            className="text-white hover:text-[var(--accent-primary)] transition-colors"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
