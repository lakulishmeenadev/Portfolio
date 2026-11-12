import { requireSupabase } from '@/lib/supabase'

const TABLES = { Inquiry: 'inquiries', Project: 'projects', FAQ: 'faqs', Testimonial: 'testimonials', SiteSetting: 'site_settings', Event: 'events' }
export function getAdminPassword() { return sessionStorage.getItem('portfolio_admin_session') || '' }
export function setAdminPassword() { sessionStorage.setItem('portfolio_admin_session', '1') }
export function clearAdminPassword() { sessionStorage.removeItem('portfolio_admin_session') }

export async function adminCall(op, payload = {}) {
  const client = requireSupabase()
  if (op === 'stats') {
    const days = payload.days === 30 ? 30 : 7
    const since = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10)
    const { data, error } = await client.from('events').select('type,day,count').gte('day', since)
    if (error) throw error
    const totals = {}; const byDay = {}
    for (const e of data || []) { totals[e.type] = (totals[e.type] || 0) + e.count; byDay[e.day] ||= { day: e.day }; byDay[e.day][e.type] = (byDay[e.day][e.type] || 0) + e.count }
    return { days, totals, series: Object.values(byDay).sort((a,b) => a.day.localeCompare(b.day)) }
  }
  if (op === 'exportInquiries') {
    const { data, error } = await client.from('inquiries').select('*').order('created_at', { ascending: false }).limit(1000)
    if (error) throw error
    const cols = ['created_at','name','email','country','business_type','budget_range','status','priority','message','internal_notes']
    const cell = v => `"${String(v ?? '').replace(/"/g,'""')}"`
    return { csv: [cols.join(','), ...(data || []).map(r => cols.map(c => cell(r[c])).join(','))].join('\n') }
  }
  if (op === 'deleteSamples') {
    const { data, error } = await client.from('inquiries').delete().eq('is_sample', true).select('id')
    if (error) throw error
    return { deleted: data.length }
  }
  if (op === 'draftIntro') {
    const name = String(payload.name || '').trim(); const category = String(payload.category || 'project').trim()
    if (!name) throw new Error('Missing project name')
    return { intro: `${name} is a ${category.toLowerCase()} project. The website presents its key information, services and content in a clear digital experience.` }
  }
  const table = TABLES[payload.entity]
  if (!table) throw new Error('Invalid collection')
  if (op === 'list') {
    let q = client.from(table).select('*')
    if (payload.sort) q = q.order(payload.sort.replace(/^-/, ''), { ascending: !payload.sort.startsWith('-') })
    if (payload.limit) q = q.limit(payload.limit)
    const { data, error } = await q; if (error) throw error; return (data || []).map(r => ({ ...r, created_date: r.created_at, updated_date: r.updated_at }))
  }
  if (op === 'create') { const { data, error } = await client.from(table).insert(payload.data || {}).select().single(); if (error) throw error; return { record: data } }
  if (op === 'update') { const { data, error } = await client.from(table).update(payload.data || {}).eq('id', payload.id).select().single(); if (error) throw error; return { record: data } }
  if (op === 'delete') { const { error } = await client.from(table).delete().eq('id', payload.id); if (error) throw error; return { ok: true } }
  if (op === 'bulkCreate') { const { data, error } = await client.from(table).insert(payload.items || []).select(); if (error) throw error; return { records: data } }
  throw new Error(`Unknown operation: ${op}`)
}
export async function uploadPublicImage(file) {
  const client = requireSupabase(); const ext = file.name.split('.').pop() || 'bin'; const path = `${crypto.randomUUID()}.${ext}`
  const { error } = await client.storage.from('portfolio-media').upload(path, file, { contentType: file.type })
  if (error) throw error
  return client.storage.from('portfolio-media').getPublicUrl(path).data.publicUrl
}
