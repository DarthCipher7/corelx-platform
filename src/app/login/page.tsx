"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

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

  return (
    <div className="min-h-screen pt-32 pb-24 px-4 flex items-center justify-center relative">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at top, var(--accent-cyan-glow) 0%, var(--bg-void) 70%)" }} />
      
      <div className="w-full max-w-md glass-card rounded-2xl p-8 relative z-10 animate-fade-in-up">
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
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Password</label>
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

        <p className="text-center text-sm mt-6" style={{ color: "var(--text-secondary)" }}>
          Don't have an account?{" "}
          <Link href="/signup" className="font-medium" style={{ color: "var(--accent-primary)" }}>
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}
