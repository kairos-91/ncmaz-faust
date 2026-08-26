-- Bucket para comprobantes de pago que suben los CLIENTES al hacer un
-- pedido en el menú público (/r/[slug]). A diferencia de payment-proofs
-- (dueños autenticados pagándole a Levery), aquí quien sube el archivo
-- normalmente no tiene sesión, así que insert queda abierto a "anon".
-- No hay policy de update/delete: nadie puede modificar un comprobante
-- ya subido desde la API.

insert into storage.buckets (id, name, public)
values ('order-receipts', 'order-receipts', true)
on conflict (id) do nothing;

create policy "public can view order receipts"
  on storage.objects for select
  using (bucket_id = 'order-receipts');

create policy "anyone can upload order receipts"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'order-receipts');
