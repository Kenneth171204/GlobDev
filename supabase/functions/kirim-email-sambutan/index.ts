// Edge Function: kirim email sambutan BulkUp lewat Resend, sekali per user.
//
// Dipanggil aplikasi setelah user login/daftar (email atau Google) bila
// profil.email_sambutan_at masih null. Email hanya dikirim ke alamat user
// yang memanggil (dibaca dari token login), jadi fungsi ini tidak bisa
// dipakai untuk mengirim ke orang lain.
//
// Secret yang dibutuhkan (Supabase → Edge Functions → Secrets):
//   RESEND_API_KEY   API key Resend dengan izin "Sending access"
// Opsional:
//   EMAIL_PENGIRIM   default "BulkUp <onboarding@resend.dev>" (tanpa domain sendiri,
//                    Resend hanya mengirim ke email pemilik akun Resend)
//   URL_APLIKASI     default "https://bulkup.pages.dev"

import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function jawab(status: number, isi: Record<string, unknown>) {
  return new Response(JSON.stringify(isi), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })
}

function amankanHtml(teks: string) {
  return teks.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
}

function isiEmail(nama: string, urlAplikasi: string) {
  const n = amankanHtml(nama)
  const html = `<!doctype html>
<html lang="id"><body style="margin:0;background:#f2f3f6;font-family:Arial,Helvetica,sans-serif;color:#141414">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:20px;overflow:hidden">
        <tr><td style="background:#c2410c;padding:28px 28px 22px;color:#ffffff">
          <div style="font-size:22px;font-weight:900;font-style:italic">BULK<span style="color:#c8f31d">UP</span></div>
          <h1 style="margin:14px 0 0;font-size:26px;line-height:1.25">Selamat datang, ${n}! 💪</h1>
        </td></tr>
        <tr><td style="padding:24px 28px 8px;font-size:16px;line-height:1.6">
          <p style="margin:0 0 14px">Akun BulkUp-mu sudah aktif. Tiga langkah untuk mulai:</p>
          <ol style="margin:0 0 18px;padding-left:20px">
            <li style="margin-bottom:8px"><strong>Isi berat &amp; tinggi badan</strong> sekali saja. Kami ingatkan seminggu sekali untuk cek ulang.</li>
            <li style="margin-bottom:8px"><strong>Cek target protein harian</strong> di Profil (umumnya 1,6–2,2 g per kg berat badan).</li>
            <li><strong>Catat latihan &amp; protein setiap hari.</strong> Grafik di Statistik terbentuk setelah beberapa hari.</li>
          </ol>
          <p style="margin:0 0 24px"><a href="${urlAplikasi}" style="display:inline-block;background:#1a56db;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:999px">Buka BulkUp</a></p>
        </td></tr>
        <tr><td style="padding:0 28px 24px;font-size:13px;color:#555b68">Kamu menerima email ini karena baru mendaftar di BulkUp.</td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
  const teks = [
    `Selamat datang di BulkUp, ${nama}!`,
    '',
    'Tiga langkah untuk mulai:',
    '1. Isi berat & tinggi badan sekali saja. Kami ingatkan seminggu sekali untuk cek ulang.',
    '2. Cek target protein harian di Profil (umumnya 1,6–2,2 g per kg berat badan).',
    '3. Catat latihan & protein setiap hari. Grafik di Statistik terbentuk setelah beberapa hari.',
    '',
    `Buka BulkUp: ${urlAplikasi}`,
  ].join('\n')
  return { html, teks }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return jawab(405, { error: 'Gunakan POST.' })

  const kunciResend = Deno.env.get('RESEND_API_KEY')
  if (!kunciResend) return jawab(500, { error: 'RESEND_API_KEY belum diatur di Supabase Secrets.' })

  // Client dengan token user → semua query tunduk pada RLS milik user itu.
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
  })
  const { data: { user }, error: galatUser } = await supabase.auth.getUser()
  if (galatUser || !user?.email) return jawab(401, { error: 'Harus login.' })

  // "Klaim" pengiriman secara atomik: hanya satu panggilan yang mendapat baris ini,
  // jadi email tidak terkirim dua kali walau fungsi dipanggil bersamaan.
  const { data: klaim, error: galatKlaim } = await supabase
    .from('profil')
    .update({ email_sambutan_at: new Date().toISOString() })
    .eq('id', user.id)
    .is('email_sambutan_at', null)
    .select('nama')
    .maybeSingle()
  if (galatKlaim) return jawab(500, { error: galatKlaim.message })
  if (!klaim) return jawab(200, { terkirim: false, alasan: 'Email sambutan sudah pernah dikirim.' })

  const urlAplikasi = Deno.env.get('URL_APLIKASI') ?? 'https://bulkup.pages.dev'
  const { html, teks } = isiEmail(klaim.nama || 'kamu', urlAplikasi)

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${kunciResend}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: Deno.env.get('EMAIL_PENGIRIM') ?? 'BulkUp <onboarding@resend.dev>',
      to: [user.email],
      subject: `Selamat datang di BulkUp, ${klaim.nama || 'kamu'}! 💪`,
      html,
      text: teks,
    }),
  })

  if (!res.ok) {
    // Gagal kirim → lepas klaim supaya bisa dicoba lagi di login berikutnya.
    await supabase.from('profil').update({ email_sambutan_at: null }).eq('id', user.id)
    const detail = await res.text()
    console.error('Resend gagal', res.status, detail)
    return jawab(502, { error: 'Gagal mengirim email.', status_resend: res.status, detail })
  }

  const hasil = await res.json()
  return jawab(200, { terkirim: true, id: hasil.id })
})
