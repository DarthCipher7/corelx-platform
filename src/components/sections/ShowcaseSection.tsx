"use client";

import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import { MOCK_PROJECTS } from "@/lib/data";
import ProjectCard from "@/components/cards/ProjectCard";

export default function ShowcaseSection() {
  const featured = MOCK_PROJECTS.filter((p) => p.featured);
  const rest = MOCK_PROJECTS.filter((p) => !p.featured);

  return (
    <section className="py-24 px-4 sm:px-6 relative" style={{ background: "rgba(8,8,20,0.6)" }}>
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <p className="label-mono mb-3">Featured Showcase</p>
            <h2 className="display-md" style={{ color: "var(--text-primary)" }}>
              Work that
              <br />
              <span className="gradient-text-warm">stops the scroll</span>
            </h2>
          </div>
          <Link href="/showcase">
            <motion.div
              className="flex items-center gap-2 text-sm font-medium"
              style={{ color: "var(--accent-primary)" }}
              whileHover={{ x: 4 }}
            >
              Full showcase <ArrowRight className="w-4 h-4" />
            </motion.div>
          </Link>
        </div>

        {/* Featured hero project */}
        {featured[0] && (
          <motion.div
            className="relative rounded-3xl overflow-hidden mb-8 cursor-pointer group"
            style={{
              height: "380px",
              background: featured[0].gradient,
              border: "1px solid rgba(255,255,255,0.08)",
            }}
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "100px" }}
            transition={{ duration: 0.6 }}
            whileHover={{ scale: 1.01 }}
          >
            {/* Noise overlay */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                backgroundSize: "150px",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(135deg, transparent 30%, rgba(5,5,15,0.85) 100%)",
              }}
            />
            <div className="absolute bottom-0 left-0 p-8">
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-4 text-xs font-medium"
                style={{
                  background: "rgba(255,210,0,0.15)",
                  border: "1px solid rgba(255,210,0,0.3)",
                  color: "#fdcb6e",
                }}
              >
                <Star className="w-3 h-3" /> Editor&apos;s Pick
              </div>
              <h3
                className="display-md text-white mb-2"
                style={{ textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}
              >
                {featured[0].title}
              </h3>
              <p className="text-sm text-white/70 max-w-lg mb-4">
                {featured[0].description}
              </p>
              <div className="flex items-center gap-2">
                <img
                  src={featured[0].creator.avatar}
                  alt={featured[0].creator.name}
                  className="w-7 h-7 rounded-full"
                  style={{ border: "1px solid rgba(255,255,255,0.3)" }}
                />
                <span className="text-sm text-white/80">{featured[0].creator.name}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Grid of remaining projects */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...featured.slice(1), ...rest].map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
