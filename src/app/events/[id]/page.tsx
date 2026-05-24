"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import OfficialTag from "@/components/ui/OfficialTag";
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
  AlertCircle,
  Send,
  Pin,
  MessageSquare,
  Paperclip,
  Share2,
  CornerUpLeft,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import Button from "@/components/ui/Button";
import TrustTierBadge from "@/components/ui/TrustTierBadge";

interface EventMessage {
  id: string;
  event_id: string;
  sender_id: string;
  content: string;
  media_url?: string;
  is_pinned: boolean;
  is_system: boolean;
  created_at: string;
  sender?: {
    handle: string;
    display_name: string;
    avatar_url?: string;
  };
}

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

const isVideoUrl = (url: string) => {
  if (!url) return false;
  const cleanUrl = url.split("?")[0];
  const videoExtensions = [".mp4", ".webm", ".mov", ".ogg", ".m4v"];
  return videoExtensions.some((ext) => cleanUrl.toLowerCase().endsWith(ext));
};

function parseMessageContent(content: string) {
  const match = content.match(/^\[reply:([a-f0-9-]+)\]\s+([^\n]+)\n([\s\S]*)/);
  if (match) {
    return {
      replyToId: match[1],
      replyToSummary: match[2],
      actualContent: match[3]
    };
  }
  return {
    replyToId: null,
    replyToSummary: null,
    actualContent: content
  };
}

export default function EventDetailPage() {
  const { id: eventId } = useParams() as { id: string };
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [replyingTo, setReplyingTo] = useState<EventMessage | null>(null);

  const scrollToMessage = (msgId: string) => {
    const el = document.getElementById(`msg-${msgId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('bg-[rgba(108,92,231,0.25)]');
      setTimeout(() => {
        el.classList.remove('bg-[rgba(108,92,231,0.25)]');
      }, 1500);
    }
  };
  const [organiserProfile, setOrganiserProfile] = useState<any>(null);
  const organiserProfileRef = useRef(organiserProfile);
  useEffect(() => {
    organiserProfileRef.current = organiserProfile;
  }, [organiserProfile]);

  // Sharing states
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const handleInvite = () => {
    const inviteUrl = `${window.location.origin}/signup?invite_type=event&invite_id=${eventId}`;
    navigator.clipboard.writeText(inviteUrl);
    setToastMessage("Invite link copied to clipboard!");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };
  
  // RSVP states
  const [rsvpList, setRsvpList] = useState<any[]>([]);
  const rsvpListRef = useRef(rsvpList);
  useEffect(() => {
    rsvpListRef.current = rsvpList;
  }, [rsvpList]);
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

  // Tab State
  const [activeTab, setActiveTab] = useState<"about" | "chat">("about");

  // Chat Space States
  const [chatMessages, setChatMessages] = useState<EventMessage[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  const [submittingMsg, setSubmittingMsg] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  const mediaInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatScrollContainerRef = useRef<HTMLDivElement>(null);

  const isOrganiser = currentUser?.id === event?.organiser_id;

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

  // Event Chat functions & hooks
  const scrollToBottom = () => {
    if (chatScrollContainerRef.current) {
      chatScrollContainerRef.current.scrollTo({
        top: chatScrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  const fetchChatMessages = async () => {
    const { data, error } = await supabase
      .from("event_messages")
      .select("*, sender:users(handle, display_name, avatar_url)")
      .eq("event_id", eventId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setChatMessages(data as EventMessage[]);
      setTimeout(scrollToBottom, 50);
    }
  };

  // Fetch event chat messages when chat tab is active
  useEffect(() => {
    if (activeTab === "chat" && (isOrganiser || isJoined)) {
      fetchChatMessages();
    }
  }, [activeTab, isOrganiser, isJoined]);

  // Subscribe to real-time event messages
  useEffect(() => {
    if (activeTab !== "chat" || (!isOrganiser && !isJoined) || !eventId) return;

    const channel = supabase
      .channel(`event_messages:${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "event_messages",
          filter: `event_id=eq.${eventId}`,
        },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            let senderData: any = null;
            if (organiserProfileRef.current && organiserProfileRef.current.id === payload.new.sender_id) {
              senderData = {
                handle: organiserProfileRef.current.handle,
                display_name: organiserProfileRef.current.display_name,
                avatar_url: organiserProfileRef.current.avatar_url,
              };
            } else {
              const matchedRsvp = rsvpListRef.current?.find(
                (r) => r.user_id === payload.new.sender_id
              );
              if (matchedRsvp?.user) {
                senderData = {
                  handle: matchedRsvp.user.handle,
                  display_name: matchedRsvp.user.display_name,
                  avatar_url: matchedRsvp.user.avatar_url,
                };
              }
            }

            if (!senderData) {
              const { data } = await supabase
                .from("users")
                .select("handle, display_name, avatar_url")
                .eq("id", payload.new.sender_id)
                .single();
              if (data) {
                senderData = data;
              }
            }

            const fullMsg: EventMessage = {
              ...(payload.new as EventMessage),
              sender: senderData || undefined,
            };

            setChatMessages((prev) => {
              if (prev.some((m) => m.id === fullMsg.id)) return prev;
              return [...prev, fullMsg];
            });
            setTimeout(scrollToBottom, 50);
          } else if (payload.eventType === "UPDATE") {
            setChatMessages((prev) =>
              prev.map((msg) =>
                msg.id === payload.new.id ? { ...msg, ...(payload.new as EventMessage) } : msg
              )
            );
          } else if (payload.eventType === "DELETE") {
            setChatMessages((prev) => prev.filter((msg) => msg.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeTab, isOrganiser, isJoined, eventId, supabase]);

  const handleClearMedia = () => {
    setSelectedFile(null);
    if (mediaPreviewUrl) {
      URL.revokeObjectURL(mediaPreviewUrl);
      setMediaPreviewUrl(null);
    }
    if (mediaInputRef.current) {
      mediaInputRef.current.value = "";
    }
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        alert("File too large. Max 100MB allowed.");
        return;
      }
      setSelectedFile(file);
      setMediaPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSendEventMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputMsg.trim() && !selectedFile) || !currentUser) return;

    const text = inputMsg.trim();
    const file = selectedFile;

    // Formatting if replying
    let finalContent = text || (file ? file.name : "");
    const currentReplying = replyingTo;
    setReplyingTo(null);

    if (currentReplying) {
      const excerptText = currentReplying.content || "";
      const cleanedExcerpt = excerptText.startsWith("[reply:")
        ? parseMessageContent(excerptText).actualContent
        : excerptText;
      const truncatedExcerpt = cleanedExcerpt.substring(0, 60) + (cleanedExcerpt.length > 60 ? "..." : "");
      const excerpt = truncatedExcerpt || (currentReplying.media_url ? "📷 Attachment" : "");

      const senderHandle = currentReplying.sender_id === currentUser.id
        ? "You"
        : (currentReplying.sender?.handle || "user");

      finalContent = `[reply:${currentReplying.id}] @${senderHandle}: ${excerpt}\n${finalContent}`;
    }

    setInputMsg("");
    handleClearMedia();
    setSubmittingMsg(true);

    try {
      let uploadedUrl: string | undefined = undefined;

      if (file) {
        setUploadingMedia(true);
        const fileExt = file.name.split(".").pop();
        const fileName = `${currentUser.id}_${Date.now()}.${fileExt}`;
        const filePath = `chat_media/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("media")
          .upload(filePath, file);

        if (uploadError) {
          throw new Error(`Media upload failed: ${uploadError.message}`);
        }

        const { data: urlData } = supabase.storage.from("media").getPublicUrl(filePath);
        uploadedUrl = urlData.publicUrl;
      }

      const { data: insertedMsg, error } = await supabase
        .from("event_messages")
        .insert({
          event_id: eventId,
          sender_id: currentUser.id,
          content: finalContent,
          media_url: uploadedUrl || null,
        })
        .select("*, sender:users(handle, display_name, avatar_url)")
        .single();

      if (error) {
        throw new Error(error.message);
      }
      if (insertedMsg) {
        setChatMessages((prev) => {
          if (prev.some((m) => m.id === insertedMsg.id)) return prev;
          return [...prev, insertedMsg as unknown as EventMessage];
        });
        setTimeout(scrollToBottom, 50);
      }
    } catch (err: any) {
      alert(err.message || "Failed to send message");
      setInputMsg(text);
      if (file) {
        setSelectedFile(file);
        setMediaPreviewUrl(URL.createObjectURL(file));
      }
    } finally {
      setSubmittingMsg(false);
      setUploadingMedia(false);
    }
  };

  const handleTogglePinEventMsg = async (msg: EventMessage) => {
    if (!isOrganiser) return;

    const newPinStatus = !msg.is_pinned;
    if (newPinStatus && chatMessages.filter((m) => m.is_pinned).length >= 3) {
      alert("An Event can have at most 3 pinned messages.");
      return;
    }

    const { error } = await supabase
      .from("event_messages")
      .update({ is_pinned: newPinStatus })
      .eq("id", msg.id);

    if (error) {
      alert(error.message);
    }
  };

  const handleDeleteEventMessage = async (msgId: string) => {
    if (!isOrganiser) return;
    if (!window.confirm("Delete this message?")) return;

    const { error } = await supabase
      .from("event_messages")
      .delete()
      .eq("id", msgId);

    if (error) {
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
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-8 bg-[var(--bg-void)] text-[var(--text-primary)]">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold font-display mb-2">Event Not Found</h2>
        <p className="text-sm text-[var(--text-muted)] mb-6 max-w-sm">
          This event may have been cancelled, deleted, or does not exist.
        </p>
        <button onClick={() => router.back()} className="px-5 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white font-semibold">
          Go Back
        </button>
      </div>
    );
  }

  const cat = CATEGORY_CONFIG[event.category] || CATEGORY_CONFIG.misc;
  const attendingList = rsvpList.filter(r => r.status === "attending" || r.status === "approved");
  const pendingList = rsvpList.filter(r => r.status === "pending");

  return (
    <div className="min-h-screen pt-24 pb-28 px-4 sm:px-6 bg-[var(--bg-void)] text-[var(--text-primary)]">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        
        {/* ── Back Button ─────────────────────────────────────── */}
        <button
          onClick={() => router.back()}
          className="self-start flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors group"
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
                <p className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1">
                  @{organiserProfile?.handle || "organiser"}
                  {organiserProfile?.id && <OfficialTag entityId={organiserProfile.id} size="sm" />}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={handleInvite}
                className="px-3.5 py-2 rounded-xl border border-[var(--glass-border)] text-[var(--text-secondary)] bg-[var(--bg-frosted)] hover:bg-[var(--glass-hover)] hover:text-[var(--text-primary)] transition-all text-xs flex items-center gap-1.5 cursor-pointer font-medium"
                title="Share Invite Link"
              >
                <Share2 className="w-3.5 h-3.5" /> Invite
              </button>
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
                      <span className="text-xs font-semibold text-[var(--text-secondary)] bg-[var(--bg-frosted)] border border-[var(--border-subtle)] px-3.5 py-2 rounded-xl flex items-center gap-1.5">
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

        {/* ── Event Tabs Navigation ────────────────────────────────── */}
        <div className="border-b border-[var(--border-subtle)] flex gap-2">
          <button
            onClick={() => setActiveTab("about")}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${
              activeTab === "about" ? "text-[var(--text-primary)] font-semibold" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            {activeTab === "about" && (
              <motion.span
                layoutId="active-event-tab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent-primary)]"
              />
            )}
            <span className="flex items-center gap-1.5 font-display uppercase tracking-wider text-xs">
              About Event
            </span>
          </button>

          {(isOrganiser || isJoined) && (
            <button
              onClick={() => setActiveTab("chat")}
              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                activeTab === "chat" ? "text-[var(--text-primary)] font-semibold" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              {activeTab === "chat" && (
                <motion.span
                  layoutId="active-event-tab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent-primary)]"
                />
              )}
              <span className="flex items-center gap-1.5 font-display uppercase tracking-wider text-xs">
                Chat Space
              </span>
            </button>
          )}
        </div>

        {/* ── Tabs Content ───────────────────────────────────────── */}
        <div className="min-h-[300px]">
          <AnimatePresence mode="wait">
            {/* ABOUT TAB */}
            {activeTab === "about" && (
              <motion.div
                key="about-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
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
                            <p className="text-sm font-bold truncate text-[var(--text-primary)]">{rsvp.user?.display_name}</p>
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
                                <p className="text-xs font-bold truncate text-[var(--text-primary)]">{rsvp.user?.display_name}</p>
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
              </motion.div>
            )}

            {/* CHAT TAB */}
            {activeTab === "chat" && (isOrganiser || isJoined) && (
              <motion.div
                key="chat-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col rounded-3xl border border-[var(--glass-border)] bg-[var(--bg-frosted)] overflow-hidden shadow-2xl h-[550px] w-full"
              >
                {/* Pinned Messages Header */}
                {chatMessages.filter((m) => m.is_pinned).length > 0 && (
                  <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex flex-col gap-1.5 transition-all">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                      <Pin className="w-3 h-3" /> Pinned Announcements ({chatMessages.filter((m) => m.is_pinned).length} / 3)
                    </span>

                    <div className="space-y-1.5 max-h-[100px] overflow-y-auto">
                      {chatMessages
                        .filter((m) => m.is_pinned)
                        .map((msg) => (
                          <div
                            key={msg.id}
                            className="text-xs text-amber-300 flex items-start justify-between gap-4 p-1.5 rounded bg-black/10 border border-amber-500/10"
                          >
                            <span className="italic leading-normal flex-1">
                              <strong>@{msg.sender?.handle || "user"}:</strong> "{msg.content}"
                            </span>
                            {isOrganiser && (
                              <button
                                onClick={() => handleTogglePinEventMsg(msg)}
                                className="text-[10px] text-amber-400 hover:text-red-400 flex-shrink-0"
                              >
                                Unpin
                              </button>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Messages stream */}
                <div
                  ref={chatScrollContainerRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/15"
                >
                  {chatMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[var(--text-muted)]">
                      <MessageSquare className="w-8 h-8 mb-2 opacity-50 text-[var(--accent-primary)]" />
                      <p className="text-sm font-semibold text-[var(--text-primary)]">Welcome to the Event Chat Space.</p>
                      <p className="text-xs text-[var(--text-muted)] mt-1">Introduce yourself and start coordinating!</p>
                    </div>
                  ) : (
                    chatMessages.map((msg) => {
                      const isMe = msg.sender_id === currentUser?.id;
                      const { replyToId, replyToSummary, actualContent } = parseMessageContent(msg.content);
                      return (
                        <div key={msg.id} id={`msg-${msg.id}`} className={`flex gap-3 max-w-[80%] transition-all duration-300 rounded-2xl ${isMe ? "ml-auto flex-row-reverse" : ""}`}>
                          {/* Avatar */}
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-purple-500 flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {msg.sender?.avatar_url ? (
                              <img src={msg.sender.avatar_url} alt={msg.sender.handle} className="w-full h-full object-cover" />
                            ) : (
                              (msg.sender?.handle || "U").charAt(0).toUpperCase()
                            )}
                          </div>

                          {/* Message Bubble */}
                          <div className="space-y-1 max-w-[85%]">
                            <div className={`flex items-center gap-2 ${isMe ? "justify-end" : ""}`}>
                              <span className="text-[11px] font-semibold text-[var(--text-secondary)]">
                                {isMe ? "You" : `@${msg.sender?.handle || "user"}`}
                              </span>
                              <span className="text-[9px] text-[var(--text-muted)] font-mono">
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                              {msg.is_pinned && <Pin className="w-2.5 h-2.5 text-amber-400 rotate-45" />}
                            </div>

                            <div
                              className={`p-3 rounded-2xl text-xs leading-relaxed border relative group/bubble ${
                                isMe
                                  ? "bg-[rgba(108,92,231,0.1)] border-[rgba(108,92,231,0.3)] text-[var(--text-primary)] rounded-tr-sm"
                                  : "bg-[var(--bg-surface)] border-[var(--glass-border)] text-[var(--text-secondary)] rounded-tl-sm"
                              }`}
                            >
                              {replyToId && (
                                <div 
                                  onClick={() => scrollToMessage(replyToId)}
                                  className="mb-2 p-2 rounded-lg bg-black/35 border-l-2 border-[var(--accent-primary)] text-[10px] text-[var(--text-muted)] cursor-pointer hover:bg-black/50 transition-all font-mono select-none"
                                >
                                  {replyToSummary}
                                </div>
                              )}

                              {actualContent && <p className="whitespace-pre-wrap">{actualContent}</p>}
                              {msg.media_url && (
                                <div className="mt-1.5 rounded-lg overflow-hidden border border-white/5 bg-black/25">
                                  {isVideoUrl(msg.media_url) ? (
                                    <video
                                      src={msg.media_url}
                                      controls
                                      className="max-h-[240px] w-full rounded object-contain"
                                    />
                                  ) : (
                                    <img
                                      src={msg.media_url}
                                      alt="Attachment"
                                      className="max-h-[240px] w-full rounded object-contain cursor-pointer hover:opacity-90 transition-opacity"
                                      onClick={() => window.open(msg.media_url, "_blank")}
                                    />
                                  )}
                                </div>
                              )}

                              {/* Hover Options (Pin/Delete for Organizer, Reply for Everyone) */}
                              <div
                                className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover/bubble:opacity-100 transition-opacity flex gap-1 ${
                                  isMe ? "right-full mr-2" : "left-full ml-2"
                                }`}
                              >
                                {isOrganiser && (
                                  <>
                                    <button
                                      onClick={() => handleTogglePinEventMsg(msg)}
                                      className={`p-1.5 rounded-full border bg-[var(--bg-deep)] transition-all hover:scale-105 ${
                                        msg.is_pinned
                                          ? "text-amber-400 border-amber-500/30"
                                          : "text-[var(--text-muted)] border-[var(--border-subtle)] hover:text-amber-400"
                                      }`}
                                      title={msg.is_pinned ? "Unpin Announcement" : "Pin Announcement"}
                                    >
                                      <Pin className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteEventMessage(msg.id)}
                                      className="p-1.5 rounded-full border border-red-500/30 bg-[var(--bg-deep)] text-red-400 transition-all hover:scale-105 hover:bg-red-500/10"
                                      title="Delete Message"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => setReplyingTo(msg)}
                                  className="p-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-deep)] text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)] transition-all hover:scale-105 cursor-pointer"
                                  title="Reply to message"
                                >
                                  <CornerUpLeft className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input block */}
                <div className="p-3 bg-[var(--bg-deep)] border-t border-[var(--border-subtle)] flex flex-col gap-2">
                  <>
                    {/* Replying Banner */}
                    {replyingTo && (
                      <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[rgba(108,92,231,0.08)] border border-[rgba(108,92,231,0.2)] text-xs text-[var(--text-secondary)]">
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-[var(--accent-primary)]">
                            Replying to @{replyingTo.sender_id === currentUser?.id ? "You" : (replyingTo.sender?.handle || "user")}
                          </span>
                          <span className="truncate text-[10px] text-[var(--text-muted)] font-mono">
                            {replyingTo.content ? (replyingTo.content.startsWith("[reply:") ? parseMessageContent(replyingTo.content).actualContent : replyingTo.content) : "Attachment"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setReplyingTo(null)}
                          className="p-1 rounded-full text-[var(--text-muted)] hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Media Preview */}
                    {mediaPreviewUrl && (
                      <div className="relative inline-block self-start rounded-xl overflow-hidden border border-[var(--glass-border)] bg-black/45 p-1 group">
                        {selectedFile?.type.startsWith("video/") ? (
                          <video src={mediaPreviewUrl} className="w-20 h-20 object-cover rounded-lg" muted />
                        ) : (
                          <img src={mediaPreviewUrl} alt="Preview" className="w-20 h-20 object-cover rounded-lg" />
                        )}
                        <button
                          type="button"
                          onClick={handleClearMedia}
                          className="absolute -top-1 -right-1 p-1.5 bg-red-500/80 hover:bg-red-600 rounded-full text-white transition-colors shadow-lg cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    <form onSubmit={handleSendEventMessage} className="flex gap-2 items-center max-w-4xl mx-auto w-full">
                      <input
                        type="file"
                        ref={mediaInputRef}
                        onChange={handleMediaChange}
                        accept="image/*,video/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => mediaInputRef.current?.click()}
                        disabled={uploadingMedia || submittingMsg}
                        className="p-2.5 rounded-xl bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                        title="Attach Image or Video"
                      >
                        {uploadingMedia ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Paperclip className="w-5 h-5" />
                        )}
                      </button>
                      <input
                        type="text"
                        value={inputMsg}
                        onChange={(e) => setInputMsg(e.target.value)}
                        placeholder="Coordinate ride shares, plan layout, discuss food..."
                        className="flex-1 bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] focus:outline-none rounded-xl px-4 py-2.5 transition-colors"
                      />
                      <button
                        type="submit"
                        disabled={(!inputMsg.trim() && !selectedFile) || submittingMsg || uploadingMedia}
                        className={`p-2.5 rounded-xl flex-shrink-0 transition-all ${
                          inputMsg.trim() || selectedFile
                            ? "bg-[var(--accent-primary)] text-white shadow-lg cursor-pointer"
                            : "bg-[var(--bg-surface)] text-[var(--text-muted)] cursor-not-allowed"
                        }`}
                      >
                        {submittingMsg ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </button>
                    </form>
                  </>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-frosted)] text-[var(--text-primary)] text-sm shadow-2xl flex items-center gap-2.5 backdrop-blur-xl"
            style={{ boxShadow: "0 10px 40px rgba(108,92,231,0.2)" }}
          >
            <div className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-pulse" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
