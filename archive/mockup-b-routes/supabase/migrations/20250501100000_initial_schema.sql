-- エリア・壁・ルート（公開読み取り + MVP では anon でも書き込み可。本番前に RLS を見直すこと）
create table if not exists public.areas (
  id text primary key,
  name text not null,
  polygon jsonb not null default '[]'::jsonb
);

create table if not exists public.walls (
  id text primary key,
  area_id text not null references public.areas (id) on delete cascade,
  name text not null,
  lat double precision not null,
  lng double precision not null
);

create index if not exists walls_area_id_idx on public.walls (area_id);

create table if not exists public.routes (
  id text primary key,
  wall_id text not null references public.walls (id) on delete cascade,
  name text not null,
  difficulty text,
  image_url text not null,
  vectors jsonb not null default '{"lines":[],"startHolds":[],"keyPoints":[]}'::jsonb,
  description text,
  sort_order int not null default 0
);

create index if not exists routes_wall_id_idx on public.routes (wall_id);

alter table public.areas enable row level security;
alter table public.walls enable row level security;
alter table public.routes enable row level security;

create policy "areas_select_anon" on public.areas for select to anon using (true);
create policy "areas_insert_anon" on public.areas for insert to anon with check (true);
create policy "areas_update_anon" on public.areas for update to anon using (true) with check (true);
create policy "areas_delete_anon" on public.areas for delete to anon using (true);

create policy "walls_select_anon" on public.walls for select to anon using (true);
create policy "walls_insert_anon" on public.walls for insert to anon with check (true);
create policy "walls_update_anon" on public.walls for update to anon using (true) with check (true);
create policy "walls_delete_anon" on public.walls for delete to anon using (true);

create policy "routes_select_anon" on public.routes for select to anon using (true);
create policy "routes_insert_anon" on public.routes for insert to anon with check (true);
create policy "routes_update_anon" on public.routes for update to anon using (true) with check (true);
create policy "routes_delete_anon" on public.routes for delete to anon using (true);

create policy "areas_select_auth" on public.areas for select to authenticated using (true);
create policy "areas_insert_auth" on public.areas for insert to authenticated with check (true);
create policy "areas_update_auth" on public.areas for update to authenticated using (true) with check (true);
create policy "areas_delete_auth" on public.areas for delete to authenticated using (true);

create policy "walls_select_auth" on public.walls for select to authenticated using (true);
create policy "walls_insert_auth" on public.walls for insert to authenticated with check (true);
create policy "walls_update_auth" on public.walls for update to authenticated using (true) with check (true);
create policy "walls_delete_auth" on public.walls for delete to authenticated using (true);

create policy "routes_select_auth" on public.routes for select to authenticated using (true);
create policy "routes_insert_auth" on public.routes for insert to authenticated with check (true);
create policy "routes_update_auth" on public.routes for update to authenticated using (true) with check (true);
create policy "routes_delete_auth" on public.routes for delete to authenticated using (true);

insert into public.areas (id, name, polygon)
values (
  'area1',
  'エリアA',
  '[[36.13,140.00],[36.23,140.00],[36.23,140.10],[36.13,140.10]]'::jsonb
)
on conflict (id) do nothing;

insert into public.walls (id, area_id, name, lat, lng)
values ('wall1', 'area1', '壁1', 36.13, 140.00)
on conflict (id) do nothing;

insert into public.routes (id, wall_id, name, difficulty, image_url, vectors, description, sort_order)
values (
  'route1',
  'wall1',
  'ルート1',
  'V3',
  '/images/routes/route1.jpg',
  '{"lines":[{"points":[[0.2,0.8],[0.3,0.7],[0.4,0.6],[0.5,0.5],[0.6,0.4],[0.7,0.3],[0.8,0.2]],"color":"#ff0000","width":3}],"startHolds":[{"position":[0.2,0.8],"type":"start","label":"S"},{"position":[0.3,0.7],"type":"hold","label":"1"},{"position":[0.4,0.6],"type":"hold","label":"2"},{"position":[0.5,0.5],"type":"hold","label":"3"},{"position":[0.6,0.4],"type":"hold","label":"4"},{"position":[0.7,0.3],"type":"hold","label":"5"},{"position":[0.8,0.2],"type":"finish","label":"F"}],"keyPoints":[{"position":[0.125,0.3333],"description":"壁ホールド（オフルート・参考）","icon":"wall"},{"position":[0.875,0.8333],"description":"壁ホールド（オフルート・参考）","icon":"wall"},{"position":[0.65,0.8667],"description":"壁ホールド（オフルート・参考）","icon":"wall"}]}'::jsonb,
  'サンプルルート1の説明',
  0
)
on conflict (id) do nothing;

insert into public.routes (id, wall_id, name, difficulty, image_url, vectors, description, sort_order)
values (
  'route2',
  'wall1',
  'ルート2',
  'V4',
  '/images/routes/route1.jpg',
  '{"lines":[],"startHolds":[],"keyPoints":[]}'::jsonb,
  '2本目のサンプル',
  1
)
on conflict (id) do nothing;
