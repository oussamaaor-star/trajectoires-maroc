/* Point d'entrée de l'application.
   Ordre des imports CSS important : d'abord la police Inter Variable,
   puis le design system du designer (design.css) qui s'appuie dessus. */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource-variable/inter'
import './styles/design.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* BrowserRouter : active la navigation par URL (« vraies » adresses, sans #) */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
