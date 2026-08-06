"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Building, Send, Globe, ShieldCheck, HelpCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import OfficialTag from "@/components/ui/OfficialTag";
import Button from "@/components/ui/Button";

interface CompanyCardProps {
  company: {
    id: string;
    name: string;
    handle: string;
    industry: string;
    size_range: string;
    website: string;
    verified: boolean;
    logo_url?: string;
    reach_enabled: boolean;
    reach_threshold: number;
    description?: string;
    isPartnered?: boolean;
  };
  index?: number;
}

export default function CompanyCard({ company, index = 0 }: CompanyCardProps) {
  const router = useRouter();
  const supabase = createClient();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentUserAura, setCurrentUserAura] = useState<number>(150);

  useEffect(() => {
    async function loadUserAura() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);

        if (user) {
          const { data: profile } = await supabase
            .from('users')
            .select('pulse_score')
            .eq('id', user.id)
            .single();
          if (profile) {
            setCurrentUserAura(profile.pulse_score || 150);
          }
        }
      } catch (error) {
        console.error("Error loading user Aura for company card:", error);
      }
    }
    loadUserAura();
  }, [supabase]);

  const handleReachClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      router.push("/login");
      return;
    }
    // Route to reach interface or company profile with reach parameter
    router.push(`/companies/${company.handle}?action=reach`);
  };

  const hasAccessToReach = currentUserAura >= company.reach_threshold;

  return (
    <motion.article
      onClick={() => router.push(`/companies/${company.handle}`)}
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
        borderColor: "rgba(255, 255, 255, 0.35)", // Neon white/silver border highlight
        boxShadow: "0 8px 32px rgba(255, 255, 255, 0.08), 0 2px 8px rgba(0,0,0,0.4)",
      }}
    >
      {/* Header Info */}
      <div className="flex gap-3 mb-3">
        {/* Logo Container */}
        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex-shrink-0 flex items-center justify-center">
          {company.logo_url ? (
            <img src={company.logo_url} alt={company.name} className="w-full h-full object-cover" />
          ) : (
            <Building className="w-6 h-6 text-white/50" />
          )}
        </div>

        {/* Name & Industry */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <h3 className="font-semibold text-sm text-[var(--text-primary)] truncate font-display">
              {company.name}
            </h3>
            <OfficialTag entityId={company.id} />
          </div>
          <p className="text-xs text-white/50 font-mono">@{company.handle || "company"}</p>
          <p className="text-[11px] text-white/40 truncate mt-0.5">{company.industry} • {company.size_range} employees</p>
        </div>
      </div>

      {/* Partnered / Reach info row */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {company.isPartnered && (
          <span className="inline-flex items-center gap-1 rounded-full text-[9px] font-bold px-2 py-0.5 border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
            🏡 Campus Partner
          </span>
        )}
        {company.reach_enabled && (
          <span 
            className={`inline-flex items-center gap-1 rounded-full text-[9px] font-bold px-2 py-0.5 border ${
              hasAccessToReach 
                ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
                : "border-red-500/30 bg-red-500/10 text-red-400"
            }`}
          >
            📩 Reach Gate: {company.reach_threshold}+ Aura
          </span>
        )}
      </div>

      {/* Description */}
      {company.description && (
        <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed mb-4">
          {company.description}
        </p>
      )}

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-white/5" onClick={e => e.stopPropagation()}>
        <Button
          variant="primary"
          size="sm"
          className="flex-1 justify-center py-1 text-xs gap-1"
          style={{
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            color: "#fff"
          }}
          whileHover={{
            background: "rgba(255, 255, 255, 0.15)",
          }}
          onClick={() => router.push(`/companies/${company.handle}`)}
        >
          View Profile
        </Button>
        {company.reach_enabled && (
          <Button
            variant="ghost"
            size="sm"
            className={`flex-1 justify-center py-1 text-xs gap-1 border-white/10 ${
              hasAccessToReach 
                ? "text-cyan-400 hover:text-cyan-300 border-cyan-500/20" 
                : "text-white/30 cursor-not-allowed hover:bg-transparent"
            }`}
            onClick={handleReachClick}
            disabled={!hasAccessToReach}
          >
            <Send className="w-3.5 h-3.5" />
            Send Reach
          </Button>
        )}
      </div>
    </motion.article>
  );
}
