"use client";

import { use, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { notFound, useRouter } from "next/navigation";
import { MapPin, Users, FolderOpen, CheckCircle, ArrowRight, X, Send, Flame, Loader2 } from "lucide-react";
import FeedPost from "@/components/cards/FeedPost";
import FlareCard from "@/components/cards/FlareCard";
import FlaresViewer from "@/components/explore/FlaresViewer";
import Button from "@/components/ui/Button";
import NeonBadge from "@/components/ui/NeonBadge";
import { createClient } from "@/utils/supabase/client";
import { FeedPostData, Flare } from "@/types";
import { MOCK_FLARES } from "@/lib/data";

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
  const [activeTab, setActiveTab] = useState<"projects" | "flares">("projects");
  const [creatorFlares, setCreatorFlares] = useState<Flare[]>([]);
  const [selectedFlareIndex, setSelectedFlareIndex] = useState<number | null>(null);

  // Follows modal state
  const [isFollowsModalOpen, setIsFollowsModalOpen] = useState(false);
  const [followsModalType, setFollowsModalType] = useState<"followers" | "following">("followers");
  const [followsList, setFollowsList] = useState<any[]>([]);
  const [loadingFollowsList, setLoadingFollowsList] = useState(false);

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
          // Redirect to canonical URL
          router.replace(`/studio/${targetHandle}`);
          return;
        } else {
          setLoading(false);
          return;
        }
      }

      // Fetch the profile gracefully
      let profileData: any = null;
      const { data: fullProfile, error: profileError } = await supabase
        .from('users')
        .select('*, skills(*), feed_posts(*, qa_reports(*)), colleges(*)')
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

      // Fetch creator's flares
      try {
        const { data: dbFlares } = await supabase
          .from("flares")
          .select("*")
          .eq("user_id", profileData.id)
          .order("created_at", { ascending: false });

        if (dbFlares && dbFlares.length > 0) {
          const formatted: Flare[] = dbFlares.map((f: any) => ({
            id: f.id,
            user_id: f.user_id,
            media_url: f.media_url,
            thumbnail_url: f.thumbnail_url || undefined,
            caption: f.caption || undefined,
            tags: f.tags || [],
            duration_seconds: f.duration_seconds || undefined,
            created_at: f.created_at,
            spark_count: Math.floor(Math.random() * 45) + 12,
            users: {
              display_name: profileData.display_name || undefined,
              handle: profileData.handle,
              avatar_url: profileData.avatar_url || undefined
            }
          }));
          setCreatorFlares(formatted);
        } else {
          // Fallback to MOCK_FLARES for this creator
          const matchedMock = MOCK_FLARES.filter(f => f.users?.handle === profileData.handle);
          if (matchedMock.length > 0) {
            setCreatorFlares(matchedMock);
          } else {
            // Generate customized fallback flares so they aren't empty
            setCreatorFlares([
              {
                id: `f-mock-${profileData.id}-1`,
                user_id: profileData.id,
                media_url: "https://assets.mixkit.co/videos/preview/mixkit-abstract-laser-lights-background-loop-41851-large.mp4",
                thumbnail_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
                caption: `Tinkering with the future of creators at CORELX. High-fidelity dynamic environments are coming next! ✦`,
                tags: ["UI Design", "Creative", "WIP"],
                duration_seconds: 12,
                created_at: new Date().toISOString(),
                spark_count: 32,
                users: {
                  display_name: profileData.display_name || undefined,
                  handle: profileData.handle,
                  avatar_url: profileData.avatar_url || undefined
                }
              }
            ]);
          }
        }
      } catch (e) {
        console.warn("Flares load failed:", e);
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

  const fetchFollowsList = async (type: "followers" | "following") => {
    if (!profile) return;
    setLoadingFollowsList(true);
    setFollowsList([]);
    try {
      let ids: string[] = [];
      if (type === "followers") {
        const { data, error } = await supabase
          .from("follows")
          .select("follower_id")
          .eq("following_id", profile.id);
        if (error) throw error;
        ids = (data || []).map((row: any) => row.follower_id);
      } else {
        const { data, error } = await supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", profile.id);
        if (error) throw error;
        ids = (data || []).map((row: any) => row.following_id);
      }

      if (ids.length === 0) {
        setFollowsList([]);
        return;
      }

      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("id, handle, display_name, avatar_url, tagline")
        .in("id", ids);

      if (usersError) throw usersError;

      let followedMap: Record<string, boolean> = {};
      if (currentUser && usersData && usersData.length > 0) {
        const { data: followRecords, error: followError } = await supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", currentUser.id)
          .in("following_id", usersData.map(u => u.id));
        
        if (!followError && followRecords) {
          followRecords.forEach((rec: any) => {
            followedMap[rec.following_id] = true;
          });
        }
      }

      const listWithFollowState = (usersData || []).map((u: any) => ({
        ...u,
        isFollowedByMe: !!followedMap[u.id]
      }));

      const orderedList = ids
        .map(id => listWithFollowState.find(u => u.id === id))
        .filter(Boolean);

      setFollowsList(orderedList);
    } catch (err) {
      console.error("Error fetching follows list:", err);
    } finally {
      setLoadingFollowsList(false);
    }
  };

  const handleOpenFollowsModal = (type: "followers" | "following") => {
    setFollowsModalType(type);
    setIsFollowsModalOpen(true);
    fetchFollowsList(type);
  };

  const toggleFollowListItem = async (targetUser: any) => {
    if (!currentUser) return router.push("/login");

    const targetId = targetUser.id;
    const isCurrentlyFollowing = targetUser.isFollowedByMe;

    // Optimistically update
    setFollowsList(prev => prev.map(u => {
      if (u.id === targetId) {
        return { ...u, isFollowedByMe: !isCurrentlyFollowing };
      }
      return u;
    }));

    if (targetId === profile.id) {
      setIsFollowing(!isCurrentlyFollowing);
      setFollowerCount(prev => isCurrentlyFollowing ? prev - 1 : prev + 1);
    }

    if (isOwner && followsModalType === "following") {
      setFollowingCount(prev => isCurrentlyFollowing ? prev - 1 : prev + 1);
    }

    try {
      if (isCurrentlyFollowing) {
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", currentUser.id)
          .eq("following_id", targetId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("follows")
          .insert({
            follower_id: currentUser.id,
            following_id: targetId
          });
        if (error) throw error;
      }
    } catch (err) {
      console.error("Failed to toggle follow status in list:", err);
      // Revert
      setFollowsList(prev => prev.map(u => {
        if (u.id === targetId) {
          return { ...u, isFollowedByMe: isCurrentlyFollowing };
        }
        return u;
      }));
      if (targetId === profile.id) {
        setIsFollowing(isCurrentlyFollowing);
        setFollowerCount(prev => isCurrentlyFollowing ? prev + 1 : prev - 1);
      }
      if (isOwner && followsModalType === "following") {
        setFollowingCount(prev => isCurrentlyFollowing ? prev + 1 : prev - 1);
      }
    }
  };

  const handleMessageRedirect = () => {
    if (!currentUser) return router.push("/login");
    router.push(`/messages?with=${profile.id}`);
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
            <div className="flex flex-wrap items-center gap-2.5 mb-1">
              <h1 className="text-3xl font-display font-bold" style={{ color: "var(--text-primary)" }}>{profile.display_name || profile.handle}</h1>
              {profile.colleges && (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center gap-1">
                  {profile.colleges.hub_type === 'society' ? '🏡' : profile.colleges.hub_type === 'corporate' ? '🏢' : '🏫'} {profile.colleges.short_name || profile.colleges.name}
                </span>
              )}
            </div>
            <p className="font-medium text-lg mb-2" style={{ color: "var(--accent-primary)" }}>@{profile.handle}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: "var(--text-muted)" }}>
              <button
                onClick={() => handleOpenFollowsModal("followers")}
                className="flex items-center gap-1.5 hover:text-white transition-colors duration-200 cursor-pointer focus:outline-none"
              >
                <Users className="w-4 h-4" /> {followerCount} followers
              </button>
              <button
                onClick={() => handleOpenFollowsModal("following")}
                className="flex items-center gap-1.5 hover:text-white transition-colors duration-200 cursor-pointer focus:outline-none"
              >
                <Users className="w-4 h-4" /> {followingCount} following
              </button>
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
                <Button variant="ghost" onClick={handleMessageRedirect}>Message</Button>
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

        {/* Dual Tab Controller: Projects vs Flares */}
        <div className="border-b border-[var(--border-subtle)] mb-8 flex gap-6">
          <button
            onClick={() => setActiveTab("projects")}
            className={`pb-4 text-lg font-medium relative transition-all ${
              activeTab === "projects" ? "text-white" : "text-[var(--text-secondary)] hover:text-white"
            }`}
          >
            Projects ({profile.feed_posts?.length || 0})
            {activeTab === "projects" && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-0 inset-x-0 h-0.5 bg-white"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab("flares")}
            className={`pb-4 text-lg font-medium relative transition-all flex items-center gap-1.5 ${
              activeTab === "flares" ? "text-white" : "text-[var(--text-secondary)] hover:text-white"
            }`}
          >
            Flares 🔥 ({creatorFlares.length})
            {activeTab === "flares" && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-0 inset-x-0 h-0.5 bg-white"
              />
            )}
          </button>
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {activeTab === "projects" ? (
            <motion.div
              key="projects-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {profile.feed_posts?.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {profile.feed_posts.map((post: any) => {
                    const qaReport = Array.isArray(post.qa_reports) ? post.qa_reports[0] : post.qa_reports;
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
                      category: post.category,
                      bug_details: qaReport ? {
                        title: qaReport.bug_title,
                        severity: qaReport.severity as "critical" | "high" | "medium" | "low",
                        platforms: qaReport.platform || [],
                        steps: qaReport.steps || []
                      } : undefined
                    };
                    return <FeedPost key={post.id} post={postData} />;
                  })}
                </div>
              ) : (
                <div className="text-center py-24 rounded-2xl bg-[var(--bg-frosted)] border border-dashed border-[var(--border-subtle)]">
                  <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" style={{ color: "var(--text-muted)" }} />
                  <h3 className="text-xl font-medium mb-2 text-white">No posts yet</h3>
                  <p style={{ color: "var(--text-secondary)" }}>When {profile.handle} posts their work, it will appear here.</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="flares-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
            >
              {creatorFlares.length > 0 ? (
                creatorFlares.map((flare, idx) => (
                  <FlareCard
                    key={flare.id}
                    flare={flare}
                    index={idx}
                    onClick={() => setSelectedFlareIndex(idx)}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-24 rounded-2xl bg-[var(--bg-frosted)] border border-dashed border-[var(--border-subtle)]">
                  <Flame className="w-12 h-12 mx-auto mb-4 opacity-50 text-[var(--accent-primary)]" />
                  <h3 className="text-xl font-medium mb-2 text-white">No Flares yet</h3>
                  <p style={{ color: "var(--text-secondary)" }}>When {profile.handle} uploads a creative Flare loop, it will light up here.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Studio Restricted Flares Viewer Overlay */}
        {selectedFlareIndex !== null && (
          <FlaresViewer
            flares={creatorFlares}
            initialIndex={selectedFlareIndex}
            onClose={() => setSelectedFlareIndex(null)}
          />
        )}

        {/* Follows List Modal */}
        <AnimatePresence>
          {isFollowsModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop with fade in */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsFollowsModalOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
              />

              {/* Modal Box */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="relative w-full max-w-md max-h-[80vh] overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d15]/90 backdrop-blur-xl text-white shadow-2xl flex flex-col z-10"
              >
                {/* Header */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <h3 className="text-lg font-display font-semibold capitalize">
                    {followsModalType}
                  </h3>
                  <button
                    onClick={() => setIsFollowsModalOpen(false)}
                    className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors focus:outline-none"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Scrollable list content */}
                <div className="flex-1 overflow-y-auto p-4 scrollbar-none">
                  {loadingFollowsList ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 text-purple-500 animate-spin mb-2" />
                      <p className="text-sm text-gray-400">Loading list...</p>
                    </div>
                  ) : followsList.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      No {followsModalType} found.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {followsList.map((user) => {
                        const isSelf = currentUser?.id === user.id;
                        return (
                          <div
                            key={user.id}
                            className="flex items-center justify-between gap-3 p-2 rounded-xl transition-all duration-200 hover:bg-white/5"
                          >
                            {/* User card link */}
                            <div
                              onClick={() => {
                                router.push(`/studio/${user.handle}`);
                                setIsFollowsModalOpen(false);
                              }}
                              className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                            >
                              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 flex items-center justify-center font-bold text-white text-base bg-gradient-to-br from-purple-500 to-cyan-500">
                                {user.avatar_url ? (
                                  <img
                                    src={user.avatar_url}
                                    alt={user.display_name || user.handle}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  user.display_name?.charAt(0) || user.handle?.charAt(0).toUpperCase()
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-sm truncate block text-white hover:text-purple-300 transition-colors">
                                    {user.display_name || user.handle}
                                  </span>
                                </div>
                                <span className="text-xs text-purple-400 font-medium block">
                                  @{user.handle}
                                </span>
                                {user.tagline && (
                                  <span className="text-xs text-gray-400 block truncate mt-0.5">
                                    {user.tagline}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Follow/Unfollow Button */}
                            {!isSelf && currentUser && (
                              <button
                                onClick={() => toggleFollowListItem(user)}
                                className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-200 ${
                                  user.isFollowedByMe
                                    ? "bg-white/10 border border-white/15 text-white hover:border-red-500/40 hover:text-red-300 hover:bg-red-500/10"
                                    : "bg-purple-600 text-white hover:bg-purple-500 shadow-[0_0_10px_rgba(147,51,234,0.3)]"
                                }`}
                              >
                                {user.isFollowedByMe ? "Unfollow" : "Follow"}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
