import { useParams } from 'react-router-dom'

export function AreaMapPage() {
  const { areaSlug } = useParams<{ areaSlug: string }>()
  return (
    <section className="page-state">
      <p>エリア地図：{areaSlug}（実装予定）</p>
    </section>
  )
}
