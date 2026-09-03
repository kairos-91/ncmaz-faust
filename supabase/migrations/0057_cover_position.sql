-- Permite reposicionar la portada (arrastrándola en el admin) en vez de
-- forzar siempre el centro de la imagen. Se guarda como un valor CSS
-- object-position/background-position ("50% 50%" = centrado, el
-- default de siempre), aplicado tal cual en el menú público.
alter table public.restaurants
  add column if not exists cover_position text not null default '50% 50%';
