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

  // Step 3 State
  const [tagline, setTagline] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user
  useEffect(() => {
    async function loadUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.push("/login");
        return;
      }
      setUser(authUser);

      // Pre-fill if they already have a row
      const { data: profile } = await supabase
        .from('users')
        .select('handle, tagline, avatar_url')
        .eq('id', authUser.id)
        .maybeSingle();

      if (profile) {
        if (profile.handle) setHandle(profile.handle);
        if (profile.tagline) setTagline(profile.tagline);
        if (profile.avatar_url) setAvatarPreview(profile.avatar_url);
        
        // Let's assume if they have a tagline, they already onboarded
        if (profile.tagline && profile.tagline.length > 0) {
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

      const { data } = await supabase
        .from('users')
        .select('id')
        .eq('handle', handle)
        .neq('id', user?.id)
        .maybeSingle();

      setHandleAvailable(!data);
      setCheckingHandle(false);
    };

    const debounceId = setTimeout(checkHandle, 500);
    return () => clearTimeout(debounceId);
  }, [handle, supabase, user]);

  const handleStep1Submit = async () => {
    if (!handleAvailable || !handle || handle.length < 3 || !user) return;
    
    setIsSubmitting(true);
    // Upsert the user row just to lock in the handle
    const { error } = await supabase.from('users').upsert({
      id: user.id,
      handle: handle,
    }, { onConflict: 'id' });

    setIsSubmitting(false);
    if (!error) setCurrentStep(2);
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
    const { error } = await supabase.from('users').update({
      tagline: tagline,
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
      <div className="w-full max-w-md bg-[var(--bg-frosted)] border border-[var(--glass-border)] backdrop-blur-2xl rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        
        <AnimatePresence mode="wait">
          {/* STEP 1: IDENTITY */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col h-full"
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
              <h2 className="text-2xl font-display font-bold text-white mb-2">Build your arsenal</h2>
              <p className="text-[var(--text-secondary)] mb-6">Select the skills that define your craft.</p>

              <div className="flex-1 overflow-y-auto max-h-[300px] custom-scrollbar pr-2 mb-8 -mx-2 px-2">
                <div className="flex flex-wrap gap-2">
                  {SKILLS_ALL.slice(0, 30).map(skill => (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
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
              className="flex flex-col h-full"
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
