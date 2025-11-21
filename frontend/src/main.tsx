import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/components.css'
import App from './App.tsx'
import { StytchProviderWrapper } from './providers/stytchProvider'
import { QueryProviderWrapper } from './providers/queryProvider'
import { DeviceProviderWrapper } from './providers/deviceProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StytchProviderWrapper>
      <QueryProviderWrapper>
        <DeviceProviderWrapper>
          <App />
        </DeviceProviderWrapper>
      </QueryProviderWrapper>
    </StytchProviderWrapper>
  </StrictMode>,
)
