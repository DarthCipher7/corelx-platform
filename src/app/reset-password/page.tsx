"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { RevealEffect } from "@/components/ui/RevealEffect";
import { Eye, EyeOff, ShieldAlert, Loader2, CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [sessionValid, setSessionValid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const verifySession = async () => {
      // Check if user is authenticated (should be if redirected from recovery callback)
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Invalid or expired password reset session. Please request a new link.");
        setSessionValid(false);
      } else {
        setSessionValid(true);
      }
      setCheckingSession(false);
    };

    verifySession();
  }, [supabase]);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError(null);

    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    // Smoothly redirect to feed after a short delay
    setTimeout(() => {
      router.push("/feed");
      router.refresh();
    }, 2000);
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-void)]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-primary)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-24 px-4 flex items-center justify-center relative bg-[var(--bg-void)]">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at top, var(--accent-cyan-glow) 0%, var(--bg-void) 70%)" }} />
      
      <div className="w-full max-w-md glass-card rounded-2xl p-8 relative z-10 animate-fade-in-up border border-[var(--glass-border)]" style={{ backgroundColor: "var(--bg-frosted)", backdropFilter: "blur(12px)" }}>
        {success ? (
          <div className="text-center py-6 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6 text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-display font-bold mb-3 text-white">Password Updated</h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Your credentials have been securely updated. Redirecting you to the feed...
            </p>
          </div>
        ) : !sessionValid ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6 text-red-400">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-display font-bold mb-3 text-white">Session Expired</h1>
            <p className="text-sm mb-8 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {error || "Your password reset session is invalid. Please request a new recovery link."}
            </p>
            <Button variant="primary" className="w-full justify-center" onClick={() => router.push("/forgot-password")}>
              Request New Link
            </Button>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-display font-bold mb-2 text-white">Set New Password</h1>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Create a strong, new password for your account.</p>
            </div>

            {error && (
              <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full rounded-xl px-4 py-3 pr-12 focus:outline-none focus:border-purple-400 transition-colors"
                    style={{ backgroundColor: "var(--bg-deep)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Confirm Password</label>
                <input
                  type="password"
                  required
                  className="w-full rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 transition-colors"
                  style={{ backgroundColor: "var(--bg-deep)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <Button variant="primary" className="w-full justify-center mt-6" disabled={loading}>
                {loading ? "Updating password..." : "Update Password"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
