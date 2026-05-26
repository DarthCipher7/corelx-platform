"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  Building, MapPin, Globe, Users, MessageSquare, Award, ArrowLeft, 
  Check, X, Inbox, Briefcase, BarChart2, Edit3, Image, Plus, 
  Calendar, FileText, Shield, User, ExternalLink, HelpCircle, Trash2,
  AlertTriangle
} from "lucide-react";
import Button from "@/components/ui/Button";
import NeonBadge from "@/components/ui/NeonBadge";
import OfficialTag from "@/components/ui/OfficialTag";
import { createClient } from "@/utils/supabase/client";

interface CompanyClientProps {
  companyUser: any;
  currentUser: any;
  isAdmin: boolean;
  initialReachMessages: any[];
  initialCollabs: any[];
  initialFeedPosts: any[];
  initialEvents: any[];
  initialPartnerships: any[];
  initialTeamMembers: any[];
}

export default function CompanyClient({
  companyUser,
  currentUser,
  isAdmin,
  initialReachMessages,
  initialCollabs,
  initialFeedPosts,
  initialEvents,
  initialPartnerships,
  initialTeamMembers,
}: CompanyClientProps) {
  const router = useRouter();
  const supabase = createClient();

  const company = Array.isArray(companyUser.company_accounts)
    ? companyUser.company_accounts[0]
    : (companyUser.company_accounts || {});

  // Page layout & navigation states
  const [activeTab, setActiveTab] = useState<"about" | "collabs" | "feed" | "events" | "partners" | "team" | "reach" | "analytics">("about");
  const [isAdminView, setIsAdminView] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Data states
  const [collabs, setCollabs] = useState<any[]>(initialCollabs);
  const [reachMessages, setReachMessages] = useState<any[]>(initialReachMessages);
  const [feedPosts, setFeedPosts] = useState<any[]>(initialFeedPosts || []);
  const [events, setEvents] = useState<any[]>(initialEvents || []);
  const [partnerships, setPartnerships] = useState<any[]>(initialPartnerships || []);
  const [teamMembers, setTeamMembers] = useState<any[]>(initialTeamMembers || []);

  // Profile metadata states
  const [displayName, setDisplayName] = useState(companyUser.display_name || "");
  const [tagline, setTagline] = useState(companyUser.tagline || "");
  const [website, setWebsite] = useState(company.website || "");
  const [sizeRange, setSizeRange] = useState(company.size_range || "1-10");
  const [industry, setIndustry] = useState(company.industry || "Technology");
  
  // Banner / Logo states
  const [bannerUrl, setBannerUrl] = useState(company.banner_url || "");
  const [avatarUrl, setAvatarUrl] = useState(companyUser.avatar_url || "");
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // About / Overview editing states
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [description, setDescription] = useState(company.description || "");
  const [savingAbout, setSavingAbout] = useState(false);

  // Talent Gateway settings states
  const [gatewayActive, setGatewayActive] = useState(company.reach_enabled);
  const [gatewayThreshold, setGatewayThreshold] = useState(company.reach_threshold || 200);
  const [gatewayCooldown, setGatewayCooldown] = useState(company.reach_cooldown_days || 30);
  const [gatewayWeeklyLimit, setGatewayWeeklyLimit] = useState(company.reach_weekly_limit || 50);
  const [gatewayTopics, setGatewayTopics] = useState<string[]>(company.reach_topic_tags || []);
  const [gatewayCustomPrompt, setGatewayCustomPrompt] = useState(company.reach_custom_prompt || "");

  // Danger Zone Deletion states
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [savingGateway, setSavingGateway] = useState(false);
  const [gatewaySuccess, setGatewaySuccess] = useState(false);

  // Post / Broadcast state
  const [postContent, setPostContent] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Event modal state
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [eventCategory, setEventCategory] = useState("hackathon");
  const [eventStartsAt, setEventStartsAt] = useState("");
  const [eventEndsAt, setEventEndsAt] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);

  // Collab / Opportunity modal state
  const [showCollabModal, setShowCollabModal] = useState(false);
  const [collabTitle, setCollabTitle] = useState("");
  const [collabDesc, setCollabDesc] = useState("");
  const [collabType, setCollabType] = useState<"paid" | "collab" | "open-source">("collab");
  const [collabBudget, setCollabBudget] = useState("");
  const [collabCommitment, setCollabCommitment] = useState("");
  const [collabSpots, setCollabSpots] = useState(1);
  const [collabSkills, setCollabSkills] = useState("");
  const [isCreatingCollab, setIsCreatingCollab] = useState(false);

  // Partnerships & B2B Proposal state
  const [showPartnershipModal, setShowPartnershipModal] = useState(false);
  const [orgsList, setOrgsList] = useState<any[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [partnershipOfferings, setPartnershipOfferings] = useState("");
  const [submittingPartnership, setSubmittingPartnership] = useState(false);
  const [partnershipSuccess, setPartnershipSuccess] = useState(false);

  // Team Addition state
  const [teamHandleInput, setTeamHandleInput] = useState("");
  const [teamRoleInput, setTeamRoleInput] = useState<"admin" | "hiring_manager" | "content_manager">("hiring_manager");
  const [addingTeamMember, setAddingTeamMember] = useState(false);
  const [teamMessage, setTeamMessage] = useState<string | null>(null);

  // Send Reach Modal State
  const [showReachModal, setShowReachModal] = useState(false);
  const [reachContent, setReachContent] = useState("");
  const [reachTag, setReachTag] = useState("Collab");
  const [sendingReach, setSendingReach] = useState(false);
  const [reachError, setReachError] = useState<string | null>(null);
  const [reachSuccess, setReachSuccess] = useState(false);

  // B2B Collab Modal state
  const [showB2bModal, setShowB2bModal] = useState(false);
  const [companiesList, setCompaniesList] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [b2bProposal, setB2bProposal] = useState("");
  const [sendingB2b, setSendingB2b] = useState(false);
  const [b2bSuccess, setB2bSuccess] = useState(false);

  const isCreator = currentUser && currentUser.id !== companyUser.id;

  // Load companies & orgs directories for B2B/Campus partnerships
  useEffect(() => {
    if (isAdmin) {
      // Load orgs
      supabase
        .from("users")
        .select("id, display_name, handle, avatar_url")
        .eq("user_type", "organisation")
        .then(({ data }) => {
          if (data) setOrgsList(data);
        });

      // Load other companies
      supabase
        .from("users")
        .select("id, display_name, handle, avatar_url")
        .eq("user_type", "company")
        .neq("id", companyUser.id)
        .then(({ data }) => {
          if (data) setCompaniesList(data);
        });
    }
  }, [isAdmin, companyUser.id]);

  // Handle banner upload
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBanner(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${companyUser.id}_banner_${Date.now()}.${fileExt}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("media").getPublicUrl(fileName);
      const newUrl = data.publicUrl;

      const { error: updateError } = await supabase
        .from("company_accounts")
        .update({ banner_url: newUrl })
        .eq("id", companyUser.id);

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
    const fileName = `${companyUser.id}_logo_${Date.now()}.${fileExt}`;

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
        .eq("id", companyUser.id);

      if (userUpdateError) throw userUpdateError;

      // Update logo_url in company_accounts
      await supabase
        .from("company_accounts")
        .update({ logo_url: newUrl })
        .eq("id", companyUser.id);

      setAvatarUrl(newUrl);
    } catch (err: any) {
      alert("Error uploading logo: " + err.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  // Save General details (About, Tagline, display name, etc.)
  const handleSaveAbout = async () => {
    setSavingAbout(true);
    try {
      // Update users table for tagline & display name
      const { error: userError } = await supabase
        .from("users")
        .update({ 
          display_name: displayName,
          tagline: tagline
        })
        .eq("id", companyUser.id);

      if (userError) throw userError;

      // Update company_accounts for description, website, industry, and size_range
      const { error: compError } = await supabase
        .from("company_accounts")
        .update({
          description: description,
          website: website,
          industry: industry,
          size_range: sizeRange
        })
        .eq("id", companyUser.id);

      if (compError) throw compError;

      setIsEditingAbout(false);
    } catch (err: any) {
      alert("Error saving details: " + err.message);
    } finally {
      setSavingAbout(false);
    }
  };

  // Save Gateway settings
  const handleSaveGateway = async () => {
    setSavingGateway(true);
    setGatewaySuccess(false);

    try {
      const { error } = await supabase
        .from("company_accounts")
        .update({
          reach_enabled: gatewayActive,
          reach_threshold: Number(gatewayThreshold),
          reach_cooldown_days: Number(gatewayCooldown),
          reach_weekly_limit: Number(gatewayWeeklyLimit),
          reach_topic_tags: gatewayTopics,
          reach_custom_prompt: gatewayCustomPrompt || null
        })
        .eq("id", companyUser.id);

      if (error) throw error;
      setGatewaySuccess(true);
      setTimeout(() => setGatewaySuccess(false), 3000);
    } catch (err: any) {
      alert("Error saving gateway settings: " + err.message);
    } finally {
      setSavingGateway(false);
    }
  };

  // Handle company deletion (Danger Zone)
  const handleDeleteCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteConfirmation !== "DELETE" || deletingAccount || currentUser?.id !== companyUser.id) return;

    setDeletingAccount(true);
    try {
      const { error } = await supabase.rpc("delete_current_user");
      if (error) throw error;
      router.push("/");
    } catch (err: any) {
      alert("Error deleting company: " + err.message);
      setDeletingAccount(false);
    }
  };

  // Toggle topics selection
  const handleToggleTopic = (topic: string) => {
    if (gatewayTopics.includes(topic)) {
      setGatewayTopics(prev => prev.filter(t => t !== topic));
    } else {
      setGatewayTopics(prev => [...prev, topic]);
    }
  };

  // Accept/archive reach messages
  const handleReachStatus = async (reachId: string, newStatus: "connected" | "archived") => {
    setProcessingId(reachId);
    const { error } = await supabase
      .from("reach_messages")
      .update({ status: newStatus })
      .eq("id", reachId);

    if (!error) {
      setReachMessages(prev =>
        prev.map(r => r.id === reachId ? { ...r, status: newStatus } : r)
      );
    }
    setProcessingId(null);
  };

  // Create event co-host
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || isCreatingEvent) return;

    setIsCreatingEvent(true);
    try {
      const { data, error } = await supabase
        .from("events")
        .insert({
          organiser_id: companyUser.id,
          title: eventTitle.trim(),
          description: eventDesc.trim(),
          category: eventCategory,
          starts_at: new Date(eventStartsAt).toISOString(),
          ends_at: new Date(eventEndsAt).toISOString(),
          location_name: eventLocation.trim(),
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setEvents(prev => [...prev, data]);
        setShowEventModal(false);
        setEventTitle("");
        setEventDesc("");
        setEventLocation("");
        setEventStartsAt("");
        setEventEndsAt("");
      }
    } catch (err: any) {
      alert("Error creating event: " + err.message);
    } finally {
      setIsCreatingEvent(false);
    }
  };

  // Create collab call
  const handleCreateCollab = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collabTitle.trim() || isCreatingCollab) return;

    setIsCreatingCollab(true);
    const parsedSkills = collabSkills
      .split(",")
      .map(s => s.trim())
      .filter(s => s.length > 0);

    try {
      const { data, error } = await supabase
        .from("collab_calls")
        .insert({
          user_id: companyUser.id,
          title: collabTitle.trim(),
          description: collabDesc.trim(),
          type: collabType,
          budget: collabType === "paid" ? collabBudget : null,
          time_commitment: collabCommitment || null,
          spots: Number(collabSpots) || 1,
          skills: parsedSkills
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setCollabs(prev => [data, ...prev]);
        setShowCollabModal(false);
        setCollabTitle("");
        setCollabDesc("");
        setCollabBudget("");
        setCollabCommitment("");
        setCollabSkills("");
        setCollabSpots(1);
      }
    } catch (err: any) {
      alert("Error creating collab: " + err.message);
    } finally {
      setIsCreatingCollab(false);
    }
  };

  // Broadcast feed update
  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim() || isBroadcasting) return;

    setIsBroadcasting(true);
    try {
      const { data, error } = await supabase
        .from("feed_posts")
        .insert({
          user_id: companyUser.id,
          title: postTitle.trim() || null,
          caption: postContent.trim()
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setFeedPosts(prev => [data, ...prev]);
        setPostContent("");
        setPostTitle("");
      }
    } catch (err: any) {
      alert("Error broadcasting update: " + err.message);
    } finally {
      setIsBroadcasting(false);
    }
  };

  // Propose partnership
  const handleProposePartnership = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrgId || submittingPartnership) return;

    setSubmittingPartnership(true);
    setPartnershipSuccess(false);

    try {
      const offeringsArray = partnershipOfferings
        .split(",")
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const { error } = await supabase
        .from("campus_partnerships")
        .insert({
          company_id: companyUser.id,
          org_id: selectedOrgId,
          status: "pending",
          offerings: offeringsArray
        });

      if (error) throw error;
      setPartnershipSuccess(true);
      setPartnershipOfferings("");
      setSelectedOrgId("");
      setTimeout(() => {
        setShowPartnershipModal(false);
        setPartnershipSuccess(false);
      }, 2000);
    } catch (err: any) {
      alert("Error sending proposal: " + err.message);
    } finally {
      setSubmittingPartnership(false);
    }
  };

  // Propose B2B collab
  const handleProposeB2b = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompanyId || !b2bProposal.trim() || sendingB2b) return;

    setSendingB2b(true);
    setB2bSuccess(false);

    try {
      // In a real system, co-brands insert B2B collab requests or send DMs.
      // We will send a direct Message to the target company.
      const { error } = await supabase
        .from("messages")
        .insert({
          sender_id: companyUser.id,
          recipient_id: selectedCompanyId,
          content: `💼 B2B Collaboration Proposal:\n\n${b2bProposal.trim()}`
        });

      if (error) throw error;
      setB2bSuccess(true);
      setB2bProposal("");
      setSelectedCompanyId("");
      setTimeout(() => {
        setShowB2bModal(false);
        setB2bSuccess(false);
      }, 2000);
    } catch (err: any) {
      alert("Error sending B2B proposal: " + err.message);
    } finally {
      setSendingB2b(false);
    }
  };

  // Add hiring manager/team member
  const handleAddTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamHandleInput.trim() || addingTeamMember) return;

    setAddingTeamMember(true);
    setTeamMessage(null);

    try {
      // Find user id by handle
      const { data: userRecord, error: userFindErr } = await supabase
        .from("users")
        .select("id, display_name, handle, avatar_url")
        .eq("handle", teamHandleInput.trim())
        .single();

      if (userFindErr || !userRecord) {
        throw new Error("Creator not found with handle " + teamHandleInput);
      }

      // Insert into company_admins
      const { error: adminErr } = await supabase
        .from("company_admins")
        .insert({
          company_id: companyUser.id,
          user_id: userRecord.id,
          role: teamRoleInput
        });

      if (adminErr) {
        if (adminErr.code === "23505") {
          throw new Error("This creator is already a team member.");
        }
        throw adminErr;
      }

      const newMember = {
        company_id: companyUser.id,
        user_id: userRecord.id,
        role: teamRoleInput,
        profile: userRecord
      };

      setTeamMembers(prev => [...prev, newMember]);
      setTeamHandleInput("");
      setTeamMessage(`Successfully added @${userRecord.handle} to team!`);
    } catch (err: any) {
      setTeamMessage("Failed: " + err.message);
    } finally {
      setAddingTeamMember(false);
    }
  };

  // Remove team member
  const handleRemoveTeamMember = async (userId: string) => {
    const { error } = await supabase
      .from("company_admins")
      .delete()
      .eq("company_id", companyUser.id)
      .eq("user_id", userId);

    if (!error) {
      setTeamMembers(prev => prev.filter(m => m.user_id !== userId));
    }
  };

  // Send Direct Reach message
  const handleSendReach = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reachContent.trim() || sendingReach) return;

    setSendingReach(true);
    setReachError(null);

    const { error } = await supabase
      .from("reach_messages")
      .insert({
        sender_id: currentUser.id,
        company_id: companyUser.id,
        content: reachContent.trim(),
        topic_tag: reachTag,
        status: "pending",
      });

    if (error) {
      setReachError(error.message);
    } else {
      setReachSuccess(true);
      setReachContent("");
      setTimeout(() => {
        setShowReachModal(false);
        setReachSuccess(false);
      }, 2000);
    }
    setSendingReach(false);
  };

  return (
    <div className="min-h-screen pb-32 bg-[#02020a] text-white">
      {/* Cover Banner */}
      <div 
        className="h-72 w-full relative bg-cover bg-center bg-no-repeat transition-all group overflow-hidden border-b border-white/5"
        style={{ 
          backgroundImage: bannerUrl ? `url(${bannerUrl})` : "none",
          background: !bannerUrl ? "linear-gradient(to right, #082f49, #0f172a, #02020a)" : undefined
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#02020a] via-black/40 to-transparent" />
        
        <button
          onClick={() => router.back()}
          className="absolute top-24 left-6 z-20 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/50 border border-white/10 hover:bg-white/10 text-white font-medium text-sm backdrop-blur-md transition-all group shadow-lg cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>

        {isAdmin && isAdminView && (
          <div className="absolute top-24 right-6 z-20 flex gap-2">
            <input 
              type="file" 
              ref={bannerInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleBannerUpload} 
            />
            <button
              onClick={() => bannerInputRef.current?.click()}
              disabled={uploadingBanner}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs shadow-lg backdrop-blur-md transition-all active:scale-95 cursor-pointer"
            >
              <Image className="w-3.5 h-3.5" />
              {uploadingBanner ? "Uploading..." : "Edit banner"}
            </button>
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative -mt-24">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-6 md:items-end mb-12 relative z-10">
          <div className="w-32 h-32 rounded-3xl shrink-0 p-[2px] bg-gradient-to-br from-cyan-400 to-blue-500 shadow-2xl relative group/logo">
            <div className="w-full h-full rounded-3xl overflow-hidden bg-[#070e1b] flex items-center justify-center text-4xl font-bold text-white relative">
              {avatarUrl ? (
                <img src={avatarUrl} alt={companyUser.display_name || companyUser.handle} className="w-full h-full object-cover" />
              ) : (
                displayName?.charAt(0) || companyUser.handle.charAt(0).toUpperCase()
              )}

              {isAdmin && isAdminView && (
                <div 
                  onClick={() => logoInputRef.current?.click()}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover/logo:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-[10px] font-bold text-cyan-300"
                >
                  <Plus className="w-5 h-5 mb-1" />
                  {uploadingLogo ? "Uploading..." : "Edit Logo"}
                </div>
              )}
            </div>
            <input 
              type="file" 
              ref={logoInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleLogoUpload} 
            />
          </div>

          <div className="flex-1 pb-2">
            <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
              <h1 className="text-3xl font-display font-bold text-white tracking-tight">
                {displayName || companyUser.handle}
              </h1>
              <OfficialTag entityId={companyUser.id} />
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center gap-1">
                🏢 {industry || "Technology"}
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <p className="font-semibold text-lg text-cyan-400">@{companyUser.handle}</p>
              <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
              <div className="text-xs font-semibold px-2.5 py-0.5 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-cyan-300">
                ✦ Verified Company
              </div>
              {partnerships.length > 0 && (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                  <div className="text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                    🛡️ {partnerships.length} Campus Partner{partnerships.length === 1 ? "" : "s"}
                  </div>
                </>
              )}
            </div>

            <p className="text-sm text-white/70 italic max-w-xl mb-4 leading-relaxed">
              {tagline || "Creator Collaboration & Building"}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)] font-medium">
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {sizeRange} employees</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Vellore, India</span>
              {website && (
                <a 
                  href={website.startsWith("http") ? website : `https://${website}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <Globe className="w-4 h-4" /> {website.replace(/https?:\/\/(www\.)?/, "")}
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pb-2">
            {isAdmin && (
              <button 
                onClick={() => {
                  setIsAdminView(!isAdminView);
                  // Default tab when entering admin panel
                  if (!isAdminView && activeTab !== "about") {
                    setActiveTab("about");
                  }
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-semibold transition-all active:scale-95 cursor-pointer ${
                  isAdminView 
                    ? "bg-cyan-500 border-cyan-400 text-black shadow-[0_0_20px_rgba(6,182,212,0.3)]" 
                    : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                }`}
              >
                <Shield className="w-4 h-4" />
                {isAdminView ? "Exit Admin View" : "Admin Panel"}
              </button>
            )}

            {isCreator && gatewayActive && !company.reach_paused && (
              <button 
                onClick={() => setShowReachModal(true)} 
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-sm shadow-lg hover:shadow-cyan-500/20 active:scale-95 cursor-pointer transition-all"
              >
                ⚡ Send Reach
              </button>
            )}
            
            {isCreator && (
              <button 
                onClick={() => {
                  // Simulate partner request
                  alert("Partnership proposal sent to " + (displayName || companyUser.handle));
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold text-sm transition-all active:scale-95 cursor-pointer"
              >
                + Partner
              </button>
            )}
          </div>
        </div>

        {/* Tab Selection */}
        <div className="border-b border-white/5 mb-8 flex gap-6 overflow-x-auto no-scrollbar relative z-10">
          {[
            { id: "about", label: "About" },
            { id: "collabs", label: `Opportunities (${collabs.length})` },
            { id: "feed", label: `Feed (${feedPosts.length})` },
            { id: "events", label: `Events (${events.length})` },
            { id: "partners", label: `Partners (${partnerships.length})` },
            { id: "team", label: "Team" },
            ...(isAdmin && isAdminView ? [
              { id: "reach", label: `Reach Inbox (${reachMessages.filter(r => r.status === "pending").length})` },
              { id: "analytics", label: "Talent Analytics" }
            ] : [])
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-4 text-sm font-medium relative transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id ? "text-white font-bold" : "text-white/40 hover:text-white"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="companyTabUnderline" className="absolute bottom-0 inset-x-0 h-0.5 bg-cyan-400" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {/* ABOUT TAB */}
          {activeTab === "about" && (
            <motion.div
              key="about-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Overview Card */}
              <div className="rounded-2xl p-6 border border-white/5 bg-white/[0.02] backdrop-blur-xl relative">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-display font-semibold text-white flex items-center gap-2">
                    <Building className="w-5 h-5 text-cyan-400" /> Company Overview
                  </h3>
                  {isAdmin && isAdminView && !isEditingAbout && (
                    <button 
                      onClick={() => setIsEditingAbout(true)}
                      className="p-2 rounded-lg bg-white/5 border border-white/10 text-cyan-400 hover:bg-white/10 transition-all cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {isEditingAbout ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400/80 block mb-1">Company Display Name</label>
                        <input
                          type="text"
                          className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm focus:border-cyan-400 outline-none"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400/80 block mb-1">Tagline</label>
                        <input
                          type="text"
                          className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm focus:border-cyan-400 outline-none"
                          value={tagline}
                          onChange={(e) => setTagline(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400/80 block mb-1">Website URL</label>
                        <input
                          type="text"
                          className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm focus:border-cyan-400 outline-none"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400/80 block mb-1">Industry</label>
                        <input
                          type="text"
                          className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm focus:border-cyan-400 outline-none"
                          value={industry}
                          onChange={(e) => setIndustry(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400/80 block mb-1">Size Range</label>
                        <select
                          className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm focus:border-cyan-400 outline-none"
                          value={sizeRange}
                          onChange={(e) => setSizeRange(e.target.value)}
                        >
                          <option value="1-10">1-10 employees</option>
                          <option value="11-50">11-50 employees</option>
                          <option value="51-200">51-200 employees</option>
                          <option value="200+">200+ employees</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400/80 block mb-1">Detailed Description (About)</label>
                      <textarea
                        rows={6}
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm focus:border-cyan-400 outline-none resize-none leading-relaxed"
                        placeholder="Write a detailed overview of your mission, what you are building, team culture, etc..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        onClick={() => setIsEditingAbout(false)}
                        className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-semibold transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveAbout}
                        disabled={savingAbout}
                        className="px-4 py-2 rounded-xl bg-cyan-400 text-black text-xs font-bold transition-all disabled:opacity-50"
                      >
                        {savingAbout ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-base text-white/80 leading-relaxed whitespace-pre-line">
                    {description || "Welcome to our profile. We are a verified creator co-builder platform."}
                  </p>
                )}
              </div>

              {/* TALENT REACH GATEWAY PANEL (Admin Settings vs Creator Info Card) */}
              {isAdmin && isAdminView ? (
                <div className="rounded-2xl p-6 border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-transparent relative">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-lg font-display font-semibold text-white flex items-center gap-2">
                        ⚡ TALENT REACH GATEWAY
                      </h3>
                      <p className="text-xs text-white/50 mt-1">Configure criteria for creators to reach out directly to your company.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white/60">Active:</span>
                      <button
                        onClick={() => setGatewayActive(!gatewayActive)}
                        className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                          gatewayActive ? "bg-cyan-500" : "bg-white/15"
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-black transition-transform ${
                          gatewayActive ? "translate-x-6" : "translate-x-0"
                        }`} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400 block mb-1">Min Aura Score</label>
                      <input
                        type="number"
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm focus:border-cyan-400 outline-none"
                        value={gatewayThreshold}
                        onChange={(e) => setGatewayThreshold(Number(e.target.value))}
                      />
                      <span className="text-[10px] text-white/30 mt-1 block">0 = open to all • 900 = elite only</span>
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400 block mb-1">Cooldown (Days)</label>
                      <input
                        type="number"
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm focus:border-cyan-400 outline-none"
                        value={gatewayCooldown}
                        onChange={(e) => setGatewayCooldown(Number(e.target.value))}
                      />
                      <span className="text-[10px] text-white/30 mt-1 block">Min days between Reaches</span>
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400 block mb-1">Max Weekly Reaches</label>
                      <input
                        type="number"
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm focus:border-cyan-400 outline-none"
                        value={gatewayWeeklyLimit}
                        onChange={(e) => setGatewayWeeklyLimit(Number(e.target.value))}
                      />
                      <span className="text-[10px] text-white/30 mt-1 block">Cap inbox per week</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400 block mb-2">Accepting Topics</label>
                    <div className="flex flex-wrap gap-2">
                      {["Dev Collab", "Design Collab", "Marketing Collab", "Sponsorship", "Speaking", "Advisory"].map(topic => {
                        const active = gatewayTopics.includes(topic);
                        return (
                          <button
                            key={topic}
                            type="button"
                            onClick={() => handleToggleTopic(topic)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                              active 
                                ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                                : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                            }`}
                          >
                            {topic}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400 block mb-1">
                      Custom Reach Prompt (Replaces default "Why are you reaching out?")
                    </label>
                    <textarea
                      rows={3}
                      className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm focus:border-cyan-400 outline-none resize-none"
                      placeholder="What projects are you most proud of, and what role did you play in them?"
                      value={gatewayCustomPrompt}
                      onChange={(e) => setGatewayCustomPrompt(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    {gatewaySuccess ? (
                      <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="w-4 h-4" /> Gateway Settings Saved!
                      </span>
                    ) : <span />}
                    <button
                      onClick={handleSaveGateway}
                      disabled={savingGateway}
                      className="px-6 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs shadow-lg active:scale-95 transition-all cursor-pointer"
                    >
                      {savingGateway ? "Saving..." : "Save Gateway Settings"}
                    </button>
                  </div>
                </div>
              ) : (
                gatewayActive && (
                  <div className="rounded-2xl p-6 border border-cyan-500/10 bg-cyan-500/[0.02] backdrop-blur-xl">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 mb-2">
                      ⚡ Talent Reach Gateway Active
                    </h4>
                    <p className="text-xs text-white/60 leading-relaxed mb-4">
                      This company accepts direct collaboration pitches from verified builders who match their criteria.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-black/30 p-4 rounded-xl border border-white/5">
                      <div>
                        <span className="text-[9px] text-white/40 uppercase block">Min Aura Score</span>
                        <span className="text-sm font-bold text-white font-mono">{gatewayThreshold}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-white/40 uppercase block">Inbox Cooldown</span>
                        <span className="text-sm font-bold text-white font-mono">{gatewayCooldown} Days</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-white/40 uppercase block">Topics Accepted</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {gatewayTopics.length > 0 ? gatewayTopics.map(t => (
                            <span key={t} className="px-1.5 py-0.5 rounded text-[9px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">{t}</span>
                          )) : <span className="text-[10px] text-white/30">All Collabs</span>}
                        </div>
                      </div>
                      <div>
                        <span className="text-[9px] text-white/40 uppercase block">Response Time</span>
                        <span className="text-sm font-bold text-white font-mono">~3 Days</span>
                      </div>
                    </div>
                  </div>
                )
              )}

              {/* Active Opportunities Section in About */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-display font-semibold text-white flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-cyan-400" /> Active Opportunities
                  </h3>
                  {isAdmin && isAdminView && (
                    <button
                      onClick={() => setShowCollabModal(true)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Post Opportunity
                    </button>
                  )}
                </div>

                {collabs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {collabs.slice(0, 2).map((collab) => (
                      <div 
                        key={collab.id} 
                        className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-xl relative flex flex-col justify-between group hover:border-cyan-500/20 transition-all"
                      >
                        <div>
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">{collab.title}</h4>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                              {collab.type}
                            </span>
                          </div>
                          <p className="text-[10px] text-white/40 font-mono mb-3">
                            Aura {gatewayThreshold}+ required • {collab.time_commitment || "Flexible"}
                          </p>
                          <p className="text-sm text-white/60 leading-relaxed line-clamp-2 mb-4">
                            {collab.description}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => router.push(`/collabs`)}
                            className="flex-1 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold text-xs text-center"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 rounded-2xl border border-dashed border-white/10 bg-white/[0.01]">
                    <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-30 text-cyan-400" />
                    <span className="text-sm text-white/50 block">No active opportunities posted.</span>
                  </div>
                )}
              </div>

              {/* COMPANY PARTNERSHIPS SECTION (Admin Action hub) */}
              <div className="space-y-4">
                <h3 className="text-lg font-display font-semibold text-white">🤝 COMPANY PARTNERSHIPS</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Propose B2B */}
                  <div 
                    onClick={() => {
                      if (isAdmin && isAdminView) {
                        setShowB2bModal(true);
                      } else {
                        alert("Please toggle Admin Panel to use these administrative controls.");
                      }
                    }}
                    className="p-5 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-cyan-500/25 transition-all cursor-pointer group flex items-start gap-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 group-hover:scale-105 transition-transform">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">Propose B2B Collab</h4>
                      <p className="text-xs text-white/50 mt-1">Find a company and propose a structured collaboration project.</p>
                    </div>
                  </div>

                  {/* Campus Partnership */}
                  <div 
                    onClick={() => {
                      if (isAdmin && isAdminView) {
                        setShowPartnershipModal(true);
                      } else {
                        alert("Please toggle Admin Panel to use these administrative controls.");
                      }
                    }}
                    className="p-5 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-cyan-500/25 transition-all cursor-pointer group flex items-start gap-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 group-hover:scale-105 transition-transform">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">Campus Partnership</h4>
                      <p className="text-xs text-white/50 mt-1">Partner with a college org for exclusive talent access.</p>
                    </div>
                  </div>

                  {/* Co-host Event */}
                  <div 
                    onClick={() => {
                      if (isAdmin && isAdminView) {
                        setShowEventModal(true);
                      } else {
                        alert("Please toggle Admin Panel to use these administrative controls.");
                      }
                    }}
                    className="p-5 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-cyan-500/25 transition-all cursor-pointer group flex items-start gap-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 group-hover:scale-105 transition-transform">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">Co-host an Event</h4>
                      <p className="text-xs text-white/50 mt-1">Create a joint event with another company or org.</p>
                    </div>
                  </div>

                  {/* Company Directory */}
                  <div 
                    onClick={() => {
                      // Trigger mock or list directory
                      alert("Opening Company directory: currently " + (companiesList.length + 1) + " companies verified on the network.");
                    }}
                    className="p-5 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-cyan-500/25 transition-all cursor-pointer group flex items-start gap-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 group-hover:scale-105 transition-transform">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">Company Directory</h4>
                      <p className="text-xs text-white/50 mt-1">Browse verified companies by industry and find partners.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* DANGER ZONE (Delete Company) */}
              {isAdmin && isAdminView && currentUser?.id === companyUser.id && (
                <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/[0.02] space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-red-400 mb-1 flex items-center gap-1.5">
                      <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" /> Danger Zone
                    </h3>
                    <p className="text-xs text-red-300/60 font-mono">Permanently delete this company page. This action is irreversible.</p>
                  </div>

                  <form onSubmit={handleDeleteCompany} className="space-y-4 max-w-md">
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
                      className="px-5 py-3 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-[0_4px_15px_rgba(239,68,68,0.2)] cursor-pointer text-xs font-mono"
                    >
                      {deletingAccount ? "Deleting Company..." : "Permanently Delete Company"}
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          )}

          {/* OPPORTUNITIES (COLLABS) TAB */}
          {activeTab === "collabs" && (
            <motion.div
              key="collabs-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-display font-semibold text-white">Open Collaboration Opportunities</h3>
                {isAdmin && isAdminView && (
                  <button
                    onClick={() => setShowCollabModal(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all cursor-pointer animate-pulse"
                  >
                    <Plus className="w-4 h-4" /> Post a Collab Call
                  </button>
                )}
              </div>

              {collabs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {collabs.map((collab) => (
                    <div 
                      key={collab.id} 
                      className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-xl relative flex flex-col justify-between group hover:border-cyan-500/20 transition-all"
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-3">
                          <h4 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">{collab.title}</h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                            {collab.type}
                          </span>
                        </div>
                        <p className="text-xs text-white/40 font-mono tracking-wider mb-4">
                          Role Type: {collab.skills?.join(", ") || "Builder"} • {collab.time_commitment || "Flexible"}
                        </p>
                        <p className="text-sm text-white/70 leading-relaxed line-clamp-3 mb-6">
                          {collab.description}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => router.push(`/collabs`)}
                          className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold text-xs text-center"
                        >
                          View Details & Apply
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 rounded-2xl border border-dashed border-white/10 bg-white/[0.01]">
                  <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-30 text-cyan-400" />
                  <h3 className="text-lg font-medium text-white mb-1">No Open Collabs</h3>
                  <p className="text-sm text-white/50">When this company hosts active projects or hires, they'll list here.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* FEED TAB */}
          {activeTab === "feed" && (
            <motion.div
              key="feed-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {isAdmin && isAdminView && (
                <form onSubmit={handleBroadcast} className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-xl flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-xs uppercase tracking-wider text-cyan-400 font-mono font-bold">Broadcast Company Update</span>
                    <input
                      type="text"
                      placeholder="Title (Optional)"
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                      className="bg-black/40 border border-white/10 text-white rounded-xl text-xs px-3 py-2.5 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="Broadcast an update or announcement to the network..."
                    rows={3}
                    maxLength={1000}
                    className="w-full bg-black/40 border border-white/10 focus:border-cyan-500/50 rounded-xl p-3 text-sm text-white placeholder-gray-500 outline-none transition-colors resize-none"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-white/30 font-mono">{postContent.length}/1000 characters</span>
                    <button 
                      type="submit" 
                      disabled={!postContent.trim() || isBroadcasting} 
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs disabled:opacity-50"
                    >
                      Broadcast Update
                    </button>
                  </div>
                </form>
              )}

              {feedPosts.length > 0 ? (
                <div className="space-y-4">
                  {feedPosts.map((post) => (
                    <div key={post.id} className="p-6 rounded-2xl border border-white/5 bg-white/[0.01] backdrop-blur-xl">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border bg-cyan-500/10 border-cyan-500/20 text-cyan-300">
                          📢 UPDATE
                        </span>
                        <span className="text-[10px] text-white/40 font-mono">
                          {new Date(post.created_at).toLocaleString()}
                        </span>
                      </div>
                      {post.title && <h4 className="text-base font-bold text-white mb-2">{post.title}</h4>}
                      <p className="text-white/80 text-sm leading-relaxed whitespace-pre-line">{post.caption}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 rounded-2xl border border-dashed border-white/10 bg-white/[0.01]">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-30 text-cyan-400" />
                  <h3 className="text-lg font-medium text-white mb-1">No Broadcasts Yet</h3>
                  <p className="text-sm text-white/50">Follow this company to get notified about their latest announcements.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* EVENTS TAB */}
          {activeTab === "events" && (
            <motion.div
              key="events-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-display font-semibold text-white">Hosted & Co-sponsored Events</h3>
                {isAdmin && isAdminView && (
                  <button
                    onClick={() => setShowEventModal(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Create Event
                  </button>
                )}
              </div>

              {events.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {events.map((event) => (
                    <div 
                      key={event.id} 
                      className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-xl relative flex flex-col justify-between group hover:border-cyan-500/20 transition-all"
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-3">
                          <h4 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">{event.title}</h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                            {event.category}
                          </span>
                        </div>
                        <p className="text-xs text-white/40 font-mono tracking-wider mb-4 flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                          {new Date(event.starts_at).toLocaleDateString()} at {new Date(event.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-sm text-white/70 leading-relaxed line-clamp-3 mb-6">
                          {event.description}
                        </p>
                      </div>
                      <button 
                        onClick={() => router.push("/events")}
                        className="w-full py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold text-xs text-center"
                      >
                        Event Page & RSVP
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 rounded-2xl border border-dashed border-white/10 bg-white/[0.01]">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30 text-cyan-400" />
                  <h3 className="text-lg font-medium text-white mb-1">No Upcoming Events</h3>
                  <p className="text-sm text-white/50">This company hasn't scheduled any hackathons or co-hosted events yet.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* PARTNERS TAB */}
          {activeTab === "partners" && (
            <motion.div
              key="partners-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="text-lg font-display font-semibold text-white">Campus Partner Network</h3>
                  <p className="text-xs text-white/50 mt-1">Verified college organizations with co-hosted offerings.</p>
                </div>
                {isAdmin && isAdminView && (
                  <button
                    onClick={() => setShowPartnershipModal(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add Campus Partner
                  </button>
                )}
              </div>

              {partnerships.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {partnerships.map((partnership) => {
                    const org = partnership.org || {};
                    return (
                      <div key={partnership.id} className="p-5 rounded-2xl border border-white/5 bg-white/[0.01] flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center text-xl text-white font-bold shrink-0">
                            {org.logo_url ? (
                              <img src={org.logo_url} alt={org.name} className="w-full h-full object-cover" />
                            ) : (
                              org.name?.charAt(0) || "P"
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-sm block text-white">{org.name}</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {partnership.offerings?.map((off: string) => (
                                <span key={off} className="px-1.5 py-0.5 rounded text-[8px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">{off}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <NeonBadge variant="cyan">Campus Partner</NeonBadge>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-24 rounded-2xl border border-dashed border-white/10 bg-white/[0.01]">
                  <Shield className="w-12 h-12 mx-auto mb-4 opacity-30 text-cyan-400" />
                  <h3 className="text-lg font-medium text-white mb-1">No Active Partnerships</h3>
                  <p className="text-sm text-white/50">Propose partnerships to college hubs to unlock exclusive campus collaboration pipelines.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* TEAM TAB */}
          {activeTab === "team" && (
            <motion.div
              key="team-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {isAdmin && isAdminView && (
                <form onSubmit={handleAddTeamMember} className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-xl">
                  <h4 className="text-xs uppercase tracking-wider text-cyan-400 font-mono font-bold mb-3">Add Team Member / Recruiter</h4>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Enter creator handle (e.g. aashaan)"
                      value={teamHandleInput}
                      onChange={(e) => setTeamHandleInput(e.target.value)}
                      className="flex-1 bg-black/40 border border-white/10 text-white rounded-xl text-xs px-3 py-2.5 focus:outline-none focus:border-cyan-400"
                    />
                    <select
                      value={teamRoleInput}
                      onChange={(e: any) => setTeamRoleInput(e.target.value)}
                      className="bg-black/40 border border-white/10 text-white rounded-xl text-xs px-3 py-2.5 focus:outline-none focus:border-cyan-400"
                    >
                      <option value="hiring_manager">Hiring Manager</option>
                      <option value="content_manager">Content Manager</option>
                      <option value="admin">Administrator</option>
                    </select>
                    <button
                      type="submit"
                      disabled={addingTeamMember}
                      className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs disabled:opacity-50"
                    >
                      Add Member
                    </button>
                  </div>
                  {teamMessage && (
                    <p className={`text-xs mt-2 ${teamMessage.startsWith("Failed") ? "text-red-400" : "text-emerald-400"}`}>
                      {teamMessage}
                    </p>
                  )}
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Primary Company Profile representation */}
                <div className="p-4 rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-transparent flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center font-bold text-white">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                      ) : (
                        displayName.charAt(0)
                      )}
                    </div>
                    <div>
                      <span className="font-semibold text-sm block text-white">{displayName}</span>
                      <span className="text-xs text-cyan-400 font-medium block">@{companyUser.handle}</span>
                    </div>
                  </div>
                  <NeonBadge variant="magenta">Owner</NeonBadge>
                </div>

                {/* Team Members from admins table */}
                {teamMembers.map((member) => {
                  const u = member.profile || {};
                  return (
                    <div key={member.user_id} className="p-4 rounded-2xl border border-white/5 bg-white/[0.01] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center font-bold text-white">
                          {u.avatar_url ? (
                            <img src={u.avatar_url} alt={u.display_name} className="w-full h-full object-cover" />
                          ) : (
                            u.display_name?.charAt(0) || "T"
                          )}
                        </div>
                        <div>
                          <span className="font-semibold text-sm block text-white">{u.display_name || u.handle}</span>
                          <span className="text-xs text-white/50 block">@{u.handle}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <NeonBadge variant={member.role === "admin" ? "purple" : "cyan"}>
                          {member.role === "admin" ? "Admin" : member.role.replace("_", " ")}
                        </NeonBadge>
                        {isAdmin && isAdminView && (
                          <button
                            onClick={() => handleRemoveTeamMember(member.user_id)}
                            className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* REACH INBOX TAB (Admin only) */}
          {activeTab === "reach" && isAdmin && (
            <motion.div
              key="reach-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {reachMessages.filter(r => r.status === "pending").length > 0 ? (
                <div className="space-y-4">
                  {reachMessages.filter(r => r.status === "pending").map((reach) => {
                    const sender = reach.sender_profile || {};
                    return (
                      <div key={reach.id} className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] flex flex-col md:flex-row justify-between gap-6">
                        <div className="flex-1 space-y-4 min-w-0">
                          {/* Sender Info */}
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full overflow-hidden bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold shrink-0">
                              {sender.avatar_url ? (
                                <img src={sender.avatar_url} alt={sender.display_name} className="w-full h-full object-cover" />
                              ) : (
                                sender.display_name?.charAt(0) || sender.handle.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-sm text-white truncate hover:text-cyan-300 cursor-pointer" onClick={() => router.push(`/studio/${sender.handle}`)}>
                                  {sender.display_name || sender.handle}
                                </span>
                                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono font-semibold">
                                  {sender.pulse_score || 150} Aura
                                </span>
                              </div>
                              <span className="text-xs text-white/50 truncate block mt-0.5">{sender.tagline || "Creator"}</span>
                            </div>
                          </div>

                          {/* Message Content */}
                          <div>
                            <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 block mb-1">Topic: {reach.topic_tag}</span>
                            <p className="text-sm text-white leading-relaxed whitespace-pre-line p-4 rounded-xl bg-black/40 border border-white/5">{reach.content}</p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex md:flex-col justify-end gap-3 self-end md:self-center shrink-0">
                          <button
                            onClick={() => handleReachStatus(reach.id, "connected")}
                            disabled={processingId === reach.id}
                            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-all disabled:opacity-50 active:scale-95"
                          >
                            <Check className="w-4 h-4" /> Accept & Connect
                          </button>
                          <button
                            onClick={() => handleReachStatus(reach.id, "archived")}
                            disabled={processingId === reach.id}
                            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold text-xs transition-all disabled:opacity-50 active:scale-95"
                          >
                            <X className="w-4 h-4" /> Archive
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-24 rounded-2xl border border-dashed border-white/10 bg-white/[0.01]">
                  <Inbox className="w-12 h-12 mx-auto mb-4 opacity-30 text-cyan-400" />
                  <h3 className="text-lg font-medium text-white mb-1">Reach Inbox Clean</h3>
                  <p className="text-sm text-white/50">No pending direct talent Reach messages at the moment.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* TALENT ANALYTICS TAB (Admin only) */}
          {activeTab === "analytics" && isAdmin && (
            <motion.div
              key="analytics-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Stat Card 1 */}
              <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-4">Talent Funnel</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-white/80">Incoming Reach</span>
                        <span className="text-white/50">12 pitches</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-400" style={{ width: "100%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-white/80">Approved Connections</span>
                        <span className="text-white/50">4 approved (+15 Aura points issued)</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400" style={{ width: "33%" }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stat Card 2 (SVG Custom Bar Chart) */}
              <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-4">Applicant Aura Distribution</h4>
                  <div className="h-32 flex items-end justify-between gap-4 pt-4 border-b border-white/10 px-2">
                    <div className="flex flex-col items-center gap-1.5 flex-1">
                      <div className="w-full bg-cyan-500/20 border border-cyan-500/40 rounded-t-md h-[40%]" />
                      <span className="text-[9px] font-mono text-white/50 uppercase">Rising</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 flex-1">
                      <div className="w-full bg-violet-500/20 border border-violet-500/40 rounded-t-md h-[70%]" />
                      <span className="text-[9px] font-mono text-white/50 uppercase">Trusted</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 flex-1">
                      <div className="w-full bg-amber-500/20 border border-amber-500/40 rounded-t-md h-[25%]" />
                      <span className="text-[9px] font-mono text-white/50 uppercase">Core</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SEND DIRECT REACH MODAL */}
        <AnimatePresence>
          {showReachModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowReachModal(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative w-full max-w-md rounded-2xl border border-cyan-500/20 bg-[#070b0d]/95 backdrop-blur-xl text-white shadow-2xl flex flex-col p-6 z-10"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-display font-semibold flex items-center gap-2 text-cyan-400 animate-pulse">
                    🚀 Direct Talent Reach
                  </h3>
                  <button onClick={() => setShowReachModal(false)} className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {reachSuccess ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                      <Check className="w-6 h-6 text-emerald-400" />
                    </div>
                    <span className="text-sm font-semibold text-white">Reach Message Sent Successfully!</span>
                    <span className="text-xs text-white/50 mt-1">If they connect, you will unlock a direct DM thread.</span>
                  </div>
                ) : (
                  <form onSubmit={handleSendReach} className="space-y-4">
                    {reachError && (
                      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                        {reachError}
                      </div>
                    )}

                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400/80 block mb-1">Topic / Category</label>
                      <select
                        required
                        value={reachTag}
                        onChange={(e) => setReachTag(e.target.value)}
                        className="w-full bg-black/50 border border-cyan-500/20 rounded-xl p-3 text-white outline-none focus:border-cyan-500 text-sm"
                      >
                        {gatewayTopics.length > 0 ? gatewayTopics.map(t => (
                          <option key={t} value={t}>{t}</option>
                        )) : (
                          <>
                            <option value="Collab">Collaboration / Co-create</option>
                            <option value="Freelance">Freelance Contract</option>
                            <option value="Speaking">Speaking Event</option>
                            <option value="Sponsorship">Sponsorship</option>
                          </>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400/80 block mb-1">
                        {gatewayCustomPrompt || "Your Pitch / Proposal"}
                      </label>
                      <textarea
                        required
                        value={reachContent}
                        onChange={(e) => setReachContent(e.target.value)}
                        placeholder="Introduce yourself, link your best projects, and explain why you'd be a great match..."
                        rows={5}
                        maxLength={1000}
                        className="w-full bg-black/50 border border-cyan-500/20 rounded-xl p-3 text-white placeholder-gray-600 outline-none focus:border-cyan-500 resize-none text-sm leading-relaxed"
                      />
                    </div>

                    <div className="pt-2 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setShowReachModal(false)}
                        className="flex-1 py-3 rounded-xl font-semibold text-white bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={sendingReach || !reachContent.trim()}
                        className="flex-1 py-3 rounded-xl font-semibold text-black bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
                      >
                        {sendingReach ? "Sending..." : "Send Pitch"}
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* POST OPPORTUNITY / COLLAB CALL MODAL */}
        <AnimatePresence>
          {showCollabModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowCollabModal(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative w-full max-w-lg rounded-2xl border border-cyan-500/20 bg-[#070b0d]/95 backdrop-blur-xl text-white shadow-2xl flex flex-col p-6 z-10"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-display font-bold text-cyan-400">
                    📢 Post an Opportunity / Collab Call
                  </h3>
                  <button onClick={() => setShowCollabModal(false)} className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateCollab} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400 block mb-1">Opportunity Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Seeking Frontend Architect for Spatial Web App"
                      value={collabTitle}
                      onChange={(e) => setCollabTitle(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white placeholder-gray-600 outline-none focus:border-cyan-400 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400 block mb-1">Description / Details</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Describe the collaboration requirements, project details, and deliverables..."
                      value={collabDesc}
                      onChange={(e) => setCollabDesc(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white placeholder-gray-600 outline-none focus:border-cyan-400 text-sm resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400 block mb-1">Type</label>
                      <select
                        value={collabType}
                        onChange={(e: any) => setCollabType(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-cyan-400 text-sm"
                      >
                        <option value="collab">Partnership (Collab)</option>
                        <option value="paid">Paid Project</option>
                        <option value="open-source">Open Source</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400 block mb-1">Time Commitment</label>
                      <input
                        type="text"
                        placeholder="e.g. 2 weeks, 15 hrs/wk"
                        value={collabCommitment}
                        onChange={(e) => setCollabCommitment(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white placeholder-gray-600 outline-none focus:border-cyan-400 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400 block mb-1">Budget / Compensation</label>
                      <input
                        type="text"
                        placeholder="e.g. $1,500 stipend / equity"
                        disabled={collabType !== "paid"}
                        value={collabBudget}
                        onChange={(e) => setCollabBudget(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white placeholder-gray-600 outline-none focus:border-cyan-400 text-sm disabled:opacity-40"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400 block mb-1">Spots Open</label>
                      <input
                        type="number"
                        min={1}
                        value={collabSpots}
                        onChange={(e) => setCollabSpots(Number(e.target.value))}
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-cyan-400 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400 block mb-1">Skills needed (Comma-separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. React, Figma, Tailwind"
                      value={collabSkills}
                      onChange={(e) => setCollabSkills(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white placeholder-gray-600 outline-none focus:border-cyan-400 text-sm"
                    />
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowCollabModal(false)}
                      className="flex-1 py-3 rounded-xl font-semibold text-white bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreatingCollab || !collabTitle.trim()}
                      className="flex-1 py-3 rounded-xl font-semibold text-black bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 transition-all flex items-center justify-center"
                    >
                      {isCreatingCollab ? "Creating..." : "Publish Opportunity"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* CO-HOST EVENT MODAL */}
        <AnimatePresence>
          {showEventModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowEventModal(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative w-full max-w-lg rounded-2xl border border-cyan-500/20 bg-[#070b0d]/95 backdrop-blur-xl text-white shadow-2xl flex flex-col p-6 z-10"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-display font-bold text-cyan-400">
                    📅 Schedule Co-hosted Event
                  </h3>
                  <button onClick={() => setShowEventModal(false)} className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateEvent} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400 block mb-1">Event Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Spatial Interfaces Hackathon"
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white placeholder-gray-600 outline-none focus:border-cyan-400 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400 block mb-1">Description</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Specify the agenda, hosts, keynotes, and prizes..."
                      value={eventDesc}
                      onChange={(e) => setEventDesc(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white placeholder-gray-600 outline-none focus:border-cyan-400 text-sm resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400 block mb-1">Category</label>
                      <select
                        value={eventCategory}
                        onChange={(e) => setEventCategory(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-cyan-400 text-sm"
                      >
                        <option value="hackathon">Hackathon</option>
                        <option value="music">Music Event</option>
                        <option value="academic">Academic Hub</option>
                        <option value="social">Social Meetup</option>
                        <option value="misc">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400 block mb-1">Location / Venue</label>
                      <input
                        type="text"
                        placeholder="e.g. VIT Auditorium / Online"
                        value={eventLocation}
                        onChange={(e) => setEventLocation(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white placeholder-gray-600 outline-none focus:border-cyan-400 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400 block mb-1">Start Time</label>
                      <input
                        type="datetime-local"
                        required
                        value={eventStartsAt}
                        onChange={(e) => setEventStartsAt(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-cyan-400 text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400 block mb-1">End Time</label>
                      <input
                        type="datetime-local"
                        required
                        value={eventEndsAt}
                        onChange={(e) => setEventEndsAt(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-cyan-400 text-sm"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowEventModal(false)}
                      className="flex-1 py-3 rounded-xl font-semibold text-white bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreatingEvent || !eventStartsAt || !eventEndsAt}
                      className="flex-1 py-3 rounded-xl font-semibold text-black bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 transition-all flex items-center justify-center"
                    >
                      {isCreatingEvent ? "Creating..." : "Schedule Event"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* CAMPUS PARTNERSHIP PROPOSAL MODAL */}
        <AnimatePresence>
          {showPartnershipModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowPartnershipModal(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative w-full max-w-md rounded-2xl border border-cyan-500/20 bg-[#070b0d]/95 backdrop-blur-xl text-white shadow-2xl flex flex-col p-6 z-10"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-display font-bold text-cyan-400">
                    🛡️ Propose Campus Partnership
                  </h3>
                  <button onClick={() => setShowPartnershipModal(false)} className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {partnershipSuccess ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                      <Check className="w-6 h-6 text-emerald-400" />
                    </div>
                    <span className="text-sm font-semibold text-white">Partnership Proposal Transmitted!</span>
                    <span className="text-xs text-white/50 mt-1">Pending student organization approval.</span>
                  </div>
                ) : (
                  <form onSubmit={handleProposePartnership} className="space-y-4">
                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400 block mb-1">Select Student Hub / Organisation</label>
                      <select
                        required
                        value={selectedOrgId}
                        onChange={(e) => setSelectedOrgId(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-cyan-400 text-sm"
                      >
                        <option value="">-- Choose Organisation --</option>
                        {orgsList.map(org => (
                          <option key={org.id} value={org.id}>
                            {org.display_name || org.handle} (@{org.handle})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400 block mb-1">Offerings (Comma-separated)</label>
                      <textarea
                        required
                        rows={3}
                        placeholder="e.g. Exclusive Hackathons, Fast-track Hiring, Dev Stipends"
                        value={partnershipOfferings}
                        onChange={(e) => setPartnershipOfferings(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white placeholder-gray-600 outline-none focus:border-cyan-400 text-sm resize-none"
                      />
                    </div>

                    <div className="pt-2 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setShowPartnershipModal(false)}
                        className="flex-1 py-3 rounded-xl font-semibold text-white bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submittingPartnership || !selectedOrgId}
                        className="flex-1 py-3 rounded-xl font-semibold text-black bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 transition-all flex items-center justify-center"
                      >
                        {submittingPartnership ? "Transmitting..." : "Send Proposal"}
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* PROPOSE B2B COLLAB MODAL */}
        <AnimatePresence>
          {showB2bModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowB2bModal(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative w-full max-w-md rounded-2xl border border-cyan-500/20 bg-[#070b0d]/95 backdrop-blur-xl text-white shadow-2xl flex flex-col p-6 z-10"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-display font-bold text-cyan-400">
                    💼 Propose B2B Collaboration
                  </h3>
                  <button onClick={() => setShowB2bModal(false)} className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {b2bSuccess ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                      <Check className="w-6 h-6 text-emerald-400" />
                    </div>
                    <span className="text-sm font-semibold text-white">B2B Proposal Transmitted!</span>
                    <span className="text-xs text-white/50 mt-1">Direct message sent to target company inbox.</span>
                  </div>
                ) : (
                  <form onSubmit={handleProposeB2b} className="space-y-4">
                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400 block mb-1">Select Partner Company</label>
                      <select
                        required
                        value={selectedCompanyId}
                        onChange={(e) => setSelectedCompanyId(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-cyan-400 text-sm"
                      >
                        <option value="">-- Choose Company --</option>
                        {companiesList.map(comp => (
                          <option key={comp.id} value={comp.id}>
                            {comp.display_name || comp.handle} (@{comp.handle})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400 block mb-1">Proposal Details</label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Detail the collaborative project scope, mutual benefits, and timeline..."
                        value={b2bProposal}
                        onChange={(e) => setB2bProposal(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white placeholder-gray-600 outline-none focus:border-cyan-400 text-sm resize-none"
                      />
                    </div>

                    <div className="pt-2 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setShowB2bModal(false)}
                        className="flex-1 py-3 rounded-xl font-semibold text-white bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={sendingB2b || !selectedCompanyId}
                        className="flex-1 py-3 rounded-xl font-semibold text-black bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 transition-all flex items-center justify-center"
                      >
                        {sendingB2b ? "Transmitting..." : "Send Proposal"}
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
