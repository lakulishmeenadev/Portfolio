# Lakulish Portfolio

Independent React + Vite portfolio frontend with Supabase authentication, Postgres data, and Storage. This project is no longer coupled to Base44's builder or preview runtime.

## Setup

1. `npm install`
2. Create a Supabase project and run `supabase/migrations/202611120001_initial_portfolio.sql` in its SQL Editor.
3. Copy `.env.example` to `.env.local` and add the Supabase project URL and anon/public key.
4. Create your admin user in Supabase Authentication > Users, then promote it using the admin promotion SQL at the end of the migration.
5. Configure your local and production URLs in Supabase Authentication > URL Configuration.
6. Run `npm run dev` / `npm run build`.

Never expose the Supabase service-role key in browser code. The anon key is intended for the frontend; RLS policies protect private data.

## Deploy

Push this repository to GitHub and import it into Vercel. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as Vercel environment variables.

## Notes

- Public content is read from `projects`, `faqs`, `testimonials`, and `site_settings`.
- Admin-only operations are protected by Supabase Auth + the `profiles.role = 'admin'` row and RLS.
- Public inquiry submission and analytics event recording still need their Supabase Edge Functions deployed before those actions are live.
- Email delivery requires a transactional email provider (e.g. Resend) and its API key configured as an Edge Function secret.
