// Polyfill: SockJS requires 'global' which Vite doesn't provide (Node.js only)
(window as any).global = window;

import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);
