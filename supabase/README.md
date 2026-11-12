# Supabase setup

1. Create a Supabase project.
2. Run `migrations/202611120001_initial_portfolio.sql` in the Supabase SQL Editor.
3. Create the first user in Authentication > Users, then run the admin promotion SQL at the bottom of the migration (uncomment and replace the email).
4. Copy the project URL and anon/public key into `.env.local` using `.env.example`.
5. Configure Auth URL settings for your local and production domains.
6. Set up Resend (or another transactional email provider) before expecting inquiry notification/confirmation emails. Never put a service-role key in frontend environment variables.
