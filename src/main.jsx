import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './state/authStore'
import { StudentProvider } from './state/studentStore'
import { CompanyProvider } from './state/companyStore'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <StudentProvider>
        <CompanyProvider>
          <App />
        </CompanyProvider>
      </StudentProvider>
    </AuthProvider>
  </React.StrictMode>,
)

