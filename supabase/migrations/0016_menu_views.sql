-- Registro simple de vistas del menú público, para la página de
-- analíticas en /admin/analytics. Un insert por carga de /r/[slug].

create table if not exists public.menu_views (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.menu_views enable row level security;

create policy "anyone can log a view for a published restaurant"
  on public.menu_views for insert
  to anon, authenticated
  with check (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.is_published = true
    )
  );

create policy "owner can view their restaurant's views"
  on public.menu_views for select
  to authenticated
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.owner_id = auth.uid()
    )
  );

create index if not exists menu_views_restaurant_id_created_at_idx
  on public.menu_views (restaurant_id, created_at desc);
