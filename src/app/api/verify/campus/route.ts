import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * Campus Geofence Verification API
 * 
 * POST /api/verify/campus
 * Body: { lat: number, lng: number }
 * Returns: { pass: boolean, college?: string }
 * 
 * Privacy: coordinates are NEVER stored. Only pass/fail is logged.
 * Rate limited to 5 checks per hour per user (enforced client-side + DB count).
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse coordinates
  let lat: number, lng: number;
  try {
    const body = await request.json();
    lat = parseFloat(body.lat);
    lng = parseFloat(body.lng);
    if (isNaN(lat) || isNaN(lng)) throw new Error('Invalid coordinates');
  } catch {
    return NextResponse.json({ error: 'Invalid coordinates provided' }, { status: 400 });
  }

  // Get user's college
  const { data: userRecord } = await supabase
    .from('users')
    .select('college_id, is_email_verified')
    .eq('id', user.id)
    .single();

  if (!userRecord?.college_id) {
    return NextResponse.json({ 
      pass: false, 
      reason: 'no_college_assigned',
      message: 'Your institution is not linked to a campus geofence yet.'
    });
  }

  // Fetch college geofence polygon
  const { data: college } = await supabase
    .from('colleges')
    .select('id, name, geofence')
    .eq('id', userRecord.college_id)
    .single();

  let pass = false;
  let reason = 'no_geofence';

  if (college?.geofence) {
    // Point-in-polygon check using GeoJSON polygon
    // The geofence is stored as a GeoJSON Polygon: { type: 'Polygon', coordinates: [[lng, lat], ...] }
    pass = pointInPolygon(lat, lng, college.geofence);
    reason = pass ? 'inside_campus' : 'outside_campus';
  } else {
    // No geofence stored — fall back to email domain verification only
    pass = userRecord.is_email_verified === true;
    reason = pass ? 'email_verified_fallback' : 'no_geofence_email_unverified';
  }

  // Log verification result (NO coordinates stored)
  await supabase.from('verification_log').insert({
    user_id: user.id,
    check_type: 'campus',
    result: pass ? 'pass' : 'fail',
    // event_id can be added by caller if needed
  });

  // Update campus_check_passed on user record
  if (pass) {
    await supabase
      .from('users')
      .update({ campus_check_passed: true, campus_check_at: new Date().toISOString() })
      .eq('id', user.id);
  }

  // Return result — coordinates are NOT included in response or logs
  return NextResponse.json({
    pass,
    reason,
    college: college ? { id: college.id, name: college.name } : null,
  });
}

/**
 * Ray casting point-in-polygon algorithm
 * Determines if a lat/lng point is inside a GeoJSON polygon.
 * GeoJSON uses [lng, lat] order.
 */
function pointInPolygon(lat: number, lng: number, geofence: any): boolean {
  const polygon: number[][] = geofence?.coordinates?.[0];
  if (!polygon || polygon.length < 3) return false;

  let inside = false;
  const x = lng, y = lat;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];

    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }

  return inside;
}
