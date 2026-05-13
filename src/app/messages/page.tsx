"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MessageSquare, ArrowLeft } from "lucide-react";

export default function MessagesPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function loadConversations() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setCurrentUser(user);

      // Fetch all messages for the current user
      const { data } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id (id, handle, display_name, avatar_url),
          recipient:recipient_id (id, handle, display_name, avatar_url)
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (data) {
        // Group by the other user
        const map = new Map();
        for (const msg of data) {
          const otherUser = msg.sender_id === user.id ? msg.recipient : msg.sender;
          if (!map.has(otherUser.id)) {
            map.set(otherUser.id, {
              otherUser,
              latestMessage: msg
            });
          }
        }
        setConversations(Array.from(map.values()));
      }
      setLoading(false);
    }
    
    loadConversations();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-4 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-24 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.back()} className="p-2 rounded-full transition-colors hover:bg-black/10" style={{ color: "var(--text-secondary)" }}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-display font-bold" style={{ color: "var(--text-primary)" }}>Messages</h1>
        </div>

        <div className="rounded-3xl shadow-2xl overflow-hidden" style={{ backgroundColor: "var(--bg-elevated)", border: "1px solid var(--glass-border)" }}>
          {conversations.length === 0 ? (
            <div className="p-12 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" style={{ color: "var(--text-muted)" }} />
              <h3 className="text-xl font-medium mb-2" style={{ color: "var(--text-primary)" }}>No messages yet</h3>
              <p style={{ color: "var(--text-secondary)" }}>Start a conversation by visiting a creator's profile.</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
              {conversations.map((conv) => (
                <Link 
                  key={conv.otherUser.id}
                  href={`/studio/${conv.otherUser.handle}`}
                  className="flex items-center gap-4 p-4 transition-colors"
                  style={{ backgroundColor: "var(--bg-deep)" }}
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 flex items-center justify-center text-white font-bold" style={{ backgroundColor: "var(--accent-primary)" }}>
                    {conv.otherUser.avatar_url ? (
                      <img src={conv.otherUser.avatar_url} alt={conv.otherUser.display_name} className="w-full h-full object-cover" />
                    ) : (
                      (conv.otherUser.display_name || conv.otherUser.handle).charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                        {conv.otherUser.display_name || conv.otherUser.handle}
                      </h4>
                      <span className="text-xs shrink-0 ml-2" style={{ color: "var(--text-muted)" }}>
                        {new Date(conv.latestMessage.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm truncate" style={{ color: "var(--text-secondary)" }}>
                      <span className="opacity-70 mr-1">{conv.latestMessage.sender_id === currentUser.id ? 'You:' : ''}</span>
                      {conv.latestMessage.content}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
