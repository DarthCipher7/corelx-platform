"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { MOCK_FLARES } from "@/lib/data";
import FlaresViewer from "@/components/explore/FlaresViewer";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function FlaresClient() {
  const [flares, setFlares] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchFlares = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("flares")
          .select("*, users:users!flares_user_id_fkey(handle, display_name, avatar_url, aura_tier)")
          .order("created_at", { ascending: false })
          .limit(20);

        if (data && data.length > 0) {
          setFlares(data);
        } else {
          // Fallback to rich high-res MOCK_FLARES so the stream is vibrant
          setFlares(MOCK_FLARES);
        }
      } catch (err) {
        console.error("Error fetching flares:", err);
        setFlares(MOCK_FLARES);
      } finally {
        setLoading(false);
      }
    };

    fetchFlares();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-[#02020a] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[var(--accent-primary)] animate-spin" />
        <span className="font-mono text-xs text-[var(--text-muted)]">
          LOADING_FLARES_STREAM...
        </span>
      </div>
    );
  }

  if (flares.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 pt-28">
        <div className="w-16 h-16 rounded-2xl glass-card flex items-center justify-center mb-4 text-2xl border border-[var(--glass-border)]">
          🎬
        </div>
        <h2 className="display-md text-[var(--text-primary)] mb-2">No Flares yet</h2>
        <p className="text-sm text-[var(--text-secondary)] max-w-sm mb-6">
          Be the first creator to upload a 60-second video flare to the platform.
        </p>
        <Link href="/explore">
          <button className="btn-primary">
            <span>Explore Platform</span>
          </button>
        </Link>
      </div>
    );
  }

  return (
    <FlaresViewer
      flares={flares}
      initialIndex={0}
      onClose={() => router.push("/explore")}
    />
  );
}
