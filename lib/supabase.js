import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Public client for anonymous operations (scoped by RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client for administrative operations (bypasses RLS)
// Only use this in server-side API routes that require elevated privileges
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey) 
  : null
