"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Zap, Globe, Link as LinkIcon, Code2 } from "lucide-react";

const FOOTER_LINKS = {
  Platform: ["Explore", "Showcase", "Collabs", "Community", "Blog"],
  Product: ["Features", "Pricing", "Changelog", "Roadmap", "API"],
  Company: ["About", "Careers", "Press", "Privacy", "Terms"],
};

export default function Footer() {
  return (
    <footer
      className="relative mt-32 border-t"
      style={{ borderColor: "rgba(108,92,231,0.1)" }}
    >
      {/* Glow top border */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--accent-primary), var(--accent-cyan), transparent)",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-12">
          {/* Brand column */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #6c5ce7, #00d2ff)",
                  boxShadow: "0 0 16px rgba(108,92,231,0.5)",
                }}
              >
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span
                className="text-xl font-bold"
                style={{
                  fontFamily: "var(--font-display)",
                  background: "linear-gradient(135deg, #f0f0ff, #a29bfe)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                CORELX
              </span>
            </Link>
            <p
              className="text-sm leading-relaxed max-w-xs"
              style={{ color: "var(--text-muted)" }}
            >
              The identity layer for the next generation of creators, builders,
              and visionaries.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {[Globe, Code2, LinkIcon].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200"
                  style={{
                    color: "var(--text-muted)",
                    border: "1px solid var(--glass-border)",
                  }}
                  whileHover={{
                    scale: 1.1,
                    borderColor: "rgba(108,92,231,0.4)",
                    color: "var(--accent-primary)",
                  }}
                >
                  <Icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <p
                className="text-xs font-semibold mb-4 tracking-widest uppercase"
                style={{ color: "var(--accent-cyan)" }}
              >
                {category}
              </p>
              <ul className="flex flex-col gap-3">
                {links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-sm transition-all duration-150"
                      style={{ color: "var(--text-muted)" }}
                      onMouseEnter={(e) =>
                        ((e.target as HTMLElement).style.color =
                          "var(--text-primary)")
                      }
                      onMouseLeave={(e) =>
                        ((e.target as HTMLElement).style.color =
                          "var(--text-muted)")
                      }
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="mt-16 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: "1px solid rgba(108,92,231,0.08)" }}
        >
          <p className="text-xs" style={{ color: "var(--text-dim)" }}>
            © 2026 CORELX, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-1">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background: "#00b894",
                boxShadow: "0 0 8px rgba(0,184,148,0.6)",
              }}
            />
            <span className="text-xs" style={{ color: "var(--text-dim)" }}>
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
