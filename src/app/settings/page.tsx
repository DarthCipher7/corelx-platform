"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [handle, setHandle] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [tagline, setTagline] = useState("");
  const [availabilityStatus, setAvailabilityStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  
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
        .select("handle, display_name, tagline, availability_status")
        .eq("id", user.id)
        .single();
        
      if (data) {
        setHandle(data.handle || "");
        setDisplayName(data.display_name || "");
        setTagline(data.tagline || "");
        setAvailabilityStatus(data.availability_status || "");
      }
      setLoading(false);
    }
    
    loadProfile();
  }, [router, supabase]);

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
        availability_status: availabilityStatus
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
