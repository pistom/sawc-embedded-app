import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App';
import './index.css'
import { UserMessageProvider } from './context/UserMessagesProvider.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <UserMessageProvider>
      <App />
    </UserMessageProvider>
  </React.StrictMode>,
)
