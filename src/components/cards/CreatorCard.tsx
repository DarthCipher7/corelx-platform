"use client";

import { motion } from "framer-motion";
import { MapPin, CheckCircle, Users, FolderOpen } from "lucide-react";
import Image from "next/image";
import type { Creator } from "@/types";
import { formatNumber } from "@/lib/utils";
import NeonBadge from "@/components/ui/NeonBadge";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";

interface CreatorCardProps {
  creator: Creator;
  index?: number;
}

export default function CreatorCard({ creator, index = 0 }: CreatorCardProps) {
  const router = useRouter();
  
  return (
    <motion.article
      onClick={() => router.push(`/studio/${creator.handle}`)}
      className="relative rounded-2xl overflow-hidden group cursor-pointer"
      style={{
        background: "linear-gradient(135deg, rgba(15,15,35,0.95) 0%, rgba(10,10,25,0.98) 100%)",
        border: "1px solid rgba(255,255,255,0.05)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
      }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "100px" }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -6 }}
    >
      {/* Cover gradient bar */}
      <div
        className="h-28 w-full relative overflow-hidden"
        style={{ background: creator.coverGradient }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, transparent 40%, rgba(10,10,25,0.95) 100%)",
          }}
        />
        {/* Online indicator */}
        {creator.online && (
          <div className="absolute top-3 right-3">
            <NeonBadge variant="emerald" size="sm">
              <span
                className="w-1.5 h-1.5 rounded-full bg-current"
                style={{ boxShadow: "0 0 6px currentColor" }}
              />
              Live
            </NeonBadge>
          </div>
        )}
      </div>

      {/* Avatar */}
      <div className="px-5 -mt-10 relative">
        <div
          className="avatar-ring w-16 h-16 rounded-full inline-block"
          style={{ padding: "2px" }}
        >
          <div
            className="w-full h-full rounded-full overflow-hidden"
            style={{ background: "var(--bg-elevated)" }}
          >
            <img
              src={creator.avatar}
              alt={creator.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pb-5 pt-2">
        {/* Name + verify */}
        <div className="flex items-center gap-1.5 mb-0.5">
          <h3
            className="font-semibold text-base"
            style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}
          >
            {creator.name}
          </h3>
          {creator.verified && (
            <CheckCircle
              className="w-4 h-4 flex-shrink-0"
              style={{ color: "var(--accent-cyan)" }}
            />
          )}
        </div>

        <p
          className="text-xs mb-1"
          style={{ color: "var(--accent-primary)" }}
        >
          @{creator.handle}
        </p>

        <p
          className="text-xs mb-3"
          style={{ color: "var(--text-secondary)" }}
        >
          {creator.role}
        </p>

        <p
          className="text-xs leading-relaxed mb-4 line-clamp-2"
          style={{ color: "var(--text-muted)" }}
        >
          {creator.bio}
        </p>

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {creator.skills.slice(0, 3).map((skill) => (
            <span key={skill} className="skill-badge">
              {skill}
            </span>
          ))}
          {creator.skills.length > 3 && (
            <span className="skill-badge" style={{ opacity: 0.6 }}>
              +{creator.skills.length - 3}
            </span>
          )}
        </div>

        {/* Stats row */}
        <div
          className="flex items-center gap-4 py-3 mb-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          {[
            { label: "Followers", value: formatNumber(creator.followers), icon: Users },
            { label: "Projects", value: creator.projects, icon: FolderOpen },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center gap-1.5">
              <Icon className="w-3.5 h-3.5" style={{ color: "var(--text-dim)" }} />
              <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                {value}
              </span>
              <span className="text-xs" style={{ color: "var(--text-dim)" }}>
                {label}
              </span>
            </div>
          ))}
          {creator.location && (
            <div className="flex items-center gap-1 ml-auto">
              <MapPin className="w-3 h-3" style={{ color: "var(--text-dim)" }} />
              <span className="text-xs truncate max-w-[80px]" style={{ color: "var(--text-dim)" }}>
                {creator.location.split(",")[0]}
              </span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button variant="primary" size="sm" className="flex-1 justify-center">
            Follow
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 justify-center">
            Message
          </Button>
        </div>
      </div>

      {/* Hover glow overlay */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          boxShadow: "inset 0 0 0 1px rgba(108,92,231,0.3)",
        }}
      />
    </motion.article>
  );
}
