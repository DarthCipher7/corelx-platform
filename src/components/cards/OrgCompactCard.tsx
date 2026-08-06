"use client";

import { motion } from "framer-motion";
import { Users, Globe, Lock, Unlock, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import OfficialTag from "@/components/ui/OfficialTag";
import Button from "@/components/ui/Button";

interface OrgCompactCardProps {
  id: string;
  name: string;
  handle: string;
  logo_url?: string;
  type: string;
  join_policy: string;
  verified: boolean;
  memberCount: number;
  college?: string | null;
  isMember?: boolean;
  index?: number;
}

export default function OrgCompactCard({
  id,
  name,
  handle,
  logo_url,
  type,
  join_policy,
  verified,
  memberCount,
  college,
  isMember = false,
  index = 0,
}: OrgCompactCardProps) {
  const router = useRouter();

  // Get nice capitalised label for org type
  const typeLabel = type ? type.charAt(0).toUpperCase() + type.slice(1) : "Club";

  // Emoji helper for org type
  const typeEmoji = 
    type === "club" ? "🎯" :
    type === "society" ? "🏡" :
    type === "community" ? "🤝" :
    type === "alumni" ? "🎓" : "🏛️";

  return (
    <motion.article
      onClick={() => router.push(`/orgs/${handle}`)}
      className="relative flex flex-col rounded-2xl p-4 backdrop-blur-xl cursor-pointer group transition-all"
      style={{
        background: "var(--bg-frosted)",
        border: "1px solid var(--glass-border)",
        boxShadow: "0 4px 24px rgba(0, 0, 0, 0.3)",
      }}
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{
        y: -4,
        borderColor: "rgba(167, 139, 250, 0.4)", // Purple/violet accent hover highlight
        boxShadow: "0 8px 32px rgba(167, 139, 250, 0.15), 0 2px 8px rgba(0,0,0,0.4)",
      }}
    >
      {/* Header Info */}
      <div className="flex gap-3 mb-3">
        {/* Logo Container */}
        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex-shrink-0 flex items-center justify-center">
          {logo_url ? (
            <img src={logo_url} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xl font-bold text-purple-400">
              {name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Name & Handle */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <h3 className="font-semibold text-sm text-[var(--text-primary)] truncate font-display">
              {name}
            </h3>
            <OfficialTag entityId={id} />
          </div>
          <p className="text-xs text-purple-400 font-mono">@{handle || "hub"}</p>
          <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
            {typeEmoji} {typeLabel} {college ? `• ${college}` : ""}
          </p>
        </div>
      </div>

      {/* Stats/Badges row */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <span className="inline-flex items-center gap-1 rounded-full text-[10px] font-semibold px-2 py-0.5 border border-white/5 bg-white/5 text-[var(--text-secondary)]">
          <Users className="w-3 h-3 text-purple-400" />
          {memberCount} {memberCount === 1 ? "member" : "members"}
        </span>
        <span 
          className={`inline-flex items-center gap-1 rounded-full text-[10px] font-semibold px-2 py-0.5 border ${
            join_policy === "open"
              ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
              : "border-amber-500/20 bg-amber-500/5 text-amber-400"
          }`}
        >
          {join_policy === "open" ? (
            <>
              <Unlock className="w-2.5 h-2.5" />
              Open Join
            </>
          ) : (
            <>
              <Lock className="w-2.5 h-2.5" />
              Gated Hub
            </>
          )}
        </span>
      </div>

      <div className="flex-1" />

      {/* Action CTA */}
      <div className="pt-2 border-t border-white/5" onClick={e => e.stopPropagation()}>
        <Button
          variant="primary"
          size="sm"
          className="w-full justify-center py-1 text-xs gap-1"
          style={{
            background: "rgba(167, 139, 250, 0.08)",
            border: "1px solid rgba(167, 139, 250, 0.15)",
            color: "#a78bfa"
          }}
          whileHover={{
            background: "rgba(167, 139, 250, 0.16)",
            boxShadow: "0 0 12px rgba(167, 139, 250, 0.2)"
          }}
          onClick={() => router.push(`/orgs/${handle}`)}
        >
          View Hub
          <ArrowRight className="w-3 h-3" />
        </Button>
      </div>
    </motion.article>
  );
}
