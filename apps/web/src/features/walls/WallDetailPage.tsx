import { useParams } from 'react-router-dom'

export function WallDetailPage() {
  const { wallId } = useParams<{ wallId: string }>()
  return (
    <section className="page-state">
      <p>岩詳細：{wallId}（実装予定）</p>
    </section>
  )
}
