-- Permite al superadmin borrar notificaciones bancarias desde
-- /superadmin/bank-notifications (por ejemplo, para limpiar el ruido de
-- un backlog viejo de correos sin leer que el Apps Script procesó antes
-- de agregarle el filtro newer_than:1d).
drop policy if exists "superadmin can delete bank notifications" on public.bank_notifications;
create policy "superadmin can delete bank notifications"
  on public.bank_notifications for delete
  to authenticated
  using (coalesce(auth.jwt() ->> 'email', '') in ('joseph.ro.silva@gmail.com'));
