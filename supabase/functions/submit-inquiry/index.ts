import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' }
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  try {
    const body = await req.json()
    if (body.honeypot) return json({ ok: true })
    if (typeof body.elapsed === 'number' && body.elapsed < 3000) return json({ error: 'Please take a moment before sending.' }, 400)
    const name = String(body.name || '').trim().slice(0, 120)
    const email = String(body.email || '').trim().toLowerCase().slice(0, 254)
    const message = String(body.message || '').trim().slice(0, 5000)
    if (!name || !email || !message || !emailRe.test(email)) return json({ error: 'Please enter your name, a valid email and a message.' }, 400)
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { data: recent, error: recentError } = await supabase.from('inquiries').select('id,message,created_at').eq('email', email).gte('created_at', since)
    if (recentError) throw recentError
    if ((recent || []).length >= 3) return json({ error: 'rate_limited' }, 429)
    if ((recent || []).some((r) => r.message === message && Date.now() - new Date(r.created_at).getTime() < 120000)) return json({ ok: true, duplicate: true })
    const { error } = await supabase.from('inquiries').insert({ name, email, country: String(body.country || '').slice(0, 100), business_type: String(body.business_type || '').slice(0, 100), budget_range: String(body.budget_range || '').slice(0, 100), message, status: 'New', priority: 'Normal', is_sample: false })
    if (error) throw error
    await supabase.from('events').insert({ type: 'form_submit', day: new Date().toISOString().slice(0, 10), count: 1 })
    // Optional email notification. Configure RESEND_API_KEY and NOTIFICATION_EMAIL as Edge Function secrets.
    const resendKey = Deno.env.get('RESEND_API_KEY')
    const notify = Deno.env.get('NOTIFICATION_EMAIL')
    if (resendKey && notify) {
      const safe = (v: string) => v.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!))
      await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: Deno.env.get('EMAIL_FROM') || 'Portfolio <onboarding@resend.dev>', to: [notify], subject: `New portfolio enquiry from ${name}`, html: `<h2>New enquiry</h2><p><b>${safe(name)}</b> · ${safe(email)}</p><p>${safe(message)}</p>` }) })
    }
    return json({ ok: true })
  } catch (e) { console.error(e); return json({ error: 'Unable to submit your message right now.' }, 500) }
})
