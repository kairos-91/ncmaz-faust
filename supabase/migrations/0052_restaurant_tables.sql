-- Gestión de mesas para pedidos "Comer en el local": zonas, capacidad y
-- QR individual por mesa (/{slug}?table=<id>, ver src/app/[slug]/page.tsx).
-- Cada mesa es una fila independiente en restaurant_tables — permite
-- generarle su propio QR y saber si está ocupada (is_occupied). Mientras
-- lo está, el selector de mesas del menú público (para quien pide "Comer
-- en el local" sin haber escaneado el QR de una mesa específica) no la
-- muestra como opción.
create table if not exists public.restaurant_tables (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  zone text not null default '',
  name text not null,
  capacity int not null default 2,
  is_occupied boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists restaurant_tables_restaurant_id_idx
  on public.restaurant_tables (restaurant_id, sort_order);

alter table public.restaurant_tables enable row level security;

-- Público: puede leer las mesas de un restaurante publicado (nombre, zona
-- y capacidad no son datos sensibles) — las usa el selector de mesas y la
-- pantalla fija cuando se escanea el QR de una mesa específica.
create policy "public can read tables of published restaurants"
  on public.restaurant_tables for select
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_tables.restaurant_id and r.is_published = true
    )
  );

create policy "owners can manage their tables"
  on public.restaurant_tables for all
  using (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_tables.restaurant_id and r.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_tables.restaurant_id and r.owner_id = auth.uid()
    )
  );

-- orders: referencia opcional a la mesa formal (para poder ocuparla al
-- crear el pedido). table_number sigue existiendo tal cual — texto libre
-- para restaurantes que no usan este módulo o pedidos cargados a mano.
alter table public.orders
  add column if not exists table_id uuid references public.restaurant_tables(id) on delete set null;

-- Marca una mesa como ocupada justo después de crear un pedido dine_in.
-- security definer porque el flujo público (checkout sin sesión) también
-- la llama — así no hace falta abrir una política pública de UPDATE en
-- restaurant_tables, que dejaría editar zona/nombre/capacidad a
-- cualquiera con la anon key. El propio id de la mesa (uuid, no
-- adivinable) es la única validación necesaria: no expone ni modifica
-- nada sensible.
create or replace function public.mark_table_occupied(p_table_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.restaurant_tables
  set is_occupied = true
  where id = p_table_id;
end;
$$;

grant execute on function public.mark_table_occupied(uuid) to anon, authenticated;
