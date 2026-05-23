"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Zap,
  Bell,
  Search,
  MessageSquare,
  Menu,
  X,
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
import SearchOverlay from "./SearchOverlay";
import { formatDistanceToNow } from "date-fns";

const NAV_LINKS = [
  { label: "Feed", href: "/feed" },
  { label: "Explore", href: "/explore" },
  { label: "Collab Board", href: "/collabs" },
  { label: "Pods", href: "/pods" },
  { label: "Showcase", href: "/showcase" },
];

const NOTIF_TEXT: Record<string, string> = {
  spark: "sparked your post ✨",
  comment: "commented on your post.",
  follow: "started following you.",
  collab_request: "sent a Collab Request! 🤝",
  dm: "sent you a message 💬",
  pod_message: "sent a message in your pod 🏠",
};

const NOTIF_EMOJI: Record<string, string> = {
  spark: "✨",
  comment: "💬",
  follow: "👤",
  collab_request: "🤝",
  dm: "💬",
  pod_message: "🏠",
};

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [mounted, setMounted] = useState(false);

  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    let activeUserId: string | null = null;
    let channel: any = null;

    const setupUser = async (authUser: any) => {
      const authUserId = authUser?.id || null;
      if (authUserId === activeUserId) {
        return; // Already setup or already null
      }

      // Cleanup previous channel
      if (channel) {
        supabase.removeChannel(channel);
        channel = null;
      }

      activeUserId = authUserId;

      if (!authUser) {
        setUser(null);
        setUserProfile(null);
        setUnreadMessages(0);
        setNotifications([]);
        setUnreadNotifs(0);
        return;
      }

      setUser(authUser);

      try {
        // Profile
        const { data: profile } = await supabase
          .from("users")
          .select("handle, display_name, avatar_url")
          .eq("id", authUser.id)
          .single();
        if (profile) setUserProfile(profile);

        // Unread DM count
        const fetchUnreadDMs = async () => {
          try {
            const { count } = await supabase
              .from("messages")
              .select("*", { count: "exact", head: true })
              .eq("recipient_id", authUser.id)
              .eq("read", false);
            setUnreadMessages(count || 0);
          } catch (err) {
            console.error("Error fetching unread DMs:", err);
          }
        };
        await fetchUnreadDMs();

        // Notifications
        const fetchNotifs = async () => {
          try {
            const { data } = await supabase
              .from("notifications")
              .select(
                "id, type, message, link, read, created_at, from_user:users!notifications_from_user_id_fkey(handle, display_name, avatar_url)"
              )
              .eq("user_id", authUser.id)
              .order("created_at", { ascending: false })
              .limit(30);
            if (data) {
              setNotifications(data);
              setUnreadNotifs(data.filter((n: any) => !n.read).length);
            }
          } catch (err) {
            console.error("Error fetching notifications:", err);
          }
        };
        await fetchNotifs();

        // Real-time: new notification or updated DM read status
        channel = supabase
          .channel(`navbar-${authUser.id}`)
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${authUser.id}` },
            () => fetchNotifs()
          )
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "messages", filter: `recipient_id=eq.${authUser.id}` },
            () => fetchUnreadDMs()
          )
          .on(
            "postgres_changes",
            { event: "UPDATE", schema: "public", table: "messages", filter: `recipient_id=eq.${authUser.id}` },
            () => fetchUnreadDMs()
          )
          .subscribe();
      } catch (err) {
        console.error("Error setting up user data in Navbar:", err);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setupUser(session.user);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => setupUser(session?.user ?? null)
    );

    return () => {
      authListener.subscription.unsubscribe();
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadNotifs(0);
  };

  const handleNotifClick = async (notif: any) => {
    if (!notif.read) {
      await supabase.from("notifications").update({ read: true }).eq("id", notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
      );
      setUnreadNotifs((c) => Math.max(0, c - 1));
    }
    if (notif.link) router.push(notif.link);
    setNotificationsOpen(false);
  };

  const iconBtnStyle = {
    color: "var(--text-muted)",
    background: "transparent",
    border: "1px solid var(--glass-border)",
  };

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? "var(--glass-bg)" : "transparent",
          backdropFilter: scrolled ? "blur(24px)" : "none",
          borderBottom: scrolled ? "1px solid var(--border-subtle)" : "1px solid transparent",
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

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Search */}
            <button
              id="navbar-search-btn"
              onClick={() => setSearchOpen(true)}
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200"
              style={iconBtnStyle}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(108,92,231,0.4)";
                (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--glass-border)";
                (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
              }}
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Theme Toggle */}
            {mounted && (
              <button
                id="navbar-theme-btn"
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200"
                style={iconBtnStyle}
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

            {/* Messages Icon with unread badge */}
            <Link
              id="navbar-messages-btn"
              href="/messages"
              className="relative w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200"
              style={iconBtnStyle}
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
              {unreadMessages > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                  style={{ background: "var(--accent-primary)" }}
                >
                  {unreadMessages > 99 ? "99+" : unreadMessages}
                </motion.span>
              )}
            </Link>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                id="navbar-notifications-btn"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200"
                style={iconBtnStyle}
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
                {unreadNotifs > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                    style={{ background: "#e84393" }}
                  >
                    {unreadNotifs > 99 ? "99+" : unreadNotifs}
                  </motion.span>
                )}
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col"
                    style={{ background: "var(--bg-deep)", border: "1px solid var(--glass-border)" }}
                  >
                    {/* Header */}
                    <div
                      className="p-3 flex items-center justify-between"
                      style={{ borderBottom: "1px solid var(--border-subtle)" }}
                    >
                      <span className="font-semibold text-white text-sm">Notifications</span>
                      {unreadNotifs > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs hover:underline"
                          style={{ color: "var(--accent-primary)" }}
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    {/* List */}
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div
                          className="p-6 text-center text-sm"
                          style={{ color: "var(--text-muted)" }}
                        >
                          <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((notif: any) => (
                          <div
                            key={notif.id}
                            onClick={() => handleNotifClick(notif)}
                            className="flex gap-3 p-3 cursor-pointer transition-colors"
                            style={{
                              borderBottom: "1px solid var(--border-subtle)",
                              background: !notif.read
                                ? "rgba(108,92,231,0.08)"
                                : "transparent",
                            }}
                            onMouseEnter={(e) =>
                              ((e.currentTarget as HTMLElement).style.background =
                                "var(--bg-surface)")
                            }
                            onMouseLeave={(e) =>
                              ((e.currentTarget as HTMLElement).style.background = !notif.read
                                ? "rgba(108,92,231,0.08)"
                                : "transparent")
                            }
                          >
                            {/* Avatar + type emoji */}
                            <div className="relative w-10 h-10 rounded-full bg-[var(--bg-surface)] overflow-visible flex-shrink-0">
                              <div className="w-10 h-10 rounded-full overflow-hidden">
                                {notif.from_user?.avatar_url ? (
                                  <img
                                    src={notif.from_user.avatar_url}
                                    alt="avatar"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div
                                    className="w-full h-full flex items-center justify-center"
                                    style={{ background: "var(--bg-elevated)" }}
                                  >
                                    <User className="w-5 h-5" style={{ color: "var(--text-muted)" }} />
                                  </div>
                                )}
                              </div>
                              <span
                                className="absolute -bottom-1 -right-1 text-[11px] leading-none rounded-full w-4 h-4 flex items-center justify-center"
                                style={{ background: "var(--bg-deep)" }}
                              >
                                {NOTIF_EMOJI[notif.type] || "🔔"}
                              </span>
                            </div>

                            {/* Text */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white line-clamp-2">
                                <span className="font-semibold">
                                  {notif.from_user?.display_name ||
                                    notif.from_user?.handle ||
                                    "Someone"}
                                </span>{" "}
                                {NOTIF_TEXT[notif.type] || notif.message || "sent you a notification."}
                              </p>
                              <span
                                className="text-xs mt-1 block"
                                style={{ color: "var(--text-muted)" }}
                              >
                                {formatDistanceToNow(new Date(notif.created_at), {
                                  addSuffix: true,
                                })}
                              </span>
                            </div>

                            {/* Unread dot */}
                            {!notif.read && (
                              <span
                                className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                                style={{ background: "#e84393" }}
                              />
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile */}
            {user ? (
              <div className="relative">
                <button
                  id="navbar-profile-btn"
                  className="h-9 flex items-center gap-2 rounded-full overflow-hidden transition-colors p-0.5 pr-3"
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)",
                  }}
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs overflow-hidden"
                    style={{ backgroundColor: "var(--accent-primary)", color: "var(--bg-void)" }}
                  >
                    {userProfile?.avatar_url ? (
                      <img
                        src={userProfile.avatar_url}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (
                        userProfile?.display_name ||
                        userProfile?.handle ||
                        user.email
                      )
                        ?.charAt(0)
                        .toUpperCase()
                    )}
                  </div>
                  {userProfile?.handle && (
                    <span
                      className="text-sm font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      @{userProfile.handle}
                    </span>
                  )}
                </button>

                {profileDropdownOpen && (
                  <RevealEffect
                    className="absolute right-0 top-full mt-2 w-48 rounded-xl shadow-2xl py-1 z-50 overflow-hidden"
                    style={{
                      backgroundColor: "var(--bg-elevated)",
                      border: "1px solid var(--glass-border)",
                    }}
                  >
                    <Link
                      href="/studio/me"
                      className="flex items-center gap-2 px-4 py-2 text-sm transition-colors"
                      style={{ color: "var(--text-secondary)" }}
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-2 px-4 py-2 text-sm transition-colors"
                      style={{ color: "var(--text-secondary)" }}
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                    <div
                      className="h-px w-full my-1"
                      style={{ backgroundColor: "var(--border-subtle)" }}
                    />
                    <button
                      onClick={() => {
                        handleLogout();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 transition-colors text-left"
                      style={{ backgroundColor: "transparent" }}
                    >
                      <LogOut className="w-4 h-4" />
                      Log Out
                    </button>
                  </RevealEffect>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium transition-colors mr-2"
                  style={{ color: "var(--text-secondary)" }}
                >
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
              style={{ color: "var(--text-secondary)", border: "1px solid var(--glass-border)" }}
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

      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
