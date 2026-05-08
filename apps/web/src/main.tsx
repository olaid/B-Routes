import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './app/App'
import './lib/leafletSetup'
import './styles/global.css'
import 'leaflet/dist/leaflet.css'

const container = document.getElementById('app')
if (!container) {
  throw new Error('#app element is missing in index.html')
}

createRoot(container).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)
