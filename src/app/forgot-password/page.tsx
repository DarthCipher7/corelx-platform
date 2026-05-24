"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { RevealEffect } from "@/components/ui/RevealEffect";
import { ArrowLeft, KeyRound, MailCheck } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen pt-32 pb-24 px-4 flex items-center justify-center relative bg-[var(--bg-void)]">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at top, var(--accent-primary-glow) 0%, var(--bg-void) 70%)" }} />
      
      <div className="w-full max-w-md glass-card rounded-2xl p-8 relative z-10 animate-fade-in-up border border-[var(--glass-border)]" style={{ backgroundColor: "var(--bg-frosted)", backdropFilter: "blur(12px)" }}>
        <div className="relative mb-6">
          <Link
            href="/login"
            className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-white/5 border border-[var(--glass-border)] text-[var(--text-secondary)] hover:text-white hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center"
            title="Back to Login"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        {success ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6 text-emerald-400">
              <MailCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-display font-bold mb-3 text-white">Check Your Email</h1>
            <p className="text-sm mb-8 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              We have sent a secure password reset link to <span className="text-white font-medium">{email}</span>. Please click the link to reset your credentials.
            </p>
            <Link href="/login" className="inline-block w-full">
              <Button variant="primary" className="w-full justify-center">
                Back to Log In
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4 text-purple-400">
                <KeyRound className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-display font-bold mb-2 text-white">Forgot Password?</h1>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Enter your email address to recover your account access.</p>
            </div>

            {error && (
              <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleResetRequest} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Email Address</label>
                <input
                  type="email"
                  required
                  className="w-full rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 transition-colors"
                  style={{ backgroundColor: "var(--bg-deep)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <Button variant="primary" className="w-full justify-center" disabled={loading}>
                {loading ? "Sending reset link..." : "Send Reset Link"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
