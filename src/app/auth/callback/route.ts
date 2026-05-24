import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/feed'
  // These are passed from email signup to preserve the user's chosen identity
  const chosenHandle = searchParams.get('handle') || ''
  const chosenName = searchParams.get('display_name') || ''

  if (code) {
    const supabase = await createClient()
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && session?.user) {
      const user = session.user;
      const metadata = user.user_metadata || {};
      const fullName = chosenName || metadata.full_name || '';
      const avatarUrl = metadata.avatar_url || '';
      const email = user.email || '';
      
      // Use chosen handle first, then fall back to generating from name/email
      let baseHandle = chosenHandle || fullName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '.')
        .replace(/\.+/g, '.')
        .replace(/^\.|\.$/g, '');
        
      if (!baseHandle) {
        baseHandle = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '.');
      }
      if (!baseHandle) {
        baseHandle = `user.${Math.floor(1000 + Math.random() * 9000)}`;
      }
      
      // Check if user record already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, handle, avatar_url, display_name')
        .eq('id', user.id)
        .maybeSingle();
        
      if (!existingUser) {
        let handleToUse = baseHandle;
        
        // Verify if baseHandle is already taken by another user
        const { data: handleCheck } = await supabase
          .from('users')
          .select('id')
          .eq('handle', baseHandle)
          .maybeSingle();
          
        if (handleCheck) {
          handleToUse = `${baseHandle}.${Math.floor(100 + Math.random() * 900)}`;
        }
        
        await supabase.from('users').insert({
          id: user.id,
          handle: handleToUse,
          display_name: fullName || handleToUse,
          avatar_url: avatarUrl || `https://api.dicebear.com/8.x/lorelei/svg?seed=${handleToUse}&backgroundColor=6c5ce7`,
        });
      } else {
        // Update profile if details are missing or contain placeholder values
        const updatePayload: any = {};
        
        const isDicebear = existingUser.avatar_url?.includes('api.dicebear.com');
        if ((!existingUser.avatar_url || isDicebear) && avatarUrl) {
          updatePayload.avatar_url = avatarUrl;
        }
        
        // If display name is missing or matches the handle (often default), update it with full name
        const isDefaultName = !existingUser.display_name || existingUser.display_name === existingUser.handle;
        if (isDefaultName && fullName) {
          updatePayload.display_name = fullName;
        }
        
        if (Object.keys(updatePayload).length > 0) {
          await supabase.from('users').update(updatePayload).eq('id', user.id);
        }
      }
    }
  }

  return NextResponse.redirect(`${origin}${next}`)
}
