"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Compass,
  Video,
  Plus,
  Briefcase,
  Users,
  User,
  Home,
} from "lucide-react";
import ComposeModal from "../explore/ComposeModal";

export default function MobileTabBar() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [composeOpen, setComposeOpen] = useState(false);

  // Auto-hide tab bar on scroll down in long feeds, restore on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 120 && currentScrollY > lastScrollY + 10) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY - 10 || currentScrollY <= 60) {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Hide tab bar inside fullscreen video players or specific deep modal routes
  const isImmersiveRoute = pathname.startsWith("/studio/") && pathname.includes("/edit");
  if (isImmersiveRoute) return null;

  const TABS = [
    { label: "Home", href: "/", icon: Home },
    { label: "Explore", href: "/explore", icon: Compass },
    { label: "Create", href: "#create", icon: Plus, isAction: true },
    { label: "Collabs", href: "/collabs", icon: Briefcase },
    { label: "Pods", href: "/community", icon: Users },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: 0 }}
        animate={{ y: isVisible ? 0 : 100 }}
        transition={{ type: "spring", stiffness: 350, damping: 30 }}
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-3 inset-x-3 z-50 pointer-events-auto"
      >
        <div
          className="relative max-w-md mx-auto rounded-3xl glass-regular p-2 flex items-center justify-around shadow-[var(--elevation-3)] border border-[var(--glass-border)]"
          style={{
            paddingBottom: "max(8px, env(safe-area-inset-bottom))",
          }}
        >
          {TABS.map((tab) => {
            const isActive = !tab.isAction && (pathname === tab.href || (tab.href !== "/" && pathname.startsWith(tab.href)));
            const Icon = tab.icon;

            if (tab.isAction) {
              return (
                <button
                  key={tab.label}
                  onClick={() => setComposeOpen(true)}
                  className="relative -top-3 w-12 h-12 rounded-2xl bg-[linear-gradient(135deg,var(--accent-primary),var(--accent-cyan))] text-white flex items-center justify-center shadow-[0_8px_20px_rgba(87,66,230,0.35)] active:scale-95 transition-transform"
                  aria-label="Create new post"
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
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive
                      ? "text-[var(--accent-primary)] stroke-[2.2]"
                      : "text-[var(--text-muted)]"
                  }`}
                />
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

      {/* Center Action: Compose Modal Trigger */}
      <ComposeModal isOpen={composeOpen} onClose={() => setComposeOpen(false)} />
    </>
  );
}
