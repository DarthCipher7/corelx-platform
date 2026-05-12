"use client";

import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { MOCK_COLLABS } from "@/lib/data";
import CollabCard from "@/components/cards/CollabCard";

export default function CollabsSection() {
  return (
    <section className="py-24 px-4 sm:px-6 relative">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <p className="label-mono mb-3">Open Collabs</p>
            <h2 className="display-md" style={{ color: "var(--text-primary)" }}>
              Build something
              <br />
              <span className="gradient-text">remarkable, together</span>
            </h2>
          </div>
          <Link href="/collabs">
            <motion.div
              className="flex items-center gap-2 text-sm font-medium"
              style={{ color: "var(--accent-primary)" }}
              whileHover={{ x: 4 }}
            >
              Browse all collabs <ArrowRight className="w-4 h-4" />
            </motion.div>
          </Link>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {MOCK_COLLABS.map((collab, i) => (
            <CollabCard key={collab.id} collab={collab} index={i} />
          ))}
        </div>

        {/* Post a collab CTA */}
        <motion.div
          className="relative rounded-3xl overflow-hidden p-8 md:p-12 text-center"
          style={{
            background: "linear-gradient(135deg, rgba(108,92,231,0.12) 0%, rgba(0,210,255,0.08) 100%)",
            border: "1px solid rgba(108,92,231,0.2)",
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "100px" }}
        >
          {/* Glow */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse, rgba(108,92,231,0.3), transparent 70%)",
              filter: "blur(24px)",
            }}
          />

          <div className="relative z-10">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: "linear-gradient(135deg, #6c5ce7, #00d2ff)" }}
            >
              <Zap className="w-7 h-7 text-white" />
            </div>
            <h3
              className="display-md mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Have a project in mind?
            </h3>
            <p
              className="text-base mb-8 max-w-md mx-auto"
              style={{ color: "var(--text-secondary)" }}
            >
              Post a collab request and get matched with vetted creators who
              have exactly the skills you need.
            </p>
            <Link href="/collabs/new">
              <motion.button
                className="btn-primary mx-auto"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                Post a Collab <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
