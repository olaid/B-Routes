import { Routes, Route, Link } from 'react-router-dom'
import { TopMapPage } from '../features/top/TopMapPage'
import { AreaMapPage } from '../features/areas/AreaMapPage'
import { WallDetailPage } from '../features/walls/WallDetailPage'

export default function App() {
  return (
    <>
      <header className="app-header">
        <Link to="/" className="app-title">
          B-Routes
        </Link>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<TopMapPage />} />
          <Route path="/areas/:areaSlug" element={<AreaMapPage />} />
          <Route path="/walls/:wallId" element={<WallDetailPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  )
}

function NotFound() {
  return (
    <section className="page-empty">
      <p>ページが見つかりませんでした。</p>
      <Link to="/">トップへ戻る</Link>
    </section>
  )
}
