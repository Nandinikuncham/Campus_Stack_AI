import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const isValidUrl = (url?: string) => {
    if (!url) return false
    try {
      const parsed = new URL(url)
      return parsed.protocol === 'http:' || parsed.protocol === 'https:'
    } catch {
      return false
    }
  }

  // If Supabase isn't configured or URL is invalid, allow request through gracefully
  if (!isValidUrl(supabaseUrl) || !supabaseAnonKey) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // Check college email domain if user is authenticated
  const isCollegeEmail = user?.email?.toLowerCase().endsWith('@gvpcew.ac.in')
  if (user && !isCollegeEmail) {
    // Non-college email detected: sign out session and force back to login
    await supabase.auth.signOut()
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('error', 'unauthorized_domain')
    return NextResponse.redirect(redirectUrl)
  }

  const protectedPaths = ['/dashboard', '/questions/ask', '/profile/edit', '/notifications', '/ai-assistant', '/leaderboard', '/admin']

  if (protectedPaths.some(p => pathname.startsWith(p)) && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if ((pathname === '/login' || pathname === '/signup') && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
}

export default proxy
