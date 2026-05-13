"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Zap,
  Bell,
  Search,
  MessageSquare,
  Menu,
  X,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { RevealEffect } from "@/components/ui/RevealEffect";

const NAV_LINKS = [
  { label: "Feed", href: "/feed" },
  { label: "Explore", href: "/explore" },
  { label: "Collab Board", href: "/collabs" },
  { label: "Showcase", href: "/showcase" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifCount] = useState(3);
  const [user, setUser] = useState<any>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled
            ? "var(--glass-bg)"
            : "transparent",
          backdropFilter: scrolled ? "blur(24px)" : "none",
          borderBottom: scrolled
            ? "1px solid var(--border-subtle)"
            : "1px solid transparent",
        }}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <motion.div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #6c5ce7, #00d2ff)",
                boxShadow: "0 0 16px rgba(108,92,231,0.5)",
              }}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <Zap className="w-4 h-4 text-white" />
            </motion.div>
            <span
              className="text-xl font-bold tracking-tight"
              style={{
                fontFamily: "var(--font-display)",
                background: "linear-gradient(135deg, #f0f0ff, #a29bfe)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              CORELX
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                style={{ color: "var(--text-secondary)" }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.color = "var(--text-primary)";
                  (e.target as HTMLElement).style.background = "var(--bg-frosted)";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.color = "var(--text-secondary)";
                  (e.target as HTMLElement).style.background = "transparent";
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Search */}
            <button
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200"
              style={{
                color: "var(--text-muted)",
                background: "transparent",
                border: "1px solid var(--glass-border)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "rgba(108,92,231,0.4)";
                (e.currentTarget as HTMLElement).style.color =
                  "var(--text-primary)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "var(--glass-border)";
                (e.currentTarget as HTMLElement).style.color =
                  "var(--text-muted)";
              }}
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Theme Toggle */}
            {mounted && (
              <button
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200"
                style={{
                  color: "var(--text-muted)",
                  background: "transparent",
                  border: "1px solid var(--glass-border)",
                }}
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(108,92,231,0.4)";
                  (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--glass-border)";
                  (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
                }}
              >
                <div className="relative w-4 h-4 overflow-hidden">
                  <motion.div
                    initial={false}
                    animate={{ y: theme === "dark" ? 0 : 20, opacity: theme === "dark" ? 1 : 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <Moon className="w-4 h-4" />
                  </motion.div>
                  <motion.div
                    initial={false}
                    animate={{ y: theme === "light" ? 0 : -20, opacity: theme === "light" ? 1 : 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <Sun className="w-4 h-4" />
                  </motion.div>
                </div>
              </button>
            )}

            {/* Messages */}
            <Link href="/messages" className="relative w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200"
              style={{
                color: "var(--text-muted)",
                background: "transparent",
                border: "1px solid var(--glass-border)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(108,92,231,0.4)";
                (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--glass-border)";
                (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
              }}
            >
              <MessageSquare className="w-4 h-4" />
            </Link>

            {/* Notifications */}
            <button className="relative w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200"
              style={{
                color: "var(--text-muted)",
                background: "transparent",
                border: "1px solid var(--glass-border)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(108,92,231,0.4)";
                (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--glass-border)";
                (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
              }}
            >
              <Bell className="w-4 h-4" />
              {notifCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                  style={{ background: "var(--accent-primary)" }}
                >
                  {notifCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="relative">
                <button 
                  className="w-9 h-9 rounded-full overflow-hidden transition-colors p-0.5"
                  style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                >
                  <div className="w-full h-full rounded-full flex items-center justify-center font-semibold text-xs" style={{ backgroundColor: "var(--accent-primary)", color: "var(--bg-void)" }}>
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                </button>
                
                {profileDropdownOpen && (
                  <RevealEffect 
                    className="absolute right-0 top-full mt-2 w-48 rounded-xl shadow-2xl py-1 z-50 overflow-hidden"
                    style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--glass-border)" }}
                  >
                    <Link href="/studio/me" className="flex items-center gap-2 px-4 py-2 text-sm transition-colors" style={{ color: "var(--text-secondary)" }} onClick={() => setProfileDropdownOpen(false)}>
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    <Link href="/settings" className="flex items-center gap-2 px-4 py-2 text-sm transition-colors" style={{ color: "var(--text-secondary)" }} onClick={() => setProfileDropdownOpen(false)}>
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                    <div className="h-px w-full my-1" style={{ backgroundColor: "var(--border-subtle)" }} />
                    <button onClick={() => { handleLogout(); setProfileDropdownOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 transition-colors text-left" style={{ backgroundColor: "transparent" }}>
                      <LogOut className="w-4 h-4" />
                      Log Out
                    </button>
                  </RevealEffect>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium transition-colors mr-2" style={{ color: "var(--text-secondary)" }}>
                  Log In
                </Link>
                <Link href="/signup">
                  <Button variant="primary" size="sm">
                    Sign Up Free
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg"
            style={{ color: "var(--text-secondary)", border: "1px solid var(--glass-border)" }}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <motion.div
        className="fixed inset-x-0 top-16 z-40 md:hidden"
        style={{
          background: "rgba(5,5,15,0.98)",
          backdropFilter: "blur(24px)",
          pointerEvents: mobileOpen ? "auto" : "none",
        }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: mobileOpen ? 1 : 0, y: mobileOpen ? 0 : -20 }}
      >
        <div className="px-4 py-6 flex flex-col gap-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-3 rounded-xl text-sm font-medium transition-all"
              style={{
                color: "var(--text-secondary)",
                border: "1px solid var(--glass-border)",
              }}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Button variant="primary" className="mt-2 justify-center">
            Sign Up Free
          </Button>
        </div>
      </motion.div>
    </>
  );
}
