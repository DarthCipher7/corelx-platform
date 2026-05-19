import { Zap } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-void)] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 50%, var(--accent-primary) 0%, transparent 50%)" }} />
      
      <div className="relative z-10 flex flex-col items-center text-center max-w-md">
        <Link href="/" className="flex items-center justify-center gap-3 mb-8 group">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #6c5ce7, #00d2ff)",
              boxShadow: "0 0 24px rgba(108,92,231,0.6)",
            }}
          >
            <Zap className="w-6 h-6 text-white" />
          </div>
          <span
            className="text-3xl font-bold tracking-tight"
            style={{
              fontFamily: "var(--font-display)",
              background: "linear-gradient(135deg, #f0f0ff, #a29bfe)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            CORELX
          </span>
        </Link>
        
        <h1 className="text-4xl font-display font-bold text-white mb-4">Privacy Policy</h1>
        <p className="text-xl text-[var(--text-secondary)] mb-8">Coming soon.</p>
        
        <Link 
          href="/"
          className="px-6 py-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-white hover:border-[var(--accent-primary)] hover:bg-[var(--glass-hover)] transition-all font-medium"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
