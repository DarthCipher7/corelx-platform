"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { Loader2, Check } from "lucide-react";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [handle, setHandle] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [tagline, setTagline] = useState("");
  const [availabilityStatus, setAvailabilityStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  
  // Hub states
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
  
  const supabase = createClient();
  const router = useRouter();

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
        .select("handle, display_name, tagline, availability_status, college_id, colleges(*)")
        .eq("id", user.id)
        .single();
        
      if (data) {
        setHandle(data.handle || "");
        setDisplayName(data.display_name || "");
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage({ text: "", type: "" });
    
    const { error } = await supabase
      .from("users")
      .update({
        handle,
        display_name: displayName,
        tagline,
        availability_status: availabilityStatus,
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
      setMessage({ text: "Profile updated successfully!", type: "success" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-4 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-24 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-display font-bold mb-8" style={{ color: "var(--text-primary)" }}>Account Settings</h1>
        
        <div className="rounded-2xl p-8 shadow-xl relative" style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
          <form onSubmit={handleSave} className="space-y-6 relative z-10">
            
            {message.text && (
              <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
                {message.text}
              </div>
            )}
            
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Display Name</label>
              <input
                type="text"
                required
                className="w-full rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 transition-colors"
                style={{ backgroundColor: "var(--bg-deep)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Unique Handle</label>
              <div className="flex">
                <span className="flex items-center px-4 rounded-l-xl text-sm font-medium" style={{ backgroundColor: "var(--bg-frosted)", border: "1px solid var(--border-subtle)", borderRight: "none", color: "var(--text-muted)" }}>@</span>
                <input
                  type="text"
                  required
                  className="w-full rounded-r-xl px-4 py-3 focus:outline-none focus:border-purple-400 transition-colors"
                  style={{ backgroundColor: "var(--bg-deep)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Tagline</label>
              <input
                type="text"
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 transition-colors"
                style={{ backgroundColor: "var(--bg-deep)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Availability Status</label>
              <input
                type="text"
                placeholder="e.g. Available for work"
                className="w-full rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 transition-colors"
                style={{ backgroundColor: "var(--bg-deep)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
                value={availabilityStatus}
                onChange={(e) => setAvailabilityStatus(e.target.value)}
              />
            </div>
            
            {/* Campus & Community Hub Selector */}
            <div className="border-t border-[var(--border-subtle)] pt-6 mt-6">
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
                Campus & Community Hub
              </label>

              {/* Current Selection card */}
              {selectedCollege ? (
                <div className="p-4 rounded-xl border border-[var(--accent-primary)]/30 bg-[var(--bg-deep)] flex items-center justify-between mb-4">
                  <div>
                    <span className="text-[var(--text-muted)] text-[10px] uppercase font-mono tracking-wider">Active Tag</span>
                    <span className="text-white font-semibold text-sm block mt-0.5">
                      {selectedCollege.name} ({selectedCollege.short_name || 'No tag'})
                    </span>
                    <span className="text-xs text-[var(--text-muted)] font-mono block mt-0.5">
                      {selectedCollege.hub_type === "society" ? "🏡 Society Hub" : selectedCollege.hub_type === "corporate" ? "🏢 Corporate Space" : "🏫 Campus Hub"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedCollege(null)}
                    className="text-xs text-red-400 hover:text-red-300 underline"
                  >
                    Leave Hub
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-deep)] text-center text-sm text-[var(--text-muted)] mb-4">
                  Not associated with any campus or community hub.
                </div>
              )}

              {!selectedCollege && !isCreatingHub && (
                <div className="space-y-3">
                  {/* Search input */}
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search and join a campus, society, corporate space..."
                      className="w-full bg-[var(--bg-deep)] border border-[var(--border-subtle)] focus:border-purple-400 rounded-xl px-4 py-3 text-white placeholder-[var(--text-muted)] outline-none transition-colors"
                      style={{ color: "var(--text-primary)" }}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
                      {searchingColleges && (
                        <Loader2 className="w-4 h-4 animate-spin text-[var(--text-muted)]" />
                      )}
                    </div>
                  </div>

                  {/* Search results */}
                  {searchResults.length > 0 ? (
                    <div className="rounded-xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-deep)] divide-y divide-[var(--border-subtle)]">
                      {searchResults.map((hub) => (
                        <button
                          key={hub.id}
                          type="button"
                          onClick={() => handleSelectHub(hub)}
                          className="w-full px-4 py-3 text-left flex items-center justify-between transition-colors hover:bg-white/5 text-white"
                        >
                          <div>
                            <div className="font-medium text-sm">{hub.name}</div>
                            <div className="text-xs text-[var(--text-muted)] font-mono uppercase tracking-wider mt-0.5">
                              {hub.hub_type === "society" ? "🏡 Society Hub" : hub.hub_type === "corporate" ? "🏢 Corporate Space" : "🏫 Campus Hub"}
                              {hub.short_name && ` • ${hub.short_name}`}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : searchQuery.trim().length > 2 && !searchingColleges ? (
                    <div className="text-center py-4 text-xs text-[var(--text-muted)]">
                      No hubs match your search.
                    </div>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingHub(true);
                      setNewHubName(searchQuery);
                    }}
                    className="text-xs text-purple-400 hover:text-purple-300 underline font-semibold block"
                  >
                    + Can't find it? Create a custom hub manually
                  </button>
                </div>
              )}

              {isCreatingHub && (
                <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-deep)] space-y-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-white font-semibold text-xs uppercase tracking-wider block">Create Custom Hub</span>
                    <button
                      type="button"
                      onClick={() => setIsCreatingHub(false)}
                      className="text-xs text-purple-400 hover:text-purple-300 underline"
                    >
                      Back to Search
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                        Hub Name
                      </label>
                      <input
                        type="text"
                        value={newHubName}
                        onChange={(e) => setNewHubName(e.target.value)}
                        placeholder="e.g. Prestige Palms Society"
                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] focus:border-purple-400 rounded-lg px-3 py-2 text-sm text-white placeholder-[var(--text-muted)] outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                          Short Name / Tag
                        </label>
                        <input
                          type="text"
                          value={newHubShortName}
                          onChange={(e) => setNewHubShortName(e.target.value)}
                          placeholder="e.g. PPS"
                          className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] focus:border-purple-400 rounded-lg px-3 py-2 text-sm text-white placeholder-[var(--text-muted)] outline-none"
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
                          placeholder="e.g. Chennai"
                          className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] focus:border-purple-400 rounded-lg px-3 py-2 text-sm text-white placeholder-[var(--text-muted)] outline-none"
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
                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] focus:border-purple-400 rounded-lg px-3 py-2 text-sm text-white outline-none"
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
                      className="w-full py-2 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors active:scale-95"
                    >
                      Create and Select Hub
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="pt-4 mt-8">
              <Button variant="primary" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
}
