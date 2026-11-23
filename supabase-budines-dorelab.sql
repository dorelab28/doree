-- Run this script in the Supabase SQL editor before publishing the Budines catalog.
-- Costs and recipes are protected by RLS. Only prices/weights are readable publicly.
create table if not exists public.budin_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.budin_admins enable row level security;
drop policy if exists "Budin admins can read their own access" on public.budin_admins;
create policy "Budin admins can read their own access" on public.budin_admins for select to authenticated using (user_id = auth.uid());
grant select on public.budin_admins to authenticated;

create or replace function public.is_budin_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.budin_admins where user_id = (select auth.uid()));
$$;
revoke all on function public.is_budin_admin() from public;
grant execute on function public.is_budin_admin() to authenticated;

create table if not exists public.budin_prices (
  flavor text not null check (flavor in ('nutella','pistacho','red-velvet','carrot-cake')),
  size text not null check (size in ('chico','mediano','doble')),
  price integer not null check (price >= 0),
  weight_grams integer not null check (weight_grams > 0),
  updated_at timestamptz not null default now(),
  primary key(flavor, size)
);
alter table public.budin_prices enable row level security;
drop policy if exists "Budin prices are public" on public.budin_prices;
create policy "Budin prices are public" on public.budin_prices for select to anon, authenticated using (true);
drop policy if exists "Budin admins manage prices" on public.budin_prices;
create policy "Budin admins manage prices" on public.budin_prices for all to authenticated using (public.is_budin_admin()) with check (public.is_budin_admin());
grant select on public.budin_prices to anon, authenticated;
grant insert, update, delete on public.budin_prices to authenticated;

create table if not exists public.budin_cost_config (
  id text primary key check (id = 'production'),
  config jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.budin_cost_config enable row level security;
drop policy if exists "Budin admins manage private costs" on public.budin_cost_config;
create policy "Budin admins manage private costs" on public.budin_cost_config for all to authenticated using (public.is_budin_admin()) with check (public.is_budin_admin());
grant select, insert, update, delete on public.budin_cost_config to authenticated;

insert into public.budin_prices(flavor,size,price,weight_grams) values
('nutella','chico',20000,900),('nutella','mediano',27000,1200),('nutella','doble',49000,2400),
('pistacho','chico',22000,900),('pistacho','mediano',30000,1200),('pistacho','doble',55000,2400),
('red-velvet','chico',19000,900),('red-velvet','mediano',25000,1200),('red-velvet','doble',46000,2400),
('carrot-cake','chico',18000,900),('carrot-cake','mediano',24000,1200),('carrot-cake','doble',44000,2400)
on conflict(flavor,size) do nothing;

-- Authorize the first manager only after creating their Supabase Auth user:
-- insert into public.budin_admins(user_id) select id from auth.users where email = 'ADMIN_EMAIL';
-- Do not paste a service-role key into the site. The first manager grants access from SQL editor.
