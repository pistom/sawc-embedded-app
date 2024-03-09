import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App';
import './index.css'
import { UserMessageProvider } from './context/UserMessagesProvider.tsx'
import { AppParamsProvider } from './context/AppParamsProvider.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppParamsProvider>
      <UserMessageProvider>
        <App />
      </UserMessageProvider>
    </AppParamsProvider>
  </React.StrictMode>,
)
