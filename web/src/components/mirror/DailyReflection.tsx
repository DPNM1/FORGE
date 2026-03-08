import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Sparkles, Trophy, Target, AlertTriangle, Send } from 'lucide-react';

export const DailyReflection: React.FC = () => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [existingReflection, setExistingReflection] = useState<any>(null);

  // Form State
  const [scores, setScores] = useState({ energy: 7, focus: 7, progress: 7 });
  const [text, setText] = useState({ 
    did_well: '', 
    fell_short: '', 
    do_differently: '' 
  });

  useEffect(() => {
    if (!profile?.id) return;
    fetchTodayReflection();
  }, [profile?.id]);

  const fetchTodayReflection = async () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    try {
      const { data, error } = await supabase
        .from('daily_reflections')
        .select('*')
        .eq('user_id', profile?.id)
        .eq('date', today)
        .single();

      if (data) {
        setExistingReflection(data);
        setScores({
          energy: data.energy_score,
          focus: data.focus_score,
          progress: data.progress_score
        });
        setText({
          did_well: data.did_well,
          fell_short: data.fell_short,
          do_differently: data.do_differently
        });
      }
    } catch (err) {
      console.error("Error fetching reflection:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!profile?.id) return;
    setSubmitting(true);
    const today = new Date().toISOString().split('T')[0];

    try {
      const { data, error } = await supabase
        .from('daily_reflections')
        .insert({
          user_id: profile.id,
          date: today,
          energy_score: scores.energy,
          focus_score: scores.focus,
          progress_score: scores.progress,
          did_well: text.did_well,
          fell_short: text.fell_short,
          do_differently: text.do_differently
        })
        .select()
        .single();

      if (error) throw error;
      setExistingReflection(data);
    } catch (err) {
      console.error("Error submitting reflection:", err);
      alert("Failed to save reflection.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center" style={{ padding: '2rem' }}>Polishing the Mirror...</div>;

  return (
    <div className="animate-fade-in" style={{ width: '100%' }}>
      <div className="glass-panel">
        <h2 style={{ marginBottom: '0.5rem' }}>Daily Reflection</h2>
        <p style={{ marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {existingReflection ? "Day captured. View your insights below." : "Be honest with yourself. Focus on the data."}
        </p>

        {/* Scores Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
          {[
            { key: 'energy', label: 'Energy Level', color: '#fbbf24' },
            { key: 'focus', label: 'Focus Sharpness', color: '#60a5fa' },
            { key: 'progress', label: 'Progress Intensity', color: '#34d399' }
          ].map((item) => (
            <div key={item.key}>
              <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600 }}>{item.label}</span>
                <span style={{ fontWeight: 700, color: item.color }}>{scores[item.key as keyof typeof scores]}/10</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={scores[item.key as keyof typeof scores]}
                disabled={!!existingReflection}
                onChange={(e) => setScores({ ...scores, [item.key]: parseInt(e.target.value) })}
                style={{ 
                  width: '100%', 
                  accentColor: item.color,
                  cursor: existingReflection ? 'default' : 'pointer'
                }}
              />
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {[
            { key: 'did_well', label: 'Wins: What went well?', icon: Trophy },
            { key: 'fell_short', label: 'Failures: Where did I fall short?', icon: AlertTriangle },
            { key: 'do_differently', label: 'Pivot: What will I do differently?', icon: Target }
          ].map((item) => (
            <div key={item.key}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <item.icon size={16} />
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.label}</span>
              </div>
              <textarea 
                className="input-glass"
                style={{ minHeight: '80px', paddingTop: '0.75rem', fontSize: '0.9rem' }}
                placeholder="..."
                value={text[item.key as keyof typeof text]}
                disabled={!!existingReflection}
                onChange={(e) => setText({ ...text, [item.key]: e.target.value })}
              />
            </div>
          ))}
        </div>

        {!existingReflection && (
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '2rem' }}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Saving...' : 'Lock In Reflection'}
          </button>
        )}

        {existingReflection && (
          <div 
            className="flex-center" 
            style={{ 
              marginTop: '2rem', 
              padding: '1rem', 
              background: 'rgba(52, 211, 153, 0.1)', 
              borderRadius: '12px',
              border: '1px solid var(--success)',
              gap: '0.5rem'
            }}
          >
            <Sparkles size={18} color="var(--success)" />
            <span style={{ color: 'var(--success)', fontWeight: 600 }}>Daily Logic Synchronized</span>
          </div>
        )}
      </div>
    </div>
  );
};
