"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  MessageSquare,
  Info,
  Send,
  Pin,
  Lock,
  Unlock,
  Archive,
  Trash2,
  LogOut,
  Edit2,
  Shield,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  X,
  Loader2,
  Calendar,
  ArrowLeft,
  Paperclip,
  Share2,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import Button from "@/components/ui/Button";
import Link from "next/link";

interface PodMemberProfile {
  id: string;
  user_id: string;
  role: "creator" | "admin" | "member";
  joined_at: string;
  user: {
    handle: string;
    display_name: string;
    avatar_url?: string;
  };
}

interface PodMessage {
  id: string;
  pod_id: string;
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

const isVideoUrl = (url: string) => {
  if (!url) return false;
  const cleanUrl = url.split("?")[0];
  const videoExtensions = [".mp4", ".webm", ".mov", ".ogg", ".m4v"];
  return videoExtensions.some((ext) => cleanUrl.toLowerCase().endsWith(ext));
};

export default function PodDetailPage() {
  const { id: podId } = useParams() as { id: string };
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [pod, setPod] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isMember, setIsMember] = useState(false);
  const [memberRole, setMemberRole] = useState<"creator" | "admin" | "member" | null>(null);

  // Sharing states
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const handleInvite = () => {
    const inviteUrl = `${window.location.origin}/signup?invite_type=pod&invite_id=${podId}`;
    navigator.clipboard.writeText(inviteUrl);
    setToastMessage("Invite link copied to clipboard!");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Tabs
  const [activeTab, setActiveTab] = useState<"about" | "chat" | "members">("about");

  // About Tab States
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Chat Tab States
  const [messages, setMessages] = useState<PodMessage[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  const [submittingMsg, setSubmittingMsg] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState<PodMessage[]>([]);
  const [showPinnedHeader, setShowPinnedHeader] = useState(true);

  // Media sharing states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  // Members Tab States
  const [membersList, setMembersList] = useState<PodMemberProfile[]>([]);
  const [kickingMemberId, setKickingMemberId] = useState<string | null>(null);
  const [promotingMemberId, setPromotingMemberId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatScrollContainerRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Pod Details & Profile
  useEffect(() => {
    if (!podId) return;
    initPodData();
  }, [podId]);

  const initPodData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      // Fetch Pod
      const { data: podData, error: podErr } = await supabase
        .from("pods")
        .select("*, colleges(name, short_name, hub_type)")
        .eq("id", podId)
        .single();

      if (podErr || !podData) {
        console.error("Pod load error:", podErr);
        setLoading(false);
        return;
      }

      setPod(podData);
      setEditName(podData.name);
      setEditDesc(podData.description || "");

      // Check Membership
      if (user) {
        const { data: memData } = await supabase
          .from("pod_members")
          .select("role")
          .eq("pod_id", podId)
          .eq("user_id", user.id)
          .maybeSingle();

        if (memData) {
          setIsMember(true);
          setMemberRole(memData.role as any);
        } else if (user.id === podData.creator_id) {
          setIsMember(true);
          setMemberRole("creator");
        } else {
          setIsMember(false);
          setMemberRole(null);
        }
      }

      // Fetch Members List
      await fetchMembers();

      // Fetch Messages (if member)
      await fetchMessages();
    } catch (e) {
      console.error("Initialization error:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    const { data, error } = await supabase
      .from("pod_members")
      .select("*, user:users(handle, display_name, avatar_url)")
      .eq("pod_id", podId)
      .order("joined_at", { ascending: true });

    if (!error && data) {
      setMembersList(data as any[]);
    }
  };

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("pod_messages")
      .select("id, pod_id, sender_id, content, is_pinned, is_system, created_at, sender:users(handle, display_name, avatar_url)")
      .eq("pod_id", podId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      const msgs = data as PodMessage[];
      setMessages(msgs);
      setPinnedMessages(msgs.filter((m) => m.is_pinned));
      setTimeout(scrollToBottom, 50);
    } else if (error) {
      console.error("fetchMessages error:", error.message);
    }
  };

  // 2. Real-time Messages Listener
  useEffect(() => {
    if (!isMember || !podId) return;

    const channel = supabase
      .channel(`pod_messages:${podId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pod_messages",
          filter: `pod_id=eq.${podId}`,
        },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            // Fetch sender profile to append
            const { data: senderData } = await supabase
              .from("users")
              .select("handle, display_name, avatar_url")
              .eq("id", payload.new.sender_id)
              .single();

            const fullMsg: PodMessage = {
              ...(payload.new as PodMessage),
              sender: senderData || undefined,
            };

            setMessages((prev) => {
              // Avoid duplicates
              if (prev.some((m) => m.id === fullMsg.id)) return prev;
              return [...prev, fullMsg];
            });
            setTimeout(scrollToBottom, 50);
          } else if (payload.eventType === "UPDATE") {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === payload.new.id ? { ...msg, ...(payload.new as PodMessage) } : msg
              )
            );
            // Refresh pinned messages
            const updated = payload.new as PodMessage;
            setPinnedMessages((prev) => {
              if (updated.is_pinned) {
                if (prev.some((m) => m.id === updated.id)) {
                  return prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m));
                }
                // Fetch sender if not present
                return [...prev, updated].sort(
                  (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                );
              } else {
                return prev.filter((m) => m.id !== updated.id);
              }
            });
          } else if (payload.eventType === "DELETE") {
            setMessages((prev) => prev.filter((msg) => msg.id !== payload.old.id));
            setPinnedMessages((prev) => prev.filter((msg) => msg.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isMember, podId, supabase]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 3. User Actions (Join, Leave, Edit, Archive, Delete)
  const handleJoin = async () => {
    if (!currentUser) {
      router.push("/login");
      return;
    }

    const { error } = await supabase
      .from("pod_members")
      .insert({ pod_id: podId, user_id: currentUser.id, role: "member" });

    if (!error) {
      setIsMember(true);
      setMemberRole("member");
      await fetchMembers();
      await fetchMessages();
    } else {
      alert(error.message);
    }
  };

  const handleLeave = async () => {
    if (!currentUser) return;
    const confirmLeave = window.confirm("Are you sure you want to leave this Pod?");
    if (!confirmLeave) return;

    const { error } = await supabase
      .from("pod_members")
      .delete()
      .eq("pod_id", podId)
      .eq("user_id", currentUser.id);

    if (!error) {
      setIsMember(false);
      setMemberRole(null);
      setActiveTab("about");
      await fetchMembers();
    } else {
      alert(error.message);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;

    setSavingEdit(true);
    const { data: updated, error } = await supabase
      .from("pods")
      .update({
        name: editName.trim(),
        description: editDesc.trim() || null,
      })
      .eq("id", podId)
      .select()
      .single();

    setSavingEdit(false);
    if (!error && updated) {
      setPod((prev: any) => ({ ...prev, ...updated }));
      setEditing(false);
    } else {
      alert(error?.message || "Update failed. You may not have permission to edit this Pod.");
    }
  };

  const handleArchive = async () => {
    const isArchived = pod.pod_status === "archived";
    const confirmMsg = isArchived
      ? "Do you want to restore and activate this Pod?"
      : "Are you sure you want to Archive this Pod?\n\n• Chat will become read-only\n• No new members can join\n• Auto-purged after 30 days";

    if (!window.confirm(confirmMsg)) return;

    const newStatus = isArchived ? "active" : "archived";
    const { data: updated, error } = await supabase
      .from("pods")
      .update({
        pod_status: newStatus,
        archived_at: isArchived ? null : new Date().toISOString(),
        auto_purge_at: isArchived
          ? null
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: isArchived,
      })
      .eq("id", podId)
      .select()
      .single();

    if (!error && updated) {
      setPod((prev: any) => ({ ...prev, ...updated }));
    } else {
      alert(error?.message || "Archive failed. You may not have permission.");
    }
  };

  const handleDelete = async () => {
    const otherMembers = membersList.filter((m) => m.user_id !== pod.creator_id).length;
    if (otherMembers > 0) {
      alert("Cannot delete a Pod with active members. Please archive it instead.");
      return;
    }

    if (!window.confirm("Are you sure you want to permanently delete this Pod? This cannot be undone.")) return;

    const { error } = await supabase.from("pods").delete().eq("id", podId);
    if (!error) {
      router.push("/pods");
    } else {
      alert(error.message);
    }
  };

  // 4. Message Actions (Send, Pin/Unpin)
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
      if (file.size > 25 * 1024 * 1024) {
        alert("File too large. Max 25MB allowed.");
        return;
      }
      setSelectedFile(file);
      setMediaPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputMsg.trim() && !selectedFile) || !currentUser || pod.pod_status === "archived") return;

    const text = inputMsg.trim();
    const file = selectedFile;

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

      const insertPayload: Record<string, any> = {
        pod_id: podId,
        sender_id: currentUser.id,
        content: text || (file ? file.name : ""),
      };
      if (uploadedUrl) insertPayload.media_url = uploadedUrl;

      const { error } = await supabase.from("pod_messages").insert(insertPayload);

      if (error) {
        throw new Error(error.message);
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

  const handleTogglePin = async (msg: PodMessage) => {
    if (!memberRole || memberRole === "member") return;

    const newPinStatus = !msg.is_pinned;
    if (newPinStatus && pinnedMessages.length >= 3) {
      alert("A Pod can have at most 3 pinned messages.");
      return;
    }

    const { error } = await supabase
      .from("pod_messages")
      .update({ is_pinned: newPinStatus })
      .eq("id", msg.id);

    if (error) {
      alert(error.message);
    }
  };

  // 5. Member Role Management (Admin promote, Kick)
  const handlePromote = async (member: PodMemberProfile) => {
    if (memberRole !== "creator") return;
    const confirmPromote = window.confirm(
      `Promote @${member.user.handle} to Admin? Admins can pin messages and kick normal members.`
    );
    if (!confirmPromote) return;

    setPromotingMemberId(member.id);
    const { error } = await supabase
      .from("pod_members")
      .update({ role: "admin" })
      .eq("id", member.id);

    setPromotingMemberId(null);
    if (!error) {
      await fetchMembers();
    } else {
      alert(error.message);
    }
  };

  const handleKick = async (member: PodMemberProfile) => {
    if (!memberRole || memberRole === "member") return;
    if (member.role === "creator") return;
    if (member.role === "admin" && memberRole !== "creator") return; // Admin can't kick another admin

    const confirmKick = window.confirm(`Are you sure you want to kick @${member.user.handle} from the Pod?`);
    if (!confirmKick) return;

    setKickingMemberId(member.id);
    const { error } = await supabase.from("pod_members").delete().eq("id", member.id);

    setKickingMemberId(null);
    if (!error) {
      await fetchMembers();
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

  if (!pod) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-8 bg-[var(--bg-void)]">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold font-display text-white mb-2">Pod Not Found</h2>
        <p className="text-sm text-[var(--text-muted)] mb-6 max-w-sm">
          This pod may have been deleted, auto-purged after archive, or does not exist.
        </p>
        <Link href="/pods">
          <Button variant="primary">Back to Pods</Button>
        </Link>
      </div>
    );
  }

  const otherMembersCount = membersList.filter((m) => m.user_id !== pod.creator_id).length;
  const isCreator = currentUser?.id === pod.creator_id;
  const isAdmin = memberRole === "creator" || memberRole === "admin";
  const isArchived = pod.pod_status === "archived";

  return (
    <div className="min-h-screen pt-24 pb-28 px-4 sm:px-6 bg-[var(--bg-void)] text-white">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        {/* ── Back Button ─────────────────────────────────────── */}
        <button
          onClick={() => router.push("/pods")}
          className="self-start flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Pods
        </button>
        {/* ── Archived Warning Banner ────────────────────────────── */}
        {isArchived && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-4 rounded-2xl border border-red-500/30 bg-red-950/15 backdrop-blur-xl text-red-400 text-sm"
          >
            <div className="flex items-center gap-2">
              <Archive className="w-4 h-4 text-red-400" />
              <span>
                <strong>This Pod has been archived by the creator.</strong> Chat is read-only, and membership is locked.
              </span>
            </div>
            {isCreator && (
              <Button variant="ghost" className="text-red-400 hover:bg-red-500/10 border-red-500/20 text-xs px-3 py-1" onClick={handleArchive}>
                Unarchive Pod
              </Button>
            )}
          </motion.div>
        )}

        {/* ── Pod Header Card ────────────────────────────────────── */}
        <div
          className="rounded-3xl p-6 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6 backdrop-blur-2xl border border-[var(--glass-border)] bg-[var(--bg-frosted)] shadow-xl"
          style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}
        >
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[var(--accent-primary)] opacity-[0.05] blur-[80px]" />

          <div className="space-y-3 z-10">
            {/* Tag / Meta Row */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-[#a29bfe]">
                {pod.pod_type}
              </span>
              {pod.colleges && (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-0.5 rounded-full border border-[var(--border-subtle)] bg-white/5 text-[var(--text-secondary)]">
                  🏫 {pod.colleges.short_name || pod.colleges.name}
                </span>
              )}
              {isArchived ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-400">
                  Archived
                </span>
              ) : pod.visibility === "open" ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                  <Unlock className="w-2.5 h-2.5" /> Open
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400">
                  <Lock className="w-2.5 h-2.5" /> Invite Only
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-white leading-tight">
              {pod.name}
            </h1>

            {pod.description && (
              <p className="text-sm text-[var(--text-secondary)] max-w-xl leading-relaxed">
                {pod.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 sm:self-center z-10">
            <button
              onClick={handleInvite}
              className="px-3.5 py-2 rounded-xl border border-[var(--glass-border)] text-[var(--text-secondary)] bg-white/5 hover:bg-white/10 hover:text-white transition-all text-xs flex items-center gap-1.5 cursor-pointer font-medium"
              title="Share Invite Link"
            >
              <Share2 className="w-3.5 h-3.5" /> Invite
            </button>
            {isMember ? (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                  <CheckCircle className="w-3 h-3" /> Member ({memberRole})
                </span>
                {!isCreator && (
                  <button
                    onClick={handleLeave}
                    className="p-2 rounded-xl border border-red-500/30 text-red-400 bg-red-500/5 hover:bg-red-500/15 transition-all text-xs flex items-center gap-1.5"
                    title="Leave Pod"
                  >
                    <LogOut className="w-4 h-4" /> Leave
                  </button>
                )}
              </div>
            ) : isArchived ? (
              <Button disabled variant="ghost" className="text-xs border-red-500/20 text-red-400">
                Archived
              </Button>
            ) : pod.visibility === "invite" ? (
              <Button variant="ghost" className="text-xs py-2 px-4 border-amber-500/30 text-amber-400 bg-amber-500/5">
                Request Invitation
              </Button>
            ) : (
              <Button variant="primary" className="text-xs py-2 px-5" onClick={handleJoin}>
                Join Pod
              </Button>
            )}
          </div>
        </div>

        {/* ── Pod Tabs Navigation ────────────────────────────────── */}
        <div className="border-b border-[var(--border-subtle)] flex gap-2">
          <button
            onClick={() => setActiveTab("about")}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${
              activeTab === "about" ? "text-white" : "text-[var(--text-muted)] hover:text-white"
            }`}
          >
            {activeTab === "about" && (
              <motion.span
                layoutId="active-pod-tab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent-primary)]"
              />
            )}
            <span className="flex items-center gap-1.5">
              <Info className="w-4 h-4" /> About
            </span>
          </button>

          {isMember && (
            <>
              <button
                onClick={() => setActiveTab("chat")}
                className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                  activeTab === "chat" ? "text-white" : "text-[var(--text-muted)] hover:text-white"
                }`}
              >
                {activeTab === "chat" && (
                  <motion.span
                    layoutId="active-pod-tab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent-primary)]"
                  />
                )}
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4" /> Chat Space
                </span>
              </button>

              <button
                onClick={() => setActiveTab("members")}
                className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                  activeTab === "members" ? "text-white" : "text-[var(--text-muted)] hover:text-white"
                }`}
              >
                {activeTab === "members" && (
                  <motion.span
                    layoutId="active-pod-tab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent-primary)]"
                  />
                )}
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" /> Members ({membersList.length})
                </span>
              </button>
            </>
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
                {/* Left side: Rules and Info */}
                <div className="md:col-span-2 space-y-6">
                  {/* Pod info block */}
                  <div className="rounded-2xl p-5 border border-[var(--glass-border)] bg-[var(--bg-frosted)] space-y-4">
                    <h3 className="font-semibold text-base font-display">Pod Details</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">Creator</p>
                        <p className="font-medium mt-0.5">@{pod.creator?.handle || "creator"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">Created On</p>
                        <p className="font-medium mt-0.5 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                          {new Date(pod.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">Visibility</p>
                        <p className="font-medium mt-0.5">{pod.visibility === "open" ? "Public / Open" : "Invite Only"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">Scope</p>
                        <p className="font-medium mt-0.5">{pod.college_id ? "Campus Restricted" : "Global Network"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Rules block */}
                  <div className="rounded-2xl p-5 border border-[var(--glass-border)] bg-[var(--bg-frosted)] space-y-3">
                    <h3 className="font-semibold text-base font-display flex items-center gap-2">
                      🛡️ Pod Rules & Permanence
                    </h3>
                    <ul className="space-y-2 text-xs text-[var(--text-secondary)] list-disc pl-4">
                      <li>
                        <strong>Membership Deletion Limit:</strong> Creators cannot delete the Pod once other members join. Only archiving is permitted.
                      </li>
                      <li>
                        <strong>Archive:</strong> When archived, chat locks and new joins are disabled. The pod is purged after 30 days of inactivity.
                      </li>
                      <li>
                        <strong>Property Lock:</strong> Once other members join, the pod's community tag (Hub) cannot be changed.
                      </li>
                      <li>
                        <strong>Ownership Transfer:</strong> If the creator exits, ownership is inherited by the oldest active Admin, then oldest Member. If none remain, the Pod archives.
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Right side: Actions / Creator Panel */}
                <div className="space-y-6">
                  {/* Creator Tools */}
                  {isCreator && (
                    <div className="rounded-2xl p-5 border border-[var(--glass-border)] bg-[var(--bg-frosted)] space-y-4">
                      <h3 className="font-semibold text-base font-display flex items-center gap-2 text-[var(--accent-secondary)]">
                        ⚙️ Creator Controls
                      </h3>

                      {editing ? (
                        <form onSubmit={handleEditSubmit} className="space-y-3">
                          <div>
                            <label className="text-[10px] uppercase font-semibold text-[var(--text-muted)]">Pod Name</label>
                            <input
                              type="text"
                              required
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full bg-[var(--bg-deep)] text-white border border-[var(--border-subtle)] rounded-lg p-2 text-xs focus:outline-none focus:border-[var(--accent-primary)] mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase font-semibold text-[var(--text-muted)]">Description</label>
                            <textarea
                              value={editDesc}
                              onChange={(e) => setEditDesc(e.target.value)}
                              className="w-full bg-[var(--bg-deep)] text-white border border-[var(--border-subtle)] rounded-lg p-2 text-xs focus:outline-none focus:border-[var(--accent-primary)] resize-none h-20 mt-1"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button type="button" variant="ghost" className="text-xs flex-1 py-1" onClick={() => setEditing(false)}>
                              Cancel
                            </Button>
                            <Button type="submit" variant="primary" className="text-xs flex-1 py-1" loading={savingEdit}>
                              Save
                            </Button>
                          </div>
                        </form>
                      ) : (
                        <div className="space-y-2">
                          <button
                            onClick={() => setEditing(true)}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium border border-[var(--border-subtle)] bg-[var(--bg-deep)] hover:bg-white/5 transition-all flex items-center gap-2"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-[var(--text-muted)]" /> Edit Metadata
                          </button>

                          <button
                            onClick={handleArchive}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium border transition-all flex items-center gap-2 ${
                              isArchived
                                ? "border-emerald-500/20 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10"
                                : "border-amber-500/20 text-amber-400 bg-amber-500/5 hover:bg-amber-500/10"
                            }`}
                          >
                            <Archive className="w-3.5 h-3.5" />
                            {isArchived ? "Unarchive Pod" : "Archive Pod"}
                          </button>

                          <button
                            onClick={handleDelete}
                            disabled={otherMembersCount > 0}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium border border-red-500/20 text-red-400 bg-red-500/5 hover:bg-red-500/10 disabled:opacity-30 disabled:hover:bg-red-500/5 transition-all flex items-center gap-2"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete Pod
                          </button>
                          {otherMembersCount > 0 && (
                            <p className="text-[9px] text-[var(--text-muted)] text-center">
                              Cannot delete: active members inside.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Public member lists snippet */}
                  <div className="rounded-2xl p-5 border border-[var(--glass-border)] bg-[var(--bg-frosted)] space-y-3">
                    <h3 className="font-semibold text-sm font-display">Members</h3>
                    <div className="flex -space-x-2 overflow-hidden py-1">
                      {membersList.slice(0, 5).map((mem) => (
                        <div
                          key={mem.id}
                          className="w-7 h-7 rounded-full border border-[var(--bg-void)] bg-purple-500 overflow-hidden flex items-center justify-center text-[10px] font-bold"
                          title={`@${mem.user.handle}`}
                        >
                          {mem.user.avatar_url ? (
                            <img src={mem.user.avatar_url} alt={mem.user.handle} className="w-full h-full object-cover" />
                          ) : (
                            mem.user.handle.charAt(0).toUpperCase()
                          )}
                        </div>
                      ))}
                      {membersList.length > 5 && (
                        <div className="w-7 h-7 rounded-full border border-[var(--bg-void)] bg-[var(--bg-deep)] text-[var(--text-muted)] flex items-center justify-center text-[9px] font-mono">
                          +{membersList.length - 5}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">
                      {membersList.length} active crew member{membersList.length === 1 ? "" : "s"}.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* CHAT TAB */}
            {activeTab === "chat" && isMember && (
              <motion.div
                key="chat-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col rounded-3xl border border-[var(--glass-border)] bg-[var(--bg-frosted)] overflow-hidden shadow-2xl h-[550px]"
              >
                {/* Pinned Messages Header */}
                {pinnedMessages.length > 0 && (
                  <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex flex-col gap-1.5 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                        <Pin className="w-3 h-3" /> Pinned Announcements ({pinnedMessages.length} / 3)
                      </span>
                      <button className="text-[10px] text-amber-400/80 hover:underline" onClick={() => setShowPinnedHeader(!showPinnedHeader)}>
                        {showPinnedHeader ? "Collapse" : "Expand"}
                      </button>
                    </div>

                    {showPinnedHeader && (
                      <div className="space-y-1.5 max-h-[100px] overflow-y-auto">
                        {pinnedMessages.map((msg) => (
                          <div key={msg.id} className="text-xs text-amber-300 flex items-start justify-between gap-4 p-1.5 rounded bg-black/10 border border-amber-500/10">
                            <span className="italic leading-normal flex-1">
                              <strong>@{msg.sender?.handle || "user"}:</strong> "{msg.content}"
                            </span>
                            {isAdmin && (
                              <button onClick={() => handleTogglePin(msg)} className="text-[10px] text-amber-400 hover:text-red-400">
                                Unpin
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Messages stream */}
                <div
                  ref={chatScrollContainerRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/15"
                >
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[var(--text-muted)]">
                      <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
                      <p className="text-sm">Welcome to the Pod Chat Space.</p>
                      <p className="text-xs">Introduce yourself and start building!</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.sender_id === currentUser?.id;
                      return (
                        <div key={msg.id} className={`flex gap-3 max-w-[80%] ${isMe ? "ml-auto flex-row-reverse" : ""}`}>
                          {/* Avatar */}
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-purple-500 flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {msg.sender?.avatar_url ? (
                              <img src={msg.sender.avatar_url} alt={msg.sender.handle} className="w-full h-full object-cover" />
                            ) : (
                              (msg.sender?.handle || "U").charAt(0).toUpperCase()
                            )}
                          </div>

                          {/* Message Bubble */}
                          <div className="space-y-1">
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
                                  ? "bg-[rgba(108,92,231,0.1)] border-[rgba(108,92,231,0.3)] text-white rounded-tr-sm"
                                  : "bg-[var(--bg-surface)] border-[var(--glass-border)] text-[var(--text-secondary)] rounded-tl-sm"
                              }`}
                            >
                              {msg.content && (
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                              )}
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

                              {/* Hover Options (Pin/Unpin) */}
                              {isAdmin && (
                                <div className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover/bubble:opacity-100 transition-opacity flex gap-1 ${
                                  isMe ? "right-full mr-2" : "left-full ml-2"
                                }`}>
                                  <button
                                    onClick={() => handleTogglePin(msg)}
                                    className={`p-1.5 rounded-full border bg-[var(--bg-deep)] transition-all hover:scale-105 ${
                                      msg.is_pinned 
                                        ? "text-amber-400 border-amber-500/30" 
                                        : "text-[var(--text-muted)] border-[var(--border-subtle)] hover:text-amber-400"
                                    }`}
                                    title={msg.is_pinned ? "Unpin Announcement" : "Pin Announcement"}
                                  >
                                    <Pin className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
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
                  {isArchived ? (
                    <div className="p-3 text-center text-xs text-[var(--text-muted)] font-mono flex items-center justify-center gap-2">
                      <Archive className="w-4 h-4 text-red-500" />
                      This Pod has been archived. Chat is read-only.
                    </div>
                  ) : (
                    <>
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
                            className="absolute -top-1 -right-1 p-1.5 bg-red-500/80 hover:bg-red-600 rounded-full text-white transition-colors shadow-lg"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      <form onSubmit={handleSendMessage} className="flex gap-2 items-center max-w-4xl mx-auto w-full">
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
                          className="p-2.5 rounded-xl bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-white transition-colors"
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
                          placeholder="Discuss studying, hacking, residency, gaming..."
                          className="flex-1 bg-[var(--bg-surface)] text-sm text-white placeholder-[var(--text-muted)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] focus:outline-none rounded-xl px-4 py-2.5 transition-colors"
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
                  )}
                </div>
              </motion.div>
            )}

            {/* MEMBERS TAB */}
            {activeTab === "members" && isMember && (
              <motion.div
                key="members-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-frosted)] p-5 space-y-4"
              >
                <h3 className="font-semibold text-base font-display">Crew Members</h3>

                <div className="divide-y divide-[var(--border-subtle)]">
                  {membersList.map((member) => {
                    const isTargetCreator = member.role === "creator";
                    const isTargetAdmin = member.role === "admin";
                    const canPromoteTarget = memberRole === "creator" && member.role === "member";
                    const canKickTarget =
                      (memberRole === "creator" && member.role !== "creator") ||
                      (memberRole === "admin" && member.role === "member");

                    return (
                      <div key={member.id} className="flex items-center justify-between py-3 gap-4">
                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          <div className="w-9 h-9 rounded-full overflow-hidden bg-purple-500 flex items-center justify-center font-bold text-sm">
                            {member.user.avatar_url ? (
                              <img src={member.user.avatar_url} alt={member.user.handle} className="w-full h-full object-cover" />
                            ) : (
                              member.user.handle.charAt(0).toUpperCase()
                            )}
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-white">
                              {member.user.display_name}
                            </p>
                            <p className="text-xs text-[var(--text-muted)] font-mono">
                              @{member.user.handle}
                            </p>
                          </div>

                          {/* Role badges */}
                          <div className="ml-2">
                            {isTargetCreator ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-purple-500/10 border border-purple-500/30 text-[#a29bfe]">
                                <ShieldCheck className="w-3 h-3" /> Creator
                              </span>
                            ) : isTargetAdmin ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider bg-blue-500/10 border border-blue-500/30 text-[#60a5fa]">
                                <Shield className="w-3 h-3" /> Admin
                              </span>
                            ) : null}
                          </div>
                        </div>

                        {/* Crew Actions (Promote, Kick) */}
                        {!isArchived && (canPromoteTarget || canKickTarget) && (
                          <div className="flex items-center gap-2">
                            {canPromoteTarget && (
                              <button
                                onClick={() => handlePromote(member)}
                                disabled={promotingMemberId === member.id}
                                className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-blue-500/30 text-blue-400 bg-blue-500/5 hover:bg-blue-500/10 transition-all flex items-center gap-1"
                              >
                                {promotingMemberId === member.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  "Make Admin"
                                )}
                              </button>
                            )}

                            {canKickTarget && (
                              <button
                                onClick={() => handleKick(member)}
                                disabled={kickingMemberId === member.id}
                                className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-red-500/30 text-red-400 bg-red-500/5 hover:bg-red-500/10 transition-all flex items-center gap-1"
                              >
                                {kickingMemberId === member.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  "Kick Crew"
                                )}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
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
            className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-frosted)] text-white text-sm shadow-2xl flex items-center gap-2.5 backdrop-blur-xl"
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
