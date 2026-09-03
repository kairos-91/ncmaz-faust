-- Hasta ahora las políticas RLS de storage.objects (0001, 0003, 0005)
-- solo verificaban bucket_id en el insert — cualquiera con la anon key
-- (pública, va en cada página) podía subir directo a la API de Storage
-- sin pasar por la app, con cualquier tipo de archivo (incluyendo SVG/HTML
-- con <script> embebido) y sin límite de tamaño. Los checks de
-- file.type que hace el código (uploadImage, uploadOrderReceipt,
-- uploadPaymentProof, updateProfileAvatar) son solo para dar un buen
-- mensaje de error en la UI — no son una barrera real, un atacante puede
-- saltárselos por completo.
--
-- Esto sí es una barrera real: Supabase Storage aplica
-- allowed_mime_types y file_size_limit en su propio endpoint de subida,
-- antes de que el archivo llegue a tocar el bucket, sin importar qué
-- cliente haga la petición. Deliberadamente sin image/svg+xml (un SVG
-- puede llevar <script> y ejecutarlo si alguien abre el archivo subido
-- directo en una pestaña del navegador).
update storage.buckets
set file_size_limit = 5242880, -- 5 MB
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
where id in ('menu-images', 'order-receipts', 'payment-proofs');
