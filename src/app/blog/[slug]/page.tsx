import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { ReadingProgress, ShareButton } from "./ReadingProgress";
import { ArrowLeft, Clock, Calendar, Tag } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: "Article Not Found — CORELX",
    };
  }

  return {
    title: `${post.title} — CORELX Journal`,
    description: post.excerpt,
    openGraph: {
      title: `${post.title} — CORELX Journal`,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      authors: [post.author.name],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const allPosts = getAllPosts();
  const relatedPosts = allPosts.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <article className="min-h-screen bg-[var(--bg-void)] text-[var(--text-primary)] relative overflow-hidden pt-28 pb-32">
      <ReadingProgress />

      {/* Background ambient glow */}
      <div
        className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[350px] pointer-events-none opacity-15 blur-[140px]"
        style={{
          background: "radial-gradient(circle, #6c5ce7 0%, #00d2ff 60%, transparent 80%)",
        }}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Navigation back */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--accent-cyan)] transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Journal</span>
        </Link>

        {/* Header */}
        <header className="mb-12">
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: "rgba(108, 92, 231, 0.15)",
                color: "#a29bfe",
                border: "1px solid rgba(108, 92, 231, 0.3)",
              }}
            >
              {post.category}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
              <Clock className="w-3.5 h-3.5" />
              {post.readTime}
            </span>
            <span className="text-xs text-[var(--text-muted)]">•</span>
            <span className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
              <Calendar className="w-3.5 h-3.5" />
              {post.date}
            </span>
          </div>

          <h1
            className="text-3xl sm:text-5xl font-bold tracking-tight mb-6 leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {post.title}
          </h1>

          <p className="text-lg sm:text-xl text-[var(--text-secondary)] leading-relaxed mb-8">
            {post.excerpt}
          </p>

          {/* Author bar */}
          <div className="flex items-center justify-between py-4 border-y border-[var(--border-subtle)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#6c5ce7] to-[#00d2ff] flex items-center justify-center font-mono font-bold text-xs text-white">
                C✦X
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">{post.author.name}</p>
                <p className="text-xs text-[var(--text-secondary)]">
                  {post.author.role} • <span className="font-mono text-[var(--accent-cyan)]">{post.author.handle}</span>
                </p>
              </div>
            </div>

            <ShareButton title={post.title} />
          </div>
        </header>

        {/* Content Body */}
        <div className="prose prose-invert max-w-none space-y-6 text-base sm:text-lg leading-relaxed text-[var(--text-secondary)]">
          {post.content.map((paragraph, index) => {
            // Check if paragraph looks like a list item or subhead
            if (/^\d+\./.test(paragraph)) {
              const [tierName, ...rest] = paragraph.split("—");
              return (
                <div
                  key={index}
                  className="rounded-xl p-5 my-3 border border-[var(--glass-border)]"
                  style={{
                    background: "rgba(15, 15, 35, 0.6)",
                  }}
                >
                  <span className="font-bold text-[var(--accent-cyan)] font-mono text-sm block mb-1">
                    {tierName.trim()}
                  </span>
                  <span className="text-[var(--text-primary)] text-sm sm:text-base">
                    {rest.join("—").trim()}
                  </span>
                </div>
              );
            }

            return (
              <p key={index} className="text-[var(--text-secondary)]">
                {paragraph}
              </p>
            );
          })}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2 mt-12 pt-8 border-t border-[var(--border-subtle)]">
          <Tag className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2.5 py-1 rounded-md bg-[var(--bg-frosted)] border border-[var(--border-subtle)] text-[var(--text-secondary)]"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Share & Bottom Action */}
        <div className="mt-10 p-6 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-card-bg)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-base font-bold text-[var(--text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
              Enjoyed this note?
            </h4>
            <p className="text-xs text-[var(--text-secondary)]">
              Share it with your squad or start your creator profile today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ShareButton title={post.title} />
            <Link
              href="/signup"
              className="px-4 py-2 rounded-xl text-xs font-mono font-medium text-white transition-transform hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #6c5ce7, #00d2ff)",
              }}
            >
              Claim Your Handle
            </Link>
          </div>
        </div>

        {/* Related articles */}
        {relatedPosts.length > 0 && (
          <div className="mt-16 pt-12 border-t border-[var(--border-subtle)]">
            <h3
              className="text-xl font-bold mb-6 text-[var(--text-primary)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Read Next
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {relatedPosts.map((related) => (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className="group block p-5 rounded-xl border border-[var(--glass-border)] hover:border-[var(--accent-primary)] transition-all bg-[var(--bg-surface)]"
                >
                  <p className="text-xs text-[var(--accent-cyan)] font-mono mb-2">{related.category}</p>
                  <h4 className="text-base font-bold group-hover:text-[var(--accent-primary)] transition-colors mb-2">
                    {related.title}
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                    {related.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
