"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Monitor, Gamepad2, Smartphone, Terminal, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BugReportLogProps {
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  platforms: string[];
  steps: string[];
  stackTrace?: string;
  screenshotUrl?: string;
}

export default function BugReportLog({
  title,
  severity,
  platforms,
  steps,
  stackTrace,
  screenshotUrl
}: BugReportLogProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getSeverityStyle = (lvl: string) => {
    switch (lvl) {
      case "critical":
        return "bg-red-500/10 text-red-500 border border-red-500/30";
      case "high":
        return "bg-orange-500/10 text-orange-400 border border-orange-500/30";
      case "medium":
        return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30";
      case "low":
      default:
        return "bg-blue-500/10 text-blue-400 border border-blue-500/30";
    }
  };

  const getPlatformIcon = (platformName: string) => {
    const norm = platformName.toLowerCase();
    if (norm.includes("pc") || norm.includes("desktop") || norm.includes("windows") || norm.includes("mac")) {
      return <Monitor className="w-4 h-4" />;
    }
    if (norm.includes("console") || norm.includes("playstation") || norm.includes("xbox") || norm.includes("switch")) {
      return <Gamepad2 className="w-4 h-4" />;
    }
    return <Smartphone className="w-4 h-4" />;
  };

  return (
    <div 
      className="p-5 rounded-xl bg-[var(--bg-deep)] border-l-4 shadow-sm flex flex-col gap-4 w-full"
      style={{ borderLeftColor: "var(--accent-secondary)" }}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-base font-bold text-[var(--text-primary)] tracking-tight leading-snug">
          {title}
        </h4>
        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ${getSeverityStyle(severity)}`}>
          {severity}
        </span>
      </div>

      {/* Platforms Row */}
      <div className="flex items-center gap-2 text-[var(--text-muted)] text-xs">
        <span className="font-mono text-[10px] uppercase tracking-wider">Scope:</span>
        <div className="flex items-center gap-1.5">
          {platforms.map((p, idx) => (
            <div key={idx} className="flex items-center gap-1 bg-[rgba(255,255,255,0.04)] px-2 py-1 rounded border border-[rgba(255,255,255,0.03)] text-[var(--text-secondary)]">
              {getPlatformIcon(p)}
              <span className="text-[10px] font-mono">{p}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Steps to Reproduce */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-mono text-[var(--accent-secondary)] uppercase tracking-wider">Steps to Reproduce:</span>
        <ol className="flex flex-col gap-2.5 pl-1">
          {steps.map((step, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <span className="text-[var(--accent-secondary)] font-mono font-bold text-xs shrink-0 w-4 text-right">
                {(idx + 1).toString().padStart(2, "0")}.
              </span>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {step}
              </p>
            </li>
          ))}
        </ol>
      </div>

      {/* Expandable Section for Logs / Trace / Screenshot */}
      {(stackTrace || screenshotUrl) && (
        <div className="border-t border-[rgba(255,255,255,0.05)] pt-3 mt-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[10px] font-mono font-bold text-[var(--accent-secondary)] hover:text-white flex items-center gap-1 transition-all outline-none"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" /> HIDE DIAGNOSTIC LOGS
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" /> VIEW FULL DIAGNOSTIC LOGS
              </>
            )}
          </button>

          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden flex flex-col gap-3 mt-3"
              >
                {/* Stack Trace */}
                {stackTrace && (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5 text-[var(--text-muted)] text-[10px] font-mono">
                      <Terminal className="w-3.5 h-3.5" /> STACK TRACE / EXCEPTION:
                    </div>
                    <pre className="bg-[#121216] border border-[rgba(255,255,255,0.05)] text-xs text-red-400/90 font-mono p-3 rounded-lg overflow-x-auto max-h-[160px] whitespace-pre select-text no-scrollbar">
                      {stackTrace}
                    </pre>
                  </div>
                )}

                {/* Screenshot */}
                {screenshotUrl && (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5 text-[var(--text-muted)] text-[10px] font-mono">
                      <ImageIcon className="w-3.5 h-3.5" /> ATTACHED SCREENSHOT / EVIDENCE:
                    </div>
                    <div className="rounded-lg overflow-hidden border border-[rgba(255,255,255,0.05)] bg-[#121216] max-h-[220px] relative">
                      <img
                        src={screenshotUrl}
                        alt="Bug Screenshot Evidence"
                        className="w-full h-full object-contain max-h-[218px]"
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
