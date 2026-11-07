import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { ArrowRight, Clock, Calendar, Sparkles, BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog — CORELX",
  description:
    "Ideas, updates, and creator stories from the CORELX journal. Building the identity layer for the next generation of builders.",
  openGraph: {
    title: "Blog — CORELX",
    description: "Ideas, updates, and creator stories from the CORELX journal.",
    type: "website",
  },
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Vision: {
    bg: "rgba(108, 92, 231, 0.15)",
    text: "#a29bfe",
    border: "rgba(108, 92, 231, 0.35)",
  },
  Reputation: {
    bg: "rgba(0, 210, 255, 0.15)",
    text: "#00d2ff",
    border: "rgba(0, 210, 255, 0.35)",
  },
  Community: {
    bg: "rgba(253, 121, 168, 0.15)",
    text: "#fd79a8",
    border: "rgba(253, 121, 168, 0.35)",
  },
  Engineering: {
    bg: "rgba(0, 206, 201, 0.15)",
    text: "#00cec9",
    border: "rgba(0, 206, 201, 0.35)",
  },
};

export default function BlogHubPage() {
  const posts = getAllPosts();
  const [featuredPost, ...otherPosts] = posts;

  return (
    <div className="min-h-screen bg-[var(--bg-void)] text-[var(--text-primary)] relative overflow-hidden pt-28 pb-32">
      {/* Background glow layers */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] pointer-events-none opacity-20 blur-[120px]"
        style={{
          background: "radial-gradient(circle, #6c5ce7 0%, #00d2ff 60%, transparent 80%)",
        }}
      />
      <div className="absolute inset-0 dot-bg opacity-30 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header section */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono mb-4 border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent-cyan)]" />
            <span className="text-[var(--accent-cyan)] uppercase tracking-wider">The CORELX Journal</span>
          </div>
          <h1
            className="text-4xl sm:text-6xl font-bold tracking-tight mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Ideas, updates, and{" "}
            <span className="gradient-text">creator stories.</span>
          </h1>
          <p className="text-lg sm:text-xl text-[var(--text-secondary)] leading-relaxed">
            Dispatches from the frontier of human craft, digital identity, and decentralized creative networks.
          </p>
        </div>

        {/* Featured Post Card */}
        {featuredPost && (
          <div className="mb-14">
            <Link
              href={`/blog/${featuredPost.slug}`}
              className="group block relative rounded-2xl p-8 sm:p-12 transition-all duration-300 overflow-hidden border border-[var(--glass-border)] hover:border-[var(--accent-primary)]"
              style={{
                background: "linear-gradient(135deg, rgba(15,15,35,0.85) 0%, rgba(10,10,25,0.92) 100%)",
                boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
              }}
            >
              <div
                className="absolute top-0 right-0 w-96 h-96 opacity-10 blur-3xl pointer-events-none group-hover:opacity-20 transition-opacity"
                style={{ background: "#6c5ce7" }}
              />

              <div className="flex flex-wrap items-center gap-3 mb-5">
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold tracking-wide"
                  style={{
                    backgroundColor: CATEGORY_COLORS[featuredPost.category]?.bg || "var(--bg-frosted)",
                    color: CATEGORY_COLORS[featuredPost.category]?.text || "var(--text-primary)",
                    border: `1px solid ${CATEGORY_COLORS[featuredPost.category]?.border || "var(--border-subtle)"}`,
                  }}
                >
                  Featured • {featuredPost.category}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                  <Clock className="w-3.5 h-3.5" />
                  {featuredPost.readTime}
                </span>
                <span className="text-xs text-[var(--text-muted)]">•</span>
                <span className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                  <Calendar className="w-3.5 h-3.5" />
                  {featuredPost.date}
                </span>
              </div>

              <h2
                className="text-2xl sm:text-4xl font-bold tracking-tight mb-4 group-hover:text-[var(--accent-cyan)] transition-colors"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {featuredPost.title}
              </h2>

              <p className="text-[var(--text-secondary)] text-base sm:text-lg leading-relaxed max-w-3xl mb-8">
                {featuredPost.excerpt}
              </p>

              <div className="flex items-center justify-between pt-6 border-t border-[var(--border-subtle)]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#6c5ce7] to-[#00d2ff] flex items-center justify-center font-mono font-bold text-xs text-[var(--text-primary)]">
                    C✦X
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{featuredPost.author.name}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{featuredPost.author.role}</p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent-primary)] group-hover:text-[var(--accent-cyan)] transition-colors">
                  <span>Read Story</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Other Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {otherPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col justify-between rounded-2xl p-7 sm:p-8 transition-all duration-300 border border-[var(--glass-border)] hover:border-[var(--accent-cyan)]"
              style={{
                background: "var(--glass-card-bg)",
                backdropFilter: "blur(20px)",
              }}
            >
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span
                    className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                    style={{
                      backgroundColor: CATEGORY_COLORS[post.category]?.bg || "var(--bg-frosted)",
                      color: CATEGORY_COLORS[post.category]?.text || "var(--text-primary)",
                      border: `1px solid ${CATEGORY_COLORS[post.category]?.border || "var(--border-subtle)"}`,
                    }}
                  >
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                    <Clock className="w-3 h-3" />
                    {post.readTime}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">•</span>
                  <span className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                    <Calendar className="w-3 h-3" />
                    {post.date}
                  </span>
                </div>

                <h3
                  className="text-xl sm:text-2xl font-bold mb-3 group-hover:text-[var(--accent-cyan)] transition-colors"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {post.title}
                </h3>

                <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed mb-6">
                  {post.excerpt}
                </p>
              </div>

              <div className="flex items-center justify-between pt-5 border-t border-[var(--border-subtle)] mt-auto">
                <span className="text-xs text-[var(--text-secondary)] font-mono">{post.author.handle}</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-cyan)] group-hover:translate-x-1 transition-transform">
                  Read Article <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Subscribe or Early Access callout */}
        <div
          className="mt-20 rounded-2xl p-8 sm:p-10 border border-[var(--border-subtle)] relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(20,20,45,0.7) 0%, rgba(10,10,25,0.85) 100%)",
          }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--accent-cyan)] mb-2">
                <BookOpen className="w-4 h-4" />
                <span>Stay Synced</span>
              </div>
              <h3 className="text-2xl font-bold text-[var(--text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
                Get dispatches before they hit the feed.
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Deep dives on creative tools, reputation models, and campus culture. No fluff, no marketing spam.
              </p>
            </div>
            <Link
              href="/signup"
              className="px-6 py-3 rounded-full text-sm font-semibold text-[var(--text-primary)] whitespace-nowrap transition-transform hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #6c5ce7, #00d2ff)",
                boxShadow: "0 0 20px rgba(108,92,231,0.4)",
              }}
            >
              Join the Network
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
