import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Home, Swords, BookOpen, FlaskConical, Users, Flame, User, MessageCircle } from 'lucide-react';
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
  { path: '/profile', label: 'Profile', icon: User },
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

      {/* Floating Oracle Button */}
      <NavLink
        to="/oracle"
        className="glass-panel flex-center"
        style={({ isActive }) => ({
          position: 'fixed',
          bottom: '5.5rem',
          right: '1.5rem',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: isActive ? 'var(--accent-primary)' : 'rgba(167, 139, 250, 0.2)',
          border: '1px solid var(--accent-primary)',
          color: isActive ? 'white' : 'var(--accent-primary)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          zIndex: 40,
          transition: 'var(--transition)'
        })}
      >
        <MessageCircle size={28} />
      </NavLink>

      {/* Bottom Navigation */}
      <nav 
        className="glass-panel flex-between" 
        style={{ 
          position: 'fixed', 
          bottom: '1rem', 
          left: '50%', 
          transform: 'translateX(-50%)',
          width: 'calc(100% - 2rem)',
          maxWidth: '500px',
          padding: '0.75rem 1.5rem',
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
