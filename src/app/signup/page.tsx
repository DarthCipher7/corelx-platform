"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Upload, ChevronRight, Loader2, GraduationCap, ShieldCheck, AlertTriangle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { SKILLS_ALL } from "@/lib/data";

// ── Email Gate Types ──────────────────────────────────────────
type EmailGateState = 'checking' | 'verified' | 'unrecognised' | 'skipped';

interface CollegeInfo {
  id: string;
  name: string;
  short_name?: string;
  email_domain: string;
}

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [user, setUser] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);

  // Email Gate State
  const [emailGate, setEmailGate] = useState<EmailGateState>('checking');
  const [detectedCollege, setDetectedCollege] = useState<CollegeInfo | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchingColleges, setSearchingColleges] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState<any>(null);
  const [isCreatingHub, setIsCreatingHub] = useState(false);

  // Custom Hub Form States
  const [newHubName, setNewHubName] = useState("");
  const [newHubShortName, setNewHubShortName] = useState("");
  const [newHubType, setNewHubType] = useState<"college" | "society" | "corporate" | "other">("college");
  const [newHubCity, setNewHubCity] = useState("");

  // Step 1 State
  const [handle, setHandle] = useState("");
  const [handleAvailable, setHandleAvailable] = useState<boolean | null>(null);
  const [checkingHandle, setCheckingHandle] = useState(false);

  // Step 2 State
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("All");

  // Step 3 State
  const [tagline, setTagline] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const SKILL_CATEGORIES: Record<string, string[]> = {
    "All": SKILLS_ALL,
    "Design": [
      "UI Design", "UX Research", "UX Writing", "Product Design", "Interaction Design",
      "Visual Design", "Graphic Design", "Brand Identity", "Logo Design", "Poster Design",
      "Typography", "Color Theory", "Print Design", "Packaging Design", "Icon Design",
      "Illustration", "Digital Painting", "Concept Art", "Character Design", "Storyboarding",
      "Comic Art", "Manga Art", "Pixel Art", "Infographic Design", "Presentation Design",
      "Figma", "Adobe XD", "Photoshop", "Illustrator", "InDesign", "Sketch", "Procreate",
      "3D Art", "Blender", "Cinema4D", "Maya", "ZBrush", "Houdini", "AR/VR Design", "Game Assets",
      "Product Rendering", "Architectural Viz", "3D Typography"
    ],
    "Film & Video": [
      "Motion Design", "Video Editing", "Film Editing", "Color Grading", "VFX",
      "After Effects", "Premiere Pro", "DaVinci Resolve", "Final Cut Pro", "CapCut",
      "Cinematography", "Videography", "Drone Videography", "Documentary Filmmaking", "Short Films",
      "Short Film Making", "YouTube Content", "Reel Editing", "Subtitling & Captions", "Green Screen",
      "Animation", "2D Animation", "3D Animation", "Rigging", "Storyboard Animation"
    ],
    "Music": [
      "Music Production", "Beat Making", "Sound Design", "Mixing & Mastering",
      "Ableton", "FL Studio", "Logic Pro", "GarageBand", "Podcast Production",
      "Voice Over", "Jingle Writing", "Music Composition", "DJ / Electronic Music",
      "Audio Branding"
    ],
    "Photography": [
      "Photography", "Portrait Photography", "Product Photography", "Fashion Photography",
      "Event Photography", "Photo Retouching", "Photo Editing", "Street Photography"
    ],
    "Code": [
      "React", "Next.js", "Vue", "Angular", "TypeScript", "JavaScript",
      "Python", "Rust", "Go", "Swift", "Kotlin", "Flutter", "React Native",
      "Node.js", "FastAPI", "GraphQL", "REST APIs", "Database Design",
      "DevOps", "AWS", "Docker", "Kubernetes", "Web3", "Solidity", "Three.js",
      "WebGL", "GLSL", "Framer", "Webflow", "WordPress", "Shopify"
    ],
    "AI": [
      "AI/ML", "Stable Diffusion", "LLMs", "PyTorch", "TensorFlow", "Data Science"
    ],
    "Gaming": [
      "Game Design", "Game Testing / QA", "Level Design", "Narrative Design",
      "Pixel Art", "Game Assets", "Unity", "Unreal Engine", "Godot",
      "Gameplay Programming", "Mod Development", "Game Trailer Editing",
      "Playtesting", "Speedrunning / Streaming"
    ],
    "Art": [
      "Illustration", "Digital Painting", "Concept Art", "Character Design",
      "Comic Art", "Manga Art", "Pixel Art", "Oil Painting", "Watercolor",
      "Acrylic Painting", "Mural Art", "Graffiti / Street Art", "Printmaking", "Collage Art",
      "Fashion Design", "Textile Art", "Jewellery Design", "Ceramics", "Sculpture"
    ],
    "Freelance": [
      "Freelance Consulting", "Project Management", "Client Management",
      "Virtual Assistance", "Data Entry", "Market Research", "Business Strategy",
      "Pitch Decks", "Financial Modeling", "Legal Writing"
    ]
  };

  // ── Load user + check college email domain ──────────────────
  useEffect(() => {
    async function loadUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.push("/login");
        return;
      }
      setUser(authUser);

      // Check if this user has already completed onboarding
      const { data: profile } = await supabase
        .from('users')
        .select('handle, display_name, tagline, avatar_url, is_email_verified, college_id, colleges(*)')
        .eq('id', authUser.id)
        .maybeSingle();

      if (profile) {
        if (profile.handle) setHandle(profile.handle);
        if (profile.tagline) setTagline(profile.tagline);
        if (profile.avatar_url) setAvatarPreview(profile.avatar_url);
        if (profile.colleges) {
          const collegeData = Array.isArray(profile.colleges) ? profile.colleges[0] : profile.colleges;
          if (collegeData) {
            setSelectedCollege(collegeData);
            setDetectedCollege(collegeData);
          }
        }
        
        // Already onboarded → skip to feed
        if (profile.tagline && profile.tagline.trim().length > 0) {
          router.push("/feed");
          return;
        }
      }

      // ── College Email Gate ────────────────────────────────────
      const email = authUser.email || '';
      const domain = email.split('@')[1]?.toLowerCase() || '';

      if (domain) {
        // Check domain against colleges table
        const { data: college } = await supabase
          .from('colleges')
          .select('id, name, short_name, email_domain, hub_type')
          .eq('email_domain', domain)
          .maybeSingle();

        if (college) {
          // Recognised institution — mark as verified in DB
          setDetectedCollege(college);
          setSelectedCollege(college);
          setEmailGate('verified');
          await supabase
            .from('users')
            .update({ 
              email_domain: domain, 
              college_id: college.id, 
              is_email_verified: true 
            })
            .eq('id', authUser.id);
        } else {
          // Not in our colleges list
          setEmailGate('unrecognised');
        }
      } else {
        setEmailGate('unrecognised');
      }

      setLoading(false);
    }
    loadUser();
  }, [supabase, router]);

  // Handle Uniqueness Check
  useEffect(() => {
    if (!handle || handle.length < 3) {
      setHandleAvailable(null);
      return;
    }

    const checkHandle = async () => {
      setCheckingHandle(true);
      // Ensure it's alphanumeric/underscores
      if (!/^[a-zA-Z0-9_]+$/.test(handle)) {
        setHandleAvailable(false);
        setCheckingHandle(false);
        return;
      }

      // Check uniqueness: find any OTHER user with this handle
      let uniqueQuery = supabase
        .from('users')
        .select('id')
        .eq('handle', handle.toLowerCase().trim());

      // Exclude the current user's own row if they already have one
      if (user?.id) {
        uniqueQuery = uniqueQuery.neq('id', user.id);
      }

      const { data } = await uniqueQuery.maybeSingle();

      setHandleAvailable(!data);
      setCheckingHandle(false);
    };

    const debounceId = setTimeout(checkHandle, 500);
    return () => clearTimeout(debounceId);
  }, [handle, supabase, user]);

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

  const handleSelectHub = async (college: any) => {
    setSelectedCollege(college);
    if (user) {
      await supabase
        .from('users')
        .update({ 
          college_id: college.id,
          // mark as verified if domain matches user email domain
          is_email_verified: college.email_domain ? (user.email?.toLowerCase().endsWith(college.email_domain.toLowerCase()) ?? false) : false
        })
        .eq('id', user.id);
    }
  };

  const handleCreateHub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHubName.trim() || !user) return;
    setIsSubmitting(true);
    
    // Check if name already exists
    const { data: existing } = await supabase
      .from('colleges')
      .select('id, name, short_name, hub_type, email_domain')
      .eq('name', newHubName.trim())
      .maybeSingle();

    if (existing) {
      await handleSelectHub(existing);
      setIsCreatingHub(false);
      setIsSubmitting(false);
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
      await handleSelectHub(newCollege);
      setIsCreatingHub(false);
      setNewHubName("");
      setNewHubShortName("");
      setNewHubCity("");
    } else {
      console.error("Hub creation error:", error);
      alert(error?.message || "Failed to create hub");
    }
    setIsSubmitting(false);
  };

  const handleStep1Submit = async () => {
    if (!handleAvailable || !handle || handle.length < 3 || !user) return;
    
    setIsSubmitting(true);
    // Normalise handle to lowercase before saving
    const normalizedHandle = handle.toLowerCase().trim();
    // Upsert the user row to lock in the handle
    const { error } = await supabase.from('users').upsert({
      id: user.id,
      handle: normalizedHandle,
      display_name: normalizedHandle,
    }, { onConflict: 'id' });

    if (!error) setHandle(normalizedHandle);
    setIsSubmitting(false);
    if (!error) setCurrentStep(2);
    else console.error('Handle save error:', error);
  };

  const handleStep2Submit = async () => {
    if (selectedSkills.length === 0 || !user) return;
    
    setIsSubmitting(true);
    // Clear old skills
    await supabase.from('skills').delete().eq('user_id', user.id);
    
    // Insert new skills
    const skillsToInsert = selectedSkills.map(skill => ({
      user_id: user.id,
      skill_name: skill
    }));
    
    const { error } = await supabase.from('skills').insert(skillsToInsert);

    setIsSubmitting(false);
    if (!error) setCurrentStep(3);
  };

  const handleStep3Submit = async () => {
    if (!user) return;
    setIsSubmitting(true);

    let finalAvatarUrl = avatarPreview;

    // Upload avatar if new file exists
    if (avatarFile) {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${user.id}_avatar_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, avatarFile);

      if (!uploadError) {
        const { data } = supabase.storage.from('media').getPublicUrl(fileName);
        finalAvatarUrl = data.publicUrl;
      } else {
        console.error("Avatar upload error:", uploadError);
      }
    }

    // Final profile update
    // Always write a non-empty tagline so it acts as the onboarding-complete signal
    // (The DB trigger initialises tagline as '' so empty = not yet onboarded)
    const finalTagline = tagline.trim().length > 0 ? tagline.trim() : handle || 'Creator';

    const { error } = await supabase.from('users').update({
      tagline: finalTagline,
      display_name: handle || user.email?.split('@')[0] || 'Creator',
      ...(finalAvatarUrl && { avatar_url: finalAvatarUrl })
    }).eq('id', user.id);

    if (error) console.error("Profile update error:", error);

    setIsSubmitting(false);
    router.push("/feed");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-primary)]" />
      </div>
    );
  }

  // ── Unified Hub Selection Screen ──────────────────────────────
  if (!showOnboarding) {
    return (
      <div className="min-h-screen bg-[var(--bg-void)] flex flex-col items-center justify-center p-4">
        <AnimatePresence mode="wait">
          {emailGate === 'checking' ? (
            <motion.div
              key="checking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-primary)]" />
              <p className="text-[var(--text-muted)] text-sm">Verifying your institution...</p>
            </motion.div>
          ) : (
            <motion.div
              key="hub-selector"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="w-full max-w-lg bg-[var(--bg-frosted)] border border-[var(--glass-border)] backdrop-blur-2xl rounded-3xl p-8 shadow-2xl"
            >
              {!isCreatingHub ? (
                <>
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 flex items-center justify-center mx-auto mb-4">
                      <GraduationCap className="w-8 h-8 text-[var(--accent-primary)]" />
                    </div>
                    <h2 className="text-2xl font-display font-bold text-white mb-2">
                      Join a Campus or Community Hub
                    </h2>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Connect with peers, access local pods, tournaments, and events.
                    </p>
                  </div>

                  {/* Auto-detected College Alert */}
                  {detectedCollege && (
                    <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                      <div className="flex items-center gap-2 justify-center mb-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        <span className="text-sm font-semibold text-emerald-400">Verified Institution Found</span>
                      </div>
                      <p className="text-white font-medium text-sm mb-3">
                        {detectedCollege.name} ({detectedCollege.short_name})
                      </p>
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => { handleSelectHub(detectedCollege); setShowOnboarding(true); }}
                          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition-colors active:scale-95"
                        >
                          Join & Continue
                        </button>
                        <button
                          onClick={() => setDetectedCollege(null)}
                          className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white/70 rounded-lg text-xs font-medium transition-colors"
                        >
                          Choose another
                        </button>
                      </div>
                    </div>
                  )}

                  {!detectedCollege && (
                    <div className="space-y-4">
                      {/* Search Bar */}
                      <div className="relative">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search colleges, societies,RWAs..."
                          className="w-full bg-[var(--bg-deep)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] rounded-xl py-3.5 pl-4 pr-10 text-white placeholder-[var(--text-muted)] outline-none transition-colors"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
                          {searchingColleges ? (
                            <Loader2 className="w-4 h-4 animate-spin text-[var(--text-muted)]" />
                          ) : null}
                        </div>
                      </div>

                      {/* Search Results */}
                      {searchResults.length > 0 ? (
                        <div className="rounded-xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-deep)] divide-y divide-[var(--border-subtle)]">
                          {searchResults.map((hub) => (
                            <button
                              key={hub.id}
                              type="button"
                              onClick={() => handleSelectHub(hub)}
                              className={`w-full px-4 py-3 text-left flex items-center justify-between transition-colors hover:bg-white/5 ${
                                selectedCollege?.id === hub.id ? "bg-white/10" : ""
                              }`}
                            >
                              <div>
                                <div className="text-white font-medium text-sm">{hub.name}</div>
                                <div className="text-xs text-[var(--text-muted)] font-mono uppercase tracking-wider mt-0.5">
                                  {hub.hub_type === "society" ? "🏡 Society Hub" : hub.hub_type === "corporate" ? "🏢 Corporate Space" : "🏫 Campus Hub"}
                                  {hub.short_name && ` • ${hub.short_name}`}
                                </div>
                              </div>
                              {selectedCollege?.id === hub.id && (
                                <Check className="w-4 h-4 text-[var(--accent-primary)]" />
                              )}
                            </button>
                          ))}
                        </div>
                      ) : searchQuery.trim().length > 2 && !searchingColleges ? (
                        <div className="text-center py-4 text-xs text-[var(--text-muted)]">
                          No hubs match your search.
                        </div>
                      ) : null}

                      {/* Selected Hub Card */}
                      {selectedCollege && !detectedCollege && (
                        <div className="p-4 rounded-xl border border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/5 flex items-center justify-between">
                          <div>
                            <span className="text-[var(--text-muted)] text-xs block">Selected Hub</span>
                            <span className="text-white font-semibold text-sm">
                              {selectedCollege.name}
                            </span>
                          </div>
                          <button
                            onClick={() => setSelectedCollege(null)}
                            className="text-xs text-red-400 hover:text-red-300 underline"
                          >
                            Remove
                          </button>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="pt-2 flex flex-col gap-3">
                        <button
                          onClick={() => setShowOnboarding(true)}
                          className="w-full py-4 rounded-xl font-semibold text-white bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] transition-all shadow-[0_0_20px_rgba(108,92,231,0.3)] flex items-center justify-center gap-2 active:scale-95"
                        >
                          {selectedCollege ? "Continue to Profile" : "Continue as Independent Creator"}
                          <ChevronRight className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            setIsCreatingHub(true);
                            setNewHubName(searchQuery);
                          }}
                          className="text-sm font-semibold text-[var(--text-muted)] hover:text-white transition-colors"
                        >
                          Can't find your institution? <span className="text-[var(--accent-primary)] underline">Create a new hub</span>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Create custom hub form */
                <form onSubmit={handleCreateHub} className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-display font-bold text-white mb-1">
                      Create Custom Hub
                    </h2>
                    <p className="text-xs text-[var(--text-muted)]">
                      Create a manual hub tag so you and others can map your community.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                        Hub Name (e.g. VIT Chennai)
                      </label>
                      <input
                        type="text"
                        required
                        value={newHubName}
                        onChange={(e) => setNewHubName(e.target.value)}
                        placeholder="e.g. Sherwood Residential Society"
                        className="w-full bg-[var(--bg-deep)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] rounded-xl px-4 py-3 text-white placeholder-[var(--text-muted)] outline-none transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                          Short Name / Badge
                        </label>
                        <input
                          type="text"
                          value={newHubShortName}
                          onChange={(e) => setNewHubShortName(e.target.value)}
                          placeholder="e.g. Sherwood"
                          className="w-full bg-[var(--bg-deep)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] rounded-xl px-4 py-3 text-white placeholder-[var(--text-muted)] outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          value={newHubCity}
                          onChange={(e) => setNewHubCity(e.target.value)}
                          placeholder="e.g. Bangalore"
                          className="w-full bg-[var(--bg-deep)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] rounded-xl px-4 py-3 text-white placeholder-[var(--text-muted)] outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                        Hub Type
                      </label>
                      <select
                        value={newHubType}
                        onChange={(e) => setNewHubType(e.target.value as any)}
                        className="w-full bg-[var(--bg-deep)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] rounded-xl px-4 py-3 text-white outline-none transition-colors"
                      >
                        <option value="college" className="bg-[var(--bg-deep)]">Campus Hub 🏫</option>
                        <option value="society" className="bg-[var(--bg-deep)]">Society / RWA 🏡</option>
                        <option value="corporate" className="bg-[var(--bg-deep)]">Corporate Space 🏢</option>
                        <option value="other" className="bg-[var(--bg-deep)]">Other Community 🌐</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsCreatingHub(false)}
                      className="flex-1 py-3.5 rounded-xl font-semibold text-white bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !newHubName.trim()}
                      className="flex-1 py-3.5 rounded-xl font-semibold text-white bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] transition-all shadow-[0_0_20px_rgba(108,92,231,0.3)] flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        "Create & Join"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-void)] flex flex-col items-center justify-center p-4">
      {/* Onboarding Step Indicator */}
      <div className="w-full max-w-md mx-auto mb-12">
        <div className="flex gap-2">
          {[1, 2, 3].map((step) => (
            <div key={step} className="h-1 flex-1 rounded-full overflow-hidden bg-[var(--bg-deep)] border border-[var(--border-subtle)]">
              <motion.div 
                className={`h-full rounded-full ${
                  currentStep === step ? 'bg-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-primary)]' : 
                  currentStep > step ? 'bg-[var(--text-primary)]' : 'bg-transparent'
                }`}
                initial={{ width: 0 }}
                animate={{ width: currentStep >= step ? '100%' : '0%' }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-2xl bg-[var(--bg-frosted)] border border-[var(--glass-border)] backdrop-blur-2xl rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        
        <AnimatePresence mode="wait">
          {/* STEP 1: IDENTITY */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col h-full max-w-md mx-auto"
            >
              <h2 className="text-2xl font-display font-bold text-white mb-2">Claim your identity</h2>
              <p className="text-[var(--text-secondary)] mb-8">This is how the network will find you. Choose wisely.</p>

              <div className="relative mb-8">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] font-mono">@</span>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value.toLowerCase())}
                  placeholder="username"
                  className="w-full bg-[var(--bg-deep)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] rounded-xl py-4 pl-10 pr-12 text-white font-mono placeholder-[var(--text-muted)] outline-none transition-colors"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
                  {checkingHandle && <Loader2 className="w-4 h-4 animate-spin text-[var(--text-muted)]" />}
                  {!checkingHandle && handleAvailable === true && <Check className="w-5 h-5 text-emerald-400" />}
                  {!checkingHandle && handleAvailable === false && <X className="w-5 h-5 text-red-400" />}
                </div>
              </div>
              
              <div className="mt-auto pt-4">
                <button
                  onClick={handleStep1Submit}
                  disabled={!handleAvailable || isSubmitting}
                  className="w-full py-4 rounded-xl font-semibold text-white bg-[var(--accent-primary)] hover:bg-[#5b4bc4] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(108,92,231,0.3)] flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Continue"}
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: ARSENAL */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col h-full"
            >
              <h2 className="text-2xl font-display font-bold text-white mb-2 text-center">Build your arsenal</h2>
              <p className="text-[var(--text-secondary)] mb-6 text-center">Select the skills that define your craft.</p>

              {/* Horizontally scrolling tab bar */}
              <div className="flex overflow-x-auto no-scrollbar gap-8 mb-6 pb-2 border-b border-[var(--border-subtle)] w-full max-w-2xl mx-auto">
                {Object.keys(SKILL_CATEGORIES).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`text-sm font-medium whitespace-nowrap px-1 pb-2 relative cursor-pointer transition-colors ${
                      activeTab === tab
                        ? "text-[var(--text-primary)] font-bold"
                        : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                    }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--accent-primary)] rounded-t-full shadow-[0_-2px_8px_rgba(108,92,231,0.5)]"
                      />
                    )}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto max-h-[300px] custom-scrollbar pr-2 mb-8 -mx-2 px-2">
                <div className="flex flex-wrap gap-2">
                  {(SKILL_CATEGORIES[activeTab] || []).map(skill => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5"
                      style={{
                        background: selectedSkills.includes(skill)
                          ? "var(--text-primary)"
                          : "var(--bg-deep)",
                        color: selectedSkills.includes(skill) ? "var(--bg-void)" : "var(--text-secondary)",
                        border: selectedSkills.includes(skill)
                          ? "1px solid var(--text-primary)"
                          : "1px solid var(--border-subtle)",
                        boxShadow: selectedSkills.includes(skill) ? "var(--shadow-glow-sm)" : "none",
                      }}
                    >
                      {selectedSkills.includes(skill) && <Check className="w-3.5 h-3.5 text-[var(--bg-void)] font-bold" />}
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
                <span className="text-sm text-[var(--text-muted)] font-mono">
                  {selectedSkills.length} selected
                </span>
                <button
                  onClick={handleStep2Submit}
                  disabled={selectedSkills.length === 0 || isSubmitting}
                  className="py-3 px-8 rounded-xl font-semibold text-white bg-[var(--text-primary)] !text-[var(--bg-void)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Next Step"}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: AVATAR */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col h-full max-w-md mx-auto"
            >
              <h2 className="text-2xl font-display font-bold text-white mb-2">Initialize your proxy</h2>
              <p className="text-[var(--text-secondary)] mb-8">Set your face to the network.</p>

              <div className="flex flex-col items-center mb-8">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-28 h-28 rounded-full bg-[var(--bg-deep)] border-2 border-dashed border-[var(--border-subtle)] hover:border-[var(--accent-primary)] flex items-center justify-center cursor-pointer relative overflow-hidden group transition-all"
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <Upload className="w-8 h-8 text-[var(--text-muted)] group-hover:text-[var(--accent-primary)] transition-colors" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs font-semibold text-white">Change</span>
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/jpeg,image/png,image/webp" 
                  className="hidden" 
                />
              </div>

              <div className="mb-8">
                <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] block mb-2">Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Senior Motion Designer @ Void"
                  className="w-full bg-[var(--bg-deep)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] rounded-xl p-4 text-white placeholder-[var(--text-muted)] outline-none transition-colors"
                />
              </div>

              <div className="mt-auto pt-4">
                <button
                  onClick={handleStep3Submit}
                  disabled={isSubmitting || !tagline}
                  className="w-full py-4 rounded-xl font-semibold text-white bg-[var(--accent-primary)] hover:bg-[#5b4bc4] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(108,92,231,0.3)] flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete Profile"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
