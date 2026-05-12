"use client";

import { motion } from "framer-motion";
import { Heart, Eye, ExternalLink } from "lucide-react";
import type { Project } from "@/types";
import { formatNumber } from "@/lib/utils";
import NeonBadge from "@/components/ui/NeonBadge";
import Link from "next/link";
import { RevealEffect } from "@/components/ui/RevealEffect";

interface ProjectCardProps {
  project: Project;
  index?: number;
}

export default function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  return (
    <motion.article
      className="relative rounded-2xl overflow-hidden group cursor-pointer"
      style={{
        background: "var(--glass-bg)",
        border: "1px solid var(--glass-border)",
        boxShadow: "var(--shadow-card)",
      }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "100px" }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -6 }}
    >
      <RevealEffect>
      {/* Thumbnail */}
      <div
        className="h-48 w-full relative overflow-hidden"
        style={{ background: project.gradient }}
      >
        {/* Noise overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            backgroundSize: "150px",
          }}
        />
        {/* Project title overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="text-center px-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <div
              className="text-2xl font-bold text-white/90 text-center leading-tight"
              style={{ textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}
            >
              {project.title.split("—")[0]}
            </div>
          </div>
        </div>
        {/* Hover reveal */}
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
          style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)" }}
        >
          <ExternalLink className="w-8 h-8 text-white" />
        </div>
        {/* Featured badge */}
        {project.featured && (
          <div className="absolute top-3 left-3">
            <NeonBadge variant="amber" size="sm">
              ✦ Featured
            </NeonBadge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3
          className="font-semibold mb-2 leading-snug"
          style={{
            color: "var(--text-primary)",
            fontFamily: "var(--font-display)",
            fontSize: "15px",
          }}
        >
          {project.title}
        </h3>

        <p
          className="text-xs leading-relaxed mb-4 line-clamp-2"
          style={{ color: "var(--text-muted)" }}
        >
          {project.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="skill-badge">
              {tag}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between pt-3"
          style={{ borderTop: "1px solid var(--border-subtle)" }}
        >
          {/* Creator */}
          <Link href={`/studio/${project.creator.handle}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div
              className="w-6 h-6 rounded-full overflow-hidden"
              style={{ border: "1px solid rgba(108,92,231,0.3)" }}
            >
              <img
                src={project.creator.avatar}
                alt={project.creator.name}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
              {project.creator.name}
            </span>
          </Link>
          {/* Stats */}
          <div className="flex items-center gap-3">
            <span
              className="flex items-center gap-1 text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              <Heart className="w-3.5 h-3.5" />
              {formatNumber(project.likes)}
            </span>
            <span
              className="flex items-center gap-1 text-xs"
              style={{ color: "var(--text-muted)" }}
            >
              <Eye className="w-3.5 h-3.5" />
              {formatNumber(project.views)}
            </span>
          </div>
        </div>
      </div>
      </RevealEffect>
    </motion.article>
  );
}
