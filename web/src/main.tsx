import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const EnvError = () => (
  <div style={{ 
    height: '100vh', 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: '2rem', 
    textAlign: 'center',
    background: '#0f172a',
    color: 'white',
    fontFamily: 'sans-serif'
  }}>
    <h1 style={{ color: '#ef4444', marginBottom: '1rem' }}>Configuration Error</h1>
    <p style={{ marginBottom: '2rem', color: '#94a3b8' }}>
      The Forge cannot ignite because Supabase environment variables are missing.
    </p>
    <div style={{ 
      background: 'rgba(255,255,255,0.05)', 
      padding: '1rem', 
      borderRadius: '8px', 
      textAlign: 'left',
      fontSize: '0.8rem',
      width: '100%',
      maxWidth: '400px'
    }}>
      <p style={{ fontWeight: 800, marginBottom: '0.5rem' }}>REQUIRED ACTION:</p>
      <p>Go to Vercel Dashboard → Settings → Environment Variables and add:</p>
      <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
        <li><code>VITE_SUPABASE_URL</code></li>
        <li><code>VITE_SUPABASE_ANON_KEY</code></li>
      </ul>
    </div>
  </div>
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {(!supabaseUrl || !supabaseAnonKey) ? <EnvError /> : <App />}
  </StrictMode>,
);
