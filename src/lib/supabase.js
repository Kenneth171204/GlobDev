import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

/** true kalau .env sudah diisi. Kalau belum, App menampilkan petunjuk setup. */
export const supabaseSiap = Boolean(url && key)

export const supabase = supabaseSiap ? createClient(url, key) : null
