-- Independent replacement for the Base44 data model.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'user' check (role in ('admin','user')),
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'); $$;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(), display_name text not null, subtitle text, intro text,
  type text, page_type text default 'Website', client text, services text, url text, year text,
  "pageImage" text, "accentColor" text, featured boolean default true, visible boolean default true,
  "order" numeric default 0, created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(), question text not null, answer text not null,
  "order" numeric default 0, visible boolean default true, created_at timestamptz default now()
);
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(), quote text not null, author text, role_business text,
  "order" numeric default 0, visible boolean default true, created_at timestamptz default now()
);
create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(), contact_email text, notification_email text, hero_text text,
  about_text text, gallery_label text, about_statement text, about_skills text, about_paragraph text,
  about_location text, portrait_image text, show_process boolean default true,
  show_testimonials boolean default true, created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(), name text not null, email text not null, country text,
  business_type text, budget_range text, message text not null,
  status text not null default 'New' check (status in ('New','Contacted','Quote sent','Won','Not a fit')),
  priority text not null default 'Normal' check (priority in ('Low','Normal','High')),
  internal_notes text, is_sample boolean default false, created_at timestamptz default now()
);
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(), type text not null check (type in ('page_view','plan_click','project_open','visit_site','form_submit')),
  day date not null default current_date, count integer not null default 1, created_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.faqs enable row level security;
alter table public.testimonials enable row level security;
alter table public.site_settings enable row level security;
alter table public.inquiries enable row level security;
alter table public.events enable row level security;

-- Public visitors can only read visible portfolio content and submit inquiries / anonymous events.
create policy "profiles read own" on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "public read projects" on public.projects for select to anon, authenticated using (visible = true or public.is_admin());
create policy "admin manage projects" on public.projects for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public read faqs" on public.faqs for select to anon, authenticated using (visible = true or public.is_admin());
create policy "admin manage faqs" on public.faqs for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public read testimonials" on public.testimonials for select to anon, authenticated using (visible = true or public.is_admin());
create policy "admin manage testimonials" on public.testimonials for all to authenticated using (public.is_admin()) with check (public.is_admin());
create view public.public_site_settings as
select id, contact_email, hero_text, about_text, gallery_label, about_statement, about_skills,
       about_paragraph, about_location, portrait_image, show_process, show_testimonials,
       created_at, updated_at
from public.site_settings;
grant select on public.public_site_settings to anon, authenticated;
create policy "admin manage settings" on public.site_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public submit inquiries" on public.inquiries for insert to anon, authenticated with check (length(trim(name)) between 1 and 120 and length(trim(message)) between 1 and 5000 and length(email) <= 254);
create policy "admin manage inquiries" on public.inquiries for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public insert events" on public.events for insert to anon, authenticated with check (type in ('page_view','plan_click','project_open','visit_site','form_submit'));
create policy "admin read events" on public.events for select to authenticated using (public.is_admin());
create policy "admin update events" on public.events for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin delete events" on public.events for delete to authenticated using (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio-media','portfolio-media',true,10485760,array['image/jpeg','image/png','image/webp','image/gif','image/avif'])
on conflict (id) do nothing;
create policy "public read portfolio media" on storage.objects for select to anon, authenticated using (bucket_id = 'portfolio-media');
create policy "admin upload portfolio media" on storage.objects for insert to authenticated with check (bucket_id = 'portfolio-media' and public.is_admin());
create policy "admin update portfolio media" on storage.objects for update to authenticated using (bucket_id = 'portfolio-media' and public.is_admin()) with check (bucket_id = 'portfolio-media' and public.is_admin());
create policy "admin delete portfolio media" on storage.objects for delete to authenticated using (bucket_id = 'portfolio-media' and public.is_admin());

-- Create a default non-admin profile automatically for each new auth user.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$ begin insert into public.profiles(id, role) values (new.id, 'user') on conflict (id) do nothing; return new; end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- After creating your first Supabase Auth user, promote it with:
-- update public.profiles set role='admin' where id=(select id from auth.users where email='YOUR_EMAIL');
-- Or insert its profile row if absent:
-- insert into public.profiles(id,role) select id,'admin' from auth.users where email='YOUR_EMAIL' on conflict(id) do update set role='admin';
