import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import CompanyClient from "./CompanyClient";

export default async function CompanyPage({ params }: { params: Promise<{ handle: string }> }) {
  const resolvedParams = await params;
  const handle = resolvedParams.handle;

  const supabase = await createClient();

  // Fetch company profile details
  const { data: companyUser, error: userError } = await supabase
    .from("users")
    .select("*, company_accounts!company_accounts_id_fkey(*)")
    .eq("handle", handle)
    .maybeSingle();

  if (userError || !companyUser || companyUser.user_type !== "company") {
    notFound();
  }

  // Get current logged-in user
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  // Check if current user is an admin of this company
  let isAdmin = false;
  if (currentUser) {
    if (currentUser.id === companyUser.id) {
      isAdmin = true;
    } else {
      const { data: adminRecord } = await supabase
        .from("company_admins")
        .select("role")
        .eq("company_id", companyUser.id)
        .eq("user_id", currentUser.id)
        .maybeSingle();
      
      if (adminRecord) {
        isAdmin = true;
      }
    }
  }

  // If admin, fetch direct Reach pitches with sender profile details
  let reachMessages: any[] = [];
  if (isAdmin) {
    const { data } = await supabase
      .from("reach_messages")
      .select("*, sender_profile:users(*)")
      .eq("company_id", companyUser.id)
      .order("created_at", { ascending: false });
    
    reachMessages = data || [];
  }

  // Fetch any collab calls posted by this company
  let collabs: any[] = [];
  try {
    const { data } = await supabase
      .from("collab_calls")
      .select("*")
      .eq("user_id", companyUser.id)
      .order("created_at", { ascending: false });
    
    collabs = data || [];
  } catch (e) {
    console.warn("Could not query collab_calls table:", e);
  }

  // Fetch company feed posts
  let feedPosts: any[] = [];
  try {
    const { data } = await supabase
      .from("feed_posts")
      .select("*")
      .eq("user_id", companyUser.id)
      .order("created_at", { ascending: false });
    feedPosts = data || [];
  } catch (e) {
    console.warn("Could not query feed_posts table:", e);
  }

  // Fetch events organized by this company
  let events: any[] = [];
  try {
    const { data } = await supabase
      .from("events")
      .select("*")
      .eq("organiser_id", companyUser.id)
      .order("starts_at", { ascending: true });
    events = data || [];
  } catch (e) {
    console.warn("Could not query events table:", e);
  }

  // Fetch approved campus partnerships
  let partnerships: any[] = [];
  try {
    const { data } = await supabase
      .from("campus_partnerships")
      .select("*, org:org_accounts(id, name, logo_url)")
      .eq("company_id", companyUser.id)
      .eq("status", "approved");
    partnerships = data || [];
  } catch (e) {
    console.warn("Could not query campus_partnerships table:", e);
  }

  // Fetch team members (company admins)
  let teamMembers: any[] = [];
  try {
    const { data } = await supabase
      .from("company_admins")
      .select("*, profile:users(id, display_name, handle, avatar_url)")
      .eq("company_id", companyUser.id);
    teamMembers = data || [];
  } catch (e) {
    console.warn("Could not query company_admins table:", e);
  }

  // Fetch pods created by this company
  let pods: any[] = [];
  try {
    const { data } = await supabase
      .from("pods")
      .select(`
        *,
        creator:users!pods_creator_id_fkey(id, handle, display_name, avatar_url, pulse_score),
        colleges(name, short_name, hub_type),
        pod_members(user_id)
      `)
      .eq("creator_id", companyUser.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    pods = data || [];
  } catch (e) {
    console.warn("Could not query pods for company:", e);
  }

  return (
    <CompanyClient
      companyUser={companyUser}
      currentUser={currentUser}
      isAdmin={isAdmin}
      initialReachMessages={reachMessages}
      initialCollabs={collabs}
      initialFeedPosts={feedPosts}
      initialEvents={events}
      initialPartnerships={partnerships}
      initialTeamMembers={teamMembers}
      initialPods={pods}
    />
  );
}
