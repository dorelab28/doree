-- Club Doré Lab
-- Pegá este archivo en Supabase > SQL Editor > New query y ejecutalo una sola vez.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  whatsapp text,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  subtotal integer not null default 0,
  shipping_cost integer not null default 0,
  total integer not null default 0,
  delivery_method text,
  postal_code text,
  items jsonb not null default '[]'::jsonb,
  promo jsonb,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz
);

create table if not exists public.rewards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id uuid unique references public.orders(id) on delete set null,
  reward_name text not null default 'Box X3 clásica de regalo',
  status text not null default 'available' check (status in ('available', 'redeemed', 'expired')),
  created_at timestamptz not null default now(),
  redeemed_at timestamptz
);

alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.rewards enable row level security;

drop policy if exists "profiles select own" on public.profiles;
create policy "profiles select own"
on public.profiles for select
to authenticated
using (auth.uid() = id);

drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "orders select own" on public.orders;
create policy "orders select own"
on public.orders for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "orders insert own pending" on public.orders;
create policy "orders insert own pending"
on public.orders for insert
to authenticated
with check (auth.uid() = user_id and status = 'pending');

drop policy if exists "rewards select own" on public.rewards;
create policy "rewards select own"
on public.rewards for select
to authenticated
using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, whatsapp)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'whatsapp'
  )
  on conflict (id) do update
  set full_name = excluded.full_name,
      whatsapp = excluded.whatsapp;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.handle_confirmed_order_reward()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  confirmed_count integer;
begin
  if new.status = 'confirmed' and old.status is distinct from 'confirmed' then
    new.confirmed_at = coalesce(new.confirmed_at, now());

    select count(*)
    into confirmed_count
    from public.orders
    where user_id = new.user_id
      and status = 'confirmed';

    if (confirmed_count + 1) % 5 = 0 then
      insert into public.rewards (user_id, order_id)
      values (new.user_id, new.id)
      on conflict (order_id) do nothing;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists on_order_confirmed_reward on public.orders;
create trigger on_order_confirmed_reward
before update of status on public.orders
for each row execute function public.handle_confirmed_order_reward();

-- Para confirmar una compra desde SQL Editor:
-- update public.orders set status = 'confirmed' where id = 'PEGAR_ID_DEL_PEDIDO';
