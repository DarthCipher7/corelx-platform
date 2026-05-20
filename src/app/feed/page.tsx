"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MOCK_FEED_POSTS, MOCK_CREATORS } from "@/lib/data";
import FeedPost from "@/components/cards/FeedPost";
import CollabCard from "@/components/cards/CollabCard";
import FlaresViewer from "@/components/explore/FlaresViewer";
import FlareCard from "@/components/cards/FlareCard";
import UploadFlareModal from "@/components/explore/UploadFlareModal";
import EventCard from "@/components/cards/EventCard";
import CreateEventModal from "@/components/cards/CreateEventModal";
import Button from "@/components/ui/Button";
import { createClient } from "@/utils/supabase/client";
import { X, Image as ImageIcon, Play, Flame, AlertCircle, Calendar } from "lucide-react";
import { FeedPostData, Flare, CampusEvent } from "@/types";

const FILTERS = [
  "All",
  "Design", "Illustration", "Photography",
  "Video", "Motion", "Music",
  "Social Media", "Writing",
  "Code", "AI", "3D", "Gaming",
  "Art", "Fashion", "Freelance",
];

export default function FeedPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [user, setUser] = useState<any>(null);
  const [dbPosts, setDbPosts] = useState<any[]>([]);
  const [flares, setFlares] = useState<Flare[]>([]);
  const [collabs, setCollabs] = useState<any[]>([]);
  
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [feedMode, setFeedMode] = useState<"posts" | "flares" | "events">("posts");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [rsvpMap, setRsvpMap] = useState<Record<string, 'none' | 'pending' | 'attending' | 'declined'>>({});
  
  const [postTitle, setPostTitle] = useState("");
  const [postCaption, setPostCaption] = useState("");
  const [postMediaUrl, setPostMediaUrl] = useState("");
  const [postCategory, setPostCategory] = useState("Design");
  const [isPosting, setIsPosting] = useState(false);

  // Background polling state
  const [newPostsCount, setNewPostsCount] = useState(0);

  // Flares viewer state
  const [selectedFlareIndex, setSelectedFlareIndex] = useState<number | null>(null);
  
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUser(user);
    });
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [activeFilter]);

  // Fetch events when switching to Events tab
  useEffect(() => {
    if (feedMode === 'events') fetchEvents();
  }, [feedMode]);

  const fetchEvents = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    const { data: eventsData } = await supabase
      .from('events')
      .select(`
        id, title, description, category, trust_tier,
        location_name, starts_at, ends_at, expires_at,
        min_headcount, max_headcount, is_active,
        require_mutual, require_face, organiser_id,
        college_id, created_at,
        organiser:users!events_organiser_id_fkey(handle, display_name, avatar_url)
      `)
      .eq('is_active', true)
      .order('starts_at', { ascending: true })
      .limit(50);

    if (!eventsData) return;

    // Fetch headcounts
    const eventIds = eventsData.map(e => e.id);
    const { data: rsvpData } = await supabase
      .from('event_rsvps')
      .select('event_id, user_id, status')
      .in('event_id', eventIds)
      .in('status', ['attending', 'pending', 'approved']);

    const headcounts: Record<string, number> = {};
    const myRsvps: Record<string, 'none' | 'pending' | 'attending' | 'declined'> = {};

    rsvpData?.forEach(r => {
      if (r.status === 'attending') {
        headcounts[r.event_id] = (headcounts[r.event_id] || 0) + 1;
      }
      if (currentUser && r.user_id === currentUser.id) {
        myRsvps[r.event_id] = r.status as any;
      }
    });

    const mapped: CampusEvent[] = eventsData.map(e => ({
      ...e,
      current_headcount: headcounts[e.id] || 0,
      organiser: Array.isArray(e.organiser) ? e.organiser[0] : e.organiser,
    }));

    setEvents(mapped);
    setRsvpMap(myRsvps);
  };

  const handleRsvp = async (eventId: string, trustTier: string) => {
    if (!user) { window.location.href = '/login'; return; }
    const status = trustTier === 'guarded' ? 'pending' : 'attending';
    await supabase.from('event_rsvps').upsert(
      { event_id: eventId, user_id: user.id, status },
      { onConflict: 'event_id,user_id' }
    );
    setRsvpMap(prev => ({ ...prev, [eventId]: status as any }));
  };

  // Silently poll the backend every 90 seconds
  useEffect(() => {
    if (dbPosts.length === 0) return;
    
    // Find newest post timestamp currently shown
    const newestPost = dbPosts.reduce((newest, post) => {
      return new Date(post.created_at) > new Date(newest.created_at) ? post : newest;
    }, dbPosts[0]);
    
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('feed_posts')
        .select('created_at')
        .gt('created_at', newestPost.created_at)
        .order('created_at', { ascending: false });
        
      if (data && data.length > 0) {
        setNewPostsCount(data.length);
      }
    }, 90000);
    
    return () => clearInterval(interval);
  }, [dbPosts]);

  const fetchPosts = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    // Fetch posts limit 100 for scoring pool
    let query = supabase
      .from('feed_posts')
      .select(`
        id,
        title,
        caption,
        media_url,
        category,
        created_at,
        user_id,
        users (
          id,
          handle,
          display_name,
          avatar_url,
          tagline,
          intent_status,
          colleges (
            id,
            name,
            short_name,
            hub_type
          )
        ),
        qa_reports (
          id,
          bug_title,
          severity,
          platform,
          steps
        )
      `)
      .limit(100);

    if (activeFilter !== "All") {
      query = query.eq('category', activeFilter);
    }
      
    const { data: postsData } = await query;
    if (!postsData) return;

    // Fetch ancillary data in parallel
    let followedIds = new Set<string>();
    let viewerSkills = new Set<string>();
    let seenPostIds = new Set<string>();
    let viewerIntent = 'available';
    let mutualFollowers: Record<string, string[]> = {};

    const postIds = postsData.map(p => p.id);
    const authorIds = Array.from(new Set(postsData.map(p => p.user_id)));

    const promises: PromiseLike<any>[] = [];

    if (currentUser) {
      promises.push(
        supabase.from('follows').select('following_id').eq('follower_id', currentUser.id)
          .then(({ data }) => data?.forEach(f => followedIds.add(f.following_id)))
      );
      promises.push(
        supabase.from('skills').select('skill_name').eq('user_id', currentUser.id)
          .then(({ data }) => data?.forEach(s => viewerSkills.add(s.skill_name.toLowerCase())))
      );
      promises.push(
        supabase.from('post_impressions').select('post_id').eq('user_id', currentUser.id)
          .then(({ data }) => data?.forEach(i => seenPostIds.add(i.post_id)))
      );
      promises.push(
        supabase.from('users').select('intent_status').eq('id', currentUser.id).single()
          .then(({ data }) => { if (data?.intent_status) viewerIntent = data.intent_status; })
      );
    }

    let sparkCounts: Record<string, number> = {};
    promises.push(
      supabase.from('sparks').select('target_id').in('target_id', postIds).eq('target_type', 'post')
        .then(({ data }) => {
          data?.forEach(s => {
            sparkCounts[s.target_id] = (sparkCounts[s.target_id] || 0) + 1;
          });
        })
    );

    let impressionCounts: Record<string, number> = {};
    promises.push(
      supabase.from('post_impressions').select('post_id').in('post_id', postIds)
        .then(({ data }) => {
          data?.forEach(i => {
            impressionCounts[i.post_id] = (impressionCounts[i.post_id] || 0) + 1;
          });
        })
    );

    promises.push(
      supabase.from('follows').select('follower_id, following_id').in('following_id', authorIds)
        .then(({ data }) => {
          data?.forEach(f => {
            if (!mutualFollowers[f.following_id]) mutualFollowers[f.following_id] = [];
            mutualFollowers[f.following_id].push(f.follower_id);
          });
        })
    );

    // Fetch Flares and Collab calls for injections
    let rawFlares: any[] = [];
    let rawCollabs: any[] = [];

    promises.push(
      supabase.from('flares').select('*, users(*)').limit(30)
        .then(({ data }) => { if (data) rawFlares = data; })
    );

    promises.push(
      supabase.from('collab_calls').select('*, users(*)').limit(10)
        .then(({ data }) => { if (data) rawCollabs = data; })
    );

    await Promise.all(promises);

    // Score Feed Posts
    const scoredPosts = postsData.map(post => {
      // 1. RecencyScore (30%)
      let recencyScore = 0;
      const ageHours = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60);
      if (ageHours < 2) {
        recencyScore = 1.0;
      } else if (ageHours <= 48) {
        recencyScore = Math.max(0, 1.0 - 0.15 * (ageHours - 2));
      }

      // 2. SparkVelocity (25%)
      const sparks = sparkCounts[post.id] || 0;
      const impressions = impressionCounts[post.id] || 0;
      const sparkVelocity = impressions > 0 ? (sparks / impressions) : 0;

      // 3. NetworkBoost (20%)
      let networkBoost = 0;
      if (followedIds.has(post.user_id)) {
        networkBoost += 0.20;
      }
      const authorFollowers = mutualFollowers[post.user_id] || [];
      const mutualCount = authorFollowers.filter(fid => followedIds.has(fid)).length;
      if (mutualCount >= 3) {
        networkBoost += 0.10;
      }

      // 4. SkillRelevance (15%)
      const postTags = [post.category.toLowerCase()];
      const hashtags = post.caption?.match(/#\w+/g);
      if (hashtags) {
        hashtags.forEach((tag: string) => postTags.push(tag.replace('#', '').toLowerCase()));
      }
      const overlap = postTags.filter(t => viewerSkills.has(t)).length;
      const skillRelevance = viewerSkills.size > 0 ? (overlap / viewerSkills.size) : 0;

      // 5. IntentMatch (10%)
      let intentMatch = 0;
      const authorUser = Array.isArray(post.users) ? post.users[0] : post.users;
      const authorIntent = authorUser?.intent_status || 'available';
      if (authorIntent === 'hiring' && ['available', 'looking_for_team', 'open_to_gigs'].includes(viewerIntent)) {
        intentMatch = 1.0;
      } else if (['available', 'open_to_gigs'].includes(authorIntent) && viewerIntent === 'hiring') {
        intentMatch = 1.0;
      } else if (authorIntent === viewerIntent) {
        intentMatch = 0.5;
      }

      let score = (recencyScore * 0.30) + (sparkVelocity * 0.25) + (networkBoost * 0.20) + (skillRelevance * 0.15) + (intentMatch * 0.10);

      // SeenPenalty
      if (seenPostIds.has(post.id)) {
        score = score * 0.05;
      }

      return {
        ...post,
        score,
        isNetwork: followedIds.has(post.user_id)
      };
    });

    // Score Flares Algorithmic Discovery
    // Fetch Flares metrics
    const [viewsRes, flaresSparksRes, requestsRes] = await Promise.all([
      supabase.from('flare_views').select('flare_id, completed'),
      supabase.from('sparks').select('target_id').eq('target_type', 'flare'),
      supabase.from('collab_requests').select('flare_id')
    ]);

    const flareViewsMap: Record<string, { total: number; completed: number }> = {};
    viewsRes.data?.forEach(v => {
      if (!flareViewsMap[v.flare_id]) flareViewsMap[v.flare_id] = { total: 0, completed: 0 };
      flareViewsMap[v.flare_id].total++;
      if (v.completed) flareViewsMap[v.flare_id].completed++;
    });

    const flareSparksMap: Record<string, number> = {};
    flaresSparksRes.data?.forEach(s => {
      flareSparksMap[s.target_id] = (flareSparksMap[s.target_id] || 0) + 1;
    });

    const flareRequestsMap: Record<string, number> = {};
    requestsRes.data?.forEach(r => {
      flareRequestsMap[r.flare_id] = (flareRequestsMap[r.flare_id] || 0) + 1;
    });

    const scoredFlares = rawFlares.map(flare => {
      const stats = flareViewsMap[flare.id] || { total: 0, completed: 0 };
      const sparks = flareSparksMap[flare.id] || 0;
      const requests = flareRequestsMap[flare.id] || 0;

      // CompletionRate (35%)
      const completionRate = stats.total > 0 ? (stats.completed / stats.total) : 0;
      // SparkRate (25%)
      const sparkRate = stats.total > 0 ? (sparks / stats.total) : 0;
      // CollabRequestRate (15%)
      const collabRequestRate = stats.total > 0 ? (requests / stats.total) : 0;

      // SkillRelevance (15%)
      const tags = flare.tags || [];
      const overlap = tags.filter((t: string) => viewerSkills.has(t.toLowerCase())).length;
      const skillRelevance = viewerSkills.size > 0 ? (overlap / viewerSkills.size) : 0;

      // Freshness (10%)
      let freshness = 0;
      const ageHours = (Date.now() - new Date(flare.created_at).getTime()) / (1000 * 60 * 60);
      if (ageHours < 6) {
        freshness = 1.0;
      } else if (ageHours <= 48) {
        freshness = Math.max(0, 1.0 - (ageHours / 48));
      }

      let score = (completionRate * 0.35) + (sparkRate * 0.25) + (collabRequestRate * 0.15) + (skillRelevance * 0.15) + (freshness * 0.10);

      // RepeatPenalty
      const hasCompleted = stats.completed > 0; // Simple session / user track
      if (hasCompleted) {
        score = score * 0.1;
      }

      return { ...flare, score };
    }).sort((a, b) => b.score - a.score);

    setFlares(scoredFlares);

    // Format Collabs
    const formattedCollabs = rawCollabs.map(c => ({
      id: c.id,
      title: c.title,
      description: c.description || "",
      skills: c.skills || [],
      type: c.type as "paid" | "collab" | "open-source",
      budget: c.budget || "",
      creator: {
        id: c.user_id,
        name: c.users?.display_name || "Unknown",
        handle: c.users?.handle || "unknown",
        avatar: c.users?.avatar_url || "",
        verified: c.users?.is_verified || false
      },
      deadline: c.expires_at ? new Date(c.expires_at).toLocaleDateString() : undefined,
      applicants: 0
    }));
    setCollabs(formattedCollabs);

    // Mix feed 70% network / 30% discovery
    const networkFeed = scoredPosts.filter(p => p.isNetwork).sort((a, b) => b.score - a.score);
    const discoveryFeed = scoredPosts.filter(p => !p.isNetwork).sort((a, b) => b.score - a.score);

    const mergedFeed: any[] = [];
    let netIdx = 0;
    let discIdx = 0;

    while (netIdx < networkFeed.length || discIdx < discoveryFeed.length) {
      for (let i = 0; i < 7 && netIdx < networkFeed.length; i++) {
        mergedFeed.push(networkFeed[netIdx++]);
      }
      for (let i = 0; i < 3 && discIdx < discoveryFeed.length; i++) {
        mergedFeed.push(discoveryFeed[discIdx++]);
      }
    }

    setDbPosts(mergedFeed);
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsPosting(true);
    
    const { data, error } = await supabase.from('feed_posts').insert({
      user_id: user.id,
      title: postTitle,
      caption: postCaption,
      media_url: postMediaUrl,
      category: postCategory
    }).select(`
      id, title, caption, media_url, category, created_at, user_id,
      users ( handle, display_name, avatar_url, tagline )
    `).single();
    
    setIsPosting(false);
    
    if (!error && data) {
      setIsPostModalOpen(false);
      setPostTitle("");
      setPostCaption("");
      setPostMediaUrl("");
      setPostCategory("UI Design");
      fetchPosts();
    } else {
      alert(error?.message || "Error posting");
    }
  };

  const handleRefreshFeed = () => {
    setNewPostsCount(0);
    fetchPosts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Convert post structure to FeedPostData
  const projectPosts = dbPosts.map(p => {
    const authorUser = Array.isArray(p.users) ? p.users[0] : p.users;
    const qaReport = Array.isArray(p.qa_reports) ? p.qa_reports[0] : p.qa_reports;
    return {
      id: p.id,
      type: "work_post" as const,
      creator: {
        id: p.user_id,
        name: authorUser?.display_name || "Unknown",
        handle: authorUser?.handle || "unknown",
        avatar: authorUser?.avatar_url || "",
        verified: false,
        role: authorUser?.tagline || "Creator",
        college: authorUser?.colleges ? {
          id: authorUser.colleges.id,
          name: authorUser.colleges.name,
          short_name: authorUser.colleges.short_name || undefined,
          hub_type: authorUser.colleges.hub_type || undefined
        } : null
      },
      timestamp: new Date(p.created_at).toLocaleDateString(),
      title: p.title,
      caption: p.caption,
      mediaUrl: p.media_url,
      tags: p.category ? [p.category] : [],
      saves: 0,
      category: p.category,
      bug_details: qaReport ? {
        title: qaReport.bug_title,
        severity: qaReport.severity as "critical" | "high" | "medium" | "low",
        platforms: qaReport.platform || [],
        steps: qaReport.steps || []
      } : undefined
    };
  });

  // Append mock feed posts at the end to keep the developer experience rich
  const rawMergedList = [
    ...projectPosts,
    ...(activeFilter === "All" ? MOCK_FEED_POSTS : MOCK_FEED_POSTS.filter((p: any) => p.category === activeFilter))
  ];

  // Algorithmic Injection Logic
  const combinedPosts: any[] = [];
  let standardPostCount = 0;
  let flareIdx = 0;
  let collabIdx = 0;

  rawMergedList.forEach((post) => {
    combinedPosts.push(post);
    standardPostCount++;

    // Inject 1 Flare Preview Card every 8 project posts
    if (standardPostCount % 8 === 0 && flares.length > 0) {
      combinedPosts.push({
        id: `injected-flare-${standardPostCount}`,
        type: "flare_preview" as const,
        flareData: flares[flareIdx % flares.length]
      });
      flareIdx++;
    }

    // Inject 1 Open Collab Listing every 12 project posts
    if (standardPostCount % 12 === 0 && collabs.length > 0) {
      combinedPosts.push({
        id: `injected-collab-${standardPostCount}`,
        type: "collab_listing" as const,
        collabData: collabs[collabIdx % collabs.length]
      });
      collabIdx++;
    }
  });

  const filteredFlares = activeFilter === "All"
    ? flares
    : flares.filter(f => f.tags?.some(t => t.toLowerCase() === activeFilter.toLowerCase()));

  return (
    <div className="min-h-screen pt-24 pb-32">
      {/* Floating New Posts Pill */}
      <AnimatePresence>
        {newPostsCount > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-24 left-1/2 z-40"
          >
            <button 
              onClick={handleRefreshFeed}
              className="px-5 py-2.5 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white text-xs font-mono font-bold rounded-full shadow-[0_0_25px_rgba(108,92,231,0.6)] border border-[var(--glass-border)] flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <span className="animate-ping w-2 h-2 rounded-full bg-cyan-400" />
              {newPostsCount} NEW POST{newPostsCount > 1 ? 'S' : ''} RELEASED
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Header with viewMode selector and action buttons */}
      <div className="max-w-[680px] mx-auto px-4 sm:px-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-[var(--border-subtle)] pb-6">
          <div>
            <p className="label-mono mb-2 text-[var(--accent-primary)] flex items-center gap-1.5">
              <span>✦</span> Discovery Network
            </p>
            <h1 className="display-sm text-white font-bold tracking-tight">
              {feedMode === "posts" ? "Discovery Feed 👥" : feedMode === "flares" ? "Trending Flares 🔥" : "Campus Events 🗓️"}
            </h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Posts / Flares / Events Selector */}
            <div className="flex items-center p-1 rounded-xl bg-[var(--bg-frosted)] border border-[var(--glass-border)] backdrop-blur-md">
              <button
                type="button"
                onClick={() => setFeedMode("posts")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  feedMode === "posts"
                    ? "bg-white text-[#030308] shadow-[0_4px_15px_rgba(255,255,255,0.15)]"
                    : "text-[var(--text-secondary)] hover:text-white"
                }`}
              >
                Posts
              </button>
              <button
                type="button"
                onClick={() => setFeedMode("flares")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-1 ${
                  feedMode === "flares"
                    ? "bg-white text-[#030308] shadow-[0_4px_15px_rgba(255,255,255,0.15)]"
                    : "text-[var(--text-secondary)] hover:text-white"
                }`}
              >
                Flares 🔥
              </button>
              <button
                type="button"
                onClick={() => setFeedMode("events")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-1 ${
                  feedMode === "events"
                    ? "bg-white text-[#030308] shadow-[0_4px_15px_rgba(255,255,255,0.15)]"
                    : "text-[var(--text-secondary)] hover:text-white"
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                Events
              </button>
            </div>

            {/* Posting actions */}
            {user ? (
              <div className="flex items-center gap-2">
                {feedMode !== "events" && (
                  <button
                    type="button"
                    onClick={() => setIsPostModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 bg-[var(--bg-frosted)] text-white hover:bg-[var(--bg-surface)] border border-[var(--glass-border)] active:scale-95 cursor-pointer"
                  >
                    Post Work
                  </button>
                )}
                {feedMode === "events" ? (
                  <button
                    type="button"
                    onClick={() => setIsEventModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 bg-[var(--accent-primary)] text-white hover:opacity-90 shadow-[0_0_15px_rgba(108,92,231,0.3)] active:scale-95 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Post Event
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 bg-[var(--accent-primary)] text-white hover:opacity-90 shadow-[0_0_15px_rgba(108,92,231,0.3)] active:scale-95 cursor-pointer"
                  >
                    <Flame className="w-3.5 h-3.5 fill-current" />
                    Post Flare
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => window.location.href = '/login'}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 bg-[var(--accent-primary)] text-white hover:opacity-90 active:scale-95 cursor-pointer"
              >
                Join to Post
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Filter Bar */}
      <div className="sticky top-16 z-30 w-full backdrop-blur-md border-b py-4 mb-8" style={{ backgroundColor: "var(--glass-bg)", borderColor: "var(--border-subtle)" }}>
        <div className="max-w-[680px] mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 -mb-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                className="whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all"
                style={{
                  backgroundColor: activeFilter === f ? "var(--text-primary)" : "var(--border-subtle)",
                  color: activeFilter === f ? "var(--bg-void)" : "var(--text-secondary)"
                }}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[680px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col">
          {feedMode === "posts" ? (
            combinedPosts.map((post, i) => {
              if (post.type === "flare_preview") {
                return (
                  <div 
                    key={post.id}
                    onClick={() => {
                      const idx = flares.findIndex(f => f.id === post.flareData.id);
                      if (idx !== -1) setSelectedFlareIndex(idx);
                    }}
                    className="relative rounded-2xl overflow-hidden cursor-pointer group mb-8 p-6 border transition-all duration-300 hover:scale-[1.01]"
                    style={{ 
                      backgroundColor: "rgba(108, 92, 231, 0.03)", 
                      borderColor: "rgba(108, 92, 231, 0.2)",
                      boxShadow: "0 8px 32px 0 rgba(108, 92, 231, 0.05)"
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-[rgba(108,92,231,0.08)] via-transparent to-transparent pointer-events-none" />
                    
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2 text-[var(--accent-primary)] font-mono text-xs font-bold tracking-wider">
                        <span className="animate-pulse">🔥</span> CORELX FLARES DISCOVERY
                      </div>
                      <div className="text-xs font-mono text-[var(--text-muted)] group-hover:text-white transition-colors flex items-center gap-1">
                        Play Flare <span>→</span>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-20 aspect-[9/16] rounded-xl overflow-hidden relative bg-black/40 border border-white/10 flex-shrink-0">
                        {post.flareData.thumbnail_url ? (
                          <img src={post.flareData.thumbnail_url} alt="Flare preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[var(--accent-primary-glow)]">
                            <span>🔥</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <span className="p-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white">
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col justify-between py-1">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <img src={post.flareData.users?.avatar_url} alt={post.flareData.users?.display_name} className="w-5 h-5 rounded-full object-cover" />
                            <span className="text-xs font-semibold text-white">@{post.flareData.users?.handle}</span>
                          </div>
                          <p className="text-sm text-[var(--text-secondary)] line-clamp-2 italic mb-2">
                            "{post.flareData.caption || "Check out my latest flare creation!"}"
                          </p>
                        </div>
                        
                        <div className="flex flex-wrap gap-1.5">
                          {post.flareData.tags?.slice(0, 3).map((tag: string) => (
                            <span key={tag} className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/70">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              if (post.type === "collab_listing") {
                return (
                  <div key={post.id} className="mb-8">
                    <div className="flex items-center gap-2 text-[var(--accent-secondary)] font-mono text-xs font-bold tracking-wider mb-3 px-1">
                      <span>⚡</span> ACTIVE COLLABORATION CALL
                    </div>
                    <CollabCard collab={post.collabData} />
                  </div>
                );
              }

              return <FeedPost key={post.id} post={post} index={i} />;
            })
          ) : feedMode === "flares" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              {filteredFlares.length > 0 ? (
                filteredFlares.map((flare, idx) => (
                  <FlareCard
                    key={flare.id}
                    flare={flare}
                    index={idx}
                    onClick={() => {
                      const absoluteIndex = flares.findIndex(f => f.id === flare.id);
                      if (absoluteIndex !== -1) setSelectedFlareIndex(absoluteIndex);
                    }}
                  />
                ))
              ) : (
                <div className="col-span-full py-16 text-center text-[var(--text-muted)] border border-dashed border-[var(--border-subtle)] rounded-3xl bg-[var(--bg-frosted)] backdrop-blur-xl">
                  <Flame className="w-10 h-10 mx-auto mb-3 opacity-40 text-[var(--accent-primary)] animate-pulse" />
                  <h4 className="text-base font-semibold text-white mb-1">No Flares Found</h4>
                  <p className="text-xs text-[var(--text-secondary)]">Be the first to upload a Flare in this category!</p>
                </div>
              )}
            </div>
          ) : (
            /* ── Events Feed ─────────────────────────────────────── */
            <div className="flex flex-col gap-4 mb-8">
              {events.length > 0 ? (
                events.map((event, i) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <EventCard
                      id={event.id}
                      title={event.title}
                      category={event.category}
                      trustTier={event.trust_tier}
                      locationName={event.location_name}
                      startsAt={event.starts_at}
                      endsAt={event.ends_at}
                      expiresAt={event.expires_at}
                      currentHeadcount={event.current_headcount || 0}
                      maxHeadcount={event.max_headcount ?? undefined}
                      organiser={{
                        handle: event.organiser?.handle || 'unknown',
                        displayName: event.organiser?.display_name || 'Organiser',
                        avatarUrl: event.organiser?.avatar_url,
                      }}
                      rsvpStatus={rsvpMap[event.id] || 'none'}
                      onRsvp={(id) => handleRsvp(id, event.trust_tier)}
                    />
                  </motion.div>
                ))
              ) : (
                <div className="py-20 text-center border border-dashed border-[var(--border-subtle)] rounded-3xl bg-[var(--bg-frosted)] backdrop-blur-xl">
                  <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40 text-[var(--accent-primary)]" />
                  <h4 className="text-base font-semibold text-white mb-2">No events yet</h4>
                  <p className="text-xs text-[var(--text-secondary)] mb-6">Be the first to post something on campus!</p>
                  {user && (
                    <button
                      onClick={() => setIsEventModalOpen(true)}
                      className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[var(--accent-primary)] text-white hover:opacity-90 transition-all active:scale-95"
                    >
                      Post an Event
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* End State */}
        <motion.div 
          className="mt-16 text-center py-12 border-t"
          style={{ borderColor: "var(--border-subtle)" }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="w-16 h-16 rounded-full border flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: "var(--accent-primary-glow)", borderColor: "var(--accent-primary)" }}>
            <span className="text-2xl">✨</span>
          </div>
          <h2 className="font-display font-bold text-2xl mb-2" style={{ color: "var(--text-primary)" }}>
            You're caught up.
          </h2>
          <p className="mb-8 max-w-sm mx-auto" style={{ color: "var(--text-secondary)" }}>
            You've seen all the latest updates from your network. Now go build something amazing.
          </p>
          {user ? (
            <Button variant="primary" className="mx-auto" onClick={() => setIsPostModalOpen(true)}>
              Post your work
            </Button>
          ) : (
            <Button variant="primary" className="mx-auto" onClick={() => window.location.href = '/login'}>
              Join to Post
            </Button>
          )}
        </motion.div>
      </div>

      {/* Flares Viewer Overlay */}
      {selectedFlareIndex !== null && (
        <FlaresViewer 
          flares={flares} 
          initialIndex={selectedFlareIndex} 
          onClose={() => setSelectedFlareIndex(null)} 
        />
      )}

      {/* Upload Flare Modal */}
      <UploadFlareModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={fetchPosts}
      />

      {/* Create Event Modal */}
      {user && (
        <CreateEventModal
          isOpen={isEventModalOpen}
          onClose={() => setIsEventModalOpen(false)}
          onSuccess={fetchEvents}
          userId={user.id}
        />
      )}

      <AnimatePresence>
        {isPostModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsPostModalOpen(false)}
              className="absolute inset-0 backdrop-blur-sm"
              style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden p-6"
              style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--glass-border)" }}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-display font-bold" style={{ color: "var(--text-primary)" }}>Create Post</h3>
                <button 
                  onClick={() => setIsPostModalOpen(false)}
                  className="p-2 rounded-full transition-colors"
                  style={{ color: "var(--text-secondary)", backgroundColor: "var(--bg-frosted)" }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <form onSubmit={handlePostSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Title your work..."
                    className="w-full text-lg font-bold bg-transparent border-none focus:outline-none focus:ring-0 px-0"
                    style={{ color: "var(--text-primary)" }}
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                  />
                </div>
                <div>
                  <textarea
                    required
                    placeholder="Share the story behind this..."
                    rows={4}
                    className="w-full resize-none bg-transparent border-none focus:outline-none focus:ring-0 px-0 text-sm"
                    style={{ color: "var(--text-secondary)" }}
                    value={postCaption}
                    onChange={(e) => setPostCaption(e.target.value)}
                  />
                </div>
                
                <div className="pt-4 border-t" style={{ borderColor: "var(--border-subtle)" }}>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Category</label>
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
                    {FILTERS.filter(f => f !== "All").map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setPostCategory(f)}
                        className="whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                        style={{
                          backgroundColor: postCategory === f ? "var(--accent-primary)" : "var(--bg-frosted)",
                          color: postCategory === f ? "#ffffff" : "var(--text-secondary)",
                          border: `1px solid ${postCategory === f ? "var(--accent-primary)" : "var(--glass-border)"}`
                        }}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t" style={{ borderColor: "var(--border-subtle)" }}>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Media URL (Optional)</label>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: "var(--bg-frosted)" }}>
                      <ImageIcon className="w-5 h-5 text-purple-400" />
                    </div>
                    <input
                      type="url"
                      placeholder="https://example.com/image.png"
                      className="flex-1 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-400 transition-colors"
                      style={{ backgroundColor: "var(--bg-deep)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
                      value={postMediaUrl}
                      onChange={(e) => setPostMediaUrl(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end pt-4">
                  <Button variant="primary" disabled={isPosting}>
                    {isPosting ? "Posting..." : "Post to Feed"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
