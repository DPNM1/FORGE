import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Home, Swords, BookOpen, FlaskConical, Users, Flame } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/arena', label: 'Arena', icon: Swords },
  { path: '/mirror', label: 'Mirror', icon: BookOpen },
  { path: '/lab', label: 'Lab', icon: FlaskConical },
  { path: '/council', label: 'Council', icon: Users },
];

export const AppShell: React.FC = () => {
  const { profile } = useAuth();

  return (
    <div className="app-container">
      {/* Top Bar */}
      <header className="flex-between" style={{ paddingBottom: '1.5rem' }}>
        <div className="flex-center" style={{ gap: '0.75rem' }}>
          {/* Avatar Placeholder */}
          <div 
            style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--secondary), var(--accent-primary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              color: 'white',
              fontSize: '1.2rem'
            }}
          >
            {profile?.first_name?.charAt(0) || '?'}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{profile?.first_name || 'Forging...'}</h3>
          </div>
        </div>
        
        {/* Streak Flame */}
        <div className="glass-panel flex-center" style={{ padding: '0.5rem 1rem', borderRadius: '9999px', gap: '0.5rem' }}>
          <Flame size={20} color="var(--accent-primary)" />
          <span style={{ fontWeight: 700 }}>12</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="animate-slide-up">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav 
        className="glass-panel flex-between" 
        style={{ 
          position: 'fixed', 
          bottom: '1rem', 
          left: '1rem', 
          right: '1rem', 
          padding: '0.75rem 1rem',
          borderRadius: '9999px',
          zIndex: 50
        }}
      >
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }: { isActive: boolean }) => ({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              textDecoration: 'none',
              color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
              transition: 'var(--transition)'
            })}
          >
            <item.icon size={24} />
            <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};
