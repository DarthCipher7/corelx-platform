import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const entityType = searchParams.get('entity_type') || 'individuals';
    const q = searchParams.get('q') || '';

    // Get current user and their network details for proximity scoring
    const { data: { user } } = await supabase.auth.getUser();
    let followingIds = new Set<string>();
    let currentUserCollegeId: string | null = null;

    if (user) {
      // Fetch followed creators
      const { data: followsData } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);
      
      if (followsData) {
        followsData.forEach(f => followingIds.add(f.following_id));
      }

      // Fetch user college
      const { data: profile } = await supabase
        .from('users')
        .select('college_id')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        currentUserCollegeId = profile.college_id;
      }
    }

    if (entityType === 'individuals') {
      // ── INDIVIDUALS SEARCH & FILTER ──────────────────────────
      const aura = searchParams.get('aura') || '';
      const skillsParam = searchParams.get('skills') || '';
      const collegeParam = searchParams.get('college') || '';
      const collab = searchParams.get('collab') === 'true';

      let dbQuery = supabase
        .from('users')
        .select(`
          id,
          handle,
          display_name,
          avatar_url,
          tagline,
          availability_status,
          created_at,
          pulse_score,
          college_id,
          user_type,
          colleges (
            name,
            short_name
          ),
          skills (
            skill_name
          )
        `)
        .eq('user_type', 'individual');

      // Execute query
      const { data: usersData, error } = await dbQuery;
      if (error) throw error;

      let results = usersData || [];

      // Filter in memory for advanced logic / keyword matches
      if (q) {
        const queryLower = q.toLowerCase();
        results = results.filter(u => 
          (u.display_name && u.display_name.toLowerCase().includes(queryLower)) ||
          (u.handle && u.handle.toLowerCase().includes(queryLower)) ||
          (u.tagline && u.tagline.toLowerCase().includes(queryLower)) ||
          (u.skills && u.skills.some((s: any) => s.skill_name.toLowerCase().includes(queryLower)))
        );
      }

      // Filter by Aura Tier
      if (aura && aura !== 'All') {
        results = results.filter(u => {
          const score = u.pulse_score || 150;
          if (aura === 'Pillar') return score >= 900;
          if (aura === 'Core') return score >= 700 && score < 900;
          if (aura === 'Trusted') return score >= 450 && score < 700;
          if (aura === 'Rising') return score >= 200 && score < 450;
          if (aura === 'New') return score < 200;
          return true;
        });
      }

      // Filter by skills
      if (skillsParam) {
        const targetSkills = skillsParam.split(',').map(s => s.trim().toLowerCase());
        results = results.filter(u => 
          u.skills && u.skills.some((s: any) => targetSkills.includes(s.skill_name.toLowerCase()))
        );
      }

      // Filter by college name / college ID
      if (collegeParam) {
        const collegeLower = collegeParam.toLowerCase();
        results = results.filter(u => {
          const collegeObj = Array.isArray(u.colleges) ? u.colleges[0] : u.colleges;
          return u.college_id === collegeParam || 
            (collegeObj && (
              (collegeObj.name && collegeObj.name.toLowerCase().includes(collegeLower)) ||
              (collegeObj.short_name && collegeObj.short_name.toLowerCase().includes(collegeLower))
            ));
        });
      }

      // Filter by availability
      if (collab) {
        results = results.filter(u => u.availability_status === 'Available for work');
      }

      // Rank results
      const rankedResults = results.map(u => {
        const auraScore = (u.pulse_score || 150) / 1000.0;
        
        const daysOld = (Date.now() - new Date(u.created_at).getTime()) / (1000 * 60 * 60 * 24);
        const recencyScore = Math.exp(-0.05 * Math.max(0, daysOld));

        let proximityScore = 0.0;
        if (followingIds.has(u.id)) {
          proximityScore = 1.0;
        } else if (currentUserCollegeId && u.college_id === currentUserCollegeId) {
          proximityScore = 0.5;
        }

        const score = (0.4 * auraScore) + (0.3 * recencyScore) + (0.3 * proximityScore);

        const collegeObj = Array.isArray(u.colleges) ? u.colleges[0] : u.colleges;

        return {
          id: u.id,
          name: u.display_name || u.handle,
          handle: u.handle,
          avatar: u.avatar_url || "",
          role: u.tagline || "Creator",
          pulse_score: u.pulse_score || 150,
          college: collegeObj ? collegeObj.short_name || collegeObj.name : null,
          skills: u.skills ? u.skills.map((s: any) => s.skill_name) : [],
          availability_status: u.availability_status,
          online: u.availability_status === 'Available for work',
          created_at: u.created_at,
          score
        };
      });

      // Sort by score descending
      rankedResults.sort((a, b) => b.score - a.score);
      return NextResponse.json(rankedResults);

    } else if (entityType === 'pods') {
      // ── ORGANISATIONS (COMMS/CLUBS) SEARCH & FILTER ─────────
      const typeParam = searchParams.get('type') || '';
      const size = searchParams.get('size') || '';
      const joinPolicy = searchParams.get('visibility') || ''; // Maps visibility to join_policy
      const activity = searchParams.get('activity') || '';

      // Load organisations with member counts and user handle
      let dbQuery = supabase
        .from('org_accounts')
        .select(`
          *,
          users:users!org_accounts_id_fkey(handle, avatar_url),
          colleges(name, short_name),
          org_members(user_id)
        `);

      const { data: orgsData, error } = await dbQuery;
      if (error) throw error;

      let results = orgsData || [];

      // Filter in memory for keyword matches
      if (q) {
        const queryLower = q.toLowerCase();
        results = results.filter(o => 
          (o.name && o.name.toLowerCase().includes(queryLower)) ||
          (o.type && o.type.toLowerCase().includes(queryLower))
        );
      }

      // Filter by type
      if (typeParam && typeParam !== 'All') {
        const typeLower = typeParam.toLowerCase();
        results = results.filter(o => o.type && o.type.toLowerCase() === typeLower);
      }

      // Filter by join policy
      if (joinPolicy) {
        results = results.filter(o => o.join_policy === joinPolicy);
      }

      // Filter by size
      if (size) {
        results = results.filter(o => {
          const count = o.org_members ? o.org_members.length : 0;
          if (size === 'small') return count < 10;
          if (size === 'medium') return count >= 10 && count <= 50;
          if (size === 'large') return count > 50;
          return true;
        });
      }

      // Fetch org posts counts for activity score (last 30 days)
      const orgIds = results.map(o => o.id);
      let postCounts: Record<string, number> = {};

      if (orgIds.length > 0) {
        const { data: postData } = await supabase
          .from('org_posts')
          .select('org_id')
          .in('org_id', orgIds)
          .gt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
        
        if (postData) {
          postData.forEach(p => {
            postCounts[p.org_id] = (postCounts[p.org_id] || 0) + 1;
          });
        }
      }

      // Filter by activity
      if (activity) {
        results = results.filter(o => {
          const count = postCounts[o.id] || 0;
          if (activity === 'high') return count >= 3;
          if (activity === 'medium') return count > 0 && count < 3;
          if (activity === 'low') return count === 0;
          return true;
        });
      }

      // Rank results
      const rankedResults = results.map(o => {
        const auraScore = o.verified ? 1.0 : 0.5;

        const daysOld = (Date.now() - new Date(o.created_at).getTime()) / (1000 * 60 * 60 * 24);
        const recencyScore = Math.exp(-0.05 * Math.max(0, daysOld));

        let proximityScore = 0.0;
        if (o.org_members && o.org_members.some((m: any) => followingIds.has(m.user_id))) {
          proximityScore = 0.8;
        } else if (currentUserCollegeId && o.college_id === currentUserCollegeId) {
          proximityScore = 0.5;
        }

        const score = (0.4 * auraScore) + (0.3 * recencyScore) + (0.3 * proximityScore);

        return {
          id: o.id,
          name: o.name,
          handle: o.users?.handle || '',
          logo_url: o.logo_url || '',
          type: o.type,
          join_policy: o.join_policy,
          verified: o.verified,
          memberCount: o.org_members ? o.org_members.length : 0,
          college: o.colleges ? o.colleges.short_name || o.colleges.name : null,
          isMember: user ? o.org_members.some((m: any) => m.user_id === user.id) : false,
          created_at: o.created_at,
          score
        };
      });

      rankedResults.sort((a, b) => b.score - a.score);
      return NextResponse.json(rankedResults);

    } else if (entityType === 'companies') {
      // ── COMPANIES SEARCH & FILTER ────────────────────────────
      const industry = searchParams.get('industry') || '';
      const threshold = searchParams.get('threshold') || '';
      const hiring = searchParams.get('hiring') === 'true';

      let dbQuery = supabase
        .from('company_accounts')
        .select(`
          *,
          users:users!company_accounts_id_fkey(handle),
          company_admins(user_id)
        `);

      const { data: companiesData, error } = await dbQuery;
      if (error) throw error;

      let results = companiesData || [];

      // Filter in memory for keyword matches
      if (q) {
        const queryLower = q.toLowerCase();
        results = results.filter(c => 
          (c.name && c.name.toLowerCase().includes(queryLower)) ||
          (c.industry && c.industry.toLowerCase().includes(queryLower)) ||
          (c.description && c.description.toLowerCase().includes(queryLower))
        );
      }

      // Filter by industry
      if (industry && industry !== 'All') {
        const indLower = industry.toLowerCase();
        results = results.filter(c => c.industry && c.industry.toLowerCase() === indLower);
      }

      // Filter by hiring status
      if (hiring) {
        results = results.filter(c => c.reach_enabled === true && c.reach_paused === false);
      }

      // Filter by Reach threshold
      if (threshold) {
        const threshVal = parseInt(threshold, 10);
        if (!isNaN(threshVal)) {
          results = results.filter(c => c.reach_threshold <= threshVal);
        }
      }

      // Check campus partnerships if college ID exists
      let partneredCompanyIds = new Set<string>();
      if (currentUserCollegeId) {
        const { data: partnerships } = await supabase
          .from('campus_partnerships')
          .select('company_id')
          .eq('college_id', currentUserCollegeId)
          .eq('status', 'active');
        
        if (partnerships) {
          partnerships.forEach(p => partneredCompanyIds.add(p.company_id));
        }
      }

      // Rank results
      const rankedResults = results.map(c => {
        const auraScore = c.verified ? 1.0 : 0.5;

        const daysOld = (Date.now() - new Date(c.created_at).getTime()) / (1000 * 60 * 60 * 24);
        const recencyScore = Math.exp(-0.05 * Math.max(0, daysOld));

        let proximityScore = 0.0;
        if (c.company_admins && c.company_admins.some((a: any) => followingIds.has(a.user_id))) {
          proximityScore = 1.0;
        } else if (partneredCompanyIds.has(c.id)) {
          proximityScore = 0.5;
        }

        const score = (0.4 * auraScore) + (0.3 * recencyScore) + (0.3 * proximityScore);

        return {
          id: c.id,
          name: c.name,
          handle: c.users?.handle || "",
          industry: c.industry,
          size_range: c.size_range,
          website: c.website,
          verified: c.verified,
          logo_url: c.logo_url,
          reach_enabled: c.reach_enabled && !c.reach_paused,
          reach_threshold: c.reach_threshold,
          description: c.description || '',
          isPartnered: partneredCompanyIds.has(c.id),
          score
        };
      });

      rankedResults.sort((a, b) => b.score - a.score);
      return NextResponse.json(rankedResults);
    }

    return NextResponse.json({ error: 'Invalid entity type' }, { status: 400 });

  } catch (error: any) {
    console.error('Explore API error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
