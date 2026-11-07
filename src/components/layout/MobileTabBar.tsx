"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Compass,
  Film,
  Plus,
  Home,
  User,
  Sparkles,
  Briefcase,
  Layers,
  X,
  Flame,
  FileText,
  Clock,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import ComposeModal from "../explore/ComposeModal";
import CreatePostModal from "../explore/CreatePostModal";
import UploadFlareModal from "../explore/UploadFlareModal";

export default function MobileTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Modal open states for all options
  const [radialMenuOpen, setRadialMenuOpen] = useState(false);
  const [postWorkOpen, setPostWorkOpen] = useState(false);
  const [traceOpen, setTraceOpen] = useState(false);
  const [flareUploadOpen, setFlareUploadOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Fetch current user & Aura tier for live Avatar Ring
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select("handle, display_name, avatar_url, aura_tier")
          .eq("id", user.id)
          .single();
        if (profile) setUserProfile(profile);
      }
    };
    fetchUser();
  }, []);

  // Auto-hide tab bar on scroll down in long feeds, restore on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 120 && currentScrollY > lastScrollY + 10) {
        setIsVisible(false);
        setRadialMenuOpen(false);
      } else if (currentScrollY < lastScrollY - 10 || currentScrollY <= 60) {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Hide tab bar inside fullscreen video players or specific deep modal routes
  const isImmersiveRoute =
    pathname.startsWith("/studio/") && pathname.includes("/edit");
  if (isImmersiveRoute) return null;

  // Aura Ring Color mapping
  const getAuraBorder = (tier?: string) => {
    switch (tier?.toLowerCase()) {
      case "rising":
        return "border-[#6c5ce7]";
      case "trusted":
        return "border-[#00d2ff]";
      case "core":
        return "border-[#fd79a8]";
      case "pillar":
        return "border-[#fdcb6e]";
      default:
        return "border-[var(--text-muted)]";
    }
  };

  // Restructured Tabs in Exact Required Order:
  // 1. Feed, 2. Explore, 3. Create (Orb), 4. Flares, 5. Account
  const TABS = [
    { label: "Feed", href: "/feed", icon: Home },
    { label: "Explore", href: "/explore", icon: Compass },
    { label: "Create", href: "#create", icon: Plus, isAction: true },
    { label: "Flares", href: "/flares", icon: Film },
    {
      label: "Account",
      href: userProfile?.handle ? `/${userProfile.handle}` : "/studio/me",
      icon: User,
      isAccount: true,
    },
  ];

  return (
    <>
      {/* Radial Quick-Create Backdrop */}
      <AnimatePresence>
        {radialMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setRadialMenuOpen(false)}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Radial Quick-Create Menu Options */}
      <AnimatePresence>
        {radialMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="fixed bottom-24 inset-x-6 z-50 max-w-sm mx-auto glass-thick rounded-3xl p-4 shadow-[var(--elevation-4)] border border-[var(--glass-border)] md:hidden flex flex-col gap-2"
          >
            <div className="flex items-center justify-between px-2 pb-2 border-b border-[var(--border-subtle)]">
              <span className="label-mono !text-[11px] text-[var(--accent-cyan)]">
                ✦ CREATE & SHARE
              </span>
              <button
                onClick={() => setRadialMenuOpen(false)}
                className="p-1 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 1. Post Work (Projects / Portfolio Piece) */}
            <button
              onClick={() => {
                setRadialMenuOpen(false);
                setPostWorkOpen(true);
              }}
              className="flex items-center gap-3.5 p-3 rounded-2xl bg-[var(--bg-surface)] hover:bg-[var(--glass-hover)] transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-[var(--text-primary)]">
                  Post Work
                </div>
                <div className="text-xs text-[var(--text-secondary)]">
                  Showcase projects, engineering code, or UI design
                </div>
              </div>
            </button>

            {/* 2. Post Flare (Vertical Video) */}
            <button
              onClick={() => {
                setRadialMenuOpen(false);
                setFlareUploadOpen(true);
              }}
              className="flex items-center gap-3.5 p-3 rounded-2xl bg-[var(--bg-surface)] hover:bg-[var(--glass-hover)] transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-[var(--text-primary)]">
                  Create Flare 🔥
                </div>
                <div className="text-xs text-[var(--text-secondary)]">
                  Upload a 60-second vertical video for creators
                </div>
              </div>
            </button>

            {/* 3. Leave a Trace (24hr Ephemeral) */}
            <button
              onClick={() => {
                setRadialMenuOpen(false);
                setTraceOpen(true);
              }}
              className="flex items-center gap-3.5 p-3 rounded-2xl bg-[var(--bg-surface)] hover:bg-[var(--glass-hover)] transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-[var(--text-primary)]">
                  Post Trace ✦
                </div>
                <div className="text-xs text-[var(--text-secondary)]">
                  Ephemeral 24-hour thought, vibe check, or audio clip
                </div>
              </div>
            </button>

            {/* 4. Collab Board Pitch */}
            <button
              onClick={() => {
                setRadialMenuOpen(false);
                router.push("/collabs");
              }}
              className="flex items-center gap-3.5 p-3 rounded-2xl bg-[var(--bg-surface)] hover:bg-[var(--glass-hover)] transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-[var(--text-primary)]">
                  Collab Board Request
                </div>
                <div className="text-xs text-[var(--text-secondary)]">
                  Find builders & pitch project openings
                </div>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Outer wrapper has pointer-events-none so touches pass through to footer & content */}
      <motion.nav
        initial={{ y: 0 }}
        animate={{ y: isVisible ? 0 : 100 }}
        transition={{ type: "spring", stiffness: 350, damping: 30 }}
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-3 inset-x-3 z-40 pointer-events-none"
      >
        {/* Floating Capsule strictly absorbs clicks */}
        <div
          className="pointer-events-auto relative max-w-md mx-auto rounded-3xl glass-regular p-1.5 flex items-center justify-around shadow-[var(--elevation-3)] border border-[var(--glass-border)]"
          style={{
            paddingBottom: "max(6px, env(safe-area-inset-bottom))",
          }}
        >
          {TABS.map((tab) => {
            const isActive =
              !tab.isAction &&
              (pathname === tab.href ||
                (tab.href !== "/" && pathname.startsWith(tab.href)));
            const Icon = tab.icon;

            // Center Action: Create Orb
            if (tab.isAction) {
              return (
                <button
                  key={tab.label}
                  onClick={() => setRadialMenuOpen(!radialMenuOpen)}
                  className={`relative -top-2.5 w-12 h-12 rounded-2xl bg-[linear-gradient(135deg,var(--accent-primary),var(--accent-cyan))] text-white flex items-center justify-center shadow-[0_8px_20px_rgba(87,66,230,0.35)] active:scale-90 transition-transform ${
                    radialMenuOpen ? "rotate-45" : ""
                  }`}
                  aria-label="Create new item"
                >
                  <Plus className="w-6 h-6 stroke-[2.5]" />
                </button>
              );
            }

            return (
              <Link
                key={tab.label}
                href={tab.href}
                className="relative flex-1 py-1.5 flex flex-col items-center justify-center gap-0.5 text-center min-h-[44px]"
              >
                {isActive && (
                  <motion.div
                    layoutId="mobileTabPill"
                    className="absolute inset-0 rounded-2xl bg-[var(--accent-primary-glow)] opacity-20"
                    transition={{ type: "spring", stiffness: 380, damping: 28 }}
                  />
                )}

                {/* Account Tab: Shows Live Avatar with Aura Tier Ring */}
                {tab.isAccount && userProfile?.avatar_url ? (
                  <div
                    className={`w-6 h-6 rounded-full overflow-hidden border-2 ${getAuraBorder(
                      userProfile.aura_tier
                    )} p-[1px]`}
                  >
                    <img
                      src={userProfile.avatar_url}
                      alt="Account"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                ) : (
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      isActive
                        ? "text-[var(--accent-primary)] stroke-[2.2]"
                        : "text-[var(--text-muted)]"
                    }`}
                  />
                )}

                <span
                  className={`text-[10px] font-mono tracking-tight transition-colors ${
                    isActive
                      ? "text-[var(--text-primary)] font-bold"
                      : "text-[var(--text-muted)]"
                  }`}
                >
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </motion.nav>

      {/* Dedicated Modals for All Post Options */}
      <CreatePostModal
        isOpen={postWorkOpen}
        onClose={() => setPostWorkOpen(false)}
      />

      <ComposeModal
        isOpen={traceOpen}
        onClose={() => setTraceOpen(false)}
      />

      <UploadFlareModal
        isOpen={flareUploadOpen}
        onClose={() => setFlareUploadOpen(false)}
      />
    </>
  );
}
