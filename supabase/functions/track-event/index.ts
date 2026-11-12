import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' }
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405, headers: cors })
  try {
    const { type } = await req.json()
    if (!['page_view','plan_click','project_open','visit_site'].includes(type)) return Response.json({ error: 'Invalid event type' }, { status: 400, headers: cors })
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const { error } = await supabase.from('events').insert({ type, day: new Date().toISOString().slice(0,10), count: 1 })
    if (error) throw error
    return Response.json({ ok: true }, { headers: cors })
  } catch (e) { console.error(e); return Response.json({ error: 'Unable to record event' }, { status: 500, headers: cors }) }
})
