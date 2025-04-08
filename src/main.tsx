import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from '@emotion/react'

const theme = {
  colors: {
    primary: '#3182ce',
    gray: {
      600: '#4A5568'
    }
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)
