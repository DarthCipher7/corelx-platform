import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-anon-key',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Ensure unauthenticated users can still view all main pages
  const isPublicRoute = request.nextUrl.pathname === '/' || 
                        request.nextUrl.pathname.startsWith('/feed') || 
                        request.nextUrl.pathname.startsWith('/explore') ||
                        request.nextUrl.pathname.startsWith('/collabs') ||
                        request.nextUrl.pathname.startsWith('/pods') ||
                        request.nextUrl.pathname.startsWith('/events') ||
                        request.nextUrl.pathname.startsWith('/showcase') ||
                        request.nextUrl.pathname.startsWith('/studio') ||
                        request.nextUrl.pathname.startsWith('/auth') ||
                        request.nextUrl.pathname.startsWith('/api') ||
                        request.nextUrl.pathname === '/login' ||
                        request.nextUrl.pathname === '/signup';

  // If user is authenticated, check they've completed onboarding (tagline is set)
  // The DB trigger creates the row with tagline = '' — Step 3 of signup writes a real value.
  if (user && request.nextUrl.pathname !== '/signup' && !request.nextUrl.pathname.startsWith('/auth') && !request.nextUrl.pathname.startsWith('/api')) {
    const { data: publicUser } = await supabase
      .from('users')
      .select('id, tagline')
      .eq('id', user.id)
      .maybeSingle()

    // Redirect to /signup only if no row exists OR tagline is still empty
    if (!publicUser || !publicUser.tagline || publicUser.tagline.trim() === '') {
      const url = request.nextUrl.clone()
      url.pathname = '/signup'
      return NextResponse.redirect(url)
    }
  }

  // Protect all other routes
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/feed' // Redirect to /feed if not logged in
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
