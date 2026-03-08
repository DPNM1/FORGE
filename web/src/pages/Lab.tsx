import React, { useState } from 'react';
import { ExperimentManager } from '../components/lab/ExperimentManager';
import { LearningLog } from '../components/lab/LearningLog';
import { MentalModels } from '../components/lab/MentalModels';

export const Lab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'experiments' | 'learning' | 'models'>('experiments');

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
          onClick={() => setActiveTab('experiments')}
          style={{ 
            flex: 1, 
            borderRadius: '9999px',
            fontSize: '0.85rem',
            padding: '0.6rem 0.2rem',
            background: activeTab === 'experiments' ? 'var(--accent-primary)' : 'transparent',
            color: activeTab === 'experiments' ? '#000' : 'var(--text-muted)'
          }}
        >
          Experiments
        </button>
        <button 
          className="btn" 
          onClick={() => setActiveTab('learning')}
          style={{ 
            flex: 1, 
            borderRadius: '9999px',
            fontSize: '0.85rem',
            padding: '0.6rem 0.2rem',
            background: activeTab === 'learning' ? 'var(--accent-primary)' : 'transparent',
            color: activeTab === 'learning' ? '#000' : 'var(--text-muted)'
          }}
        >
          Learning
        </button>
        <button 
          className="btn" 
          onClick={() => setActiveTab('models')}
          style={{ 
            flex: 1, 
            borderRadius: '9999px',
            fontSize: '0.85rem',
            padding: '0.6rem 0.2rem',
            background: activeTab === 'models' ? 'var(--accent-primary)' : 'transparent',
            color: activeTab === 'models' ? '#000' : 'var(--text-muted)'
          }}
        >
          Models
        </button>
      </div>

      {/* Main Context Area */}
      <div style={{ width: '100%', flex: 1 }}>
        {activeTab === 'experiments' && <ExperimentManager />}
        {activeTab === 'learning' && <LearningLog />}
        {activeTab === 'models' && <MentalModels />}
      </div>
      
      {/* Spacer for bottom nav */}
      <div style={{ height: '5rem' }}></div>
    </div>
  );
};
