"use client";

import { motion } from "framer-motion";
import { DollarSign, Users, Clock, ArrowRight } from "lucide-react";
import type { CollabRequest } from "@/types";
import NeonBadge from "@/components/ui/NeonBadge";
import Button from "@/components/ui/Button";

interface CollabCardProps {
  collab: CollabRequest;
  index?: number;
}

const TYPE_CONFIG = {
  paid: { label: "Paid", variant: "emerald" as const },
  collab: { label: "Collab", variant: "purple" as const },
  "open-source": { label: "Open Source", variant: "cyan" as const },
};

export default function CollabCard({ collab, index = 0 }: CollabCardProps) {
  const typeConf = TYPE_CONFIG[collab.type];

  return (
    <motion.article
      className="relative rounded-2xl p-5 group cursor-pointer"
      style={{
        background: "linear-gradient(135deg, rgba(15,15,35,0.95) 0%, rgba(10,10,25,0.98) 100%)",
        border: "1px solid rgba(255,255,255,0.05)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
      }}
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "100px" }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ borderColor: "rgba(108,92,231,0.3)", y: -2 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3 gap-3">
        <h3
          className="font-semibold leading-snug flex-1"
          style={{
            color: "var(--text-primary)",
            fontFamily: "var(--font-display)",
            fontSize: "15px",
          }}
        >
          {collab.title}
        </h3>
        <NeonBadge variant={typeConf.variant} size="sm">
          {typeConf.label}
        </NeonBadge>
      </div>

      <p
        className="text-xs leading-relaxed mb-4 line-clamp-2"
        style={{ color: "var(--text-muted)" }}
      >
        {collab.description}
      </p>

      {/* Skills needed */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {collab.skills.map((skill) => (
          <span key={skill} className="skill-badge">
            {skill}
          </span>
        ))}
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 mb-4">
        {collab.budget && (
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5" style={{ color: "#00cec9" }} />
            <span className="text-xs font-medium" style={{ color: "#00cec9" }}>
              {collab.budget}
            </span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {collab.applicants} applied
          </span>
        </div>
        {collab.deadline && (
          <div className="flex items-center gap-1.5 ml-auto">
            <Clock className="w-3.5 h-3.5" style={{ color: "var(--text-dim)" }} />
            <span className="text-xs" style={{ color: "var(--text-dim)" }}>
              {new Date(collab.deadline).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between pt-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full overflow-hidden"
            style={{ border: "1px solid rgba(108,92,231,0.3)" }}
          >
            <img
              src={collab.creator.avatar}
              alt={collab.creator.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
              {collab.creator.name}
            </p>
            <p className="text-[10px]" style={{ color: "var(--text-dim)" }}>
              @{collab.creator.handle}
            </p>
          </div>
        </div>

        <motion.button
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
          style={{
            color: "var(--accent-primary)",
            background: "rgba(108,92,231,0.1)",
            border: "1px solid rgba(108,92,231,0.2)",
          }}
          whileHover={{
            background: "rgba(108,92,231,0.2)",
            borderColor: "rgba(108,92,231,0.5)",
          }}
          whileTap={{ scale: 0.97 }}
        >
          Apply <ArrowRight className="w-3 h-3" />
        </motion.button>
      </div>
    </motion.article>
  );
}
