-- route1.svg 上のホールド座標を vectors に反映済みのデータへ更新（既存 DB 用）
update public.routes
set vectors =
  '{"lines":[{"points":[[0.2,0.8],[0.3,0.7],[0.4,0.6],[0.5,0.5],[0.6,0.4],[0.7,0.3],[0.8,0.2]],"color":"#ff0000","width":3}],"startHolds":[{"position":[0.2,0.8],"type":"start","label":"S"},{"position":[0.3,0.7],"type":"hold","label":"1"},{"position":[0.4,0.6],"type":"hold","label":"2"},{"position":[0.5,0.5],"type":"hold","label":"3"},{"position":[0.6,0.4],"type":"hold","label":"4"},{"position":[0.7,0.3],"type":"hold","label":"5"},{"position":[0.8,0.2],"type":"finish","label":"F"}],"keyPoints":[{"position":[0.125,0.3333],"description":"壁ホールド（オフルート・参考）","icon":"wall"},{"position":[0.875,0.8333],"description":"壁ホールド（オフルート・参考）","icon":"wall"},{"position":[0.65,0.8667],"description":"壁ホールド（オフルート・参考）","icon":"wall"}]}'::jsonb
where id = 'route1';
