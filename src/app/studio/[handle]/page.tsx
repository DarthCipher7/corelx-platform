"use client";

import { use, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { notFound, useRouter } from "next/navigation";
import { MapPin, Users, FolderOpen, CheckCircle, ArrowRight, X, Send } from "lucide-react";
import FeedPost from "@/components/cards/FeedPost";
import Button from "@/components/ui/Button";
import NeonBadge from "@/components/ui/NeonBadge";
import { createClient } from "@/utils/supabase/client";
import { FeedPostData } from "@/types";

export default function StudioPage({ params }: { params: Promise<{ handle: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const supabase = createClient();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  
  const [isMessageDrawerOpen, setIsMessageDrawerOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      let targetHandle = resolvedParams.handle;
      
      // If handle is 'me', resolve to the current user's actual handle
      if (targetHandle === 'me') {
        if (!user) {
          router.push("/login");
          return;
        }
        const { data: userMeta } = await supabase.from('users').select('handle').eq('id', user.id).single();
        if (userMeta?.handle) {
          targetHandle = userMeta.handle;
          // Optionally redirect to the canonical URL
          router.replace(`/studio/${targetHandle}`);
          return;
        } else {
          setLoading(false);
          return;
        }
      }

      // Fetch the profile gracefully handling missing foreign tables if they aren't created yet
      let profileData: any = null;
      const { data: fullProfile, error: profileError } = await supabase
        .from('users')
        .select('*, skills(*), feed_posts(*)')
        .eq('handle', targetHandle)
        .maybeSingle();

      if (profileError) {
        console.warn("Joined profile fetch failed, attempting base user fetch...", profileError);
        const { data: baseProfile } = await supabase
          .from('users')
          .select('*')
          .eq('handle', targetHandle)
          .maybeSingle();
          
        if (baseProfile) {
          profileData = { ...baseProfile, skills: [], feed_posts: [] };
        }
      } else {
        profileData = fullProfile;
      }

      if (!profileData) {
        setLoading(false);
        return;
      }
      setProfile(profileData);

      // Fetch follower count gracefully
      try {
        const { count: followers } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', profileData.id);
        setFollowerCount(followers || 0);

        const { count: following } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', profileData.id);
        setFollowingCount(following || 0);

        if (user) {
          const { data: followRecord } = await supabase
            .from('follows')
            .select('id')
            .eq('follower_id', user.id)
            .eq('following_id', profileData.id)
            .maybeSingle();
          setIsFollowing(!!followRecord);
        }
      } catch (e) {
        console.warn("Follows relation check skipped:", e);
      }

      setLoading(false);
    }
    loadData();
  }, [resolvedParams.handle, supabase]);

  const toggleFollow = async () => {
    if (!currentUser) return router.push("/login");

    if (isFollowing) {
      await supabase.from('follows').delete()
        .eq('follower_id', currentUser.id)
        .eq('following_id', profile.id);
      setIsFollowing(false);
      setFollowerCount(prev => prev - 1);
    } else {
      await supabase.from('follows').insert({
        follower_id: currentUser.id,
        following_id: profile.id
      });
      setIsFollowing(true);
      setFollowerCount(prev => prev + 1);
    }
  };

  const openMessages = async () => {
    if (!currentUser) return router.push("/login");
    setIsMessageDrawerOpen(true);
    fetchMessages();
  };

  const fetchMessages = async () => {
    if (!profile || !currentUser) return;
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${currentUser.id},recipient_id.eq.${profile.id}),and(sender_id.eq.${profile.id},recipient_id.eq.${currentUser.id})`)
      .order('created_at', { ascending: true });
    if (data) setMessages(data);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !currentUser || !profile) return;
    setSending(true);
    await supabase.from('messages').insert({
      sender_id: currentUser.id,
      recipient_id: profile.id,
      content: messageText
    });
    setMessageText("");
    setSending(false);
    fetchMessages();
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!profile) return notFound();

  const isOwner = currentUser?.id === profile.id;

  return (
    <div className="min-h-screen pb-32">
      {/* Cover Image */}
      <div className="h-64 w-full relative bg-gradient-to-tr from-purple-900 via-gray-900 to-black">
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--bg-void), transparent)" }} />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative -mt-24">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-6 md:items-end mb-12">
          <div className="avatar-ring w-32 h-32 rounded-full inline-block shrink-0 p-1" style={{ backgroundColor: "var(--bg-void)" }}>
            <div className="w-full h-full rounded-full overflow-hidden relative flex items-center justify-center text-4xl font-bold text-white" style={{ backgroundColor: "var(--bg-frosted)", backgroundImage: "linear-gradient(135deg, #6c5ce7 0%, #00d2ff 100%)" }}>
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full object-cover" />
              ) : (
                profile.display_name?.charAt(0) || profile.handle.charAt(0).toUpperCase()
              )}
            </div>
          </div>
          
          <div className="flex-1 pb-2">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-display font-bold" style={{ color: "var(--text-primary)" }}>{profile.display_name || profile.handle}</h1>
            </div>
            <p className="font-medium text-lg mb-2" style={{ color: "var(--accent-primary)" }}>@{profile.handle}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: "var(--text-muted)" }}>
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {followerCount} followers</span>
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {followingCount} following</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pb-2">
            {isOwner ? (
              <Button variant="ghost" onClick={() => router.push("/settings")}>Edit Profile</Button>
            ) : (
              <>
                <Button 
                  variant={isFollowing ? "ghost" : "primary"} 
                  onClick={toggleFollow}
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </Button>
                <Button variant="ghost" onClick={openMessages}>Message</Button>
              </>
            )}
          </div>
        </div>

        {/* Bio & Skills */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          <div className="md:col-span-2">
            <h2 className="text-xl font-display font-semibold mb-4" style={{ color: "var(--text-primary)" }}>About</h2>
            <p className="leading-relaxed text-lg mb-6" style={{ color: "var(--text-secondary)" }}>
              {profile.tagline || "This creator hasn't added a tagline yet."}
            </p>
            <div className="flex flex-wrap gap-2">
              {profile.skills?.map((s: any) => (
                <span key={s.id} className="skill-badge px-3 py-1.5">{s.skill_name}</span>
              ))}
            </div>
          </div>
          <div>
            <div className="rounded-2xl p-6 shadow-xl" style={{ backgroundColor: "var(--bg-frosted)", border: "1px solid var(--border-subtle)" }}>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--text-muted)" }}>Status</h3>
              <div className="flex items-center gap-3 mb-6">
                <NeonBadge variant="emerald">{profile.availability_status || "Unavailable"}</NeonBadge>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-display font-semibold" style={{ color: "var(--text-primary)" }}>Posts</h2>
          </div>
          
          {profile.feed_posts?.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {profile.feed_posts.map((post: any) => {
                const postData: FeedPostData = {
                  id: post.id,
                  type: "work_post",
                  creator: {
                    id: profile.id,
                    name: profile.display_name || profile.handle,
                    handle: profile.handle,
                    avatar: profile.avatar_url || "",
                    verified: false,
                    role: profile.tagline || "Creator"
                  },
                  timestamp: new Date(post.created_at).toLocaleDateString(),
                  title: post.title,
                  caption: post.caption,
                  mediaUrl: post.media_url,
                  tags: [],
                  saves: 0,
                  category: post.category
                };
                return <FeedPost key={post.id} post={postData} />;
              })}
            </div>
          ) : (
            <div className="text-center py-24 rounded-2xl" style={{ backgroundColor: "var(--bg-frosted)", border: "1px dashed var(--border-subtle)" }}>
              <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" style={{ color: "var(--text-muted)" }} />
              <h3 className="text-xl font-medium mb-2" style={{ color: "var(--text-primary)" }}>No posts yet</h3>
              <p style={{ color: "var(--text-secondary)" }}>When {profile.handle} posts their work, it will appear here.</p>
            </div>
          )}
        </div>
      </div>

      {/* Message Drawer */}
      <AnimatePresence>
        {isMessageDrawerOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMessageDrawerOpen(false)}
              className="fixed inset-0 z-40 backdrop-blur-sm"
              style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-50 md:left-auto md:right-8 md:w-96 h-[80vh] md:h-[600px] rounded-t-3xl md:rounded-t-3xl shadow-2xl flex flex-col"
              style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--glass-border)", borderBottom: "none" }}
            >
              <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-deep)" }}>
                <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>Chat with @{profile.handle}</h3>
                <button onClick={() => setIsMessageDrawerOpen(false)} className="p-2 rounded-full hover:bg-black/10 transition-colors">
                  <X className="w-5 h-5" style={{ color: "var(--text-muted)" }} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                {messages.length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center opacity-50">
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Say hi to {profile.display_name || profile.handle}!</p>
                  </div>
                )}
                {messages.map(msg => {
                  const isMine = msg.sender_id === currentUser.id;
                  return (
                    <div key={msg.id} className={`max-w-[80%] p-3 rounded-2xl shadow-sm ${isMine ? 'rounded-br-sm self-end' : 'rounded-bl-sm self-start'}`}
                      style={{ 
                        backgroundColor: isMine ? "var(--accent-primary)" : "var(--bg-frosted)",
                        color: isMine ? "#fff" : "var(--text-primary)",
                        border: isMine ? "none" : "1px solid var(--border-subtle)"
                      }}>
                      {msg.content}
                    </div>
                  );
                })}
              </div>

              <div className="p-4 border-t" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-deep)" }}>
                <form onSubmit={sendMessage} className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Message..." 
                    className="flex-1 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    style={{ backgroundColor: "var(--bg-frosted)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)" }}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                  />
                  <button type="submit" disabled={sending} className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95" style={{ backgroundColor: "var(--accent-primary)", color: "#fff" }}>
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
