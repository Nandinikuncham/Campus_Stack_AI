import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function getValidSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (url && (url.startsWith('https://') || url.startsWith('http://'))) {
    return url
  }
  return 'https://placeholder.supabase.co'
}

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    getValidSupabaseUrl(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key',
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}

export async function createAdminClient() {
  const cookieStore = await cookies()
  return createServerClient(
    getValidSupabaseUrl(),
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key',
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
