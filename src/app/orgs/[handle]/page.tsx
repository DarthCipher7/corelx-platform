import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import OrgClient from "./OrgClient";

export default async function OrgPage({ params }: { params: Promise<{ handle: string }> }) {
  const resolvedParams = await params;
  const handle = resolvedParams.handle;

  const supabase = await createClient();

  // Fetch the user and join with college & org profile details
  const { data: orgUser, error: userError } = await supabase
    .from("users")
    .select("*, colleges(*), org_accounts!org_accounts_id_fkey(*)")
    .eq("handle", handle)
    .maybeSingle();

  if (userError || !orgUser || orgUser.user_type !== "organisation") {
    notFound();
  }

  // Get current logged-in user
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  // Fetch current user's membership role if any
  let initialMemberRole: string | null = null;
  if (currentUser) {
    const { data: member } = await supabase
      .from("org_members")
      .select("role")
      .eq("org_id", orgUser.id)
      .eq("user_id", currentUser.id)
      .maybeSingle();
    if (member) {
      initialMemberRole = member.role;
    }
  }

  // Fetch all members of this organization
  const { data: members = [] } = await supabase
    .from("org_members")
    .select("*, users(*)")
    .eq("org_id", orgUser.id);

  // Fetch all broadcasts / posts of this organization
  const { data: posts = [] } = await supabase
    .from("org_posts")
    .select("*")
    .eq("org_id", orgUser.id)
    .order("created_at", { ascending: false });

  // Fetch any collab calls posted by this organization
  let collabs: any[] = [];
  try {
    const { data } = await supabase
      .from("collab_calls")
      .select("*")
      .eq("user_id", orgUser.id)
      .order("created_at", { ascending: false });
    collabs = data || [];
  } catch (e) {
    console.warn("Could not query collab_calls for organisation:", e);
  }

  // Fetch all badges issued by this organization
  let badges: any[] = [];
  try {
    const { data } = await supabase
      .from("org_badges")
      .select("*, awarded_to_user:users!org_badges_awarded_to_fkey(id, handle, avatar_url, display_name)")
      .eq("org_id", orgUser.id)
      .order("created_at", { ascending: false });
    badges = data || [];
  } catch (e) {
    console.warn("Could not query org_badges:", e);
  }

  // Fetch approved campus partnerships
  let partnerships: any[] = [];
  try {
    const { data } = await supabase
      .from("campus_partnerships")
      .select("*, company:company_accounts(*, users!company_accounts_id_fkey(handle, avatar_url, display_name))")
      .eq("org_id", orgUser.id)
      .eq("status", "approved");
    partnerships = data || [];
  } catch (e) {
    console.warn("Could not query campus_partnerships for org:", e);
  }

  // Fetch pending join requests (admin only)
  let joinRequests: any[] = [];
  const isAdmin = initialMemberRole === "admin" || initialMemberRole === "creator";
  if (currentUser && isAdmin) {
    try {
      const { data } = await supabase
        .from("org_join_requests")
        .select("*, users(*)")
        .eq("org_id", orgUser.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      joinRequests = data || [];
    } catch (e) {
      console.warn("Could not query org_join_requests:", e);
    }
  }

  return (
    <OrgClient
      orgUser={orgUser}
      initialMembers={members || []}
      initialPosts={posts || []}
      currentUser={currentUser}
      initialMemberRole={initialMemberRole}
      initialCollabs={collabs}
      initialBadges={badges}
      initialPartnerships={partnerships}
      initialJoinRequests={joinRequests}
    />
  );
}
