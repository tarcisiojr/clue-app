import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App.tsx'
import './index.css'

// Registro do service worker (PWA) com atualização automática e confiável.
// Em modo autoUpdate, ao detectar uma nova versão o app recarrega sozinho.
// Forçamos a checagem de atualização ao abrir/voltar o app e periodicamente,
// o que é essencial em PWAs instalados (especialmente no iOS).
const updateSW = registerSW({
  immediate: true,
  onRegisteredSW(_swUrl, registration) {
    if (!registration) return
    const checkForUpdate = () => {
      registration.update().catch(() => {})
    }
    // Ao trazer o app para frente novamente.
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') checkForUpdate()
    })
    window.addEventListener('focus', checkForUpdate)
    // Verificação periódica enquanto o app fica aberto (1 hora).
    setInterval(checkForUpdate, 60 * 60 * 1000)
  },
})

// Mantém a referência viva (evita remoção pelo tree-shaking).
void updateSW

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
