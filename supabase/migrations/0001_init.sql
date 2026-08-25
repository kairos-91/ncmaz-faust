-- Levery: menú digital multi-tenant para restaurantes
-- Ejecutar en el SQL Editor de Supabase (o via `supabase db push`)

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- restaurants
-- ---------------------------------------------------------------------------
create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  slug text not null unique,
  description text,
  logo_url text,
  cover_url text,
  address text,
  phone text,
  whatsapp text,
  theme_color text not null default '#f97316',
  currency text not null default 'USD',
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

create index if not exists restaurants_owner_id_idx on public.restaurants (owner_id);

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists categories_restaurant_id_idx on public.categories (restaurant_id);

-- ---------------------------------------------------------------------------
-- menu_items
-- ---------------------------------------------------------------------------
create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  name text not null,
  description text,
  price numeric(10, 2) not null check (price >= 0),
  image_url text,
  is_available boolean not null default true,
  is_featured boolean not null default false,
  tags text[] not null default '{}',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists menu_items_restaurant_id_idx on public.menu_items (restaurant_id);
create index if not exists menu_items_category_id_idx on public.menu_items (category_id);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists restaurants_set_updated_at on public.restaurants;
create trigger restaurants_set_updated_at
  before update on public.restaurants
  for each row execute function public.set_updated_at();

drop trigger if exists menu_items_set_updated_at on public.menu_items;
create trigger menu_items_set_updated_at
  before update on public.menu_items
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.restaurants enable row level security;
alter table public.categories enable row level security;
alter table public.menu_items enable row level security;

-- restaurants: público puede ver los publicados; el dueño ve/edita todo lo suyo
create policy "public can read published restaurants"
  on public.restaurants for select
  using (is_published = true);

create policy "owners can read their own restaurants"
  on public.restaurants for select
  using (auth.uid() = owner_id);

create policy "owners can insert their own restaurants"
  on public.restaurants for insert
  with check (auth.uid() = owner_id);

create policy "owners can update their own restaurants"
  on public.restaurants for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "owners can delete their own restaurants"
  on public.restaurants for delete
  using (auth.uid() = owner_id);

-- categories: público puede ver categorías de restaurantes publicados; el dueño gestiona las suyas
create policy "public can read categories of published restaurants"
  on public.categories for select
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = categories.restaurant_id and r.is_published = true
    )
  );

create policy "owners can manage their categories"
  on public.categories for all
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = categories.restaurant_id and r.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.restaurants r
      where r.id = categories.restaurant_id and r.owner_id = auth.uid()
    )
  );

-- menu_items: público puede ver ítems disponibles de restaurantes publicados; el dueño gestiona los suyos
create policy "public can read available items of published restaurants"
  on public.menu_items for select
  using (
    is_available = true
    and exists (
      select 1 from public.restaurants r
      where r.id = menu_items.restaurant_id and r.is_published = true
    )
  );

create policy "owners can manage their menu items"
  on public.menu_items for all
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = menu_items.restaurant_id and r.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.restaurants r
      where r.id = menu_items.restaurant_id and r.owner_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Storage: bucket público para logos, portadas y fotos de platos
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('menu-images', 'menu-images', true)
on conflict (id) do nothing;

create policy "public can view menu images"
  on storage.objects for select
  using (bucket_id = 'menu-images');

create policy "authenticated users can upload menu images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'menu-images');

create policy "owners can update their own menu images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'menu-images' and owner = auth.uid())
  with check (bucket_id = 'menu-images' and owner = auth.uid());

create policy "owners can delete their own menu images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'menu-images' and owner = auth.uid());
