import { createBrowserClient } from '@supabase/ssr'

function getValidSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (url && (url.startsWith('https://') || url.startsWith('http://'))) {
    return url
  }
  return 'https://placeholder.supabase.co'
}

export function createClient() {
  return createBrowserClient(
    getValidSupabaseUrl(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
  )
}
