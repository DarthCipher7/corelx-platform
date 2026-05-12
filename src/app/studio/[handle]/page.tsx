"use client";

import { use } from "react";
import { motion } from "framer-motion";
import { MOCK_CREATORS, MOCK_PROJECTS } from "@/lib/data";
import { notFound } from "next/navigation";
import { MapPin, Users, FolderOpen, CheckCircle, ArrowRight } from "lucide-react";
import ProjectCard from "@/components/cards/ProjectCard";
import Button from "@/components/ui/Button";
import NeonBadge from "@/components/ui/NeonBadge";

export default function StudioPage({ params }: { params: Promise<{ handle: string }> }) {
  const resolvedParams = use(params);
  const creator = MOCK_CREATORS.find((c) => c.handle === resolvedParams.handle) || MOCK_CREATORS[0];

  if (!creator) {
    notFound();
  }

  const creatorProjects = MOCK_PROJECTS.filter(p => p.creator.id === creator.id || p.id === "p1");

  return (
    <div className="min-h-screen pb-32">
      {/* Cover Image */}
      <div 
        className="h-64 w-full relative"
        style={{ background: creator.coverGradient }}
      >
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--bg-void), transparent)" }} />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative -mt-24">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-6 md:items-end mb-12">
          <div className="avatar-ring w-32 h-32 rounded-full inline-block shrink-0 p-1" style={{ backgroundColor: "var(--bg-void)" }}>
            <div className="w-full h-full rounded-full overflow-hidden relative" style={{ backgroundColor: "var(--bg-frosted)" }}>
              <img src={creator.avatar} alt={creator.name} className="w-full h-full object-cover" />
              {creator.online && (
                <div className="absolute bottom-2 right-2 w-4 h-4 bg-emerald-500 rounded-full border-2 shadow-[0_0_10px_rgba(16,185,129,0.8)]" style={{ borderColor: "var(--bg-void)" }} />
              )}
            </div>
          </div>
          
          <div className="flex-1 pb-2">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-display font-bold" style={{ color: "var(--text-primary)" }}>{creator.name}</h1>
              {creator.verified && <CheckCircle className="w-5 h-5" style={{ color: "var(--accent-cyan)" }} />}
            </div>
            <p className="font-medium text-lg mb-2" style={{ color: "var(--accent-primary)" }}>@{creator.handle}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: "var(--text-muted)" }}>
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {creator.location}</span>
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {creator.followers.toLocaleString()} followers</span>
              <span className="flex items-center gap-1.5"><FolderOpen className="w-4 h-4" /> {creator.projects} projects</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pb-2">
            <Button variant="primary">Follow</Button>
            <Button variant="ghost">Message</Button>
          </div>
        </div>

        {/* Bio & Skills */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          <div className="md:col-span-2">
            <h2 className="text-xl font-display font-semibold mb-4" style={{ color: "var(--text-primary)" }}>About</h2>
            <p className="leading-relaxed text-lg mb-6" style={{ color: "var(--text-secondary)" }}>
              {creator.bio}
            </p>
            <div className="flex flex-wrap gap-2">
              {creator.skills.map(skill => (
                <span key={skill} className="skill-badge px-3 py-1.5">{skill}</span>
              ))}
            </div>
          </div>
          <div>
            <div className="rounded-2xl p-6" style={{ backgroundColor: "var(--bg-frosted)", border: "1px solid var(--border-subtle)" }}>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--text-muted)" }}>Status</h3>
              <div className="flex items-center gap-3 mb-6">
                <NeonBadge variant="emerald">Available for work</NeonBadge>
              </div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--text-muted)" }}>Social</h3>
              <div className="flex flex-col gap-3">
                {Object.entries(creator.socialLinks).map(([platform, handle]) => (
                  <a key={platform} href="#" className="capitalize flex items-center justify-between group transition-colors" style={{ color: "var(--text-secondary)" }}>
                    {platform}
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-cyan-400" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-display font-semibold" style={{ color: "var(--text-primary)" }}>Showcase</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {creatorProjects.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
