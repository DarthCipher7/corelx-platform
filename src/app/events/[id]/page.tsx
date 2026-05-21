"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Users,
  Shield,
  Check,
  Edit,
  Trash2,
  Loader2,
  Lock,
  Unlock,
  Settings,
  UserCheck,
  X,
  AlertCircle
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import Button from "@/components/ui/Button";
import TrustTierBadge from "@/components/ui/TrustTierBadge";

const INPUT_CLS =
  "w-full bg-[var(--bg-deep)] text-[var(--text-primary)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] text-sm transition-all";

type Category =
  | "sports"
  | "music"
  | "academic"
  | "social"
  | "misc"
  | "hackathon"
  | "competition"
  | "informal"
  | "formal";

const CATEGORY_CONFIG = {
  sports: { label: "Sports", emoji: "🏃" },
  music: { label: "Music", emoji: "🎵" },
  academic: { label: "Academic", emoji: "📚" },
  social: { label: "Fun / Social", emoji: "🎉" },
  misc: { label: "Misc", emoji: "✨" },
  hackathon: { label: "Hackathon", emoji: "💡" },
  competition: { label: "Competition", emoji: "🏆" },
  informal: { label: "Informal", emoji: "🤝" },
  formal: { label: "Formal", emoji: "👔" },
} as any;

export default function EventDetailPage() {
  const { id: eventId } = useParams() as { id: string };
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [organiserProfile, setOrganiserProfile] = useState<any>(null);
  
  // RSVP states
  const [rsvpList, setRsvpList] = useState<any[]>([]);
  const [userRsvp, setUserRsvp] = useState<any>(null); // current user's RSVP if any
  const [isJoined, setIsJoined] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isRsvping, setIsRsvping] = useState(false);

  // Edit / Delete states
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editCategory, setEditCategory] = useState<Category>("social");
  const [editStartsAt, setEditStartsAt] = useState("");
  const [editEndsAt, setEditEndsAt] = useState("");
  const [editMaxHeadcount, setEditMaxHeadcount] = useState<string>("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Verification Simulation State
  const [verifyingCampus, setVerifyingCampus] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  useEffect(() => {
    if (!eventId) return;
    initEventData();
  }, [eventId]);

  const initEventData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      // Fetch Event
      const { data: eventData, error: eventErr } = await supabase
        .from("events")
        .select("*, organiser:users!events_organiser_id_fkey(*)")
        .eq("id", eventId)
        .single();

      if (eventErr || !eventData) {
        console.error("Event load error:", eventErr);
        setLoading(false);
        return;
      }

      setEvent(eventData);
      setOrganiserProfile(eventData.organiser);
      
      // Initialize edit fields
      setEditTitle(eventData.title);
      setEditDesc(eventData.description || "");
      setEditLocation(eventData.location_name || "");
      setEditCategory(eventData.category as Category);
      
      // Format timestamp for datetime-local
      const toLocalDateTimeString = (isoString: string) => {
        const d = new Date(isoString);
        // adjust to local time zone string formatted for datetime-local (yyyy-MM-ddThh:mm)
        const pad = (n: number) => (n < 10 ? "0" + n : n);
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      };
      
      setEditStartsAt(toLocalDateTimeString(eventData.starts_at));
      setEditEndsAt(toLocalDateTimeString(eventData.ends_at));
      setEditMaxHeadcount(eventData.max_headcount ? String(eventData.max_headcount) : "");

      // Check current user RSVP
      if (user) {
        const { data: userRsvpData } = await supabase
          .from("event_rsvps")
          .select("*")
          .eq("event_id", eventId)
          .eq("user_id", user.id)
          .maybeSingle();

        if (userRsvpData) {
          setUserRsvp(userRsvpData);
          setIsJoined(userRsvpData.status === "attending" || userRsvpData.status === "approved");
          setIsPending(userRsvpData.status === "pending");
        } else {
          setUserRsvp(null);
          setIsJoined(false);
          setIsPending(false);
        }
      }

      // Fetch RSVPs list
      await fetchRsvps();
    } catch (e) {
      console.error("Event page init error:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchRsvps = async () => {
    const { data, error } = await supabase
      .from("event_rsvps")
      .select("*, user:users(*)")
      .eq("event_id", eventId)
      .order("requested_at", { ascending: true });

    if (!error && data) {
      setRsvpList(data);
    }
  };

  const handleRsvpAction = async () => {
    if (!currentUser) {
      router.push("/login");
      return;
    }

    setIsRsvping(true);

    // If "Checked" trust tier, simulate campus GPS check-in first!
    if (event.trust_tier === "checked" && !isJoined && !isPending) {
      setVerifyingCampus(true);
      await new Promise((resolve) => setTimeout(resolve, 1800)); // premium loader feeling
      setVerifyingCampus(false);
      setVerificationSuccess(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setVerificationSuccess(false);
    }

    const rsvpStatus = event.trust_tier === "guarded" ? "pending" : "attending";

    const { data, error } = await supabase
      .from("event_rsvps")
      .upsert(
        {
          event_id: eventId,
          user_id: currentUser.id,
          status: rsvpStatus,
          verified_campus: event.trust_tier === "checked" || event.trust_tier === "guarded",
        },
        { onConflict: "event_id,user_id" }
      )
      .select()
      .single();

    setIsRsvping(false);
    if (!error && data) {
      setUserRsvp(data);
      setIsJoined(data.status === "attending" || data.status === "approved");
      setIsPending(data.status === "pending");
      await fetchRsvps();
    } else {
      alert(error?.message || "RSVP failed.");
    }
  };

  const handleCancelRsvp = async () => {
    if (!window.confirm("Are you sure you want to cancel your RSVP?")) return;

    setIsRsvping(true);
    const { error } = await supabase
      .from("event_rsvps")
      .delete()
      .eq("event_id", eventId)
      .eq("user_id", currentUser.id);

    setIsRsvping(false);
    if (!error) {
      setUserRsvp(null);
      setIsJoined(false);
      setIsPending(false);
      await fetchRsvps();
    } else {
      alert(error.message);
    }
  };

  const handleUpdateRsvpStatus = async (rsvpId: string, status: "approved" | "declined" | "attending") => {
    const { error } = await supabase
      .from("event_rsvps")
      .update({
        status,
        resolved_at: new Date().toISOString()
      })
      .eq("id", rsvpId);

    if (!error) {
      await fetchRsvps();
    } else {
      alert(error.message);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) return;

    setSavingEdit(true);
    const { data: updated, error } = await supabase
      .from("events")
      .update({
        title: editTitle.trim(),
        description: editDesc.trim() || null,
        location_name: editLocation.trim() || null,
        category: editCategory,
        starts_at: new Date(editStartsAt).toISOString(),
        ends_at: new Date(editEndsAt).toISOString(),
        max_headcount: editMaxHeadcount ? parseInt(editMaxHeadcount) : null
      })
      .eq("id", eventId)
      .select()
      .single();

    setSavingEdit(false);
    if (!error && updated) {
      setEvent((prev: any) => ({ ...prev, ...updated }));
      setEditing(false);
    } else {
      alert(error?.message || "Update failed. You may not have permission to edit this event.");
    }
  };

  const handleDeleteEvent = async () => {
    if (!window.confirm("Are you sure you want to delete this event? This action is permanent.")) return;

    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", eventId);

    if (!error) {
      router.push("/pods"); // Return to Hub Tab (events lives under pods now)
    } else {
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-void)]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-primary)]" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-8 bg-[var(--bg-void)]">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold font-display text-white mb-2">Event Not Found</h2>
        <p className="text-sm text-[var(--text-muted)] mb-6 max-w-sm">
          This event may have been cancelled, deleted, or does not exist.
        </p>
        <button onClick={() => router.back()} className="px-5 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white font-semibold">
          Go Back
        </button>
      </div>
    );
  }

  const isOrganiser = currentUser?.id === event.organiser_id;
  const cat = CATEGORY_CONFIG[event.category] || CATEGORY_CONFIG.misc;
  const attendingList = rsvpList.filter(r => r.status === "attending" || r.status === "approved");
  const pendingList = rsvpList.filter(r => r.status === "pending");

  return (
    <div className="min-h-screen pt-24 pb-28 px-4 sm:px-6 bg-[var(--bg-void)] text-white">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        
        {/* ── Back Button ─────────────────────────────────────── */}
        <button
          onClick={() => router.back()}
          className="self-start flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>

        {/* ── GPS Verification Loader simulation ────────────────── */}
        <AnimatePresence>
          {verifyingCampus && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md"
            >
              <Loader2 className="w-12 h-12 animate-spin text-[var(--accent-primary)] mb-4" />
              <p className="text-lg font-bold font-display text-white mb-1">Verifying Geofence</p>
              <p className="text-sm text-[var(--text-muted)]">Verifying one-time campus GPS liveness...</p>
            </motion.div>
          )}

          {verificationSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md"
            >
              <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-green-400" />
              </div>
              <p className="text-lg font-bold font-display text-white mb-1">Campus Verified!</p>
              <p className="text-sm text-[var(--text-muted)]">GPS coordinates validated successfully.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Header details card ──────────────────────────────── */}
        <div
          className="relative rounded-3xl p-6 md:p-8 backdrop-blur-xl flex flex-col gap-6"
          style={{
            background: "var(--bg-frosted)",
            border: "1px solid var(--glass-border)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          }}
        >
          {/* Top badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="inline-flex items-center gap-1 rounded-full text-xs font-semibold px-3 py-1 border"
              style={{
                background: "rgba(108,92,231,0.15)",
                borderColor: "rgba(108,92,231,0.35)",
                color: "#a29bfe",
              }}
            >
              {cat.emoji} {cat.label}
            </span>
            <TrustTierBadge tier={event.trust_tier} />
            
            {event.max_headcount && (
              <span className="text-xs text-[var(--text-muted)] ml-auto bg-white/5 border border-white/10 px-3 py-1 rounded-full font-mono">
                {attendingList.length} / {event.max_headcount} spots taken
              </span>
            )}
          </div>

          {/* Title and Description */}
          {editing ? (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-[var(--text-muted)] font-semibold uppercase block mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  className={INPUT_CLS}
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs text-[var(--text-muted)] font-semibold uppercase block mb-1">Description</label>
                <textarea
                  rows={3}
                  className={`${INPUT_CLS} resize-none`}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[var(--text-muted)] font-semibold uppercase block mb-1">Location Name</label>
                  <input
                    type="text"
                    className={INPUT_CLS}
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-[var(--text-muted)] font-semibold uppercase block mb-1">Category</label>
                  <select
                    className={INPUT_CLS}
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as Category)}
                  >
                    {Object.keys(CATEGORY_CONFIG).map((key) => (
                      <option key={key} value={key} className="bg-[var(--bg-void)]">
                        {CATEGORY_CONFIG[key].emoji} {CATEGORY_CONFIG[key].label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[var(--text-muted)] font-semibold uppercase block mb-1">Starts At</label>
                  <input
                    type="datetime-local"
                    required
                    className={INPUT_CLS}
                    value={editStartsAt}
                    onChange={(e) => setEditStartsAt(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-[var(--text-muted)] font-semibold uppercase block mb-1">Ends At</label>
                  <input
                    type="datetime-local"
                    required
                    className={INPUT_CLS}
                    value={editEndsAt}
                    onChange={(e) => setEditEndsAt(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-[var(--text-muted)] font-semibold uppercase block mb-1">Max Headcount (Optional)</label>
                <input
                  type="number"
                  placeholder="Unlimited"
                  className={INPUT_CLS}
                  value={editMaxHeadcount}
                  onChange={(e) => setEditMaxHeadcount(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={savingEdit}>
                  Save Changes
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col gap-3">
              <h1 className="text-3xl md:text-4xl font-extrabold font-display leading-tight">{event.title}</h1>
              {event.description && (
                <p className="text-sm md:text-base text-[var(--text-secondary)] leading-relaxed">{event.description}</p>
              )}
            </div>
          )}

          {/* Details metadata row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 border-y border-white/5 my-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/55">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-semibold text-[var(--text-muted)] tracking-wider">Starts At</p>
                <p className="text-xs font-semibold">{new Date(event.starts_at).toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/55">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-semibold text-[var(--text-muted)] tracking-wider">Ends At</p>
                <p className="text-xs font-semibold">{new Date(event.ends_at).toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/55">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-semibold text-[var(--text-muted)] tracking-wider">Location</p>
                <p className="text-xs font-semibold">{event.location_name || "TBA / Online"}</p>
              </div>
            </div>
          </div>

          {/* Organizer + Join / Edit Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
            {/* Organizer details */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--accent-primary)] border border-white/10 flex items-center justify-center font-bold">
                {organiserProfile?.avatar_url ? (
                  <img src={organiserProfile.avatarUrl || organiserProfile.avatar_url} alt={organiserProfile.display_name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  (organiserProfile?.display_name || "?").charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <p className="text-xs text-[var(--text-secondary)] font-medium">Hosted by</p>
                <p className="text-sm font-bold text-white">@{organiserProfile?.handle || "organiser"}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {isOrganiser ? (
                <>
                  <Button variant="ghost" icon={<Edit className="w-4 h-4" />} onClick={() => setEditing(true)}>
                    Edit Event
                  </Button>
                  <Button variant="danger" icon={<Trash2 className="w-4 h-4" />} onClick={handleDeleteEvent}>
                    Delete
                  </Button>
                </>
              ) : (
                <>
                  {isJoined ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-green-400 bg-green-500/10 border border-green-500/30 px-3.5 py-2 rounded-xl flex items-center gap-1.5">
                        <Check className="w-4 h-4" /> Going
                      </span>
                      <Button variant="ghost" onClick={handleCancelRsvp} loading={isRsvping}>
                        Cancel RSVP
                      </Button>
                    </div>
                  ) : isPending ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white/50 bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl flex items-center gap-1.5">
                        Request Pending
                      </span>
                      <Button variant="ghost" onClick={handleCancelRsvp} loading={isRsvping}>
                        Cancel Request
                      </Button>
                    </div>
                  ) : (
                    <Button variant="primary" loading={isRsvping} onClick={handleRsvpAction}>
                      Join Event
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Guest List and Pending Requests sections ─────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Attendees List (2 columns width) */}
          <div
            className="md:col-span-2 rounded-3xl p-6 backdrop-blur-xl flex flex-col gap-4"
            style={{
              background: "var(--bg-frosted)",
              border: "1px solid var(--glass-border)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            }}
          >
            <h2 className="text-xl font-bold font-display flex items-center gap-2">
              <Users className="w-5 h-5 text-[var(--accent-primary)]" />
              Attendees ({attendingList.length})
            </h2>

            {attendingList.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] italic py-4">No one is attending yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto no-scrollbar">
                {attendingList.map((rsvp) => (
                  <div
                    key={rsvp.id}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--bg-deep)] border border-[var(--border-subtle)]"
                  >
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs">
                      {rsvp.user?.avatar_url ? (
                        <img src={rsvp.user.avatar_url} alt={rsvp.user.display_name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        (rsvp.user?.display_name || "?").charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate text-white">{rsvp.user?.display_name}</p>
                      <p className="text-xs text-[var(--text-muted)] truncate font-mono">@{rsvp.user?.handle}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending RSVPs List (Visible to Organiser only) */}
          {isOrganiser && (
            <div
              className="rounded-3xl p-6 backdrop-blur-xl flex flex-col gap-4"
              style={{
                background: "var(--bg-frosted)",
                border: "1px solid var(--glass-border)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              }}
            >
              <h2 className="text-lg font-bold font-display flex items-center gap-2 text-yellow-400">
                <Shield className="w-4 h-4" />
                Requests ({pendingList.length})
              </h2>

              {pendingList.length === 0 ? (
                <p className="text-xs text-[var(--text-muted)] italic py-4">No pending requests.</p>
              ) : (
                <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto no-scrollbar">
                  {pendingList.map((rsvp) => (
                    <div
                      key={rsvp.id}
                      className="flex flex-col gap-2 p-3 rounded-2xl bg-[var(--bg-deep)] border border-[var(--border-subtle)]"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center font-bold text-[10px]">
                          {rsvp.user?.avatar_url ? (
                            <img src={rsvp.user.avatar_url} alt={rsvp.user.display_name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            (rsvp.user?.display_name || "?").charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate text-white">{rsvp.user?.display_name}</p>
                          <p className="text-[10px] text-[var(--text-muted)] truncate font-mono">@{rsvp.user?.handle}</p>
                        </div>
                      </div>

                      <div className="flex justify-end gap-1.5 pt-1">
                        <button
                          onClick={() => handleUpdateRsvpStatus(rsvp.id, "declined")}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-semibold border border-red-500/30 text-red-400 bg-red-500/10 hover:bg-red-500/20"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleUpdateRsvpStatus(rsvp.id, "attending")}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-green-500 text-white hover:opacity-90"
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
