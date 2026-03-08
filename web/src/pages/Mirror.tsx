import React, { useState } from 'react';
import { DailyReflection } from '../components/mirror/DailyReflection';
import { HabitTracker } from '../components/mirror/HabitTracker';

export const Mirror: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'reflection' | 'habits'>('reflection');

  return (
    <div className="flex-center" style={{ flexDirection: 'column', gap: '1.5rem', marginTop: '1rem', width: '100%' }}>
      
      {/* Tab Navigation */}
      <div 
        className="glass-panel flex-between" 
        style={{ 
          padding: '0.5rem', 
          borderRadius: '9999px',
          width: '100%',
          maxWidth: '400px'
        }}
      >
        <button 
          className="btn" 
          onClick={() => setActiveTab('reflection')}
          style={{ 
            flex: 1, 
            borderRadius: '9999px',
            background: activeTab === 'reflection' ? 'var(--accent-primary)' : 'transparent',
            color: activeTab === 'reflection' ? '#000' : 'var(--text-muted)'
          }}
        >
          Reflection
        </button>
        <button 
          className="btn" 
          onClick={() => setActiveTab('habits')}
          style={{ 
            flex: 1, 
            borderRadius: '9999px',
            background: activeTab === 'habits' ? 'var(--accent-primary)' : 'transparent',
            color: activeTab === 'habits' ? '#000' : 'var(--text-muted)'
          }}
        >
          Habits
        </button>
      </div>

      {/* Main Context Area */}
      <div style={{ width: '100%', flex: 1 }}>
        {activeTab === 'reflection' ? <DailyReflection /> : <HabitTracker />}
      </div>
      
      {/* Spacer for bottom nav */}
      <div style={{ height: '5rem' }}></div>
    </div>
  );
};
