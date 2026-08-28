-- Las reseñas ya no se muestran en el menú público (solo el dueño las ve
-- en /admin/reviews). Se retira la política que permitía leerlas a
-- cualquiera; la inserción pública (para poder seguir dejando reseñas)
-- y las políticas del dueño no cambian.

drop policy if exists "public can read visible reviews" on public.reviews;
