import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import StudioClient from "./StudioClient";

export default async function StudioPage({ params }: { params: Promise<{ handle: string }> }) {
  const resolvedParams = await params;
  let handle = resolvedParams.handle;

  const supabase = await createClient();

  if (handle === "me") {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      redirect("/login");
    }
    const { data: userMeta } = await supabase
      .from("users")
      .select("handle")
      .eq("id", user.id)
      .single();

    if (userMeta?.handle) {
      redirect(`/studio/${userMeta.handle}`);
    } else {
      notFound();
    }
  }

  // Fetch user_type to determine redirect
  const { data: userProfile, error } = await supabase
    .from("users")
    .select("user_type")
    .eq("handle", handle)
    .maybeSingle();

  if (error || !userProfile) {
    notFound();
  }

  if (userProfile.user_type === "organisation") {
    redirect(`/orgs/${handle}`);
  } else if (userProfile.user_type === "company") {
    redirect(`/companies/${handle}`);
  }

  return <StudioClient handle={handle} />;
}
