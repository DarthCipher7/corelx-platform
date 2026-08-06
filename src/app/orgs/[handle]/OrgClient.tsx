"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  Users, FolderOpen, ShieldCheck, Plus, Send, X, ArrowLeft, Trash2, Award, 
  Settings, BarChart2, Globe, FileText, Edit3, Image, 
  Calendar, Shield, Check, Briefcase, User, ExternalLink, AlertTriangle, Pin
} from "lucide-react";
import Button from "@/components/ui/Button";
import NeonBadge from "@/components/ui/NeonBadge";
import OfficialTag from "@/components/ui/OfficialTag";
import { createClient } from "@/utils/supabase/client";

import PodCard from "@/components/cards/PodCard";
import CreatePodModal from "@/components/cards/CreatePodModal";

interface OrgClientProps {
  orgUser: any;
  initialMembers: any[];
  initialPosts: any[];
  currentUser: any;
  initialMemberRole: string | null;
  initialCollabs?: any[];
  initialBadges?: any[];
  initialPartnerships?: any[];
  initialJoinRequests?: any[];
  initialPods?: any[];
}

const categoryStyles: Record<string, { theme: string; border: string; text: string; bg: string; pulse: string; badge: string }> = {
  club: {
    theme: "from-pink-500 to-rose-600",
    border: "border-pink-500/30",
    text: "text-pink-400",
    bg: "bg-pink-500/10",
    pulse: "shadow-pink-500/20",
    badge: "✦ Club"
  },
  society: {
    theme: "from-emerald-400 to-teal-500",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
    bg: "bg-emerald-500/10",
    pulse: "shadow-emerald-500/20",
    badge: "✦ Society"
  },
  community: {
    theme: "from-violet-500 to-purple-600",
    border: "border-violet-500/30",
    text: "text-violet-400",
    bg: "bg-violet-500/10",
    pulse: "shadow-violet-500/20",
    badge: "✦ Community"
  },
  alumni: {
    theme: "from-cyan-400 to-blue-500",
    border: "border-cyan-500/30",
    text: "text-cyan-400",
    bg: "bg-cyan-500/10",
    pulse: "shadow-cyan-500/20",
    badge: "✦ Alumni Network"
  },
  other: {
    theme: "from-amber-400 to-orange-500",
    border: "border-amber-500/30",
    text: "text-amber-400",
    bg: "bg-amber-500/10",
    pulse: "shadow-amber-500/20",
    badge: "✦ Campus Org"
  }
};

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  );
}

function LinkedinIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
      <rect x="2" y="9" width="4" height="12"></rect>
      <circle cx="4" cy="4" r="2"></circle>
    </svg>
  );
}

export default function OrgClient({
  orgUser,
  initialMembers,
  initialPosts,
  currentUser,
  initialMemberRole,
  initialCollabs = [],
  initialBadges = [],
  initialPartnerships = [],
  initialJoinRequests = [],
  initialPods = [],
}: OrgClientProps) {
  const router = useRouter();
  const supabase = createClient();

  const orgAccount = Array.isArray(orgUser.org_accounts)
    ? orgUser.org_accounts[0]
    : (orgUser.org_accounts || {});

  const orgType = orgAccount?.type || "other";
  const styles = categoryStyles[orgType] || categoryStyles.other;

  // Active page tabs
  const [activeTab, setActiveTab] = useState<"broadcasts" | "members" | "collabs" | "badges" | "aura" | "partners" | "admin" | "pods">("broadcasts");
  const [isAdminView, setIsAdminView] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Core Data states
  const [members, setMembers] = useState<any[]>(initialMembers);
  const [posts, setPosts] = useState<any[]>(initialPosts);
  const [collabs, setCollabs] = useState<any[]>(initialCollabs);
  const [badges, setBadges] = useState<any[]>(initialBadges);
  const [partnerships, setPartnerships] = useState<any[]>(initialPartnerships);
  const [joinRequests, setJoinRequests] = useState<any[]>(initialJoinRequests);
  const [pods, setPods] = useState<any[]>(initialPods);
  const [showCreatePodModal, setShowCreatePodModal] = useState(false);
  const [memberRole, setMemberRole] = useState<string | null>(initialMemberRole);

  // Org Settings / Metadata states
  const [displayName, setDisplayName] = useState(orgUser.display_name || "");
  const [tagline, setTagline] = useState(orgUser.tagline || "");
  const [description, setDescription] = useState(orgAccount?.description || "");
  const [website, setWebsite] = useState(orgAccount?.website || "");
  const [instagram, setInstagram] = useState(orgAccount?.instagram || "");
  const [linkedin, setLinkedin] = useState(orgAccount?.linkedin || "");
  const [joinPolicy, setJoinPolicy] = useState(orgAccount?.join_policy || "open");
  const [selectedCategory, setSelectedCategory] = useState(orgType);

  // File Upload states
  const [bannerUrl, setBannerUrl] = useState(orgAccount?.banner_url || "");
  const [avatarUrl, setAvatarUrl] = useState(orgUser.avatar_url || "");
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Edit / Status flags
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [savingAbout, setSavingAbout] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [postType, setPostType] = useState<"post" | "announcement" | "event_result">("post");
  const [posting, setPosting] = useState(false);

  // Modal / Issuance triggers
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [targetMemberId, setTargetMemberId] = useState("");
  const [badgeTitle, setBadgeTitle] = useState("");
  const [badgeEmoji, setBadgeEmoji] = useState("✦");
  const [issuingBadge, setIssuingBadge] = useState(false);

  // Danger zone account deletion
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);

  const isAdmin = memberRole === "admin" || memberRole === "creator";
  const isCoreMember = isAdmin || memberRole === "core_member";
  const isMember = !!memberRole;
  const isOwner = currentUser?.id === orgUser.id;

  // Real join request status for current user if gated
  const [userRequestStatus, setUserRequestStatus] = useState<string | null>(null);
  const [checkingRequest, setCheckingRequest] = useState(false);

  // Check if current user has an active join request
  useEffect(() => {
    async function checkPendingRequest() {
      if (!currentUser || isMember || joinPolicy !== "gated") return;
      setCheckingRequest(true);
      const { data } = await supabase
        .from("org_join_requests")
        .select("status")
        .eq("org_id", orgUser.id)
        .eq("user_id", currentUser.id)
        .maybeSingle();
      if (data) {
        setUserRequestStatus(data.status);
      }
      setCheckingRequest(false);
    }
    checkPendingRequest();
  }, [currentUser, isMember, joinPolicy, orgUser.id]);

  // Handle banner upload
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBanner(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${orgUser.id}_banner_${Date.now()}.${fileExt}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("media").getPublicUrl(fileName);
      const newUrl = data.publicUrl;

      const { error: updateError } = await supabase
        .from("org_accounts")
        .update({ banner_url: newUrl })
        .eq("id", orgUser.id);

      if (updateError) throw updateError;

      setBannerUrl(newUrl);
    } catch (err: any) {
      alert("Error uploading banner: " + err.message);
    } finally {
      setUploadingBanner(false);
    }
  };

  // Handle logo upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${orgUser.id}_logo_${Date.now()}.${fileExt}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("media").getPublicUrl(fileName);
      const newUrl = data.publicUrl;

      // Update users avatar_url
      const { error: userUpdateError } = await supabase
        .from("users")
        .update({ avatar_url: newUrl })
        .eq("id", orgUser.id);

      if (userUpdateError) throw userUpdateError;

      // Update logo_url in org_accounts
      await supabase
        .from("org_accounts")
        .update({ logo_url: newUrl })
        .eq("id", orgUser.id);

      setAvatarUrl(newUrl);
    } catch (err: any) {
      alert("Error uploading logo: " + err.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  // Save Settings & About metadata
  const handleSaveAbout = async () => {
    setSavingAbout(true);
    try {
      const { error: userError } = await supabase
        .from("users")
        .update({ 
          display_name: displayName,
          tagline: tagline 
        })
        .eq("id", orgUser.id);

      if (userError) throw userError;

      const { error: orgError } = await supabase
        .from("org_accounts")
        .update({
          description: description,
          website: website,
          instagram: instagram,
          linkedin: linkedin
        })
        .eq("id", orgUser.id);

      if (orgError) throw orgError;

      setIsEditingAbout(false);
    } catch (err: any) {
      alert("Error saving metadata: " + err.message);
    } finally {
      setSavingAbout(false);
    }
  };

  // Save Settings Tab Panel updates
  const handleSaveSettingsPanel = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      // Update basic fields
      const { error: userError } = await supabase
        .from("users")
        .update({ display_name: displayName, tagline: tagline })
        .eq("id", orgUser.id);
      
      if (userError) throw userError;

      // Update org specific fields
      const { error: orgError } = await supabase
        .from("org_accounts")
        .update({
          type: selectedCategory,
          join_policy: joinPolicy,
          website: website,
          instagram: instagram,
          linkedin: linkedin,
          description: description
        })
        .eq("id", orgUser.id);

      if (orgError) throw orgError;

      alert("Settings updated successfully!");
    } catch (err: any) {
      alert("Error saving settings: " + err.message);
    } finally {
      setSavingSettings(false);
    }
  };

  // Join or request to join organisation
  const handleJoinLeave = async () => {
    if (!currentUser) {
      router.push("/login");
      return;
    }

    if (isMember) {
      if (confirm("Are you sure you want to leave this organization?")) {
        const { error } = await supabase
          .from("org_members")
          .delete()
          .eq("org_id", orgUser.id)
          .eq("user_id", currentUser.id);

        if (!error) {
          setMembers(prev => prev.filter(m => m.user_id !== currentUser.id));
          setMemberRole(null);
        }
      }
    } else {
      if (joinPolicy === "gated") {
        if (userRequestStatus === "pending") {
          // Cancel request
          const { error } = await supabase
            .from("org_join_requests")
            .delete()
            .eq("org_id", orgUser.id)
            .eq("user_id", currentUser.id);

          if (!error) {
            setUserRequestStatus(null);
          }
        } else {
          // Submit request
          const { error } = await supabase
            .from("org_join_requests")
            .insert({
              org_id: orgUser.id,
              user_id: currentUser.id,
              status: "pending"
            });

          if (!error) {
            setUserRequestStatus("pending");
          } else {
            alert("Error sending request: " + error.message);
          }
        }
      } else {
        // Open registration - join directly
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
    }
  };

  // Broadcast Feed management
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
    } else if (error) {
      alert("Error posting broadcast: " + error.message);
    }
    setPosting(false);
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Delete this broadcast update?")) return;
    const { error } = await supabase
      .from("org_posts")
      .delete()
      .eq("id", postId);

    if (!error) {
      setPosts(prev => prev.filter(p => p.id !== postId));
    }
  };

  // Issue Digital Badge
  const handleIssueBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetMemberId || !badgeTitle.trim() || issuingBadge) return;

    setIssuingBadge(true);
    const { data: newBadge, error } = await supabase
      .from("org_badges")
      .insert({
        org_id: orgUser.id,
        awarded_to: targetMemberId,
        badge_name: badgeTitle.trim(),
        badge_emoji: badgeEmoji,
        issued_by: currentUser?.id
      })
      .select("*, awarded_to_user:users!org_badges_awarded_to_fkey(id, handle, avatar_url, display_name)")
      .single();

    if (!error && newBadge) {
      setBadges(prev => [newBadge, ...prev]);
      setBadgeTitle("");
      setTargetMemberId("");
      setShowBadgeModal(false);
    } else if (error) {
      alert("Error issuing badge: " + error.message);
    }
    setIssuingBadge(false);
  };

  const handleRevokeBadge = async (badgeId: string) => {
    if (!confirm("Are you sure you want to revoke this badge?")) return;
    const { error } = await supabase
      .from("org_badges")
      .delete()
      .eq("id", badgeId);

    if (!error) {
      setBadges(prev => prev.filter(b => b.id !== badgeId));
    } else {
      alert("Error revoking badge: " + error.message);
    }
  };

  // Join Requests Approvals
  const handleProcessRequest = async (requestId: string, approve: boolean) => {
    setProcessingId(requestId);
    const request = joinRequests.find(r => r.id === requestId);
    if (!request) return;

    try {
      if (approve) {
        // 1. Add to org_members
        const { error: memberError } = await supabase
          .from("org_members")
          .insert({
            org_id: orgUser.id,
            user_id: request.user_id,
            role: "member"
          });

        if (memberError) throw memberError;

        // 2. Update request status to approved
        const { error: statusError } = await supabase
          .from("org_join_requests")
          .update({ status: "approved" })
          .eq("id", requestId);

        if (statusError) throw statusError;

        // Add to local members list
        setMembers(prev => [...prev, {
          org_id: orgUser.id,
          user_id: request.user_id,
          role: "member",
          users: request.users,
          joined_at: new Date().toISOString()
        }]);
      } else {
        // Reject - update status
        const { error: statusError } = await supabase
          .from("org_join_requests")
          .update({ status: "rejected" })
          .eq("id", requestId);

        if (statusError) throw statusError;
      }

      // Remove from pending list
      setJoinRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (err: any) {
      alert("Error processing request: " + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  // Role management & updates
  const handleUpdateRole = async (userId: string, newRole: string) => {
    const { error } = await supabase
      .from("org_members")
      .update({ role: newRole })
      .eq("org_id", orgUser.id)
      .eq("user_id", userId);

    if (!error) {
      setMembers(prev => prev.map(m => m.user_id === userId ? { ...m, role: newRole } : m));
      if (userId === currentUser?.id) {
        setMemberRole(newRole);
      }
    } else {
      alert("Error updating role: " + error.message);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this member from the organization?")) return;
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
    } else {
      alert("Error removing member: " + error.message);
    }
  };

  // Danger zone Delete organization
  const handleDeleteOrganisation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteConfirmation !== "DELETE" || deletingAccount || !isOwner) return;

    setDeletingAccount(true);
    try {
      const { error } = await supabase.rpc("delete_current_user");
      if (error) throw error;
      
      router.push("/");
    } catch (err: any) {
      alert("Error deleting organization: " + err.message);
      setDeletingAccount(false);
    }
  };

  // Aura tiers calculations
  const auraScores = members.map(m => m.users?.pulse_score || 150);
  const totalAura = auraScores.reduce((a, b) => a + b, 0);
  const auraTiersCount = {
    Pillar: auraScores.filter(s => s >= 900).length,
    Core: auraScores.filter(s => s >= 700 && s < 900).length,
    Trusted: auraScores.filter(s => s >= 450 && s < 700).length,
    Rising: auraScores.filter(s => s >= 200 && s < 450).length,
    New: auraScores.filter(s => s < 200).length,
  };

  // Member Leaderboard (sorted by aura pulse)
  const leaderboard = [...members]
    .sort((a, b) => (b.users?.pulse_score || 0) - (a.users?.pulse_score || 0))
    .slice(0, 5);

  const collegeName = orgUser.colleges?.short_name || orgUser.colleges?.name || "Independent Hub";

  return (
    <div className="min-h-screen pb-32">
      {/* Cover Banner */}
      <div className="h-72 w-full relative bg-gradient-to-tr from-emerald-950 via-gray-900 to-black overflow-hidden border-b border-white/5">
        {bannerUrl ? (
          <img src={bannerUrl} alt="Cover Banner" className="w-full h-full object-cover opacity-80" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/20 via-cyan-950/30 to-black/50" />
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--bg-void), transparent)" }} />
        
        <button
          onClick={() => router.back()}
          className="absolute top-24 left-6 z-20 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 hover:bg-white/10 text-white font-medium text-sm backdrop-blur-md transition-all group shadow-lg cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>

        {isOwner && (
          <div className="absolute top-24 right-6 z-20">
            <input 
              type="file" 
              ref={bannerInputRef} 
              accept="image/*" 
              onChange={handleBannerUpload} 
              className="hidden" 
            />
            <button
              onClick={() => bannerInputRef.current?.click()}
              disabled={uploadingBanner}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 hover:bg-white/10 text-white font-medium text-sm backdrop-blur-md transition-all shadow-lg cursor-pointer"
            >
              <Image className="w-4 h-4" />
              {uploadingBanner ? "Uploading..." : "Edit Banner"}
            </button>
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative -mt-20 z-10">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-6 md:items-end mb-12">
          {/* Logo container */}
          <div className="w-36 h-36 rounded-3xl shrink-0 p-[2px] bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-2xl relative group">
            <div className="w-full h-full rounded-3xl overflow-hidden bg-[var(--bg-void)] flex items-center justify-center text-4xl font-bold text-white relative">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                displayName?.charAt(0) || orgUser.handle.charAt(0).toUpperCase()
              )}

              {isOwner && (
                <div 
                  onClick={() => logoInputRef.current?.click()}
                  className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-center p-2 text-xs font-semibold"
                >
                  <Image className="w-5 h-5 mb-1" />
                  {uploadingLogo ? "Uploading..." : "Edit Logo"}
                </div>
              )}
            </div>
            <input 
              type="file" 
              ref={logoInputRef} 
              accept="image/*" 
              onChange={handleLogoUpload} 
              className="hidden" 
            />
          </div>

          <div className="flex-1 pb-2">
            <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
              <h1 className="text-3xl font-display font-bold text-white">{displayName || orgUser.handle}</h1>
              <OfficialTag entityId={orgUser.id} />
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                🏫 {collegeName}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 mb-3">
              <p className="font-semibold text-lg text-emerald-400">@{orgUser.handle}</p>
              <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
              <div className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 ${styles.text}`}>
                {styles.badge}
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)] font-mono">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-white font-bold">{members.length}</span> member{members.length === 1 ? "" : "s"}
              </span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-pink-400" />
                <span className="text-white font-bold">{totalAura}</span> total pulse
              </span>
            </div>
          </div>

          {/* Join / Leave / Admin actions */}
          <div className="flex flex-wrap items-center gap-2.5 pb-2">
            {isOwner && (
              <button
                onClick={() => setIsAdminView(!isAdminView)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-xs font-semibold shadow-lg transition-all ${
                  isAdminView 
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Settings className="w-4 h-4" />
                {isAdminView ? "Visitor View" : "Admin Panel"}
              </button>
            )}

            {!isOwner && (
              <Button 
                variant={isMember ? "ghost" : "primary"} 
                disabled={checkingRequest}
                className={isMember ? "border-red-500/30 hover:bg-red-500/10 hover:text-red-400" : ""}
                onClick={handleJoinLeave}
              >
                {checkingRequest ? "Checking..." : 
                 isMember ? "Leave Organisation" : 
                 joinPolicy === "gated" ? (userRequestStatus === "pending" ? "Request Pending (Cancel)" : "Request to Join") : "Join Organisation"}
              </Button>
            )}
          </div>
        </div>

        {/* About / Inline edit Section */}
        <div className="rounded-2xl p-6 shadow-xl border border-[var(--border-subtle)] bg-[var(--bg-frosted)] mb-12 relative overflow-hidden group">
          <div className={`absolute top-0 left-0 w-2 h-full bg-gradient-to-b ${styles.theme}`} />
          
          <div className="flex justify-between items-start mb-3">
            <h2 className="text-lg font-display font-semibold text-white">About the Organisation</h2>
            {isOwner && !isEditingAbout && (
              <button 
                onClick={() => setIsEditingAbout(true)}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
          </div>

          {isEditingAbout ? (
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400/80 block mb-1">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400/80 block mb-1">One-liner Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400/80 block mb-1">Detailed Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-emerald-500 text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400/80 block mb-1">Website</label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://myclub.org"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-emerald-500 text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400/80 block mb-1">Instagram handle</label>
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="@myclub"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-emerald-500 text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400/80 block mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/company/myclub"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-emerald-500 text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button variant="ghost" onClick={() => setIsEditingAbout(false)}>Cancel</Button>
                <Button variant="primary" disabled={savingAbout} onClick={handleSaveAbout}>
                  {savingAbout ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-base text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap mb-6">
                {description || tagline || "No detailed description provided."}
              </p>

              {/* Social / Info Links */}
              <div className="flex flex-wrap gap-4 pt-4 border-t border-white/5 text-xs text-[var(--text-muted)] font-mono">
                {website && (
                  <a href={website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-emerald-300 transition-colors">
                    <Globe className="w-3.5 h-3.5" /> Website <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
                {instagram && (
                  <a href={`https://instagram.com/${instagram.replace('@','')}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-pink-400 transition-colors">
                    <InstagramIcon className="w-3.5 h-3.5" /> Instagram
                  </a>
                )}
                {linkedin && (
                  <a href={linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors">
                    <LinkedinIcon className="w-3.5 h-3.5" /> LinkedIn
                  </a>
                )}
                {!website && !instagram && !linkedin && (
                  <span className="italic">No links provided.</span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Tab Selection */}
        <div className="border-b border-[var(--border-subtle)] mb-8 flex gap-6 overflow-x-auto no-scrollbar">
          {[
            { id: "broadcasts", label: `Broadcasts (${posts.length})` },
            { id: "members", label: `Members (${members.length})` },
            { id: "collabs", label: `Collab Calls (${collabs.length})` },
            { id: "badges", label: `Badge Vault (${badges.length})` },
            { id: "pods", label: `Pods (${pods.length})` },
            { id: "aura", label: "Aura Metrics" },
            { id: "partners", label: `Partners (${partnerships.length})` },
            ...(isOwner && isAdminView ? [{ id: "admin", label: "Admin panel" }] : [])
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-4 text-base font-medium relative transition-all whitespace-nowrap ${
                activeTab === tab.id ? "text-white" : "text-[var(--text-secondary)] hover:text-white"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="orgTabUnderline" className={`absolute bottom-0 inset-x-0 h-0.5 bg-gradient-to-r ${styles.theme}`} />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {/* BROADCAST FEED */}
          {activeTab === "broadcasts" && (
            <motion.div
              key="broadcasts-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
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
                    className="w-full bg-black/30 border border-white/5 focus:border-emerald-500/50 rounded-xl p-4 text-white placeholder-gray-500 outline-none transition-colors resize-none text-sm"
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
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                            post.type === "announcement" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                            post.type === "event_result" ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" :
                            "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          }`}>
                            {post.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-[var(--text-muted)] font-mono">
                            {new Date(post.created_at).toLocaleString()}
                          </span>
                          {isOwner && (
                            <button 
                              onClick={() => handleDeletePost(post.id)}
                              className="p-1 rounded text-gray-500 hover:text-red-400 hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-white text-base leading-relaxed whitespace-pre-line">{post.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 rounded-2xl border border-dashed border-[var(--border-subtle)] bg-white/[0.01]">
                  <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-40 text-emerald-400" />
                  <h3 className="text-lg font-medium text-white mb-1">No Broadcasts Yet</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Broadcasts or announcements will display here.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* MEMBERS LIST */}
          {activeTab === "members" && (
            <motion.div
              key="members-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
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
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-emerald-400 font-medium font-mono">@{u.handle}</span>
                          <span className="w-1 h-1 rounded-full bg-white/20" />
                          <span className="text-xs text-[var(--text-muted)] font-mono">{u.pulse_score || 150} Pulse</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <NeonBadge variant={
                        member.role === "creator" || member.role === "admin" ? "magenta" :
                        member.role === "core_member" ? "purple" : "cyan"
                      }>
                        {member.role}
                      </NeonBadge>

                      {isOwner && !isMemberSelf && member.role !== "creator" && (
                        <div className="flex items-center gap-1">
                          <select 
                            value={member.role}
                            onChange={(e) => handleUpdateRole(member.user_id, e.target.value)}
                            className="bg-black/50 border border-white/10 text-white rounded text-[10px] px-1 py-1 focus:outline-none"
                          >
                            <option value="member">Member</option>
                            <option value="core_member">Core</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button
                            onClick={() => handleRemoveMember(member.user_id)}
                            className="p-1 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Remove member"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}

          {/* COLLAB CALLS */}
          {activeTab === "collabs" && (
            <motion.div
              key="collabs-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-white">Active Collab Pipelines</h3>
                  <p className="text-xs text-[var(--text-muted)]">Work opportunities and builders projects curated by this organization.</p>
                </div>
                {isCoreMember && (
                  <Button onClick={() => router.push("/collabs")} className="flex items-center gap-1.5 text-xs font-semibold">
                    <Plus className="w-4 h-4" /> Create Collab Call
                  </Button>
                )}
              </div>

              {collabs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {collabs.map((collab) => (
                    <div 
                      key={collab.id} 
                      onClick={() => router.push(`/collabs`)}
                      className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-frosted)] hover:border-emerald-500/30 transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold text-sm text-white hover:text-emerald-400 transition-colors">{collab.title}</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono uppercase tracking-wider ${
                            collab.type === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                          }`}>
                            {collab.type}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-muted)] line-clamp-3 mb-4">{collab.description}</p>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-3 border-t border-white/5">
                        {collab.skills?.slice(0, 3).map((skill: string) => (
                          <span key={skill} className="px-1.5 py-0.5 rounded text-[10px] bg-white/5 border border-white/10 text-white/70">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 rounded-2xl border border-dashed border-[var(--border-subtle)] bg-white/[0.01]">
                  <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-40 text-emerald-400" />
                  <h3 className="text-lg font-medium text-white mb-1">No Active Collabs</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Create collab calls to source projects for members.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* BADGE VAULT */}
          {activeTab === "badges" && (
            <motion.div
              key="badges-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Verified Credentials</h3>
                  <p className="text-xs text-[var(--text-muted)]">Digital badges issued by the organization to reward contribution.</p>
                </div>
                {isAdmin && (
                  <Button onClick={() => setShowBadgeModal(true)} className="flex items-center gap-1.5 text-xs font-semibold">
                    <Plus className="w-4 h-4" /> Issue Badge
                  </Button>
                )}
              </div>

              {badges.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {badges.map((badge) => {
                    const recipient = badge.awarded_to_user || {};
                    return (
                      <div key={badge.id} className="p-4 rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent flex items-center justify-between shadow-lg relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-lg">
                            {badge.badge_emoji || "✦"}
                          </div>
                          <div>
                            <span className="text-[10px] text-[var(--text-muted)] block font-mono">
                              Awarded to <span className="text-emerald-400">@{recipient.handle || "unknown"}</span>
                            </span>
                            <span className="text-sm font-bold text-white block mt-0.5">{badge.badge_name}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[10px] text-white/30 font-mono self-start">{new Date(badge.created_at).toLocaleDateString()}</span>
                          {isAdmin && (
                            <button
                              onClick={() => handleRevokeBadge(badge.id)}
                              className="p-1 rounded text-gray-500 hover:text-red-400 hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-all"
                              title="Revoke Badge"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-24 rounded-2xl border border-dashed border-[var(--border-subtle)] bg-white/[0.01]">
                  <Award className="w-12 h-12 mx-auto mb-4 opacity-40 text-emerald-400" />
                  <h3 className="text-lg font-medium text-white mb-1">Badge Vault Empty</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Award digital credentials to your members to recognize active contributions.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* AURA METRICS */}
          {activeTab === "aura" && (
            <motion.div
              key="aura-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Left Column: Tiers breakdown */}
              <div className="lg:col-span-2 p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-frosted)] space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Aura tier breakdown</h3>
                  <p className="text-xs text-[var(--text-muted)] font-mono">Pulse distribution of {members.length} organization members.</p>
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
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-white/80">{tier} Tier</span>
                          <span className="text-white/50">{count} ({Math.round(percentage)}%)</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-white/5 border border-white/10 overflow-hidden">
                          <div className={`h-full ${colorClass}`} style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Leaderboard */}
              <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-frosted)] space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Top Contributors</h3>
                  <p className="text-xs text-[var(--text-muted)] font-mono">Ranked by aura pulse score.</p>
                </div>

                <div className="space-y-4">
                  {leaderboard.map((m, idx) => {
                    const u = m.users || {};
                    return (
                      <div key={m.user_id} className="flex items-center justify-between gap-3 text-sm">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-mono text-emerald-400 font-bold w-4">#{idx+1}</span>
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 shrink-0">
                            {u.avatar_url ? (
                              <img src={u.avatar_url} alt={u.handle} className="w-full h-full object-cover" />
                            ) : (
                              u.handle?.charAt(0).toUpperCase()
                            )}
                          </div>
                          <span className="text-white font-semibold truncate hover:text-emerald-300 transition-colors cursor-pointer" onClick={() => router.push(`/studio/${u.handle}`)}>
                            {u.display_name || u.handle}
                          </span>
                        </div>
                        <span className="font-mono text-xs text-white/50 font-bold shrink-0">{u.pulse_score || 150} Pulse</span>
                      </div>
                    );
                  })}

                  {leaderboard.length === 0 && (
                    <div className="text-center py-8 text-xs text-[var(--text-muted)] italic">No contributors yet.</div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* PARTNERS */}
          {activeTab === "partners" && (
            <motion.div
              key="partners-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-semibold text-white">Campus Company Partners</h3>
                <p className="text-xs text-[var(--text-muted)]">Verified corporate partners and project sponsors sponsoring events.</p>
              </div>

              {partnerships.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {partnerships.map((p) => {
                    const comp = p.company || {};
                    return (
                      <div key={p.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.01] flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center text-xl text-white font-bold shrink-0">
                            {comp.logo_url ? (
                              <img src={comp.logo_url} alt={comp.name} className="w-full h-full object-cover" />
                            ) : (
                              comp.name?.charAt(0) || "C"
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-sm block text-white hover:text-emerald-400 cursor-pointer" onClick={() => comp.users?.handle && router.push(`/companies/${comp.users.handle}`)}>
                              {comp.name}
                            </span>
                            <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">{comp.industry || "Technology"}</span>
                          </div>
                        </div>
                        <NeonBadge variant="magenta">Corporate Sponsor</NeonBadge>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-24 rounded-2xl border border-dashed border-[var(--border-subtle)] bg-white/[0.01]">
                  <Shield className="w-12 h-12 mx-auto mb-4 opacity-40 text-emerald-400" />
                  <h3 className="text-lg font-medium text-white mb-1">No Active Partnerships</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Partner sponsorships will display here.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* PODS HUB TAB */}
          {activeTab === "pods" && (
            <motion.div
              key="pods-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-white font-display">Pods Space 🚀</h2>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    Collaboration groups, project rooms, and clubs hosted by this community.
                  </p>
                </div>
                {isOwner && isAdminView && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setShowCreatePodModal(true)}
                  >
                    <Plus className="w-4 h-4" />
                    Launch Pod
                  </Button>
                )}
              </div>

              {pods.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {pods.map((pod, idx) => (
                    <PodCard key={pod.id} {...pod} index={idx} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-frosted)]">
                  <div className="w-14 h-14 rounded-full bg-[var(--bg-deep)] border border-[var(--border-subtle)] flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <h3 className="text-lg font-medium text-white mb-1">No Pods Created</h3>
                  <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-sm mx-auto">
                    Launch pod collaboration spaces to bring your organization's projects and meetups together.
                  </p>
                  {isOwner && isAdminView && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setShowCreatePodModal(true)}
                    >
                      Create First Pod
                    </Button>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* ADMIN SETTINGS */}
          {activeTab === "admin" && isOwner && isAdminView && (
            <motion.div
              key="admin-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Profile Config */}
              <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-frosted)] space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Update Organization settings</h3>
                  <p className="text-xs text-[var(--text-muted)]">Configure details, category, and access policies.</p>
                </div>

                <form onSubmit={handleSaveSettingsPanel} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] block mb-1">Display Name</label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-emerald-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] block mb-1">One-liner Tagline</label>
                      <input
                        type="text"
                        value={tagline}
                        onChange={(e) => setTagline(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-emerald-500 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] block mb-1">Organization Category</label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-emerald-500 text-sm"
                      >
                        <option value="club">Club</option>
                        <option value="society">Society</option>
                        <option value="community">Community</option>
                        <option value="alumni">Alumni network</option>
                        <option value="other">Other Campus Org</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] block mb-1">Join Request Policy</label>
                      <select
                        value={joinPolicy}
                        onChange={(e) => setJoinPolicy(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-emerald-500 text-sm"
                      >
                        <option value="open">Open (Anyone can join instantly)</option>
                        <option value="gated">Gated (Requires admin approval)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] block mb-1">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-emerald-500 text-sm resize-none"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button type="submit" variant="primary" disabled={savingSettings}>
                      {savingSettings ? "Updating..." : "Save Settings"}
                    </Button>
                  </div>
                </form>
              </div>

              {/* Pending Join Requests (only if gated) */}
              {joinPolicy === "gated" && (
                <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-frosted)] space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Pending Join Requests ({joinRequests.length})</h3>
                    <p className="text-xs text-[var(--text-muted)]">Review student membership applications.</p>
                  </div>

                  {joinRequests.length > 0 ? (
                    <div className="space-y-3">
                      {joinRequests.map((req) => {
                        const u = req.users || {};
                        return (
                          <div key={req.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.01] flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10">
                                {u.avatar_url ? (
                                  <img src={u.avatar_url} alt={u.handle} className="w-full h-full object-cover" />
                                ) : (
                                  u.handle?.charAt(0).toUpperCase()
                                )}
                              </div>
                              <div>
                                <span className="font-semibold text-sm block text-white">{u.display_name || u.handle}</span>
                                <span className="text-xs text-emerald-400 font-mono">@{u.handle} • Pulse: {u.pulse_score || 150}</span>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <button 
                                disabled={processingId === req.id}
                                onClick={() => handleProcessRequest(req.id, false)}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                              >
                                Decline
                              </button>
                              <button 
                                disabled={processingId === req.id}
                                onClick={() => handleProcessRequest(req.id, true)}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer"
                              >
                                Approve
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-xs text-[var(--text-muted)] italic">No pending join requests.</div>
                  )}
                </div>
              )}

              {/* Analytics tab preview */}
              <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-frosted)] space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Analytics overview</h3>
                  <p className="text-xs text-[var(--text-muted)] font-mono">Engagement trends for broadcasts & members.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-white/5 bg-black/20 text-center">
                    <span className="text-xs text-white/50 block font-mono">Post Impressions</span>
                    <span className="text-2xl font-bold text-emerald-400 block mt-1">1,248</span>
                    <span className="text-[10px] text-emerald-500 font-mono font-semibold">+18% this week</span>
                  </div>
                  <div className="p-4 rounded-xl border border-white/5 bg-black/20 text-center">
                    <span className="text-xs text-white/50 block font-mono">Badge Engagements</span>
                    <span className="text-2xl font-bold text-pink-400 block mt-1">42</span>
                    <span className="text-[10px] text-pink-500 font-mono font-semibold">+4 issued</span>
                  </div>
                  <div className="p-4 rounded-xl border border-white/5 bg-black/20 text-center">
                    <span className="text-xs text-white/50 block font-mono">New Members</span>
                    <span className="text-2xl font-bold text-cyan-400 block mt-1">+{members.length}</span>
                    <span className="text-[10px] text-cyan-500 font-mono font-semibold">Total active base</span>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/[0.02] space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-red-400 mb-1 flex items-center gap-1.5">
                    <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" /> Danger Zone
                  </h3>
                  <p className="text-xs text-red-300/60">Permanently delete this organization hub. This action is irreversible.</p>
                </div>

                <form onSubmit={handleDeleteOrganisation} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-red-400 mb-2 font-mono">
                      Type <span className="text-red-300 font-bold">DELETE</span> to confirm
                    </label>
                    <input
                      type="text"
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      placeholder="Type DELETE here..."
                      className="w-full bg-void/50 border border-red-500/20 focus:border-red-500 focus:shadow-[0_0_12px_rgba(239,68,68,0.2)] rounded-xl px-4 py-3 text-sm text-white outline-none transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={deleteConfirmation !== "DELETE" || deletingAccount}
                    className="px-5 py-3 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-[0_4px_15px_rgba(239,68,68,0.2)] cursor-pointer"
                  >
                    {deletingAccount ? "Deleting Organisation..." : "Permanently Delete Organisation"}
                  </button>
                </form>
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
                      className="w-full bg-black/50 border border-emerald-500/20 rounded-xl p-3 text-white outline-none focus:border-emerald-500 text-sm"
                    >
                      <option value="">-- Choose Member --</option>
                      {members.map(m => (
                        <option key={m.user_id} value={m.user_id}>
                          {m.users?.display_name || m.users?.handle} (@{m.users?.handle})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400/80 block mb-1">Badge Title</label>
                      <input
                        type="text"
                        required
                        value={badgeTitle}
                        onChange={(e) => setBadgeTitle(e.target.value)}
                        placeholder="e.g. Design Lead, Code Wizard"
                        className="w-full bg-black/50 border border-emerald-500/20 rounded-xl p-3 text-white placeholder-gray-600 outline-none focus:border-emerald-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400/80 block mb-1">Emoji Icon</label>
                      <select
                        value={badgeEmoji}
                        onChange={(e) => setBadgeEmoji(e.target.value)}
                        className="w-full bg-black/50 border border-emerald-500/20 rounded-xl p-3 text-white outline-none focus:border-emerald-500 text-sm"
                      >
                        <option value="✦">✦ Star</option>
                        <option value="🏆">🏆 Trophy</option>
                        <option value="🚀">🚀 Rocket</option>
                        <option value="💻">💻 Code</option>
                        <option value="🎨">🎨 Palette</option>
                        <option value="🎓">🎓 Cap</option>
                        <option value="🔥">🔥 Fire</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowBadgeModal(false)}
                      className="flex-1 py-3 rounded-xl font-semibold text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={issuingBadge || !targetMemberId || !badgeTitle.trim()}
                      className="flex-1 py-3 rounded-xl font-semibold text-black bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      Issue Badge
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
          {showCreatePodModal && (
            <CreatePodModal
              onClose={() => setShowCreatePodModal(false)}
              onCreated={(newPod) => setPods((prev) => [newPod, ...prev])}
              currentUserId={orgUser.id}
              userCollege={orgUser.colleges}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
