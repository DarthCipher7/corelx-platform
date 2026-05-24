"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { RevealEffect } from "@/components/ui/RevealEffect";
import { ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingInvite, setPendingInvite] = useState<{ type: string; id: string } | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const inviteType = params.get("invite_type");
      const inviteId = params.get("invite_id");
      if (inviteType && inviteId) {
        sessionStorage.setItem("pending_invite_type", inviteType);
        sessionStorage.setItem("pending_invite_id", inviteId);
        setPendingInvite({ type: inviteType, id: inviteId });
      } else {
        const cachedType = sessionStorage.getItem("pending_invite_type");
        const cachedId = sessionStorage.getItem("pending_invite_id");
        if (cachedType && cachedId) {
          setPendingInvite({ type: cachedType, id: cachedId });
        }
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/feed");
    router.refresh();
  };

  const handleOAuth = async (provider: 'google' | 'linkedin_oidc') => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24 px-4 flex items-center justify-center relative">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at top, var(--accent-cyan-glow) 0%, var(--bg-void) 70%)" }} />
      
      <div className="w-full max-w-md glass-card rounded-2xl p-8 relative z-10 animate-fade-in-up">
        {pendingInvite && (
          <div className="mb-6 p-4 rounded-2xl bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-primary)]/5 to-transparent animate-pulse" />
            <div className="flex items-center gap-2 justify-center mb-1 text-[var(--accent-primary)]">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Pending Invite Detected</span>
            </div>
            <p className="text-white text-xs">
              Log in to join the exclusive {pendingInvite.type === 'pod' ? 'Pod' : 'Event'}.
            </p>
          </div>
        )}

        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold mb-2" style={{ color: "var(--text-primary)" }}>Welcome Back</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Log in to continue building your legacy.</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Email</label>
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
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Password</label>
              <Link href="/forgot-password" className="text-xs transition-colors hover:underline" style={{ color: "var(--accent-primary)" }}>
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              className="w-full rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 transition-colors"
              style={{ backgroundColor: "var(--bg-deep)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button variant="primary" className="w-full justify-center mt-6" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </Button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-1 h-px" style={{ backgroundColor: "var(--border-subtle)" }} />
          <span className="px-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Or continue with</span>
          <div className="flex-1 h-px" style={{ backgroundColor: "var(--border-subtle)" }} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <RevealEffect className="rounded-xl overflow-hidden">
            <button
              onClick={() => handleOAuth('google')}
              disabled={loading}
              type="button"
              className="w-full py-3 px-4 flex items-center justify-center gap-2 text-xs font-medium transition-all cursor-pointer"
              style={{
                backgroundColor: "var(--bg-frosted)",
                border: "1px solid var(--glass-border)",
                color: "var(--text-primary)",
                backdropFilter: "blur(8px)",
              }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.6 14.8 1 12 1 7.3 1 3.4 3.7 1.6 7.6l3.7 2.9C6.2 7.2 8.9 5 12 5z"/>
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.3 3.7l3.6 2.8c2.1-2 3.7-5 3.7-8.7z"/>
                <path fill="#FBBC05" d="M5.3 14.8c-.2-.7-.3-1.5-.3-2.3s.1-1.6.3-2.3L1.6 7.3C.6 9.2 0 11.5 0 12.5s.6 3.3 1.6 5.2l3.7-2.9z"/>
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.6-2.8c-1.1.7-2.5 1.2-4.4 1.2-3.1 0-5.8-2.2-6.7-5.5L1.6 15.8C3.4 19.8 7.3 23 12 23z"/>
              </svg>
              Google
            </button>
          </RevealEffect>

          <RevealEffect className="rounded-xl overflow-hidden">
            <button
              onClick={() => handleOAuth('linkedin_oidc')}
              disabled={loading}
              type="button"
              className="w-full py-3 px-4 flex items-center justify-center gap-2 text-xs font-medium transition-all cursor-pointer"
              style={{
                backgroundColor: "var(--bg-frosted)",
                border: "1px solid var(--glass-border)",
                color: "var(--text-primary)",
                backdropFilter: "blur(8px)",
              }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#0A66C2">
                <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5V9h3v10zM6.5 7.8A1.8 1.8 0 118.3 6a1.8 1.8 0 01-1.8 1.8zM19 19h-3v-5.4c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9V19h-3V9h2.9v1.4h.1c.4-.8 1.4-1.6 3-1.6 3.2 0 3.8 2.1 3.8 4.8V19z"/>
              </svg>
              LinkedIn
            </button>
          </RevealEffect>
        </div>

        <p className="text-center text-sm mt-6" style={{ color: "var(--text-secondary)" }}>
          Don't have an account?{" "}
          <Link href={pendingInvite ? `/signup?invite_type=${pendingInvite.type}&invite_id=${pendingInvite.id}` : "/signup"} className="font-medium" style={{ color: "var(--accent-primary)" }}>
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}
