import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppShell } from './components/layout/AppShell';
import { Dashboard } from './pages/Dashboard';
import { Onboarding } from './pages/Onboarding';
import { Arena } from './pages/Arena';
import { Mirror } from './pages/Mirror';
import { Lab } from './pages/Lab';
import { Council } from './pages/Council';
import { Oracle } from './pages/Oracle';
import { Profile } from './pages/Profile';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

const AuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex-center" style={{ height: '100vh' }}>Loading The FORGE...</div>;
  }

  if (profile) {
    const isCurrentlyOnboarding = location.pathname === '/onboarding';
    
    if (!profile.onboarding_completed && !isCurrentlyOnboarding) {
      return <Navigate to="/onboarding" replace />;
    }
    
    if (profile.onboarding_completed && isCurrentlyOnboarding) {
      return <Navigate to="/" replace />;
    }
  } else {
    // If auth is finished and profile is still null, it's a critical auth failure
    return (
      <div className="flex-center" style={{ height: '100vh', flexDirection: 'column', gap: '1rem', padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ color: '#ef4444' }}>Terminal Authentication Failure</h2>
        <p style={{ color: 'var(--text-muted)' }}>We couldn't verify your presence in the network. Please restart the bot.</p>
      </div>
    );
  }

  return <>{children}</>;
};

export const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AuthWrapper>
            <Routes>
              <Route path="/onboarding" element={<Onboarding />} />
              <Route element={<AppShell />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/arena" element={<Arena />} />
                <Route path="/mirror" element={<Mirror />} />
                <Route path="/lab" element={<Lab />} />
                <Route path="/council" element={<Council />} />
                <Route path="/oracle" element={<Oracle />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthWrapper>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
