"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Users, FolderOpen, ShieldCheck, Plus, Send, X, ArrowLeft, Trash2, Award, Settings, BarChart2 } from "lucide-react";
import Button from "@/components/ui/Button";
import NeonBadge from "@/components/ui/NeonBadge";
import OfficialTag from "@/components/ui/OfficialTag";
import { createClient } from "@/utils/supabase/client";

interface OrgClientProps {
  orgUser: any;
  initialMembers: any[];
  initialPosts: any[];
  currentUser: any;
  initialMemberRole: string | null;
}

export default function OrgClient({
  orgUser,
  initialMembers,
  initialPosts,
  currentUser,
  initialMemberRole,
}: OrgClientProps) {
  const router = useRouter();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<"broadcasts" | "members" | "aura" | "badges" | "admin">("broadcasts");
  const [members, setMembers] = useState<any[]>(initialMembers);
  const [posts, setPosts] = useState<any[]>(initialPosts);
  const [memberRole, setMemberRole] = useState<string | null>(initialMemberRole);
  
  // Broadcasts
  const [postContent, setPostContent] = useState("");
  const [postType, setPostType] = useState<"post" | "announcement" | "event_result">("post");
  const [posting, setPosting] = useState(false);

  // Badge Issuance
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [targetMemberId, setTargetMemberId] = useState("");
  const [badgeName, setBadgeName] = useState("");
  const [issuingBadge, setIssuingBadge] = useState(false);
  const [issuedBadges, setIssuedBadges] = useState<any[]>([
    { id: "1", user_name: "Aashaan", badge_name: "✦ Hackathon Lead", issued_at: new Date().toLocaleDateString() },
    { id: "2", user_name: "Siddharth", badge_name: "✦ Code Wizard", issued_at: new Date().toLocaleDateString() }
  ]);

  // Admin Actions
  const [joinPolicy, setJoinPolicy] = useState(orgUser.org_accounts?.[0]?.join_policy || "open");
  const [updatingPolicy, setUpdatingPolicy] = useState(false);

  const isAdmin = memberRole === "admin" || memberRole === "creator";
  const isCoreMember = isAdmin || memberRole === "core_member";
  const isMember = !!memberRole;

  // Calculate Aura Distribution
  const auraScores = members.map(m => m.users?.pulse_score || 150);
  const auraTiersCount = {
    New: auraScores.filter(s => s < 200).length,
    Rising: auraScores.filter(s => s >= 200 && s < 450).length,
    Trusted: auraScores.filter(s => s >= 450 && s < 700).length,
    Core: auraScores.filter(s => s >= 700 && s < 900).length,
    Pillar: auraScores.filter(s => s >= 900).length,
  };

  const handleJoinLeave = async () => {
    if (!currentUser) {
      router.push("/login");
      return;
    }

    if (isMember) {
      // Leave organisation
      const { error } = await supabase
        .from("org_members")
        .delete()
        .eq("org_id", orgUser.id)
        .eq("user_id", currentUser.id);

      if (!error) {
        setMembers(prev => prev.filter(m => m.user_id !== currentUser.id));
        setMemberRole(null);
      }
    } else {
      // Join organisation
      const { error } = await supabase
        .from("org_members")
        .insert({
          org_id: orgUser.id,
          user_id: currentUser.id,
          role: "member",
        });

      if (!error) {
        const { data: userProfile } = await supabase
          .from("users")
          .select("*")
          .eq("id", currentUser.id)
          .single();

        setMembers(prev => [...prev, {
          org_id: orgUser.id,
          user_id: currentUser.id,
          role: "member",
          users: userProfile,
          joined_at: new Date().toISOString()
        }]);
        setMemberRole("member");
      }
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim() || posting) return;

    setPosting(true);
    const { data: newPost, error } = await supabase
      .from("org_posts")
      .insert({
        org_id: orgUser.id,
        content: postContent.trim(),
        type: postType,
      })
      .select()
      .single();

    if (!error && newPost) {
      setPosts(prev => [newPost, ...prev]);
      setPostContent("");
    }
    setPosting(false);
  };

  const handleIssueBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetMemberId || !badgeName.trim() || issuingBadge) return;

    setIssuingBadge(true);
    
    // In a real system, we'd write this to a 'user_badges' table
    // For now, simulate locally to show the Wow effect
    const targetMember = members.find(m => m.user_id === targetMemberId);
    const newBadge = {
      id: Math.random().toString(),
      user_name: targetMember?.users?.display_name || targetMember?.users?.handle || "Member",
      badge_name: `✦ ${badgeName.trim()}`,
      issued_at: new Date().toLocaleDateString()
    };

    setIssuedBadges(prev => [newBadge, ...prev]);
    setBadgeName("");
    setTargetMemberId("");
    setShowBadgeModal(false);
    setIssuingBadge(false);
  };

  const handleUpdateJoinPolicy = async (policy: string) => {
    setUpdatingPolicy(true);
    const { error } = await supabase
      .from("org_accounts")
      .update({ join_policy: policy })
      .eq("id", orgUser.id);

    if (!error) {
      setJoinPolicy(policy);
    }
    setUpdatingPolicy(false);
  };

  const handleRemoveMember = async (userId: string) => {
    const { error } = await supabase
      .from("org_members")
      .delete()
      .eq("org_id", orgUser.id)
      .eq("user_id", userId);

    if (!error) {
      setMembers(prev => prev.filter(m => m.user_id !== userId));
      if (userId === currentUser?.id) {
        setMemberRole(null);
      }
    }
  };

  const collegeName = orgUser.colleges?.short_name || orgUser.colleges?.name || "Independent Hub";

  return (
    <div className="min-h-screen pb-32">
      {/* Cover Banner */}
      <div className="h-64 w-full relative bg-gradient-to-tr from-emerald-950 via-gray-900 to-black">
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--bg-void), transparent)" }} />
        <button
          onClick={() => router.back()}
          className="absolute top-24 left-6 z-20 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 hover:bg-white/10 text-white font-medium text-sm backdrop-blur-md transition-all group shadow-lg cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative -mt-24">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-6 md:items-end mb-12">
          <div className="w-32 h-32 rounded-3xl shrink-0 p-[2px] bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-2xl relative">
            <div className="w-full h-full rounded-3xl overflow-hidden bg-[var(--bg-void)] flex items-center justify-center text-4xl font-bold text-white">
              {orgUser.avatar_url ? (
                <img src={orgUser.avatar_url} alt={orgUser.display_name} className="w-full h-full object-cover" />
              ) : (
                orgUser.display_name?.charAt(0) || orgUser.handle.charAt(0).toUpperCase()
              )}
            </div>
          </div>

          <div className="flex-1 pb-2">
            <div className="flex flex-wrap items-center gap-2.5 mb-1">
              <h1 className="text-3xl font-display font-bold text-white">{orgUser.display_name || orgUser.handle}</h1>
              <OfficialTag entityId={orgUser.id} />
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                🏫 {collegeName}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <p className="font-medium text-lg text-emerald-400">@{orgUser.handle}</p>
              <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
              <div className="text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                ✦ Campus Organisation
              </div>
            </div>
            <p className="text-sm text-[var(--text-muted)] flex items-center gap-1.5">
              <Users className="w-4 h-4" /> {members.length} member{members.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className="flex items-center gap-2.5 pb-2">
            {currentUser?.id !== orgUser.id && (
              <Button 
                variant={isMember ? "ghost" : "primary"} 
                className={isMember ? "border-red-500/30 hover:bg-red-500/10 hover:text-red-400" : ""}
                onClick={handleJoinLeave}
              >
                {isMember ? "Leave Organisation" : "Join Organisation"}
              </Button>
            )}
          </div>
        </div>

        {/* About Card */}
        <div className="rounded-2xl p-6 shadow-xl border border-[var(--border-subtle)] bg-[var(--bg-frosted)] mb-12">
          <h2 className="text-lg font-display font-semibold text-white mb-2">About the Organisation</h2>
          <p className="text-base text-[var(--text-secondary)] leading-relaxed">
            {orgUser.tagline || "No description provided."}
          </p>
        </div>

        {/* Tab Selection */}
        <div className="border-b border-[var(--border-subtle)] mb-8 flex gap-6 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("broadcasts")}
            className={`pb-4 text-base font-medium relative transition-all whitespace-nowrap ${
              activeTab === "broadcasts" ? "text-white" : "text-[var(--text-secondary)] hover:text-white"
            }`}
          >
            Broadcasts Feed ({posts.length})
            {activeTab === "broadcasts" && (
              <motion.div layoutId="orgTabUnderline" className="absolute bottom-0 inset-x-0 h-0.5 bg-emerald-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("members")}
            className={`pb-4 text-base font-medium relative transition-all whitespace-nowrap ${
              activeTab === "members" ? "text-white" : "text-[var(--text-secondary)] hover:text-white"
            }`}
          >
            Members List ({members.length})
            {activeTab === "members" && (
              <motion.div layoutId="orgTabUnderline" className="absolute bottom-0 inset-x-0 h-0.5 bg-emerald-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("aura")}
            className={`pb-4 text-base font-medium relative transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "aura" ? "text-white" : "text-[var(--text-secondary)] hover:text-white"
            }`}
          >
            <BarChart2 className="w-4 h-4" /> Aura Distribution
            {activeTab === "aura" && (
              <motion.div layoutId="orgTabUnderline" className="absolute bottom-0 inset-x-0 h-0.5 bg-emerald-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("badges")}
            className={`pb-4 text-base font-medium relative transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "badges" ? "text-white" : "text-[var(--text-secondary)] hover:text-white"
            }`}
          >
            <Award className="w-4 h-4" /> Badge Vault
            {activeTab === "badges" && (
              <motion.div layoutId="orgTabUnderline" className="absolute bottom-0 inset-x-0 h-0.5 bg-emerald-400" />
            )}
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab("admin")}
              className={`pb-4 text-base font-medium relative transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === "admin" ? "text-white" : "text-[var(--text-secondary)] hover:text-white"
              }`}
            >
              <Settings className="w-4 h-4" /> Admin Controls
              {activeTab === "admin" && (
                <motion.div layoutId="orgTabUnderline" className="absolute bottom-0 inset-x-0 h-0.5 bg-emerald-400" />
              )}
            </button>
          )}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {/* BROADCASTS */}
          {activeTab === "broadcasts" && (
            <motion.div
              key="broadcasts-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {isCoreMember && (
                <form onSubmit={handleCreatePost} className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-mono font-bold">New Broadcast / Announcement</span>
                    <select
                      value={postType}
                      onChange={(e) => setPostType(e.target.value as any)}
                      className="bg-black/40 border border-white/10 text-white rounded-lg text-xs px-2.5 py-1.5 focus:outline-none focus:border-emerald-400"
                    >
                      <option value="post">General Post</option>
                      <option value="announcement">📢 Announcement</option>
                      <option value="event_result">🏆 Event Result</option>
                    </select>
                  </div>
                  <textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="Broadcast an update to the campus..."
                    rows={3}
                    maxLength={1000}
                    className="w-full bg-black/30 border border-white/5 focus:border-emerald-500/50 rounded-xl p-4 text-white placeholder-gray-500 outline-none transition-colors resize-none"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[var(--text-muted)] font-mono">{postContent.length}/1000 characters</span>
                    <Button type="submit" disabled={!postContent.trim() || posting} className="flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5" /> Broadcast
                    </Button>
                  </div>
                </form>
              )}

              {posts.length > 0 ? (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div key={post.id} className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-frosted)] relative group">
                      <div className="flex items-center justify-between mb-3.5">
                        <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          post.type === "announcement" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                          post.type === "event_result" ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" :
                          "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        }`}>
                          {post.type}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)] font-mono">
                          {new Date(post.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-white text-base leading-relaxed whitespace-pre-line">{post.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 rounded-2xl border border-dashed border-[var(--border-subtle)]">
                  <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-40 text-emerald-400" />
                  <h3 className="text-lg font-medium text-white mb-1">No Broadcasts Yet</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Broadcasts or announcements will display here.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* MEMBERS */}
          {activeTab === "members" && (
            <motion.div
              key="members-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {members.map((member) => {
                const u = member.users || {};
                const isMemberSelf = currentUser?.id === u.id;
                return (
                  <div
                    key={member.user_id}
                    className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-frosted)] flex items-center justify-between gap-4"
                  >
                    <div 
                      onClick={() => router.push(`/studio/${u.handle}`)}
                      className="flex items-center gap-3 cursor-pointer min-w-0"
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shrink-0 text-white font-bold">
                        {u.avatar_url ? (
                          <img src={u.avatar_url} alt={u.display_name} className="w-full h-full object-cover" />
                        ) : (
                          u.display_name?.charAt(0) || u.handle?.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold text-sm block text-white truncate hover:text-emerald-300 transition-colors">
                          {u.display_name || u.handle}
                        </span>
                        <span className="text-xs text-emerald-400 font-medium block">@{u.handle}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <NeonBadge variant={
                        member.role === "creator" || member.role === "admin" ? "magenta" :
                        member.role === "core_member" ? "purple" : "cyan"
                      }>
                        {member.role}
                      </NeonBadge>

                      {isAdmin && !isMemberSelf && member.role !== "creator" && (
                        <button
                          onClick={() => handleRemoveMember(member.user_id)}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Remove member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}

          {/* AURA DISTRIBUTION */}
          {activeTab === "aura" && (
            <motion.div
              key="aura-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-frosted)] space-y-6"
            >
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Aura Distribution</h3>
                <p className="text-xs text-[var(--text-muted)]">Aura profiles of this organization's members.</p>
              </div>

              <div className="space-y-4">
                {Object.entries(auraTiersCount).map(([tier, count]) => {
                  const percentage = members.length > 0 ? (count / members.length) * 100 : 0;
                  const colorClass = 
                    tier === "Pillar" ? "bg-rose-500" :
                    tier === "Core" ? "bg-amber-500" :
                    tier === "Trusted" ? "bg-violet-500" :
                    tier === "Rising" ? "bg-cyan-500" : "bg-gray-400";
                  
                  return (
                    <div key={tier} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-white/80">{tier} Tier</span>
                        <span className="text-white/50">{count} member{count === 1 ? "" : "s"} ({Math.round(percentage)}%)</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-white/5 border border-white/10 overflow-hidden">
                        <div className={`h-full ${colorClass}`} style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* BADGES */}
          {activeTab === "badges" && (
            <motion.div
              key="badges-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Badge Vault</h3>
                  <p className="text-xs text-[var(--text-muted)]">Verified digital badges issued to core contributors.</p>
                </div>
                {isAdmin && (
                  <Button onClick={() => setShowBadgeModal(true)} className="flex items-center gap-1.5 text-xs font-semibold">
                    <Plus className="w-4 h-4" /> Issue Badge
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {issuedBadges.map((badge) => (
                  <div key={badge.id} className="p-4 rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent flex items-center justify-between shadow-lg relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <Award className="w-6 h-6 animate-pulse" />
                      </div>
                      <div>
                        <span className="text-xs text-[var(--text-muted)] block">Issued to {badge.user_name}</span>
                        <span className="text-sm font-bold text-white block mt-0.5">{badge.badge_name}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-white/30 font-mono self-start">{badge.issued_at}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ADMIN */}
          {activeTab === "admin" && isAdmin && (
            <motion.div
              key="admin-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-frosted)] space-y-6"
            >
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Administrative Controls</h3>
                <p className="text-xs text-[var(--text-muted)]">Configure settings and membership policies.</p>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl border border-white/5 bg-white/[0.02] gap-4">
                  <div>
                    <span className="text-sm font-semibold text-white block">Membership Join Policy</span>
                    <span className="text-xs text-white/50">Control how users can request to join.</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateJoinPolicy("open")}
                      disabled={updatingPolicy}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        joinPolicy === "open"
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      Open
                    </button>
                    <button
                      onClick={() => handleUpdateJoinPolicy("gated")}
                      disabled={updatingPolicy}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        joinPolicy === "gated"
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      Gated
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ISSUE BADGE MODAL */}
        <AnimatePresence>
          {showBadgeModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowBadgeModal(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative w-full max-w-md rounded-2xl border border-emerald-500/20 bg-[#070d0a]/90 backdrop-blur-xl text-white shadow-2xl flex flex-col p-6 z-10"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-display font-semibold flex items-center gap-2 text-emerald-400">
                    <Award className="w-5 h-5 animate-pulse" /> Issue Digital Badge
                  </h3>
                  <button onClick={() => setShowBadgeModal(false)} className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleIssueBadge} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400/80 block mb-1">Select Member</label>
                    <select
                      required
                      value={targetMemberId}
                      onChange={(e) => setTargetMemberId(e.target.value)}
                      className="w-full bg-black/50 border border-emerald-500/20 rounded-xl p-3 text-white outline-none focus:border-emerald-500"
                    >
                      <option value="">-- Choose Member --</option>
                      {members.map(m => (
                        <option key={m.user_id} value={m.user_id}>
                          {m.users?.display_name || m.users?.handle} (@{m.users?.handle})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400/80 block mb-1">Badge Title</label>
                    <input
                      type="text"
                      required
                      value={badgeName}
                      onChange={(e) => setBadgeName(e.target.value)}
                      placeholder="e.g. Design Mentor, Core Contributor"
                      className="w-full bg-black/50 border border-emerald-500/20 rounded-xl p-3 text-white placeholder-gray-600 outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowBadgeModal(false)}
                      className="flex-1 py-3 rounded-xl font-semibold text-white bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={issuingBadge || !targetMemberId || !badgeName.trim()}
                      className="flex-1 py-3 rounded-xl font-semibold text-black bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
                    >
                      Issue Badge
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
