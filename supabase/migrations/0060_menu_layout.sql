-- Deja que cada restaurante elija cómo se ven las tarjetas de su menú
-- público: "list" (foto pequeña al lado, el diseño de siempre) o "grid"
-- (foto grande arriba, tarjetas en cuadrícula de dos columnas).
alter table public.restaurants
  add column if not exists menu_layout text not null default 'list';

alter table public.restaurants
  drop constraint if exists restaurants_menu_layout_check;

alter table public.restaurants
  add constraint restaurants_menu_layout_check check (menu_layout in ('list', 'grid'));
