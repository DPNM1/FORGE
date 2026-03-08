import React, { useState } from 'react';
import { ActivityFeed } from '../components/council/ActivityFeed';
import { Scoreboard } from '../components/council/Scoreboard';
import { WinBoard } from '../components/council/WinBoard';

export const Council: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'feed' | 'scoreboard' | 'wins'>('feed');

  return (
    <div className="flex-center" style={{ flexDirection: 'column', gap: '1.5rem', marginTop: '1rem', width: '100%' }}>
      
      {/* Tab Navigation */}
      <div 
        className="glass-panel flex-between" 
        style={{ 
          padding: '0.4rem', 
          borderRadius: '9999px',
          width: '100%',
          maxWidth: '500px',
          gap: '0.25rem'
        }}
      >
        <button 
          className="btn" 
          onClick={() => setActiveTab('feed')}
          style={{ 
            flex: 1, 
            borderRadius: '9999px',
            fontSize: '0.85rem',
            padding: '0.6rem 0.2rem',
            background: activeTab === 'feed' ? 'var(--accent-primary)' : 'transparent',
            color: activeTab === 'feed' ? '#000' : 'var(--text-muted)'
          }}
        >
          Feed
        </button>
        <button 
          className="btn" 
          onClick={() => setActiveTab('scoreboard')}
          style={{ 
            flex: 1, 
            borderRadius: '9999px',
            fontSize: '0.85rem',
            padding: '0.6rem 0.2rem',
            background: activeTab === 'scoreboard' ? 'var(--accent-primary)' : 'transparent',
            color: activeTab === 'scoreboard' ? '#000' : 'var(--text-muted)'
          }}
        >
          Scoreboard
        </button>
        <button 
          className="btn" 
          onClick={() => setActiveTab('wins')}
          style={{ 
            flex: 1, 
            borderRadius: '9999px',
            fontSize: '0.85rem',
            padding: '0.6rem 0.2rem',
            background: activeTab === 'wins' ? 'var(--accent-primary)' : 'transparent',
            color: activeTab === 'wins' ? '#000' : 'var(--text-muted)'
          }}
        >
          Wins
        </button>
      </div>

      {/* Main Context Area */}
      <div style={{ width: '100%', flex: 1 }}>
        {activeTab === 'feed' && <ActivityFeed />}
        {activeTab === 'scoreboard' && <Scoreboard />}
        {activeTab === 'wins' && <WinBoard />}
      </div>
      
      {/* Spacer for bottom nav */}
      <div style={{ height: '5rem' }}></div>
    </div>
  );
};
