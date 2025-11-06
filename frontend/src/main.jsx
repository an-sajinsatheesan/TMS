import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PrimeReactProvider } from 'primereact/api'

// PrimeReact theme + core + icons (MUST be imported FIRST)
import 'primereact/resources/themes/lara-light-teal/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

// Tailwind utilities (imported AFTER PrimeReact)
import './index.css';

import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PrimeReactProvider value={{
      ripple: true,
      unstyled: false
    }}>
      <App />
    </PrimeReactProvider>
  </StrictMode>,
)
