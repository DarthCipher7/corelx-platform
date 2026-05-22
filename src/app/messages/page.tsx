"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Send, CheckCheck, MoreVertical, Flame } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

interface UserProfile {
  id: string;
  handle: string;
  display_name: string;
  avatar_url?: string;
  is_online?: boolean;
}

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export default function MessagesPage() {
  const supabase = createClient();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [search, setSearch] = useState("");
  
  // Data
  const [threads, setThreads] = useState<UserProfile[]>([]);
  const [activeThread, setActiveThread] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  
  const [loading, setLoading] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle textarea auto-resize
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = Math.min(scrollHeight, 120) + 'px';
    }
  };

  useEffect(() => {
    async function loadInitialData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login?next=/messages");
        return;
      }
      setCurrentUser(user);

      try {
        // Fetch users the current user has chatted with
        const { data: recentMessages } = await supabase
          .from('messages')
          .select('sender_id, recipient_id, created_at')
          .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
          .order('created_at', { ascending: false });

        let loadedThreads: UserProfile[] = [];

        if (recentMessages && recentMessages.length > 0) {
          // Extract unique counterparty IDs
          const partnerIds = Array.from(new Set(
            recentMessages.map(m => m.sender_id === user.id ? m.recipient_id : m.sender_id)
          ));

          if (partnerIds.length > 0) {
            const { data: users } = await supabase
              .from('users')
              .select('id, handle, display_name, avatar_url, availability_status')
              .in('id', partnerIds);

            if (users) {
              loadedThreads = users.map(u => ({
                id: u.id,
                handle: u.handle,
                display_name: u.display_name || u.handle,
                avatar_url: u.avatar_url || undefined,
                is_online: u.availability_status === 'Available for work'
              }));
            }
          }
        } else {
          // Mock some threads for empty state preview
          loadedThreads = [
            { id: "mock-1", handle: "aria.creates", display_name: "Aria Chen", is_online: true, avatar_url: "https://api.dicebear.com/8.x/lorelei/svg?seed=aria&backgroundColor=6c5ce7" },
            { id: "mock-2", handle: "eli.motion", display_name: "Eli Ramos", is_online: false, avatar_url: "https://api.dicebear.com/8.x/lorelei/svg?seed=eli&backgroundColor=a29bfe" },
            { id: "mock-3", handle: "lunavisuals", display_name: "Luna Voss", is_online: true, avatar_url: "https://api.dicebear.com/8.x/lorelei/svg?seed=luna&backgroundColor=fd79a8" }
          ];
        }

        // Retrieve 'with' query parameter inside useEffect
        const searchParams = new URLSearchParams(window.location.search);
        const withUserId = searchParams.get("with");

        if (withUserId) {
          const existingThread = loadedThreads.find(t => t.id === withUserId);
          if (existingThread) {
            setThreads(loadedThreads);
            setActiveThread(existingThread);
          } else {
            // Fetch user details from supabase
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('id, handle, display_name, avatar_url, availability_status')
              .eq('id', withUserId)
              .single();

            if (userData && !userError) {
              const newThread: UserProfile = {
                id: userData.id,
                handle: userData.handle,
                display_name: userData.display_name || userData.handle,
                avatar_url: userData.avatar_url || undefined,
                is_online: userData.availability_status === 'Available for work'
              };
              const updatedThreads = [newThread, ...loadedThreads];
              setThreads(updatedThreads);
              setActiveThread(newThread);
            } else {
              setThreads(loadedThreads);
              if (loadedThreads.length > 0) {
                setActiveThread(loadedThreads[0]);
              }
            }
          }
        } else {
          setThreads(loadedThreads);
          if (loadedThreads.length > 0) {
            setActiveThread(loadedThreads[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load threads", err);
      }
      setLoading(false);
    }
    
    loadInitialData();
  }, [supabase, router]);

  // Load messages when active thread changes
  useEffect(() => {
    async function loadMessages() {
      if (!currentUser || !activeThread || activeThread.id.startsWith("mock")) {
        // Load mock messages for mock threads
        if (activeThread?.id === "mock-1") {
          setMessages([
            { id: "m1", sender_id: activeThread.id, recipient_id: currentUser?.id || "me", content: "Hey! Loved your recent Flare on the UI animations.", is_read: true, created_at: new Date(Date.now() - 3600000).toISOString() },
            { id: "m2", sender_id: currentUser?.id || "me", recipient_id: activeThread.id, content: "Thank you so much Aria! Really appreciate it.", is_read: true, created_at: new Date(Date.now() - 3500000).toISOString() }
          ]);
        } else {
          setMessages([]);
        }
        return;
      }

      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUser.id},recipient_id.eq.${activeThread.id}),and(sender_id.eq.${activeThread.id},recipient_id.eq.${currentUser.id})`)
        .order('created_at', { ascending: true });

      if (data) {
        setMessages(data);
      }
    }

    loadMessages();

    // Set up Realtime subscription
    if (currentUser && activeThread && !activeThread.id.startsWith("mock")) {
      const channel = supabase.channel('messages_changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `recipient_id=eq.${currentUser.id}`
          },
          (payload) => {
            if (payload.new.sender_id === activeThread.id) {
              setMessages(prev => [...prev, payload.new as Message]);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [activeThread, currentUser, supabase]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || !currentUser || !activeThread) return;

    const messageText = inputMessage.trim();
    setInputMessage(""); // Optimistic clear
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    const newMessage: Message = {
      id: `temp-${Date.now()}`,
      sender_id: currentUser.id,
      recipient_id: activeThread.id,
      content: messageText,
      is_read: false,
      created_at: new Date().toISOString()
    };

    // Optimistic UI update
    setMessages(prev => [...prev, newMessage]);

    if (activeThread.id.startsWith("mock")) {
      // Simulate AI bot response
      setTimeout(() => {
        let reply = "That's awesome!";
        const lowerInput = messageText.toLowerCase();
        
        if (activeThread.id === "mock-1") { // Aria
          const ariaReplies = [
            "I love that! The UI animations are super smooth.",
            "Have you considered using a slightly darker gradient for the glassmorphism?",
            "Absolutely. Cyber-minimalism is the way to go!"
          ];
          reply = ariaReplies[Math.floor(Math.random() * ariaReplies.length)];
          if (lowerInput.includes("collab")) reply = "I'm currently full on projects, but I'd love to review your designs anytime!";
        } else if (activeThread.id === "mock-2") { // Eli
          const eliReplies = [
            "Those easing curves could be a bit tighter. Try [0.4, 0, 0.2, 1].",
            "The motion feels a bit heavy, maybe reduce the stiffness?",
            "Great physics on that transition!"
          ];
          reply = eliReplies[Math.floor(Math.random() * eliReplies.length)];
          if (lowerInput.includes("help")) reply = "Send over the Framer Motion code and I'll take a look at the variants.";
        } else if (activeThread.id === "mock-3") { // Luna
          const lunaReplies = [
            "The lighting is beautiful. Very cinematic.",
            "I'd push the neon glow just a bit further on the edges.",
            "The composition is striking. Love the void black background."
          ];
          reply = lunaReplies[Math.floor(Math.random() * lunaReplies.length)];
          if (lowerInput.includes("3d")) reply = "I mostly use Blender for the base models and then light it up in Unreal Engine 5.";
        }

        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          sender_id: activeThread.id,
          recipient_id: currentUser.id,
          content: reply,
          is_read: true,
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiMessage]);
      }, 1500);
    } else {
      const { error } = await supabase.from('messages').insert({
        sender_id: currentUser.id,
        recipient_id: activeThread.id,
        content: messageText
      });

      if (error) {
        console.error("Failed to send message", error);
        // In a real app, we'd mark the message as failed here
      }
    }
  };

  const filteredThreads = threads.filter(t => 
    t.display_name.toLowerCase().includes(search.toLowerCase()) || 
    t.handle.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="min-h-[calc(100vh-80px)] flex items-center justify-center"><div className="w-8 h-8 border-4 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="pt-20 px-4 sm:px-6 pb-6">
      {/* Desktop Split-Pane Layout Container */}
      <div className="messages-layout flex w-full max-w-[1200px] h-[calc(100vh-104px)] mx-auto rounded-3xl border border-[var(--glass-border)] bg-[var(--bg-frosted)] backdrop-blur-2xl overflow-hidden shadow-2xl">
        
        {/* Left Pane: Active Threads */}
        <div className="w-full sm:w-[320px] flex-shrink-0 flex flex-col border-r border-[var(--border-subtle)] bg-[rgba(3,3,8,0.4)]">
          {/* Header */}
          <div className="p-5 border-b border-[var(--border-subtle)]">
            <h2 className="text-xl font-display font-semibold text-white mb-4">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search threads..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] transition-all"
              />
            </div>
          </div>

          {/* Threads List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredThreads.map(thread => (
              <button
                key={thread.id}
                onClick={() => setActiveThread(thread)}
                className={`w-full flex items-center gap-3 p-4 border-l-4 transition-all duration-200 text-left ${
                  activeThread?.id === thread.id 
                    ? "border-[var(--accent-primary)] bg-[var(--bg-surface)]" 
                    : "border-transparent hover:border-[var(--glass-border)] hover:bg-[rgba(255,255,255,0.02)]"
                }`}
              >
                <div className="relative">
                  {thread.avatar_url ? (
                    <img src={thread.avatar_url} alt={thread.handle} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[var(--bg-deep)] border border-[var(--border-subtle)] flex items-center justify-center text-sm font-medium text-white">
                      {thread.handle[0].toUpperCase()}
                    </div>
                  )}
                  {/* Neon Online Indicator */}
                  <div 
                    className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-[var(--bg-void)] ${
                      thread.is_online 
                        ? "bg-[#10b981] shadow-[0_0_8px_#10b981]" 
                        : "bg-[var(--text-muted)]"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white truncate">{thread.display_name}</h3>
                  <p className="text-xs text-[var(--text-muted)] truncate">@{thread.handle}</p>
                </div>
              </button>
            ))}
            
            {filteredThreads.length === 0 && (
              <div className="p-6 text-center text-[var(--text-muted)] text-sm">
                No threads found.
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Chat Log */}
        <div className="hidden sm:flex flex-1 flex-col relative bg-[var(--bg-void)]">
          {activeThread ? (
            <>
              {/* Chat Header */}
              <div className="p-5 border-b border-[var(--border-subtle)] bg-[rgba(3,3,8,0.8)] backdrop-blur-md flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {activeThread.avatar_url ? (
                      <img src={activeThread.avatar_url} alt={activeThread.handle} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[var(--bg-surface)] flex items-center justify-center text-white">
                        {activeThread.handle[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-white">{activeThread.display_name}</h2>
                    <a href={`/studio/${activeThread.handle}`} className="text-xs text-[var(--text-muted)] hover:text-[var(--accent-secondary)] transition-colors">
                      @{activeThread.handle}
                    </a>
                  </div>
                </div>
                <button className="p-2 rounded-full hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Log Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[var(--bg-void)]">
                {/* Handshake/Spark Warning Area (Optional context) */}
                <div className="flex flex-col items-center justify-center my-6">
                  <div className="bg-[rgba(108,92,231,0.05)] border border-[rgba(108,92,231,0.2)] rounded-full px-4 py-1.5 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-[var(--accent-primary)]" />
                    <span className="text-xs font-mono text-[var(--text-secondary)]">Spark Handshake Accepted</span>
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {messages.map((msg, index) => {
                    const isMe = msg.sender_id === currentUser?.id || msg.sender_id === "me";
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                            isMe 
                              ? "bg-[rgba(108,92,231,0.1)] border border-[rgba(108,92,231,0.4)] text-[var(--text-primary)] rounded-br-sm shadow-[0_4px_20px_rgba(108,92,231,0.1)] backdrop-blur-md"
                              : "bg-[var(--bg-surface)] border border-[var(--glass-border)] text-[var(--text-secondary)] rounded-bl-sm backdrop-blur-md"
                          }`}
                        >
                          {msg.content}
                          <div className={`flex items-center gap-1 mt-1 text-[10px] ${isMe ? "justify-end text-[var(--accent-primary)] opacity-80" : "justify-start text-[var(--text-muted)]"}`}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {isMe && <CheckCheck className="w-3 h-3 ml-0.5" />}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-deep)]">
                <div className="relative flex items-end gap-3 max-w-4xl mx-auto">
                  <div className="flex-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl overflow-hidden focus-within:border-[var(--accent-primary)] transition-colors shadow-inner">
                    <textarea
                      ref={textareaRef}
                      value={inputMessage}
                      onChange={handleInput}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      className="w-full bg-transparent p-3.5 text-sm text-white placeholder-[var(--text-muted)] focus:outline-none resize-none custom-scrollbar"
                      rows={1}
                      style={{ minHeight: '48px' }}
                    />
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim()}
                    className={`p-3.5 rounded-full flex-shrink-0 transition-all duration-300 ${
                      inputMessage.trim()
                        ? "bg-[var(--accent-primary)] text-white shadow-[0_0_15px_var(--accent-primary-glow)]"
                        : "bg-[var(--bg-surface)] text-[var(--text-muted)]"
                    }`}
                  >
                    <Send className={`w-5 h-5 ${inputMessage.trim() ? "translate-x-0.5 -translate-y-0.5" : ""}`} />
                  </button>
                </div>
                <div className="text-center mt-2">
                  <span className="text-[10px] text-[var(--text-muted)] font-mono">
                    Press Enter to send, Shift+Enter for new line
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center mb-4">
                <Flame className="w-6 h-6 text-[var(--text-muted)]" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Your Conversations</h3>
              <p className="text-sm text-[var(--text-secondary)] max-w-xs">
                Select a thread from the left to view the chat, or discover new connections via the Explore Network.
              </p>
            </div>
          )}
        </div>

        {/* Mobile View Placeholder */}
        <div className="sm:hidden flex flex-1 items-center justify-center p-4 text-center">
          <p className="text-sm text-[var(--text-muted)]">
            Mobile layout optimized for the native app.<br/>Please use desktop to view messages.
          </p>
        </div>

      </div>
    </div>
  );
}
