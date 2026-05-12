"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { MOCK_CREATORS } from "@/lib/data";
import CreatorCard from "@/components/cards/CreatorCard";

export default function FeaturedCreators() {
  return (
    <section className="py-24 px-4 sm:px-6 relative">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <p className="label-mono mb-3">Top Creators</p>
            <h2 className="display-md" style={{ color: "var(--text-primary)" }}>
              Meet the builders
              <br />
              <span className="gradient-text">shaping tomorrow</span>
            </h2>
          </div>
          <Link href="/explore">
            <motion.div
              className="flex items-center gap-2 text-sm font-medium"
              style={{ color: "var(--accent-primary)" }}
              whileHover={{ x: 4 }}
            >
              View all creators <ArrowRight className="w-4 h-4" />
            </motion.div>
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_CREATORS.map((creator, i) => (
            <CreatorCard key={creator.id} creator={creator} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
