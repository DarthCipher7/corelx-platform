"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Mail, UserPlus, UserCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import OfficialTag from "@/components/ui/OfficialTag";
import Button from "@/components/ui/Button";

interface CompactIndividualCardProps {
  creator: {
    id: string;
    name: string;
    handle: string;
    avatar: string;
    role: string;
    pulse_score: number;
    skills: string[];
    availability_status?: string;
    online?: boolean;
  };
  index?: number;
}

const AURA_TIERS = [
  { min: 0, max: 199, name: "New", icon: "🌱", color: "#9ca3af" },
  { min: 200, max: 449, name: "Rising", icon: "⚡", color: "#22d3ee" },
  { min: 450, max: 699, name: "Trusted", icon: "🔥", color: "#a78bfa" },
  { min: 700, max: 899, name: "Core", icon: "💎", color: "#fbbf24" },
  { min: 900, max: 1000, name: "Pillar", icon: "🌟", color: "#f43f5e" }
];

function getAuraTier(score: number) {
  const normalizedScore = Math.max(0, Math.min(1000, score || 150));
  return AURA_TIERS.find(t => normalizedScore >= t.min && normalizedScore <= t.max) || AURA_TIERS[0];
}

export default function CompactIndividualCard({ creator, index = 0 }: CompactIndividualCardProps) {
  const router = useRouter();
  const supabase = createClient();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [loadingFollow, setLoadingFollow] = useState<boolean>(true);

  const tier = getAuraTier(creator.pulse_score);

  useEffect(() => {
    async function checkFollowStatus() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);

        if (user) {
          const { data: followRecord } = await supabase
            .from('follows')
            .select('id')
            .eq('follower_id', user.id)
            .eq('following_id', creator.id)
            .maybeSingle();
          setIsFollowing(!!followRecord);
        }
      } catch (error) {
        console.error("Error checking follow status:", error);
      } finally {
        setLoadingFollow(false);
      }
    }
    checkFollowStatus();
  }, [creator.id, supabase]);

  const toggleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      router.push("/login");
      return;
    }

    const nextIsFollowing = !isFollowing;
    setIsFollowing(nextIsFollowing);

    try {
      if (nextIsFollowing) {
        const { error } = await supabase.from('follows').insert({
          follower_id: currentUser.id,
          following_id: creator.id
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.from('follows').delete()
          .eq('follower_id', currentUser.id)
          .eq('following_id', creator.id);
        if (error) throw error;
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      setIsFollowing(!nextIsFollowing); // Rollback
    }
  };

  const handleMessageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      router.push("/login");
      return;
    }
    router.push(`/messages?with=${creator.id}`);
  };

  return (
    <motion.article
      onClick={() => router.push(`/studio/${creator.handle}`)}
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
        borderColor: "rgba(34, 211, 238, 0.4)", // Cyan border highlight on hover
        boxShadow: "0 8px 32px rgba(34, 211, 238, 0.15), 0 2px 8px rgba(0,0,0,0.4)",
      }}
    >
      {/* Header Info */}
      <div className="flex gap-3 mb-3">
        {/* Avatar Container */}
        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex-shrink-0">
          {creator.avatar ? (
            <img src={creator.avatar} alt={creator.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-bold text-white text-sm" style={{ background: "var(--accent-primary)" }}>
              {creator.name.charAt(0).toUpperCase()}
            </div>
          )}
          {creator.online && (
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[var(--bg-void)]" />
          )}
        </div>

        {/* Name & Handle */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <h3 className="font-semibold text-sm text-[var(--text-primary)] truncate font-display">
              {creator.name}
            </h3>
            <OfficialTag entityId={creator.id} />
          </div>
          <p className="text-xs text-cyan-400 font-mono">@{creator.handle}</p>
          <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">{creator.role}</p>
        </div>
      </div>

      {/* Aura Tier and Info tag */}
      <div className="flex items-center gap-2 mb-3">
        <span 
          className="inline-flex items-center gap-1 rounded-full text-[10px] font-bold px-2 py-0.5 border"
          style={{
            background: `${tier.color}15`,
            borderColor: `${tier.color}35`,
            color: tier.color
          }}
        >
          <span>{tier.icon}</span> {tier.name} Tier • {creator.pulse_score} Aura
        </span>
      </div>

      {/* Skills row */}
      {creator.skills.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {creator.skills.slice(0, 3).map((skill) => (
            <span key={skill} className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[var(--text-secondary)]">
              {skill}
            </span>
          ))}
          {creator.skills.length > 3 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/5 text-[var(--text-muted)]">
              +{creator.skills.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="flex-1" />

      {/* Action buttons */}
      <div className="flex gap-2 pt-2 border-t border-white/5" onClick={e => e.stopPropagation()}>
        <Button
          variant={isFollowing ? "ghost" : "primary"}
          size="sm"
          className="flex-1 justify-center py-1 text-xs gap-1"
          onClick={toggleFollow}
          disabled={loadingFollow || currentUser?.id === creator.id}
          style={!isFollowing && currentUser?.id !== creator.id ? {
            background: "var(--accent-primary)",
            borderColor: "rgba(108,92,231,0.5)",
            color: "#fff"
          } : undefined}
        >
          {isFollowing ? (
            <>
              <UserCheck className="w-3.5 h-3.5" />
              Following
            </>
          ) : (
            <>
              <UserPlus className="w-3.5 h-3.5" />
              Follow
            </>
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 justify-center py-1 text-xs gap-1 border-white/10 text-white/70 hover:text-white"
          onClick={handleMessageClick}
          disabled={currentUser?.id === creator.id}
        >
          <Mail className="w-3.5 h-3.5" />
          Message
        </Button>
      </div>
    </motion.article>
  );
}
