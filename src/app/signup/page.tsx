"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Upload, ChevronRight, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { SKILLS_ALL } from "@/lib/data";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [user, setUser] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);

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

  // Load user
  useEffect(() => {
    async function loadUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.push("/login");
        return;
      }
      setUser(authUser);

      // Check if this user has already completed onboarding
      // A user is considered onboarded once they have a handle AND a display_name set
      const { data: profile } = await supabase
        .from('users')
        .select('handle, display_name, tagline, avatar_url')
        .eq('id', authUser.id)
        .maybeSingle();

      if (profile) {
        // Pre-fill form fields in case they want to edit later
        if (profile.handle) setHandle(profile.handle);
        if (profile.tagline) setTagline(profile.tagline);
        if (profile.avatar_url) setAvatarPreview(profile.avatar_url);
        
        // The DB trigger sets tagline to '' (empty string) on signup.
        // Once the user completes Step 3, tagline is written as a real value.
        // So: tagline non-empty = onboarding was completed → skip to feed.
        if (profile.tagline && profile.tagline.trim().length > 0) {
          router.push("/feed");
          return;
        }
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
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[var(--accent-primary)]" /></div>;
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
