import type { Metadata } from "next";
import Link from "next/link";
import { Shield, AlertCircle, ArrowLeft, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — CORELX",
  description:
    "How CORELX handles your data. Privacy policy covering data collection, Supabase storage, SafeMode, and your rights.",
  openGraph: {
    title: "Privacy Policy — CORELX",
    description: "How CORELX handles your data. Privacy policy covering data collection, Supabase storage, SafeMode, and your rights.",
    type: "website",
  },
};

export default function PrivacyPage() {
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
            <strong className="text-white block font-medium mb-0.5">Pre-Launch Legal Notice:</strong>
            This privacy policy is a draft. It has been reviewed by the CORELX team but not yet by legal counsel. It will be updated before final launch.
          </div>
        </div>

        {/* Document Header */}
        <header className="mb-12 pb-8 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent-cyan)] uppercase tracking-wider mb-2">
            <Shield className="w-4 h-4" />
            <span>Data Governance Protocol</span>
          </div>
          <h1
            className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Privacy Policy
          </h1>
          <p className="text-xs font-mono text-[var(--text-muted)]">
            Effective Date: November 2026 • Platform Version: v0.9.0
          </p>
        </header>

        {/* Policy Body */}
        <div className="space-y-10 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
              1. Overview &amp; Commitment
            </h2>
            <p>
              CORELX (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates the creative identity and collaboration platform available at corelx.app. We are fundamentally committed to protecting the privacy and creative intellectual property of student builders, designers, and creators. We do not sell your personal data, and we do not monetize through behavioral advertising trackers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
              2. What We Collect
            </h2>
            <p>We collect only the data strictly necessary to deliver our services:</p>
            <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
              <li>
                <strong className="text-white">Account Information:</strong> Your institutional email, chosen handle (@username), display name, avatar, bio, and associated university campus or college affiliation.
              </li>
              <li>
                <strong className="text-white">Content &amp; Artifacts:</strong> Flares (short vertical video), Traces (24-hour ephemeral posts), Showcase portfolio items, code links, and Collab Board pitch posts you publish.
              </li>
              <li>
                <strong className="text-white">Usage &amp; Interaction Data:</strong> Spark reactions, pod channel messages, collab applications, and Aura reputation signals.
              </li>
              <li>
                <strong className="text-white">Device &amp; Telemetry Data:</strong> IP address, browser type, and operating system collected for security authentication and anti-bot defense.
              </li>
              <li>
                <strong className="text-white">SafeMode Geolocation:</strong> Approximate device location when you explicitly opt in to campus geofencing.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
              3. How We Use Information
            </h2>
            <p>Your information is utilized solely to:</p>
            <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
              <li>Operate, maintain, and provide the core features of the CORELX platform.</li>
              <li>Calculate and maintain your earned cryptographic Aura score across the 5 tiers.</li>
              <li>Filter collaborator suggestions on the Collab Board and route high-signal Reach Inbox inquiries.</li>
              <li>Enforce SafeMode privacy restrictions, campus filters, and community safety policies.</li>
              <li>Send critical system notifications, collaboration alerts, and security updates.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
              4. Storage &amp; Infrastructure via Supabase
            </h2>
            <p>
              CORELX stores account records, metadata, and database relations using Supabase Inc. (supabase.com), hosted on AWS infrastructure. All transmissions are encrypted in transit via TLS 1.3 and at rest with AES-256 encryption. European Union Standard Contractual Clauses (SCCs) apply to cross-border data handling where applicable.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
              5. SafeMode &amp; Geolocation Privacy
            </h2>
            <p>
              SafeMode is our proprietary privacy engine. Geolocation coordinates are used solely to establish your approximate campus perimeter for local pod discovery and campus events. We never record continuous location history, we never broadcast precise coordinates to peers, and we never share location telemetry with third parties. SafeMode geofencing is strictly opt-in and can be deactivated at any time in your Settings.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
              6. AI Content Analysis &amp; Moderation
            </h2>
            <p>
              To maintain community integrity without human surveillance of private chats, automated AI moderation algorithms may scan publicly published Flares, Traces, and Showcase text for policy violations (including hate speech, harassment, impersonation, and non-consensual imagery).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
              7. Three-Strike Enforcement System
            </h2>
            <p>
              Platform integrity violations are tracked under our transparent Three-Strike policy:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li><strong className="text-white">Strike 1:</strong> Formal warning and removal of the offending content.</li>
              <li><strong className="text-white">Strike 2:</strong> 14-day suspension of Collab Board posting and Reach Inbox privileges.</li>
              <li><strong className="text-white">Strike 3:</strong> Permanent account termination and Aura revocation.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
              8. Data Retention &amp; Deletion
            </h2>
            <p>
              Account data is retained for the active lifecycle of your account. If you elect to delete your account via Settings, your profile, showcases, traces, and pod memberships will be permanently expunged from primary databases within 30 days, following standard backup rotation cycles.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
              9. Your Rights
            </h2>
            <p>
              Regardless of your physical location, you have the right to request a full export of your portfolio artifacts, correct inaccurate profile data, or initiate complete account deletion by contacting our privacy team.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-[var(--border-subtle)]">
            <h2 className="text-lg sm:text-xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
              10. Contact Us
            </h2>
            <p>
              For privacy inquiries, data export requests, or security disclosures, reach our designated privacy officers directly at:
            </p>
            <p className="font-mono text-sm text-[var(--accent-cyan)] flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <a href="mailto:privacy@corelx.app" className="hover:underline">
                privacy@corelx.app
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
