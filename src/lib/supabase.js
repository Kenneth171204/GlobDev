import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

/** false kalau .env belum diisi → App menampilkan petunjuk setup. */
export const supabaseSiap = Boolean(url && key)

// PKCE: alur OAuth (login Google) yang direkomendasikan untuk aplikasi di browser.
export const supabase = supabaseSiap ? createClient(url, key, { auth: { flowType: 'pkce' } }) : null
