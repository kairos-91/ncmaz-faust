-- Reseñas con calificación (1 a 5 estrellas) que los clientes dejan desde
-- el menú público. Visibles públicamente por defecto; el dueño puede
-- ocultar o eliminar cualquiera desde /admin/reviews. Igual que orders,
-- quien inserta normalmente no tiene sesión.

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  customer_name text not null,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  is_visible boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.reviews enable row level security;

create policy "anyone can create a review for a published restaurant"
  on public.reviews for insert
  to anon, authenticated
  with check (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.is_published = true
    )
  );

create policy "public can read visible reviews"
  on public.reviews for select
  to anon, authenticated
  using (is_visible = true);

create policy "owner can view all their reviews"
  on public.reviews for select
  to authenticated
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.owner_id = auth.uid()
    )
  );

create policy "owner can update their reviews"
  on public.reviews for update
  to authenticated
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.owner_id = auth.uid()
    )
  );

create policy "owner can delete their reviews"
  on public.reviews for delete
  to authenticated
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.owner_id = auth.uid()
    )
  );

create index if not exists reviews_restaurant_id_created_at_idx
  on public.reviews (restaurant_id, created_at desc);
