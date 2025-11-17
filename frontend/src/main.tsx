import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { StytchProviderWrapper } from './providers/stytchProvider'
import { QueryProviderWrapper } from './providers/queryProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StytchProviderWrapper>
      <QueryProviderWrapper>
        <App />
      </QueryProviderWrapper>
    </StytchProviderWrapper>
  </StrictMode>,
)
