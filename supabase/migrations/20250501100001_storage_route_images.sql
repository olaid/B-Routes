-- ルート画像用バケット（公開読み取り・anon アップロードは MVP 用。運用前に必ず見直す）
drop policy if exists "route_images_select" on storage.objects;
drop policy if exists "route_images_insert" on storage.objects;
drop policy if exists "route_images_update" on storage.objects;
drop policy if exists "route_images_delete" on storage.objects;

insert into storage.buckets (id, name, public)
values ('route-images', 'route-images', true)
on conflict (id) do update set public = excluded.public;

create policy "route_images_select"
on storage.objects for select to anon, authenticated
using (bucket_id = 'route-images');

create policy "route_images_insert"
on storage.objects for insert to anon, authenticated
with check (bucket_id = 'route-images');

create policy "route_images_update"
on storage.objects for update to anon, authenticated
using (bucket_id = 'route-images')
with check (bucket_id = 'route-images');

create policy "route_images_delete"
on storage.objects for delete to anon, authenticated
using (bucket_id = 'route-images');
