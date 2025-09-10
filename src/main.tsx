import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import favicon from './assets/logo.png';

// Set the favicon dynamically to ensure it's included in the build
const faviconLink = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
if (faviconLink) {
  faviconLink.href = favicon;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
