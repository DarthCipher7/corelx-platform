"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import { 
  Loader2, 
  Check, 
  User, 
  Flame, 
  Globe, 
  Upload, 
  Sparkles, 
  Building, 
  Home, 
  Search, 
  ChevronRight, 
  Clock 
} from "lucide-react";

// Aura Tier Configuration matching the profile/studio system
const AURA_TIERS = [
  {
    min: 0,
    max: 199,
    name: "New",
    icon: "🌱",
    color: "#9ca3af",
    gradientStart: "#4b5563",
    gradientEnd: "#6b7280",
    glow: false,
    shadowColor: "transparent",
    description: "Base access to features and hubs.",
    perks: "Standard access, creation rights."
  },
  {
    min: 200,
    max: 449,
    name: "Rising",
    icon: "⚡",
    color: "#22d3ee",
    gradientStart: "#06b6d4",
    gradientEnd: "#3b82f6",
    glow: false,
    shadowColor: "transparent",
    description: "Growing presence and enhanced visibility.",
    perks: "Higher feed priority, premium badge."
  },
  {
    min: 450,
    max: 699,
    name: "Trusted",
    icon: "🔥",
    color: "#a78bfa",
    gradientStart: "#8b5cf6",
    gradientEnd: "#6366f1",
    glow: false,
    shadowColor: "transparent",
    description: "Vouched member with endorsement privileges.",
    perks: "Can endorse other members (+8 Aura)."
  },
  {
    min: 700,
    max: 899,
    name: "Core",
    icon: "💎",
    color: "#fbbf24",
    gradientStart: "#f59e0b",
    gradientEnd: "#eab308",
    glow: false,
    shadowColor: "transparent",
    description: "Key contributor with community privilege.",
    perks: "Early feature access, moderation rights."
  },
  {
    min: 900,
    max: 1000,
    name: "Pillar",
    icon: "🌟",
    color: "#f43f5e",
    gradientStart: "#f43f5e",
    gradientEnd: "#ef4444",
    glow: true,
    shadowColor: "rgba(244, 63, 94, 0.5)",
    description: "Pillar of the community representing maximum vitality.",
    perks: "Host pinned events, priority feed placement, glowing profile aura."
  }
];

function getAuraTier(score: number) {
  const normalizedScore = Math.max(0, Math.min(1000, score || 150));
  return AURA_TIERS.find(t => normalizedScore >= t.min && normalizedScore <= t.max) || AURA_TIERS[0];
}

const DEFAULT_AVATARS = [
  { name: "Cyberpunk", path: "/avatars/cyber_avatar.png" },
  { name: "Cosmic", path: "/avatars/cosmic_avatar.png" },
  { name: "Synthwave", path: "/avatars/synthwave_avatar.png" },
  { name: "Glassmorphic", path: "/avatars/glassmorphic_avatar.png" }
];

const TABS = [
  { id: "profile", name: "Profile Settings", icon: User },
  { id: "aura", name: "Aura Telemetry", icon: Flame },
  { id: "hub", name: "Hub Connectivity", icon: Globe }
];

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [handle, setHandle] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [pulseScore, setPulseScore] = useState(150);
  const [tagline, setTagline] = useState("");
  const [availabilityStatus, setAvailabilityStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  
  // Tabs State
  const [activeTab, setActiveTab] = useState<"profile" | "aura" | "hub">("profile");

  // Hub States
  const [selectedCollege, setSelectedCollege] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchingColleges, setSearchingColleges] = useState(false);
  const [isCreatingHub, setIsCreatingHub] = useState(false);

  // Custom Hub Form States
  const [newHubName, setNewHubName] = useState("");
  const [newHubShortName, setNewHubShortName] = useState("");
  const [newHubType, setNewHubType] = useState<"college" | "society" | "corporate" | "other">("college");
  const [newHubCity, setNewHubCity] = useState("");

  // Aura History State
  const [pulseEvents, setPulseEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const router = useRouter();

  // Load User Profile on Mount
  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);
      
      const { data, error } = await supabase
        .from("users")
        .select("handle, display_name, avatar_url, pulse_score, tagline, availability_status, college_id, colleges(*)")
        .eq("id", user.id)
        .single();
        
      if (data) {
        setHandle(data.handle || "");
        setDisplayName(data.display_name || "");
        setAvatarUrl(data.avatar_url || "");
        setPulseScore(data.pulse_score ?? 150);
        setTagline(data.tagline || "");
        setAvailabilityStatus(data.availability_status || "");
        if (data.colleges) {
          const collegeData = Array.isArray(data.colleges) ? data.colleges[0] : data.colleges;
          if (collegeData) {
            setSelectedCollege(collegeData);
          }
        }
      }
      setLoading(false);
    }
    
    loadProfile();
  }, [router, supabase]);

  // Load Aura Events (Lazy loaded on Aura tab mount)
  useEffect(() => {
    if (activeTab === "aura" && user) {
      async function loadEvents() {
        setLoadingEvents(true);
        try {
          const { data, error } = await supabase
            .from("pulse_event")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });
          
          if (!error) {
            setPulseEvents(data || []);
          }
        } catch (e) {
          console.error("Failed to load pulse events:", e);
        } finally {
          setLoadingEvents(false);
        }
      }
      loadEvents();
    }
  }, [activeTab, user, supabase]);

  // Search Colleges/Hubs
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const searchHubs = async () => {
      setSearchingColleges(true);
      const { data } = await supabase
        .from("colleges")
        .select("id, name, short_name, hub_type, email_domain")
        .or(`name.ilike.%${searchQuery.trim()}%,short_name.ilike.%${searchQuery.trim()}%`)
        .limit(5);
      setSearchResults(data || []);
      setSearchingColleges(false);
    };
    const debounceId = setTimeout(searchHubs, 300);
    return () => clearTimeout(debounceId);
  }, [searchQuery, supabase]);

  const handleSelectHub = (college: any) => {
    setSelectedCollege(college);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleCreateHub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHubName.trim()) return;
    setSaving(true);
    
    // Check if name already exists
    const { data: existing } = await supabase
      .from('colleges')
      .select('id, name, short_name, hub_type, email_domain')
      .eq('name', newHubName.trim())
      .maybeSingle();

    if (existing) {
      setSelectedCollege(existing);
      setIsCreatingHub(false);
      setSaving(false);
      return;
    }

    const { data: newCollege, error } = await supabase
      .from('colleges')
      .insert({
        name: newHubName.trim(),
        short_name: newHubShortName.trim() || null,
        hub_type: newHubType,
        city: newHubCity.trim() || null,
        is_verified: true
      })
      .select()
      .single();

    if (!error && newCollege) {
      setSelectedCollege(newCollege);
      setIsCreatingHub(false);
      setNewHubName("");
      setNewHubShortName("");
      setNewHubCity("");
    } else {
      console.error("Hub creation error:", error);
      alert(error?.message || "Failed to create hub");
    }
    setSaving(false);
  };

  // Avatar Upload Handler
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate if it is an image
    if (!file.type.startsWith("image/")) {
      setMessage({ text: "Please upload a valid image file.", type: "error" });
      return;
    }

    // Size limit check (e.g. 5MB for fast loading)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ text: "Image size must be less than 5MB.", type: "error" });
      return;
    }

    setUploadingAvatar(true);
    setMessage({ text: "", type: "" });

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_avatar_${Date.now()}.${fileExt}`;
      const filePath = fileName;

      // Upload file to Supabase storage 'media' bucket
      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("media")
        .getPublicUrl(filePath);

      // Update users table
      const { error: dbError } = await supabase
        .from("users")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (dbError) throw dbError;

      setAvatarUrl(publicUrl);
      setMessage({ text: "Avatar updated successfully!", type: "success" });
    } catch (err: any) {
      console.error("Avatar upload failed:", err);
      setMessage({ text: err.message || "Failed to upload avatar.", type: "error" });
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Profile Form Save Handler
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage({ text: "", type: "" });
    
    const { error } = await supabase
      .from("users")
      .update({
        handle: handle.trim(),
        display_name: displayName.trim(),
        tagline: tagline.trim(),
        availability_status: availabilityStatus.trim(),
        avatar_url: avatarUrl,
        college_id: selectedCollege ? selectedCollege.id : null,
        // update email domain and verified status if selectedCollege has domain
        email_domain: selectedCollege?.email_domain || null,
        is_email_verified: selectedCollege?.email_domain ? (user.email?.toLowerCase().endsWith(selectedCollege.email_domain.toLowerCase()) ?? false) : false
      })
      .eq("id", user.id);
      
    setSaving(false);
    
    if (error) {
      setMessage({ text: error.message, type: "error" });
    } else {
      setMessage({ text: "Profile settings updated successfully!", type: "success" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-4 flex items-center justify-center bg-[#02020a] dot-bg grid-bg mesh-bg">
        <div className="w-8 h-8 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  // Aura tiers calculations
  const currentTier = getAuraTier(pulseScore);
  const currentTierIndex = AURA_TIERS.findIndex(t => t.name === currentTier.name);
  const nextTier = currentTierIndex < AURA_TIERS.length - 1 ? AURA_TIERS[currentTierIndex + 1] : null;

  let progressPercent = 100;
  let pointsToNext = 0;
  if (nextTier) {
    const range = nextTier.min - currentTier.min;
    const earned = pulseScore - currentTier.min;
    progressPercent = Math.min(100, Math.max(0, (earned / range) * 100));
    pointsToNext = nextTier.min - pulseScore;
  }

  return (
    <div className="min-h-screen pt-32 pb-24 px-4 bg-[#02020a] dot-bg grid-bg mesh-bg">
      <div className="max-w-4xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-10 text-left">
          <h1 className="text-4xl font-display font-bold gradient-text-cyber mb-2">
            Control Panel
          </h1>
          <p className="text-sm text-[var(--text-secondary)] font-medium">
            Manage your digital studio profile, view Aura telemetry levels, and connect to community hubs.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-white/5 mb-8 overflow-x-auto no-scrollbar gap-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setMessage({ text: "", type: "" });
                }}
                className={`flex items-center gap-2 pb-4 px-4 text-sm font-semibold transition-all relative whitespace-nowrap cursor-pointer ${
                  isActive 
                    ? "text-white" 
                    : "text-[var(--text-secondary)] hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-purple-400" : "text-gray-400"}`} />
                {tab.name}
                {isActive && (
                  <motion.div
                    layoutId="activeSettingsTabUnderline"
                    className="absolute bottom-0 inset-x-0 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Glassmorphic Panel Container */}
        <div className="glass-card rounded-2xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
          
          {/* Status Message Overlay */}
          {message.text && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl text-sm font-semibold mb-6 border ${
                message.type === 'error' 
                  ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                  : 'bg-green-500/10 text-green-400 border-green-500/20'
              }`}
            >
              <div className="flex items-center gap-2">
                {message.type === 'success' && <Check className="w-4 h-4 shrink-0" />}
                <span>{message.text}</span>
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            
            {/* 1. Profile Settings Tab */}
            {activeTab === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-10"
              >
                {/* Custom Avatar Upload Col */}
                <div className="flex flex-col items-center justify-start lg:border-r border-white/5 lg:pr-10 pb-6 lg:pb-0">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)] mb-4 block w-full text-center">
                    User Identity
                  </span>
                  
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="relative w-32 h-32 rounded-full p-[3px] cursor-pointer group transition-all duration-300 overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${currentTier.gradientStart}, ${currentTier.gradientEnd})`,
                      boxShadow: currentTier.glow ? `0 0 20px ${currentTier.shadowColor}` : "0 0 15px rgba(108, 92, 231, 0.15)",
                    }}
                  >
                    <div className="w-full h-full rounded-full p-[2px]" style={{ backgroundColor: "var(--bg-void)" }}>
                      <div className="w-full h-full rounded-full overflow-hidden relative flex items-center justify-center text-4xl font-bold text-white bg-void/60">
                        {uploadingAvatar ? (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                          </div>
                        ) : avatarUrl ? (
                          <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          displayName?.charAt(0) || handle?.charAt(0).toUpperCase() || "?"
                        )}

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity duration-200">
                          <Upload className="w-5 h-5 text-white animate-pulse" />
                          <span className="text-[9px] font-semibold text-white uppercase tracking-wider">Change Photo</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleAvatarUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />
                  
                  <div className="text-center mt-4">
                    <h3 className="text-base font-bold text-white leading-none">{displayName || `@${handle}`}</h3>
                    <div className="flex items-center justify-center gap-1.5 mt-2 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full">
                      <span className="text-[10px] text-purple-400 font-bold font-mono tracking-wide uppercase">
                        {currentTier.icon} {currentTier.name} Tier
                      </span>
                    </div>
                  </div>

                  <div className="mt-8 w-full border-t border-white/5 pt-6">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)] mb-3 block w-full text-center">
                      Or Choose Default
                    </span>
                    <div className="grid grid-cols-4 gap-2.5 px-2">
                      {DEFAULT_AVATARS.map((av, index) => {
                        const isSelected = avatarUrl === av.path;
                        return (
                          <button
                            key={index}
                            type="button"
                            onClick={() => {
                              setAvatarUrl(av.path);
                              setMessage({ text: `Selected ${av.name} avatar! Remember to Save Changes.`, type: "success" });
                            }}
                            className={`relative aspect-square rounded-full overflow-hidden border-2 cursor-pointer transition-all hover:scale-105 ${
                              isSelected 
                                ? "border-purple-500 scale-105 shadow-[0_0_12px_rgba(168,85,247,0.4)]" 
                                : "border-white/10 hover:border-white/30"
                            }`}
                            title={av.name}
                          >
                            <img src={av.path} alt={av.name} className="w-full h-full object-cover" />
                            {isSelected && (
                              <div className="absolute inset-0 bg-purple-600/20 flex items-center justify-center">
                                <Check className="w-4 h-4 text-white drop-shadow-md" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Profile Form Details Col */}
                <form onSubmit={handleSave} className="lg:col-span-2 space-y-5">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)] mb-2 block">
                    Metadata Parameters
                  </span>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2 font-mono">
                      Display Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Your full name or alias"
                      className="input-nova"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2 font-mono">
                      Unique Handle
                    </label>
                    <div className="flex">
                      <span className="flex items-center px-4 rounded-l-xl text-sm font-semibold border-y border-l border-white/5 bg-void/50 text-[var(--text-muted)]">
                        @
                      </span>
                      <input
                        type="text"
                        required
                        className="w-full rounded-r-xl px-4 py-3 bg-void/50 border border-white/5 focus:border-purple-500 focus:shadow-[0_0_12px_rgba(108,92,231,0.2)] text-white outline-none transition-all"
                        value={handle}
                        onChange={(e) => setHandle(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2 font-mono">
                      Tagline / Bio
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Senior Frontend Architect / Creator"
                      className="input-nova"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2 font-mono">
                      Availability Status
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Available for premium collaborations"
                      className="input-nova"
                      value={availabilityStatus}
                      onChange={(e) => setAvailabilityStatus(e.target.value)}
                    />
                  </div>

                  <div className="pt-4 border-t border-white/5 flex justify-end">
                    <Button variant="primary" disabled={saving}>
                      {saving ? "Saving Changes..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* 2. Aura Telemetry Tab */}
            {activeTab === "aura" && (
              <motion.div
                key="aura"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Glowing telemetry card */}
                  <div className="md:col-span-1 p-6 rounded-2xl border bg-void/40 border-purple-500/20 shadow-[0_0_20px_rgba(108,92,231,0.15)] relative overflow-hidden flex flex-col justify-center items-center text-center group">
                    <div className="absolute -inset-px bg-gradient-to-tr from-purple-500/10 to-cyan-500/10 rounded-2xl opacity-50 pointer-events-none" />
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] font-mono mb-2">
                      Pulse Strength
                    </span>
                    <div className="text-6xl font-bold font-display text-white mb-2 flex items-center gap-1 drop-shadow-[0_0_12px_rgba(168,85,247,0.4)]">
                      <span>🔥</span>
                      <span>{pulseScore}</span>
                    </div>
                    <div className="text-sm font-bold flex items-center gap-1.5 mt-2" style={{ color: currentTier.color }}>
                      <span>{currentTier.icon}</span> {currentTier.name} Level
                    </div>
                  </div>

                  {/* progression progress bar */}
                  <div className="md:col-span-2 p-6 rounded-2xl border border-white/5 bg-void/20 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] font-mono">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> 
                          Progression to Next Tier
                        </span>
                        <span>
                          {nextTier ? `${pulseScore} / ${nextTier.min} pts` : "Max Level Reached"}
                        </span>
                      </div>
                      
                      <div className="relative h-3.5 w-full bg-void border border-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercent}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 rounded-full" 
                        />
                      </div>
                    </div>

                    {nextTier ? (
                      <p className="text-xs text-[var(--text-secondary)] font-medium mt-4">
                        Unlock <span style={{ color: nextTier.color }} className="font-bold">{nextTier.icon} {nextTier.name}</span> in <span className="text-white font-bold">{pointsToNext} points</span>.
                      </p>
                    ) : (
                      <p className="text-xs text-green-400 font-bold mt-4 flex items-center gap-1.5">
                        🌟 Max tier unlocked. You are representing the absolute highest core tier.
                      </p>
                    )}
                  </div>
                </div>

                {/* Showcase all tiers */}
                <div className="space-y-3 border-t border-white/5 pt-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] font-mono">
                    Aura Tiers Specification
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                    {AURA_TIERS.map((tier) => {
                      const isActive = currentTier.name === tier.name;
                      return (
                        <div 
                          key={tier.name}
                          className={`p-4 rounded-xl border transition-all duration-300 flex flex-col items-center justify-between text-center relative ${
                            isActive 
                              ? "bg-gradient-to-b from-purple-900/10 to-indigo-900/10 border-purple-500/40 shadow-[0_0_15px_rgba(108,92,231,0.15)]" 
                              : "bg-void/25 border-white/5 opacity-40 hover:opacity-60"
                          }`}
                        >
                          <span className="text-2xl mb-1">{tier.icon}</span>
                          <span className={`text-xs font-bold ${isActive ? "text-white" : "text-[var(--text-secondary)]"}`}>{tier.name}</span>
                          <span className="text-[9px] text-[var(--text-muted)] font-mono mt-0.5">{tier.min}-{tier.max} pts</span>
                          {isActive && (
                            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Aura Events scrollable list */}
                <div className="space-y-4 border-t border-white/5 pt-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] font-mono flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Recent Aura Activity Log
                  </h3>
                  
                  {loadingEvents ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                    </div>
                  ) : pulseEvents.length > 0 ? (
                    <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {pulseEvents.map((evt) => {
                        const isPositive = evt.delta >= 0;
                        return (
                          <div 
                            key={evt.id} 
                            className="p-3.5 rounded-xl border border-white/5 bg-void/45 flex items-center justify-between hover:bg-white/5 transition-colors duration-200"
                          >
                            <div className="flex items-center gap-3">
                              <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                                isPositive 
                                  ? "bg-green-500/10 text-green-400 border border-green-500/20" 
                                  : "bg-red-500/10 text-red-400 border border-red-500/20"
                              }`}>
                                {isPositive ? `+${evt.delta}` : evt.delta}
                              </span>
                              <div className="text-left">
                                <p className="text-sm font-medium text-white">{evt.reason}</p>
                                <span className="text-[9px] text-[var(--text-muted)] font-mono">
                                  {new Date(evt.created_at).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6 border border-dashed border-white/5 rounded-xl text-sm text-[var(--text-muted)] bg-void/20">
                      No recent Aura events recorded.
                    </div>
                  )}
                </div>

              </motion.div>
            )}

            {/* 3. Hub Connectivity Tab */}
            {activeTab === "hub" && (
              <motion.div
                key="hub"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-6 text-left"
              >
                <div className="p-5 rounded-2xl border border-white/5 bg-void/30">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)] mb-3 block">
                    Campus & Community Hub
                  </span>
                  
                  {selectedCollege ? (
                    <div className="p-4 rounded-xl border border-purple-500/20 bg-void/50 flex items-center justify-between">
                      <div>
                        <span className="text-[var(--text-muted)] text-[9px] uppercase font-mono tracking-widest block">Active Tag</span>
                        <span className="text-white font-bold text-base block mt-1">
                          {selectedCollege.name} ({selectedCollege.short_name || 'No tag'})
                        </span>
                        <span className="text-xs text-purple-400 font-medium block mt-1">
                          {selectedCollege.hub_type === "society" ? "🏡 Society Hub" : selectedCollege.hub_type === "corporate" ? "🏢 Corporate Space" : "🏫 Campus Hub"}
                        </span>
                      </div>
                      <Button 
                        type="button" 
                        variant="danger" 
                        size="sm"
                        onClick={() => setSelectedCollege(null)}
                      >
                        Leave Hub
                      </Button>
                    </div>
                  ) : (
                    <div className="p-5 rounded-xl border border-dashed border-white/10 bg-void/25 text-center text-sm text-[var(--text-muted)]">
                      Not associated with any campus or community hub.
                    </div>
                  )}
                </div>

                {!selectedCollege && !isCreatingHub && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] font-mono">
                        Search Community Hub
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search and join a campus, society, corporate space..."
                          className="input-nova pl-11"
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                          <Search className="w-4 h-4" />
                        </div>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
                          {searchingColleges && (
                            <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {searchResults.length > 0 ? (
                      <div className="rounded-xl overflow-hidden border border-white/5 bg-void/60 divide-y divide-white/5 shadow-2xl">
                        {searchResults.map((hub) => (
                          <button
                            key={hub.id}
                            type="button"
                            onClick={() => handleSelectHub(hub)}
                            className="w-full px-4 py-3.5 text-left flex items-center justify-between transition-colors hover:bg-white/5 text-white"
                          >
                            <div>
                              <div className="font-semibold text-sm">{hub.name}</div>
                              <div className="text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-wider mt-1 flex items-center gap-1.5">
                                <span>{hub.hub_type === "society" ? "🏡 Society Hub" : hub.hub_type === "corporate" ? "🏢 Corporate Space" : "🏫 Campus Hub"}</span>
                                {hub.short_name && (
                                  <>
                                    <span>•</span>
                                    <span className="text-purple-400 font-bold">{hub.short_name}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                          </button>
                        ))}
                      </div>
                    ) : searchQuery.trim().length > 2 && !searchingColleges ? (
                      <div className="text-center py-6 border border-white/5 rounded-xl text-xs text-[var(--text-muted)] bg-void/25">
                        No hubs match your search.
                      </div>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingHub(true);
                        setNewHubName(searchQuery);
                      }}
                      className="text-xs text-purple-400 hover:text-purple-300 underline font-semibold block transition-colors cursor-pointer"
                    >
                      + Can't find it? Create a custom hub manually
                    </button>
                  </div>
                )}

                {isCreatingHub && (
                  <div className="p-5 rounded-xl border border-white/5 bg-void/35 space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <span className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Create Custom Hub
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsCreatingHub(false)}
                        className="text-xs text-purple-400 hover:text-purple-300 underline transition-colors cursor-pointer"
                      >
                        Back to Search
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] font-mono mb-1.5">
                          Hub Name
                        </label>
                        <input
                          type="text"
                          value={newHubName}
                          onChange={(e) => setNewHubName(e.target.value)}
                          placeholder="e.g. Prestige Palms Society"
                          className="input-nova"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] font-mono mb-1.5">
                            Short Name / Tag
                          </label>
                          <input
                            type="text"
                            value={newHubShortName}
                            onChange={(e) => setNewHubShortName(e.target.value)}
                            placeholder="e.g. PPS"
                            className="input-nova"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] font-mono mb-1.5">
                            City
                          </label>
                          <input
                            type="text"
                            value={newHubCity}
                            onChange={(e) => setNewHubCity(e.target.value)}
                            placeholder="e.g. Chennai"
                            className="input-nova"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] font-mono mb-1.5">
                          Hub Type
                        </label>
                        <select
                          value={newHubType}
                          onChange={(e) => setNewHubType(e.target.value as any)}
                          className="w-full bg-void/50 border border-white/5 focus:border-purple-500 focus:shadow-[0_0_12px_rgba(108,92,231,0.2)] rounded-xl px-4 py-3 text-sm text-white outline-none transition-all"
                        >
                          <option value="college">Campus Hub 🏫</option>
                          <option value="society">Society / RWA 🏡</option>
                          <option value="corporate">Corporate Space 🏢</option>
                          <option value="other">Other Community 🌐</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={handleCreateHub}
                        disabled={!newHubName.trim()}
                        className="w-full py-3 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all duration-200 active:scale-98 shadow-[0_4px_15px_rgba(108,92,231,0.3)] hover:shadow-[0_4px_20px_rgba(108,92,231,0.45)] cursor-pointer"
                      >
                        Create and Select Hub
                      </button>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSave} className="pt-4 border-t border-white/5 flex justify-end">
                  <Button variant="primary" disabled={saving}>
                    {saving ? "Saving Changes..." : "Save Changes"}
                  </Button>
                </form>
              </motion.div>
            )}

          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
