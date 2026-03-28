import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import ScrollManager from './components/layout/ScrollManager.tsx'

function getRouterBasename() {
  const configuredBase = import.meta.env.BASE_URL

  if (configuredBase !== '/') {
    return configuredBase
  }

  if (typeof window === 'undefined') {
    return configuredBase
  }

  const { hostname, pathname } = window.location

  if (!hostname.endsWith('.github.io')) {
    return configuredBase
  }

  const [firstSegment] = pathname.split('/').filter(Boolean)

  return firstSegment ? `/${firstSegment}` : configuredBase
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={getRouterBasename()}>
      <ScrollManager />
      <App />
    </BrowserRouter>
  </StrictMode>,
)
