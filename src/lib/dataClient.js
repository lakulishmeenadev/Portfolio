// Data and auth client backed entirely by Supabase.
import { requireSupabase } from '@/lib/supabase'

const TABLES = { Project: 'projects', FAQ: 'faqs', Testimonial: 'testimonials', SiteSetting: 'site_settings', Inquiry: 'inquiries', Event: 'events', User: 'profiles' }
const mapRow = (row) => row ? ({ ...row, created_date: row.created_at, updated_date: row.updated_at }) : row
const mapRows = (rows) => (rows || []).map(mapRow)

const entities = new Proxy({}, { get: (_, entity) => {
  const table = TABLES[entity]
  if (!table) throw new Error(`Unknown data collection: ${String(entity)}`)
  return {
    async list(sort, limit) {
      let q = requireSupabase().from(entity === 'SiteSetting' ? 'public_site_settings' : table).select('*')
      if (sort) q = q.order(sort.replace(/^-/, ''), { ascending: !sort.startsWith('-') })
      if (limit) q = q.limit(limit)
      const { data, error } = await q
      if (error) throw error
      return mapRows(data)
    },
    async filter(filters = {}, sort, limit) {
      let q = requireSupabase().from(table).select('*')
      for (const [key, value] of Object.entries(filters)) q = q.eq(key, value)
      if (sort) q = q.order(sort.replace(/^-/, ''), { ascending: !sort.startsWith('-') })
      if (limit) q = q.limit(limit)
      const { data, error } = await q
      if (error) throw error
      return mapRows(data)
    },
    async get(id) { const { data, error } = await requireSupabase().from(table).select('*').eq('id', id).single(); if (error) throw error; return mapRow(data) },
    async create(values) { const { data, error } = await requireSupabase().from(table).insert(values).select().single(); if (error) throw error; return mapRow(data) },
    async update(id, values) { const { data, error } = await requireSupabase().from(table).update(values).eq('id', id).select().single(); if (error) throw error; return mapRow(data) },
    async delete(id) { const { error } = await requireSupabase().from(table).delete().eq('id', id); if (error) throw error; return { ok: true } },
    async bulkCreate(items) { const { data, error } = await requireSupabase().from(table).insert(items).select(); if (error) throw error; return mapRows(data) },
  }
} })

export const db = {
  entities,
  auth: {
    async isAuthenticated() { const { data } = await requireSupabase().auth.getSession(); return !!data.session },
    async me() { const { data: { user }, error } = await requireSupabase().auth.getUser(); if (error) throw error; return user },
    async loginViaEmailPassword(email, password) { const { error } = await requireSupabase().auth.signInWithPassword({ email, password }); if (error) throw error },
    async loginWithProvider(provider, returnTo = window.location.href) { const { error } = await requireSupabase().auth.signInWithOAuth({ provider, options: { redirectTo: returnTo } }); if (error) throw error },
    async register({ email, password }) { const { error } = await requireSupabase().auth.signUp({ email, password }); if (error) throw error },
    async verifyOtp({ email, otpCode }) { const { data, error } = await requireSupabase().auth.verifyOtp({ email, token: otpCode, type: 'email' }); if (error) throw error; return data.session },
    async resendOtp(email) { const { error } = await requireSupabase().auth.resend({ type: 'signup', email }); if (error) throw error },
    async resetPasswordRequest(email) { const { error } = await requireSupabase().auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` }); if (error) throw error },
    async resetPassword({ newPassword }) { const { error } = await requireSupabase().auth.updateUser({ password: newPassword }); if (error) throw error },
    async logout() { const { error } = await requireSupabase().auth.signOut(); if (error) throw error },
    setToken() {},
    redirectToLogin() { window.location.assign('/admin') },
  },
  functions: {
    async invoke(name, body) { const { data, error } = await requireSupabase().functions.invoke(name.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`), { body }); if (error) throw error; return { data } },
  },
  integrations: { Core: { async UploadPublicFile({ file }) {
    const client = requireSupabase()
    const ext = file.name.split('.').pop() || 'bin'
    const path = `${crypto.randomUUID()}.${ext}`
    const { error } = await client.storage.from('portfolio-media').upload(path, file, { upsert: false, contentType: file.type })
    if (error) throw error
    const { data } = client.storage.from('portfolio-media').getPublicUrl(path)
    return { file_url: data.publicUrl }
  } } },
}
export default db
