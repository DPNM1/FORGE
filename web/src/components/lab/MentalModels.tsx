import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Brain, Sparkles, BookOpen, Info, ChevronDown, ChevronUp } from 'lucide-react';

const PRESET_MODELS = [
  {
    name: 'First Principles Thinking',
    description: "Breaking complex problems into basic elements and reassembling them from the ground up. This avoids the trap of 'reasoning by analogy' and allows for truly original solutions.",
    application: 'When stuck on a legacy process, ask: What are the fundamental truths here? How can I rebuild this from scratch?'
  },
  {
    name: 'Inversion',
    description: "Thinking about a problem backward. Instead of asking 'How do I succeed?', ask 'How could I fail?' and then avoid those pitfalls. Crucial for risk management.",
    application: "I will use this when planning a new project specifically to find the 'hidden paths to failure'."
  },
  {
    name: 'Pareto Principle (80/20)',
    description: 'For many outcomes, roughly 80% of consequences come from 20% of causes. Focus on the vital few rather than the trivial many.',
    application: 'Identify the 20% of my Daily 3 tasks that drive 80% of my quarterly progress.'
  }
];

export const MentalModels: React.FC = () => {
  const { profile } = useAuth();
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.id) fetchModels();
  }, [profile?.id]);

  const fetchModels = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('mental_models')
        .select('*')
        .eq('user_id', profile?.id);
      
      // If no user models, we'll show presets. 
      // In a real app, we might sync presets to the DB on first load.
      // Here, we effectively treat presets as a fallback.
      if (data) setModels(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const displayModels = models.length > 0 ? models : PRESET_MODELS.map((p, i) => ({ id: `p-${i}`, is_preset: true, ...p }));

  return (
    <div className="animate-fade-in">
      <div className="glass-panel" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.1), rgba(0,0,0,0.4))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Sparkles size={24} color="var(--accent-primary)" />
          <div>
            <h3 style={{ margin: 0 }}>Thinker Library</h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Frameworks for superior decision making.</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {displayModels.map(model => {
          const isExpanded = expandedId === model.id;
          return (
            <div 
              key={model.id} 
              className="glass-panel" 
              style={{ 
                padding: '1.25rem', 
                cursor: 'pointer',
                borderColor: isExpanded ? 'var(--accent-primary)' : 'var(--glass-border)'
              }}
              onClick={() => setExpandedId(isExpanded ? null : model.id)}
            >
              <div className="flex-between">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Brain size={20} color={model.is_preset ? 'var(--accent-primary)' : 'var(--text-main)'} />
                  <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{model.name}</h4>
                </div>
                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>

              {isExpanded && (
                <div className="animate-slide-down" style={{ marginTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                  <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--text-main)', marginBottom: '1.25rem' }}>
                    {model.description}
                  </p>
                  
                  <div style={{ padding: '1rem', background: 'rgba(52, 211, 153, 0.05)', borderRadius: '10px', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <BookOpen size={14} color="#34d399" />
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase' }}>APPLICATION</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 500 }}>
                      {model.application || model.personal_application}
                    </p>
                  </div>

                  {model.is_preset && (
                    <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                      <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                        CORE PRESET
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
