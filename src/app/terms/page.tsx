import type { Metadata } from "next";
import Link from "next/link";
import { FileText, AlertCircle, ArrowLeft, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service — CORELX",
  description:
    "CORELX terms of service. Account rules, content policy, Aura, Reach, and enforcement.",
  openGraph: {
    title: "Terms of Service — CORELX",
    description: "CORELX terms of service. Account rules, content policy, Aura, Reach, and enforcement.",
    type: "website",
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-void)] text-[var(--text-primary)] pt-28 pb-32 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div
        className="absolute top-10 left-1/2 -translate-x-1/2 w-[750px] h-[400px] pointer-events-none opacity-15 blur-[140px]"
        style={{
          background: "radial-gradient(circle, #6c5ce7 0%, #00d2ff 60%, transparent 80%)",
        }}
      />
      <div className="absolute inset-0 dot-bg opacity-30 pointer-events-none" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Navigation back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--accent-cyan)] transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Return Home</span>
        </Link>

        {/* Top Legal Review Notice Banner */}
        <div className="mb-10 p-4 sm:p-5 rounded-2xl border border-[#fdcb6e]/40 bg-[#fdcb6e]/10 flex items-start gap-3.5">
          <AlertCircle className="w-5 h-5 text-[#fdcb6e] flex-shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            <strong className="text-[var(--text-primary)] block font-medium mb-0.5">Pre-Launch Legal Notice:</strong>
            These terms are a draft. They have been reviewed by the CORELX team but not yet by legal counsel. Final terms will be published before launch.
          </div>
        </div>

        {/* Header */}
        <header className="mb-12 pb-8 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent-cyan)] uppercase tracking-wider mb-2">
            <FileText className="w-4 h-4" />
            <span>Platform Agreement</span>
          </div>
          <h1
            className="text-3xl sm:text-5xl font-bold tracking-tight text-[var(--text-primary)] mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Terms of Service
          </h1>
          <p className="text-xs font-mono text-[var(--text-muted)]">
            Last Updated: November 2026 • Platform Version: v0.9.0
          </p>
        </header>

        {/* Terms Body */}
        <div className="space-y-10 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using CORELX (corelx.app) or any affiliated service, you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you disagree with any part of these Terms, you may not register an account or utilize the network.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
              2. Account Types &amp; Eligibility
            </h2>
            <p>CORELX provides three distinct account classifications:</p>
            <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
              <li>
                <strong className="text-[var(--text-primary)]">Individual Creator:</strong> For student builders, designers, engineers, and digital polymaths showcasing original work and collaborating in pods.
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">Organisation (Comms):</strong> For campus clubs, university student societies, hackathon organizers, and academic labs.
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">Company:</strong> For verified studios, enterprise partners, and recruiting firms interacting with the Collab Board and Reach Inbox.
              </li>
            </ul>
            <p className="text-xs sm:text-sm">
              You must be at least 13 years old (or 16 in select jurisdictions) to maintain an individual account.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
              3. Permitted Platform Use
            </h2>
            <p>
              CORELX is engineered for authentic creative collaboration, portfolio discovery, and constructive squad building. Permitted use includes publishing project timelapses in Flares, sharing ephemeral updates in Traces, curating work in Showcase, creating community Pods, and pitching on the Collab Board.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
              4. Content Policy &amp; Community Rules
            </h2>
            <p>
              We maintain absolute zero tolerance for abusive behavior. The following activities will trigger immediate enforcement:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li>Hate speech, discrimination, harassment, threats, or stalking.</li>
              <li>Impersonation of creators, campus organizations, or official institutions.</li>
              <li>Automated bot traffic, engagement pods, scraping, or spamming.</li>
              <li>Plagiarism or misrepresenting someone else&apos;s code or design as your own.</li>
              <li>
                NSFW content: Explicit adult content is strictly prohibited on public feeds. Any adult-themed art or creative projects require SafeMode off and age verification (future capability).
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
              5. Aura Reputation Integrity
            </h2>
            <p>
              Aura is the non-transferable reputation standard of CORELX. Aura is mathematically calculated based on genuine project completions, verified peer collaboration, and community contribution across 5 tiers (New, Rising, Trusted, Core, Pillar).
            </p>
            <p className="text-[var(--text-primary)] font-medium text-xs sm:text-sm">
              Aura cannot be purchased, sold, transferred, or gamed. Any attempt to artificially manipulate Aura scores will result in immediate tier demotion or permanent platform expulsion.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
              6. Reach Inbox Guidelines
            </h2>
            <p>
              The Reach Inbox is designed for high-signal creative outreach and collaboration offers. Transmissions must remain professional, relevant, and non-commercial spam. Misuse of the Reach protocol to send unsolicited promotional blasts will lead to immediate Reach suspension.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
              7. Three-Strike Enforcement &amp; Appeals
            </h2>
            <p>
              Moderation actions follow our progressive Three-Strike structure:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
              <li><strong className="text-[var(--text-primary)]">Strike 1:</strong> Formal warning and removal of non-compliant content.</li>
              <li><strong className="text-[var(--text-primary)]">Strike 2:</strong> 14-day temporary freeze of collaboration posting and Reach messaging.</li>
              <li><strong className="text-[var(--text-primary)]">Strike 3:</strong> Permanent platform termination and handle forfeiture.</li>
            </ul>
            <p className="text-xs sm:text-sm">
              Creators may appeal any strike within 14 days by transmitting a formal review request to <a href="mailto:support@corelx.app" className="text-[var(--accent-cyan)] hover:underline">support@corelx.app</a>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
              8. Intellectual Property &amp; Creator Ownership
            </h2>
            <p>
              <strong className="text-[var(--text-primary)]">You own your work.</strong> CORELX claims zero ownership over the code, 3D assets, videos, music, designs, or writings you upload. By publishing on CORELX, you grant us a worldwide, non-exclusive, royalty-free license to host, display, and stream your content solely for the purpose of operating the platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
              9. Account Termination
            </h2>
            <p>
              You may terminate your account at any time in your Settings. CORELX reserves the right to suspend or terminate accounts that breach these Terms, participate in harassment, or pose a security threat to our community.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-[var(--border-subtle)]">
            <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
              10. Legal Contact
            </h2>
            <p>
              For legal inquiries, copyright claims (DMCA notices), or formal correspondence, please reach out to our legal department at:
            </p>
            <p className="font-mono text-sm text-[var(--accent-cyan)] flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <a href="mailto:legal@corelx.app" className="hover:underline">
                legal@corelx.app
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
