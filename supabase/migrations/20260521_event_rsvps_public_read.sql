-- Drop the restricted select policies on event_rsvps to allow correct headcount calculations for guests
DROP POLICY IF EXISTS "Users see their own RSVPs" ON public.event_rsvps;
DROP POLICY IF EXISTS "Organisers see RSVPs for their events" ON public.event_rsvps;

-- Create public select policy so anyone can see RSVPs (required for counting attendees and displaying guest lists)
CREATE POLICY "Anyone can read event RSVPs" ON public.event_rsvps
    FOR SELECT
    USING (true);

-- Drop the restricted select policy on pod_members to allow correct member counts and member list visibility
DROP POLICY IF EXISTS "Pod members can read member list" ON public.pod_members;
CREATE POLICY "Anyone can read pod members" ON public.pod_members
    FOR SELECT
    USING (true);
