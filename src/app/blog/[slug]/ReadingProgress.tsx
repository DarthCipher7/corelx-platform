"use client";

import { useEffect, useState } from "react";
import { Copy, Check, Share2 } from "lucide-react";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const windowHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (windowHeight === 0) return;
      const scrollPercent = (totalScroll / windowHeight) * 100;
      setProgress(Math.min(100, Math.max(0, scrollPercent)));
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 h-1 z-50 pointer-events-none"
      style={{ background: "rgba(255,255,255,0.05)" }}
    >
      <div
        className="h-full transition-all duration-75"
        style={{
          width: `${progress}%`,
          background: "linear-gradient(90deg, #6c5ce7 0%, #00d2ff 100%)",
          boxShadow: "0 0 10px rgba(0,210,255,0.7)",
        }}
      />
    </div>
  );
}

export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      if (typeof window !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // fallback
    }
  };

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium border border-[var(--border-subtle)] bg-[var(--bg-frosted)] text-[var(--text-primary)] hover:border-[var(--accent-cyan)] hover:text-[var(--accent-cyan)] transition-all cursor-pointer"
      title="Copy link to clipboard"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-[#00cec9]" />
          <span className="text-[#00cec9]">Link copied!</span>
        </>
      ) : (
        <>
          <Share2 className="w-3.5 h-3.5" />
          <span>Share Article</span>
        </>
      )}
    </button>
  );
}
