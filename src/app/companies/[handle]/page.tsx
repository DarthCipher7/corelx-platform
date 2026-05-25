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
    .select("*, company_accounts(*)")
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
      .eq("user_id", companyUser.id);
    
    collabs = data || [];
  } catch (e) {
    console.warn("Could not query collab_calls table:", e);
  }

  return (
    <CompanyClient
      companyUser={companyUser}
      currentUser={currentUser}
      isAdmin={isAdmin}
      initialReachMessages={reachMessages}
      initialCollabs={collabs}
    />
  );
}
