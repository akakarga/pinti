import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { DataWorkspaceProvider } from './context/DataWorkspaceContext.tsx'
import { DemoAuthProvider } from './context/DemoAuthContext.tsx'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DemoAuthProvider>
      <DataWorkspaceProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </DataWorkspaceProvider>
    </DemoAuthProvider>
  </StrictMode>,
)
