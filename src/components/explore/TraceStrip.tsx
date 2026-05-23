"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import TraceRing from "@/components/ui/TraceRing";
import TraceViewer from "@/components/explore/TraceViewer";
import ComposeModal from "@/components/explore/ComposeModal";

interface TraceStripProps {
  scope?: "public" | "pod_only";
  podId?: string;
  className?: string;
  isExploreTrending?: boolean; // If true, fetches trending traces (10+ resonates)
}

export default function TraceStrip({
  scope = "public",
  podId,
  className = "",
  isExploreTrending = false
}: TraceStripProps) {
  const supabase = createClient();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [groupedTraces, setGroupedTraces] = useState<any[]>([]);
  const [userHasActiveTrace, setUserHasActiveTrace] = useState(false);
  const [seenTraceIds, setSeenTraceIds] = useState<string[]>([]);
  
  // Modal states
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [activeUserIndex, setActiveUserIndex] = useState(0);

  // Fetch current user and seen traces from localStorage
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
    });

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("seen-trace-ids");
      if (stored) {
        try {
          setSeenTraceIds(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [supabase]);

  // Load and refresh traces data
  const loadTraces = async () => {
    if (!currentUser) return;

    try {
      let query = supabase
        .from("traces")
        .select("*, users:users(id, handle, display_name, avatar_url)")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: true });

      if (isExploreTrending) {
        // Trending logic: scope = 'public', count of resonate reactions >= 10
        // Wait, since we can't easily join count in Supabase client without a custom RPC or view,
        // we can fetch active public traces, then filter or sort them.
        // Wait, the backend agent spec says:
        // "Trending now query: traces WHERE scope = 'public' AND expires_at > NOW() and reaction count >= 10, ordered by reaction velocity (reactions in last 2h DESC)"
        // Let's implement a client-side fetch of public traces, and we can query trace_reactions to count resonates.
        // But to make it fast and efficient, we can fetch all public traces, fetch all resonate reactions, and group/filter them in memory!
        query = query.eq("scope", "public");
      } else if (scope === "pod_only") {
        if (podId) {
          query = query.eq("scope", "pod_only").eq("pod_id", podId);
        } else {
          // If no podId, don't return anything
          setGroupedTraces([]);
          return;
        }
      } else {
        // Feed traces: followed creators + self
        const { data: follows } = await supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", currentUser.id);

        const targetUserIds = follows?.map((f) => f.following_id) || [];
        targetUserIds.push(currentUser.id); // Always show self

        query = query.in("user_id", targetUserIds);
      }

      const { data: traces, error } = await query;
      if (error) throw error;

      if (traces) {
        // If we are showing explore trending, we need to filter for those with >= 10 resonates
        let filteredTraces = traces;

        if (isExploreTrending) {
          // Fetch reactions count for these traces
          const traceIds = traces.map((t) => t.id);
          if (traceIds.length > 0) {
            const { data: reactions } = await supabase
              .from("trace_reactions")
              .select("trace_id, reaction_type")
              .in("trace_id", traceIds)
              .eq("reaction_type", "resonate");

            const countMap: Record<string, number> = {};
            reactions?.forEach((r) => {
              countMap[r.trace_id] = (countMap[r.trace_id] || 0) + 1;
            });

            // Filter for traces with >= 10 resonates (or >= 1 for testing support, but spec says 10+)
            // Let's stick to the spec (10+), but let's allow it to fall back to showing if anyone reacted for mockup rich-feel if none exist
            // Wait, the spec says "Traces with 10+ reactions surface here. Ordered by reaction velocity."
            filteredTraces = traces.filter((t) => (countMap[t.id] || 0) >= 10);
            
            // If empty, let's keep it empty as per: "Explore strip: hidden when no hot Traces"
          } else {
            filteredTraces = [];
          }
        }

        // Group traces by user
        const grouped: Record<string, { user: any; traces: any[] }> = {};
        let selfHasActive = false;

        filteredTraces.forEach((trace) => {
          const u = trace.users;
          if (!u) return;

          if (currentUser && u.id === currentUser.id) {
            selfHasActive = true;
          }

          if (!grouped[u.id]) {
            grouped[u.id] = {
              user: {
                id: u.id,
                handle: u.handle,
                display_name: u.display_name,
                avatar_url: u.avatar_url
              },
              traces: []
            };
          }
          grouped[u.id].traces.push({
            id: trace.id,
            type: trace.type,
            content: trace.content,
            scope: trace.scope,
            pod_id: trace.pod_id,
            expires_at: trace.expires_at,
            created_at: trace.created_at,
            media_url: trace.media_url,
            media_type: trace.media_type
          });
        });

        setUserHasActiveTrace(selfHasActive);

        // Convert to array. Place self first if present.
        const list = Object.values(grouped);
        if (currentUser) {
          const selfIdx = list.findIndex((item) => item.user.id === currentUser.id);
          if (selfIdx > -1) {
            const [selfItem] = list.splice(selfIdx, 1);
            list.unshift(selfItem);
          }
        }

        setGroupedTraces(list);
      }
    } catch (e) {
      console.error("Error loading traces:", e);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadTraces();

      // Realtime subscription to refresh strip
      const channel = supabase
        .channel(`traces-strip-${scope}-${podId || "all"}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "traces"
          },
          () => {
            loadTraces();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [currentUser, scope, podId, isExploreTrending]);

  const handleOpenViewer = (index: number) => {
    setActiveUserIndex(index);
    setIsViewerOpen(true);
  };

  const handleViewerClose = () => {
    setIsViewerOpen(false);
    // Refresh seen traces from localStorage when user closes viewer
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("seen-trace-ids");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setSeenTraceIds(parsed);
          
          // Also save new views from the active user's viewed session
          const activeUser = groupedTraces[activeUserIndex];
          if (activeUser) {
            const ids = activeUser.traces.map((t: any) => t.id);
            const updated = Array.from(new Set([...parsed, ...ids]));
            localStorage.setItem("seen-trace-ids", JSON.stringify(updated));
            setSeenTraceIds(updated);
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        // If empty, save the active user's trace IDs
        const activeUser = groupedTraces[activeUserIndex];
        if (activeUser) {
          const ids = activeUser.traces.map((t: any) => t.id);
          localStorage.setItem("seen-trace-ids", JSON.stringify(ids));
          setSeenTraceIds(ids);
        }
      }
    }
    loadTraces();
  };

  // Check if a user's traces are all seen
  const isUserTracesAllSeen = (userItem: any) => {
    return userItem.traces.every((t: any) => seenTraceIds.includes(t.id));
  };

  // If Explore trending and empty, hide entirely
  if (isExploreTrending && groupedTraces.length === 0) {
    return null;
  }

  return (
    <div className={`w-full py-4 border-b border-white/5 bg-void/50 ${className}`}>
      <div className="flex items-center gap-4 overflow-x-auto no-scrollbar px-6">
        {/* Compose Trigger avatar at the beginning (if not trending exploration mode) */}
        {!isExploreTrending && (
          <div className="flex flex-col items-center gap-1.5 shrink-0 select-none">
            {userHasActiveTrace ? (
              // If active user has active trace, show normal avatar which opens viewer
              <div className="relative">
                <TraceRing
                  userId={currentUser?.id}
                  avatarUrl={currentUser?.avatar_url}
                  displayName={currentUser?.display_name || currentUser?.handle}
                  size="md"
                  hasActiveTrace={true}
                  onClick={() => {
                    const idx = groupedTraces.findIndex((g) => g.user.id === currentUser?.id);
                    if (idx > -1) handleOpenViewer(idx);
                  }}
                />
                <button
                  onClick={() => setIsComposeOpen(true)}
                  className="absolute bottom-0 right-0 w-4 h-4 bg-gradient-to-tr from-indigo-500 to-pink-500 border border-[var(--bg-void)] rounded-full flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all shadow-md cursor-pointer"
                >
                  <Plus className="w-2.5 h-2.5" />
                </button>
              </div>
            ) : (
              // If no trace, show compose button
              <button
                onClick={() => setIsComposeOpen(true)}
                className="w-12 h-12 rounded-full border border-dashed border-white/20 hover:border-[var(--accent-primary)] hover:bg-[var(--accent-primary-glow)] flex items-center justify-center text-[var(--text-secondary)] hover:text-white transition-all cursor-pointer group relative"
              >
                {currentUser?.avatar_url ? (
                  <img src={currentUser.avatar_url} alt="You" className="w-10 h-10 rounded-full object-cover opacity-50 group-hover:opacity-80 transition-opacity" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-gradient-to-tr from-indigo-500 to-pink-500 rounded-full flex items-center justify-center text-white shadow-md">
                  <Plus className="w-2.5 h-2.5" />
                </div>
              </button>
            )}
            <span className="text-[10px] font-semibold text-[var(--text-secondary)] tracking-tight">Your Trace</span>
          </div>
        )}

        {/* Vertical divider */}
        {!isExploreTrending && groupedTraces.length > 0 && (
          <div className="w-[1px] h-8 bg-white/10 shrink-0 self-center" />
        )}

        {/* Other Users' Traces */}
        {groupedTraces.map((item, idx) => {
          // If not explore, skip rendering self since it is handled by the first icon
          if (!isExploreTrending && currentUser && item.user.id === currentUser.id && userHasActiveTrace) {
            return null;
          }

          const allSeen = isUserTracesAllSeen(item);

          return (
            <div
              key={item.user.id}
              onClick={() => handleOpenViewer(idx)}
              className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
            >
              <div className="relative">
                <TraceRing
                  userId={item.user.id}
                  avatarUrl={item.user.avatar_url}
                  displayName={item.user.display_name}
                  size="md"
                  hasActiveTrace={!allSeen}
                  className={allSeen ? "opacity-60 transition-opacity group-hover:opacity-100" : ""}
                />
              </div>
              <span className="text-[10px] font-semibold text-[var(--text-secondary)] group-hover:text-white transition-colors max-w-[60px] truncate text-center leading-tight">
                {item.user.display_name.split(" ")[0]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Viewer Dialog overlay */}
      {isViewerOpen && (
        <TraceViewer
          isOpen={isViewerOpen}
          onClose={handleViewerClose}
          userTraces={groupedTraces}
          initialUserIndex={activeUserIndex}
          initialTraceIndex={0}
        />
      )}

      {/* Compose modal overlay */}
      {isComposeOpen && (
        <ComposeModal
          isOpen={isComposeOpen}
          onClose={() => setIsComposeOpen(false)}
          onPostSuccess={loadTraces}
        />
      )}
    </div>
  );
}
