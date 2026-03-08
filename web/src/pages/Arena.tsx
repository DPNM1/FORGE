import React, { useState } from 'react';
import { DailyThree } from '../components/arena/DailyThree';
import { DeepWorkTimer } from '../components/arena/DeepWorkTimer';

export const Arena: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'daily3' | 'deepwork'>('daily3');

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
          onClick={() => setActiveTab('daily3')}
          style={{ 
            flex: 1, 
            borderRadius: '9999px',
            background: activeTab === 'daily3' ? 'var(--accent-primary)' : 'transparent',
            color: activeTab === 'daily3' ? '#000' : 'var(--text-muted)'
          }}
        >
          Daily 3
        </button>
        <button 
          className="btn" 
          onClick={() => setActiveTab('deepwork')}
          style={{ 
            flex: 1, 
            borderRadius: '9999px',
            background: activeTab === 'deepwork' ? 'var(--accent-primary)' : 'transparent',
            color: activeTab === 'deepwork' ? '#000' : 'var(--text-muted)'
          }}
        >
          Deep Work
        </button>
      </div>

      {/* Main Context Area */}
      <div style={{ width: '100%', flex: 1 }}>
        {activeTab === 'daily3' ? <DailyThree /> : <DeepWorkTimer />}
      </div>
      
      {/* Spacer for bottom nav */}
      <div style={{ height: '5rem' }}></div>
    </div>
  );
};
