import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { ThemeProvider } from './ThemeContext';
import './index.css';

// ✅ SW is now registered in public/index.html <head> for faster recognition
// by Chrome Android. No need to register again here.

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