import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './state/authStore'
import { StudentProvider } from './state/studentStore'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <StudentProvider>
        <App />
      </StudentProvider>
    </AuthProvider>
  </React.StrictMode>,
)

