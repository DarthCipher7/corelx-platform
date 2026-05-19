"use client";

import { use, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { notFound, useRouter } from "next/navigation";
import { MapPin, Users, FolderOpen, CheckCircle, ArrowRight, X, Send, Flame } from "lucide-react";
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

      </div>
    </div>
  );
}
