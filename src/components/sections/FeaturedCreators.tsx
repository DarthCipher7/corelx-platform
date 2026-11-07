import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

interface CreatorRecord {
  id: string;
  handle: string;
  display_name: string | null;
  tagline: string | null;
  avatar_url: string | null;
  aura_tier: string | null;
  skills: string[] | string | null;
}

interface AuraConfig {
  label: string;
  color: string;
  gradient: string;
  glow: string;
  shadowHover: string;
}

const AURA_TIER_CONFIG: Record<string, AuraConfig> = {
  pillar: {
    label: "Pillar",
    color: "#fdcb6e",
    gradient: "linear-gradient(135deg, #fdcb6e 0%, #e17055 100%)",
    glow: "rgba(253, 203, 110, 0.4)",
    shadowHover: "0 12px 32px -4px rgba(253, 203, 110, 0.35)",
  },
  core: {
    label: "Core",
    color: "#fd79a8",
    gradient: "linear-gradient(135deg, #fd79a8 0%, #6c5ce7 100%)",
    glow: "rgba(253, 121, 168, 0.4)",
    shadowHover: "0 12px 32px -4px rgba(253, 121, 168, 0.35)",
  },
  trusted: {
    label: "Trusted",
    color: "#00d2ff",
    gradient: "linear-gradient(135deg, #00d2ff 0%, #6c5ce7 100%)",
    glow: "rgba(0, 210, 255, 0.4)",
    shadowHover: "0 12px 32px -4px rgba(0, 210, 255, 0.35)",
  },
  rising: {
    label: "Rising",
    color: "#6c5ce7",
    gradient: "linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)",
    glow: "rgba(108, 92, 231, 0.4)",
    shadowHover: "0 12px 32px -4px rgba(108, 92, 231, 0.35)",
  },
  new: {
    label: "New",
    color: "#a8a8c4",
    gradient: "linear-gradient(135deg, #a8a8c4 0%, #5a5a7a 100%)",
    glow: "rgba(168, 168, 196, 0.25)",
    shadowHover: "0 12px 32px -4px rgba(168, 168, 196, 0.25)",
  },
};

export default async function FeaturedCreators() {
  const supabase = await createClient();

  let creators: CreatorRecord[] | null = null;
  try {
    const { data } = await supabase
      .from("users")
      .select("id, handle, display_name, tagline, avatar_url, aura_tier, skills")
      .eq("account_type", "creator")
      .order("created_at", { ascending: false })
      .limit(6);

    creators = data as CreatorRecord[] | null;
  } catch (error) {
    console.error("Error fetching featured creators from Supabase:", error);
  }

  // Graceful empty state
  if (!creators || creators.length === 0) {
    return (
      <section className="py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <div className="mb-14 text-left">
            <p className="label-mono mb-3">Featured Creators</p>
            <h2 className="display-lg text-[var(--text-primary)] tracking-tight">
              The builders shaping
              <br />
              <span className="gradient-text">what's next.</span>
            </h2>
          </div>

          <div className="glass-card rounded-2xl p-12 text-center max-w-xl mx-auto border border-[rgba(255,255,255,0.06)] shadow-[0_16px_40px_rgba(0,0,0,0.4)]">
            <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center bg-[rgba(108,92,231,0.12)] border border-[rgba(108,92,231,0.3)] text-[#00d2ff] text-lg">
              ✦
            </div>
            <h3
              className="text-xl font-bold mb-2 text-[var(--text-primary)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Be among the first.
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-sm mx-auto leading-relaxed">
              Claim your handle, build your reputation, and start collaborating with top creators worldwide.
            </p>
            <Link href="/signup">
              <button className="btn-primary !py-3 !px-7 !text-xs font-mono uppercase tracking-wider inline-flex items-center gap-2">
                <span>Join CORELX</span>
                <span className="text-[#00d2ff]">✦</span>
              </button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-14 gap-6">
          <div className="text-left">
            <p className="label-mono mb-3">Featured Creators</p>
            <h2 className="display-lg text-[var(--text-primary)] tracking-tight">
              The builders shaping
              <br />
              <span className="gradient-text">what's next.</span>
            </h2>
          </div>
          <Link
            href="/explore"
            className="group inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <span>Explore all creators</span>
            <span className="text-[#00d2ff]">✦</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Layout: Horizontal scroll strip on mobile (overflow-x: auto, snap-x mandatory, no scrollbar), 3-col grid on desktop */}
        <div className="flex lg:grid lg:grid-cols-3 gap-6 overflow-x-auto lg:overflow-x-visible snap-x snap-mandatory scrollbar-hide pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
          {creators.map((creator) => {
            const rawTier = creator.aura_tier?.toLowerCase() || "new";
            const aura = AURA_TIER_CONFIG[rawTier] || AURA_TIER_CONFIG.new;

            // Normalize skills array
            let skills: string[] = [];
            if (Array.isArray(creator.skills)) {
              skills = creator.skills;
            } else if (typeof creator.skills === "string") {
              try {
                skills = JSON.parse(creator.skills);
              } catch {
                skills = [creator.skills];
              }
            }

            const initialLetter = (
              creator.display_name ||
              creator.handle ||
              "C"
            )
              .charAt(0)
              .toUpperCase();

            return (
              <div
                key={creator.id}
                className="group relative rounded-2xl p-6 glass-card border border-[rgba(255,255,255,0.06)] transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between shrink-0 w-[85vw] sm:w-[340px] lg:w-auto snap-center"
                style={{
                  ["--tier-color" as string]: aura.color,
                  ["--tier-shadow" as string]: aura.shadowHover,
                }}
              >
                {/* Aura border glow on hover via CSS styles */}
                <div
                  className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    boxShadow: `inset 0 0 0 1px ${aura.color}, ${aura.shadowHover}`,
                  }}
                />

                <div className="relative z-10">
                  {/* Top card row: Avatar with Aura gradient ring + Tier Badge */}
                  <div className="flex items-start justify-between gap-4 mb-5">
                    {/* Avatar image with Aura gradient ring (wrapper with gradient bg and 2px padding) */}
                    <div
                      className="w-16 h-16 rounded-full shrink-0 relative"
                      style={{
                        background: aura.gradient,
                        padding: "2px",
                        boxShadow: `0 0 14px ${aura.glow}`,
                      }}
                    >
                      <div className="w-full h-full rounded-full overflow-hidden bg-[var(--bg-elevated)] relative flex items-center justify-center">
                        {creator.avatar_url ? (
                          <Image
                            src={creator.avatar_url}
                            alt={creator.display_name || creator.handle || "Creator"}
                            fill
                            sizes="64px"
                            className="object-cover rounded-full"
                            unoptimized
                          />
                        ) : (
                          <span className="font-mono font-bold text-lg text-[var(--text-primary)] select-none">
                            {initialLetter}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Aura tier badge */}
                    <div
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border"
                      style={{
                        backgroundColor: `${aura.color}15`,
                        borderColor: `${aura.color}40`,
                        color: aura.color,
                      }}
                    >
                      <span>{aura.label}</span>
                      <span>✦</span>
                    </div>
                  </div>

                  {/* Creator identity */}
                  <div className="mb-3">
                    <h3
                      className="text-lg font-bold text-[var(--text-primary)] truncate"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {creator.display_name || creator.handle}
                    </h3>
                    <p className="font-mono text-xs text-[var(--text-secondary)] truncate">
                      @{creator.handle}
                    </p>
                  </div>

                  {/* Tagline (1-2 lines max, truncated) */}
                  <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed mb-4 min-h-[2rem]">
                    {creator.tagline || "Creator & digital craftsperson building on CORELX."}
                  </p>

                  {/* Skill tags: up to 3 */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {skills.slice(0, 3).map((skill) => (
                      <span key={skill} className="skill-badge !text-[11px] !py-0.5 !px-2.5">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* View Profile link */}
                <div className="relative z-10 pt-4 mt-2 border-t border-[rgba(255,255,255,0.06)]">
                  <Link
                    href={`/${creator.handle}`}
                    className="inline-flex items-center justify-between w-full text-xs font-mono text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <span>View Profile</span>
                      <span style={{ color: aura.color }}>✦</span>
                    </span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
