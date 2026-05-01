import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

export function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  return Boolean(url && key && url !== 'undefined')
}

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null
  if (client) return client
  const url = import.meta.env.VITE_SUPABASE_URL as string
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string
  client = createClient(url, key)
  return client
}

export function getSupabaseOrThrow(): SupabaseClient {
  const c = getSupabase()
  if (!c) throw new Error('Supabase が未設定です。.env に VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY を設定してください。')
  return c
}
