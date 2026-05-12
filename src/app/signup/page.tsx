"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [handle, setHandle] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1. Sign up the user in auth.users
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      // 2. Insert the public user record
      const { error: dbError } = await supabase
        .from("users")
        .insert({
          id: authData.user.id,
          handle: handle,
          name: name || handle,
          // default avatar
          avatar_url: `https://api.dicebear.com/8.x/lorelei/svg?seed=${handle}&backgroundColor=6c5ce7`
        });

      if (dbError) {
        // Handle constraint violations, etc.
        setError(dbError.message);
        setLoading(false);
        return;
      }
      
      router.push("/feed");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24 px-4 flex items-center justify-center relative">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at top, var(--accent-primary-glow) 0%, var(--bg-void) 70%)" }} />
      
      <div className="w-full max-w-md glass-card rounded-2xl p-8 relative z-10 animate-fade-in-up">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold mb-2" style={{ color: "var(--text-primary)" }}>Join CORELX</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Create your creator identity.</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Email</label>
            <input
              type="email"
              required
              className="w-full rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-400 transition-colors"
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
              className="w-full rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-400 transition-colors"
              style={{ backgroundColor: "var(--bg-deep)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Unique Handle</label>
            <input
              type="text"
              required
              className="w-full rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-400 transition-colors"
              style={{ backgroundColor: "var(--bg-deep)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
              placeholder="e.g. aria.creates"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Display Name</label>
            <input
              type="text"
              required
              className="w-full rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-400 transition-colors"
              style={{ backgroundColor: "var(--bg-deep)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
              placeholder="e.g. Aria Chen"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <Button variant="primary" className="w-full justify-center mt-6" disabled={loading}>
            {loading ? "Creating..." : "Sign Up"}
          </Button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: "var(--text-secondary)" }}>
          Already have an account?{" "}
          <Link href="/login" className="font-medium" style={{ color: "var(--accent-cyan)" }}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
