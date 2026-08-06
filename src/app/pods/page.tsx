"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  X,
  Users,
  Zap,
  BookOpen,
  Target,
  Wrench,
  CheckCircle,
  Loader2,
  Calendar,
  Clock,
} from "lucide-react";
import PodCard, { PodCardProps } from "@/components/cards/PodCard";
import EventCard from "@/components/cards/EventCard";
import CreateEventModal from "@/components/cards/CreateEventModal";
import CreatePodModal from "@/components/cards/CreatePodModal";
import { PodType, CampusEvent } from "@/types";
import Button from "@/components/ui/Button";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

/* ─── Filter tabs ─────────────────────────────────────────────── */
const FILTER_TABS = [
  { label: "All", value: "all" },
  { label: "🤝 Meetup", value: "meetup" },
  { label: "⚡ Hackathon", value: "hackathon" },
  { label: "📖 Class", value: "class" },
  { label: "🎯 Club", value: "club" },
  { label: "⚽ Sports", value: "sports" },
  { label: "🎮 Gaming", value: "gaming" },
  { label: "🏆 Tournament", value: "tournament" },
  { label: "🛠️ Project", value: "project" },
] as const;

type FilterValue = (typeof FILTER_TABS)[number]["value"];

/* ─── Mock pods (shown when DB has no data yet) ───────────────── */
const MOCK_PODS: Omit<PodCardProps, "onJoin">[] = [
  {
    id: "mock-1",
    name: "IIT Madras Inter-Hostel Chess Tournament",
    podType: "tournament",
    description:
      "Official campus brackets. Register your hostel team here. Prizes up to 15k INR.",
    memberCount: 24,
    maxMembers: 64,
    roleTags: ["Inter-hostel", "Prizes"],
    visibility: "open",
    creator: { handle: "chess_pres", displayName: "Aravind S" },
    isMember: false,
    hub: { name: "IIT Madras", shortName: "IIT Madras", hubType: "college" },
    index: 0,
  },
  {
    id: "mock-2",
    name: "Prestige Palms Tennis Tournament",
    podType: "tournament",
    description:
      "Mixed doubles weekend tournament for Sherwood & Prestige residents at Court A.",
    memberCount: 8,
    maxMembers: 16,
    roleTags: ["Mixed doubles", "Court A"],
    visibility: "open",
    creator: { handle: "rohit_g", displayName: "Rohit Goel" },
    isMember: false,
    hub: { name: "Prestige Palms Residential Society", shortName: "Prestige Palms", hubType: "society" },
    index: 1,
  },
  {
    id: "mock-3",
    name: "VIT FIFA 26 Campus Tournament",
    podType: "gaming",
    description:
      "Gaming pod for registration, matchups and coordination for the VIT FIFA lan event.",
    memberCount: 18,
    maxMembers: 32,
    roleTags: ["FIFA 26", "LAN event"],
    visibility: "open",
    creator: { handle: "gamer_vit", displayName: "Varun Nair" },
    isMember: false,
    hub: { name: "Vellore Institute of Technology", shortName: "VIT", hubType: "college" },
    index: 2,
  },
  {
    id: "mock-4",
    name: "CS301 Study Group",
    podType: "class",
    description:
      "Weekly problem-set sessions, exam prep and concept reviews for Algorithms & Complexity.",
    memberCount: 12,
    maxMembers: 20,
    roleTags: ["Meeting Thursdays 5pm"],
    visibility: "open",
    creator: { handle: "priya_m", displayName: "Priya Mehta" },
    isMember: false,
    hub: { name: "Vellore Institute of Technology", shortName: "VIT", hubType: "college" },
    index: 3,
  },
];

/* ─── Stat card ───────────────────────────────────────────────── */
function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}) {
  return (
    <div
      className="rounded-2xl p-4 flex items-center gap-3"
      style={{
        background: "var(--bg-frosted)",
        backdropFilter: "blur(8px)",
        border: "1px solid var(--glass-border)",
      }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: "var(--border-subtle)" }}
      >
        {icon}
      </div>
      <div>
        <p
          className="text-base font-bold"
          style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}
        >
          {value}
        </p>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          {label}
        </p>
      </div>
    </div>
  );
}

/* ─── Inline label helper ─────────────────────────────────────── */
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label
      className="block text-[10px] font-semibold uppercase tracking-wider mb-2"
      style={{ color: "var(--text-muted)" }}
    >
      {children}
    </label>
  );
}

const INPUT_CLS =
  "w-full bg-[var(--bg-deep)] text-[var(--text-primary)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] text-sm transition-all";



/* ─── Page ────────────────────────────────────────────────────── */
export default function PodsPage() {
  const supabase = createClient();
  const router = useRouter();

  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");
  const [dbPods, setDbPods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userCollege, setUserCollege] = useState<any>(null);
  const [scopeFilter, setScopeFilter] = useState<"local" | "global">("local");
  const [userMemberships, setUserMemberships] = useState<Set<string>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Events tab
  const [pageTab, setPageTab] = useState<"pods" | "events">("pods");
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [rsvpMap, setRsvpMap] = useState<Record<string, 'none' | 'pending' | 'attending' | 'declined'>>({});
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);

  /* ── Restore state on mount ─────────────────────────────────── */
  useEffect(() => {
    const storedScope = sessionStorage.getItem("pods_scope_filter");
    const storedFilter = sessionStorage.getItem("pods_active_filter");
    if (storedScope === "local" || storedScope === "global") {
      setScopeFilter(storedScope);
    }
    if (storedFilter) {
      setActiveFilter(storedFilter as any);
    }
  }, []);

  /* ── Save state on changes ──────────────────────────────────── */
  useEffect(() => {
    sessionStorage.setItem("pods_scope_filter", scopeFilter);
  }, [scopeFilter]);

  useEffect(() => {
    sessionStorage.setItem("pods_active_filter", activeFilter);
  }, [activeFilter]);

  /* ── Auth + initial fetch ───────────────────────────────────── */
  useEffect(() => {
    const initPage = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      let collegeIdToQuery = null;
      
      if (user) {
        // Query full profile including college details
        const { data: profile } = await supabase
          .from("users")
          .select("*, colleges(*)")
          .eq("id", user.id)
          .single();
          
        if (profile) {
          setCurrentUser(profile);
          fetchMemberships(user.id);
          if (profile.colleges) {
            setUserCollege(profile.colleges);
            collegeIdToQuery = profile.colleges.id;
          }
        }
      }
      
      // If user isn't logged in or doesn't have a hub, default to global view
      const defaultScope = collegeIdToQuery ? scopeFilter : "global";
      if (!collegeIdToQuery && scopeFilter === "local") {
        setScopeFilter("global");
      }
      
      await fetchPods(collegeIdToQuery, defaultScope);
    };

    initPage();

    // Force reload/refetch when navigating back via BFcache
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        initPage();
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [scopeFilter]);

  // Fetch events when switching to events tab
  useEffect(() => {
    if (pageTab === "events") fetchEvents();
  }, [pageTab]);

  const fetchEvents = async () => {
    setEventsLoading(true);
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    const { data: eventsData } = await supabase
      .from('events')
      .select(`
        id, title, description, category, trust_tier,
        location_name, starts_at, ends_at, expires_at,
        min_headcount, max_headcount, is_active,
        require_mutual, require_face, organiser_id,
        college_id, created_at,
        organiser:users!events_organiser_id_fkey(id, handle, display_name, avatar_url)
      `)
      .eq('is_active', true)
      .order('starts_at', { ascending: true })
      .limit(50);

    if (!eventsData) { setEventsLoading(false); return; }

    const eventIds = eventsData.map(e => e.id);
    const { data: rsvpData } = await supabase
      .from('event_rsvps')
      .select('event_id, user_id, status')
      .in('event_id', eventIds)
      .in('status', ['attending', 'pending', 'approved']);

    const headcounts: Record<string, number> = {};
    const myRsvps: Record<string, 'none' | 'pending' | 'attending' | 'declined'> = {};
    rsvpData?.forEach(r => {
      if (r.status === 'attending') headcounts[r.event_id] = (headcounts[r.event_id] || 0) + 1;
      if (currentUser && r.user_id === currentUser.id) myRsvps[r.event_id] = r.status as any;
    });

    const mapped: CampusEvent[] = eventsData.map(e => ({
      ...e,
      current_headcount: headcounts[e.id] || 0,
      organiser: Array.isArray(e.organiser) ? e.organiser[0] : e.organiser,
    }));
    setEvents(mapped);
    setRsvpMap(myRsvps);
    setEventsLoading(false);
  };

  const handleRsvp = async (eventId: string, trustTier: string) => {
    if (!currentUser) { router.push('/login'); return; }
    const status = trustTier === 'guarded' ? 'pending' : 'attending';
    await supabase.from('event_rsvps').upsert(
      { event_id: eventId, user_id: currentUser.id, status },
      { onConflict: 'event_id,user_id' }
    );
    setRsvpMap(prev => ({ ...prev, [eventId]: status as any }));
  };

  const fetchPods = async (collegeId: string | null = null, currentScope: "local" | "global" = "local") => {
    setLoading(true);
    try {
      const nowStr = new Date().toISOString();
      let query = supabase
        .from("pods")
        .select(
          "*, creator:users!pods_creator_id_fkey(handle, display_name, avatar_url), colleges(*), pod_members(count)"
        )
        .neq("pod_status", "deleted")
        .or(`ends_at.is.null,ends_at.gt.${nowStr}`);

      const targetCollegeId = collegeId || userCollege?.id;
      if (currentScope === "local" && targetCollegeId) {
        query = query.eq("college_id", targetCollegeId);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (!error && data) {
        setDbPods(data);
      } else {
        console.warn("Pods fetch warning:", error?.message);
        setDbPods([]);
      }
    } catch (err) {
      console.error("fetchPods error:", err);
      setDbPods([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberships = async (userId: string) => {
    const { data } = await supabase
      .from("pod_members")
      .select("pod_id")
      .eq("user_id", userId);
    if (data) {
      setUserMemberships(new Set(data.map((m: any) => m.pod_id)));
    }
  };

  /* ── Join handler ───────────────────────────────────────────── */
  const handleJoin = async (podId: string) => {
    if (!currentUser) {
      router.push("/login");
      return;
    }
    const { error } = await supabase
      .from("pod_members")
      .insert({ pod_id: podId, user_id: currentUser.id });
    if (!error) {
      setUserMemberships((prev) => new Set([...prev, podId]));
    } else {
      console.error("Join error:", error.message);
    }
  };

  /* ── Map DB rows → PodCardProps ─────────────────────────────── */
  const mapDbPod = (pod: any, idx: number): Omit<PodCardProps, "onJoin"> => ({
    id: pod.id,
    name: pod.name,
    podType: pod.pod_type ?? "project",
    description: pod.description ?? "",
    memberCount:
      Array.isArray(pod.pod_members)
        ? pod.pod_members[0]?.count ?? 0
        : (pod.pod_members?.count ?? 0),
    maxMembers: pod.max_members ?? undefined,
    roleTags: pod.role_tags ?? [],
    visibility: pod.visibility ?? "open",
    creator: {
      handle: pod.creator?.handle ?? "unknown",
      displayName: pod.creator?.display_name ?? "Creator",
      avatarUrl: pod.creator?.avatar_url ?? undefined,
    },
    isMember: userMemberships.has(pod.id) || (currentUser && currentUser.id === pod.creator_id),
    hub: pod.colleges ? {
      name: pod.colleges.name,
      shortName: pod.colleges.short_name,
      hubType: pod.colleges.hub_type,
    } : undefined,
    index: idx,
    podStatus: pod.pod_status,
    startsAt: pod.starts_at,
    endsAt: pod.ends_at,
  });

  /* ── Combine live + mock; filter ────────────────────────────── */
  const useMocks = !loading && dbPods.length === 0;
  const allPods: Omit<PodCardProps, "onJoin">[] = useMocks
    ? MOCK_PODS
    : dbPods
        .filter((pod) => {
          if (pod.visibility === "invite") {
            return (
              currentUser &&
              (pod.creator_id === currentUser.id || userMemberships.has(pod.id))
            );
          }
          return true;
        })
        .map(mapDbPod);

  const filtered =
    activeFilter === "all"
      ? allPods
      : allPods.filter((p) => p.podType === activeFilter);

  /* ── Stats ──────────────────────────────────────────────────── */
  const totalMembers = allPods.reduce((acc, p) => acc + p.memberCount, 0);
  const openPods = allPods.filter((p) => p.visibility === "open" || p.visibility === "request").length;

  return (
    <div className="min-h-screen pt-24 pb-28 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* ── Page header ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8"
        >
          <div>
            {/* Label mono pill */}
            <span
              className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full border mb-4"
              style={{
                background: "rgba(108,92,231,0.10)",
                borderColor: "rgba(108,92,231,0.30)",
                color: "var(--accent-primary)",
                fontFamily: "var(--font-mono)",
              }}
            >
              <Zap className="w-2.5 h-2.5" />
              Campus Layer · Community Pods
            </span>

            <h1
              className="text-4xl font-bold tracking-tight leading-none mb-3"
              style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}
            >
              Community Pods 🏡
            </h1>
            <p className="text-base max-w-md" style={{ color: "var(--text-secondary)" }}>
              Find your crew. Study, play, compete, or build together.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-shrink-0">
            {/* Pods / Events page tab toggle */}
            <div
              className="inline-flex rounded-xl p-1 gap-1"
              style={{
                background: "var(--bg-frosted)",
                border: "1px solid var(--glass-border)",
              }}
            >
              <button
                onClick={() => setPageTab("pods")}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
                style={{
                  background: pageTab === "pods" ? "var(--accent-primary)" : "transparent",
                  color: pageTab === "pods" ? "#fff" : "var(--text-muted)",
                }}
              >
                🏡 Pods
              </button>
              <button
                onClick={() => setPageTab("events")}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
                style={{
                  background: pageTab === "events" ? "var(--accent-primary)" : "transparent",
                  color: pageTab === "events" ? "#fff" : "var(--text-muted)",
                }}
              >
                📅 Events
              </button>
            </div>

            {/* Hub Selector — only on Pods tab */}
            {pageTab === "pods" && userCollege && (
              <div
                className="inline-flex rounded-xl p-1 gap-1"
                style={{
                  background: "var(--bg-frosted)",
                  border: "1px solid var(--glass-border)",
                }}
              >
                <button
                  onClick={() => setScopeFilter("local")}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
                  style={{
                    background: scopeFilter === "local" ? "var(--accent-primary)" : "transparent",
                    color: scopeFilter === "local" ? "#fff" : "var(--text-muted)",
                  }}
                >
                  <span>
                    {userCollege.hub_type === "society" ? "🏡" : userCollege.hub_type === "corporate" ? "🏢" : "🏫"}
                  </span>
                  {userCollege.short_name || userCollege.name}
                </button>
                <button
                  onClick={() => setScopeFilter("global")}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
                  style={{
                    background: scopeFilter === "global" ? "var(--accent-primary)" : "transparent",
                    color: scopeFilter === "global" ? "#fff" : "var(--text-muted)",
                  }}
                >
                  🌐 Global Net
                </button>
              </div>
            )}

            {pageTab === "pods" ? (
              <Button
                variant="primary"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => {
                  if (!currentUser) router.push("/login");
                  else setShowCreateModal(true);
                }}
              >
                Create Pod
              </Button>
            ) : (
              <Button
                variant="primary"
                icon={<Calendar className="w-4 h-4" />}
                onClick={() => {
                  if (!currentUser) router.push("/login");
                  else setShowCreateEventModal(true);
                }}
              >
                Create Event
              </Button>
            )}
          </div>
        </motion.div>

        {/* ── Stats row ───────────────────────────────────────── */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          <StatCard
            icon={<Zap className="w-4 h-4" style={{ color: "var(--accent-primary)" }} />}
            value={allPods.length}
            label="Active Pods"
          />
          <StatCard
            icon={<Users className="w-4 h-4" style={{ color: "var(--accent-secondary)" }} />}
            value={totalMembers}
            label="Total Members"
          />
          <StatCard
            icon={<BookOpen className="w-4 h-4" style={{ color: "#fb923c" }} />}
            value={openPods}
            label="Open to Join"
          />
        </motion.div>

        {/* ── PODS TAB CONTENT ─────────────────────────────────── */}
        {pageTab === "pods" && (
          <>
            {/* Filter tabs */}
            <motion.div
              className="relative mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.12 }}
            >
              <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
                {FILTER_TABS.map(({ label, value }) => (
                  <button
                    key={value}
                    onClick={() => setActiveFilter(value)}
                    className="relative flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                    style={{ color: activeFilter === value ? "var(--text-primary)" : "var(--text-muted)" }}
                  >
                    {activeFilter === value && (
                      <motion.span
                        layoutId="pod-filter-pill"
                        className="absolute inset-0 rounded-xl"
                        style={{ background: "var(--bg-frosted)", border: "1px solid rgba(108,92,231,0.35)" }}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{label}</span>
                  </button>
                ))}
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "var(--border-subtle)" }} />
            </motion.div>

            <p className="text-xs mb-5" style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              {loading ? "Loading pods…" : `${filtered.length} pod${filtered.length !== 1 ? "s" : ""} found`}
              {useMocks && !loading && (
                <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] border" style={{ background: "rgba(253,203,110,0.08)", borderColor: "rgba(253,203,110,0.25)", color: "#fdcb6e" }}>
                  Example data
                </span>
              )}
            </p>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <motion.div key={i} className="rounded-2xl p-5 animate-pulse" style={{ background: "var(--bg-frosted)", border: "1px solid var(--glass-border)", height: "240px" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                    <div className="flex gap-2 mb-4"><div className="h-5 w-20 rounded-full" style={{ background: "var(--border-subtle)" }} /><div className="h-5 w-16 rounded-full ml-auto" style={{ background: "var(--border-subtle)" }} /></div>
                    <div className="h-5 w-3/4 rounded-lg mb-2" style={{ background: "var(--border-subtle)" }} />
                    <div className="h-4 w-full rounded-lg mb-1" style={{ background: "var(--border-subtle)" }} />
                    <div className="h-4 w-5/6 rounded-lg" style={{ background: "var(--border-subtle)" }} />
                  </motion.div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <motion.div className="text-center py-24" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <p className="text-5xl mb-4">🏡</p>
                <p className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>No Pods Yet</p>
                <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>Be the first to launch a Pod in your community.</p>
                <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => { if (!currentUser) router.push("/login"); else setShowCreateModal(true); }}>Create First Pod</Button>
              </motion.div>
            ) : (
              <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18 }}>
                {filtered.map((pod, i) => (
                  <PodCard key={pod.id} {...pod} index={i} onJoin={handleJoin} />
                ))}
              </motion.div>
            )}
          </>
        )}

        {/* ── EVENTS TAB CONTENT ───────────────────────────────── */}
        {pageTab === "events" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            {eventsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <motion.div key={i} className="rounded-2xl p-5 animate-pulse" style={{ background: "var(--bg-frosted)", border: "1px solid var(--glass-border)", height: "200px" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} />
                ))}
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-5xl mb-4">📅</p>
                <p className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>No Events Yet</p>
                <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>Create the first campus event for your community.</p>
                <Button variant="primary" icon={<Calendar className="w-4 h-4" />} onClick={() => { if (!currentUser) router.push("/login"); else setShowCreateEventModal(true); }}>Create Event</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {events.map((event, i) => (
                  <EventCard
                    key={event.id}
                    id={event.id}
                    title={event.title}
                    category={event.category as any}
                    trustTier={event.trust_tier as any}
                    locationName={event.location_name}
                    startsAt={event.starts_at}
                    endsAt={event.ends_at}
                    currentHeadcount={event.current_headcount ?? 0}
                    maxHeadcount={event.max_headcount ?? undefined}
                    organiser={{
                      id: event.organiser?.id ?? event.organiser_id,
                      handle: event.organiser?.handle ?? "unknown",
                      displayName: event.organiser?.display_name ?? "",
                      avatarUrl: event.organiser?.avatar_url ?? undefined,
                    }}
                    rsvpStatus={rsvpMap[event.id] ?? "none"}
                    onRsvp={(id) => handleRsvp(id, event.trust_tier)}
                    expiresAt={event.expires_at}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}

      </div>

      {/* ── CreatePodModal portal ────────────────────────────── */}
      <AnimatePresence>
        {showCreateModal && (
          <CreatePodModal
            onClose={() => setShowCreateModal(false)}
            currentUserId={currentUser?.id ?? null}
            userCollege={userCollege}
            onCreated={(newPod) => {
              setDbPods((prev) => [newPod, ...prev]);
              // Immediately mark creator as member of new pod
              setUserMemberships((prev) => new Set([...prev, newPod.id]));
            }}
          />
        )}
        {currentUser && (
          <CreateEventModal
            isOpen={showCreateEventModal}
            onClose={() => setShowCreateEventModal(false)}
            onSuccess={() => { setShowCreateEventModal(false); fetchEvents(); }}
            userId={currentUser.id}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
