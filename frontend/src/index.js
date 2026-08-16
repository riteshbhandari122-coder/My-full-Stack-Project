import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { ThemeProvider } from './ThemeContext';
import './index.css';

// ✅ Service worker is registered in public/index.html <head> (not here) so
// Chrome/Android recognizes the PWA as early as possible. See index.html.

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <ThemeProvider>
      <App />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            fontFamily: 'DM Sans, sans-serif',
            borderRadius: '12px',
          },
        }}
      />
    </ThemeProvider>
  </BrowserRouter>
);