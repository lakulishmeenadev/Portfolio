# Migration status — Base44 export to independent Supabase app

## What was audited
- The ZIP archive passes `unzip -t` integrity checks.
- Base44 export report says 134 files, 1 asset, 1 resolved asset, and no reported missing assets.
- The report also records a cross-origin preview iframe scan warning, so it cannot certify that the preview's full DOM/assets were exported.
- The exported `src/api/base44Client.js` was a dummy stub: auth always returned false, entity operations returned empty/no-op results, and uploads returned an empty URL.
- The Base44 function sources depended on Base44 runtime imports, so they could not operate outside Base44.
- `src/lib/app-params` was referenced by auth flows but absent from the archive.
- `vite.config.js` called the Base44 plugin without importing it.
- `assets/other/%23n` was a copied Monaco editor HTML page, not a portfolio image; it has been removed.

## Changes prepared in this migration copy
- Removed Base44 Vite plugin and SDK dependencies from `package.json` and `vite.config.js`.
- Added Supabase browser client, Postgres schema/RLS migration, public media bucket policies, and Supabase Edge Functions for inquiries and analytics.
- Replaced admin data operations with Supabase Postgres operations.
- Replaced admin password stub with Supabase Auth + admin role verification.
- Removed unused Base44-only MFA/OAuth pages and flows from this app build.
- Removed the exported editor HTML artifact and Base44 config/function source folder.

## Not yet completed / external setup required
- Supabase project has not yet been connected or provisioned; add URL + anon key in `.env.local`.
- Run the SQL migration, create an admin Auth user, and promote its profile to `admin`.
- Deploy the two Edge Functions and configure Resend secrets to enable inquiry email notifications.
- Existing Base44 database records were not present in this ZIP; only entity schemas were exported. Projects, settings, FAQs, testimonials, and inquiry records must be exported separately from Base44 if you want existing content/data migrated.
- GitHub repository has not been created/pushed because GitHub access is not connected.
- Vercel hosting has not been deployed.
- `npm install` could not complete in this environment (network/install timed out), so a production build has not yet been verified.

Do not treat this copy as production-ready until the external setup and build checks above are complete.
