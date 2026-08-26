-- Bucket para comprobantes de pago pegados en /admin/subscription.
-- Igual que menu-images: público por URL directa, pero sin listado
-- público, y solo usuarios autenticados pueden subir.

insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', true)
on conflict (id) do nothing;

create policy "public can view payment proofs by direct link"
  on storage.objects for select
  using (bucket_id = 'payment-proofs');

create policy "authenticated users can upload payment proofs"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'payment-proofs');

create policy "owners can delete their own payment proofs"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'payment-proofs' and owner = auth.uid());
