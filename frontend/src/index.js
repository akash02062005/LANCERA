import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { Toaster } from 'react-hot-toast';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <SocketProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1A1A2E', color: '#fff', border: '1px solid #2D2D4E' },
            success: { iconTheme: { primary: '#4BB543', secondary: '#fff' } },
            error: { iconTheme: { primary: '#FF6584', secondary: '#fff' } }
          }}
        />
        <App />
      </SocketProvider>
    </AuthProvider>
  </React.StrictMode>
);
