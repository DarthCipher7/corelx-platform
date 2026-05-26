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

  return (
    <OrgClient
      orgUser={orgUser}
      initialMembers={members || []}
      initialPosts={posts || []}
      currentUser={currentUser}
      initialMemberRole={initialMemberRole}
    />
  );
}
