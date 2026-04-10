import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { useGameStore } from './store/gameStore'

// Debug handle so dev tools and Playwright e2e tests can drive the store.
if (typeof window !== 'undefined') {
  ;(window as unknown as { __game: typeof useGameStore }).__game =
    useGameStore
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
