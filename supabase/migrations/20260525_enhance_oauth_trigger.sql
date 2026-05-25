-- Update handle_new_user() trigger function to extract avatar, display name, and user_type from raw_user_meta_data for OAuth/Signup users.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  base_handle text;
  final_handle text;
  counter integer := 1;
  meta_fullname text;
  meta_avatar text;
  meta_user_type text;
BEGIN
  -- Extract OAuth/Signup metadata details
  meta_fullname := new.raw_user_meta_data->>'full_name';
  IF meta_fullname IS NULL OR meta_fullname = '' THEN
    meta_fullname := new.raw_user_meta_data->>'name';
  END IF;
  
  meta_avatar := new.raw_user_meta_data->>'avatar_url';
  IF meta_avatar IS NULL OR meta_avatar = '' THEN
    meta_avatar := new.raw_user_meta_data->>'picture';
  END IF;

  meta_user_type := new.raw_user_meta_data->>'user_type';
  IF meta_user_type IS NULL OR meta_user_type = '' THEN
    meta_user_type := 'individual';
  END IF;

  -- Generate base handle from email, or fallback to full name, or fallback to 'user'
  IF new.email IS NOT NULL AND new.email <> '' THEN
    base_handle := split_part(new.email, '@', 1);
  ELSIF meta_fullname IS NOT NULL AND meta_fullname <> '' THEN
    base_handle := regexp_replace(meta_fullname, '\s+', '', 'g');
  ELSE
    base_handle := 'user';
  END IF;
  
  base_handle := regexp_replace(base_handle, '[^a-zA-Z0-9]', '', 'g');
  IF base_handle = '' THEN
    base_handle := 'user';
  END IF;
  
  final_handle := base_handle;
  WHILE EXISTS (SELECT 1 FROM public.users WHERE handle = final_handle) LOOP
    final_handle := base_handle || counter::text;
    counter := counter + 1;
  END LOOP;

  INSERT INTO public.users (
    id, 
    handle, 
    display_name, 
    avatar_url, 
    tagline, 
    availability_status,
    user_type
  )
  VALUES (
    new.id,
    final_handle,
    coalesce(meta_fullname, split_part(new.email, '@', 1), final_handle),
    coalesce(meta_avatar, 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || final_handle),
    '',
    'open-to-collab',
    meta_user_type
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
