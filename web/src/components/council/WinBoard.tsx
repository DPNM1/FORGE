import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Trophy, Star, Sparkles, Heart } from 'lucide-react';

export const WinBoard: React.FC = () => {
  const [wins, setWins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWins();
  }, []);

  const fetchWins = async () => {
    setLoading(true);
    try {
      // In a real implementation, we'd have a specific `wins` table.
      // For this phase, we'll fetch reflections where "did_well" is significant.
      const { data } = await supabase
        .from('daily_reflections')
        .select('*, profiles(username)')
        .not('did_well', 'eq', '')
        .order('date', { ascending: false })
        .limit(10);
      
      if (data) setWins(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center" style={{ padding: '2rem' }}>Gathering victories...</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
      <div className="glass-panel" style={{ padding: '1.5rem', background: 'linear-gradient(45deg, rgba(52, 211, 153, 0.1), rgba(0,0,0,0.4))', textAlign: 'center' }}>
        <Trophy size={48} color="#34d399" style={{ marginBottom: '1rem' }} />
        <h2 style={{ marginBottom: '0.5rem' }}>The Arena of Wins</h2>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Identity is forged through evidence of victory.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {wins.map(win => (
          <div key={win.id} className="glass-panel" style={{ position: 'relative', overflow: 'hidden', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
            <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1 }}>
              <Sparkles size={80} color="var(--success)" />
            </div>
            
            <div className="flex-between" style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Star size={16} color="#fbbf24" fill="#fbbf24" />
                <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>{win.profiles?.username} captured a win</span>
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(win.date).toLocaleDateString()}</span>
            </div>

            <p style={{ fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.4, margin: '1rem 0', color: '#fff' }}>
               "{win.did_well}"
            </p>

            <div className="flex-between" style={{ marginTop: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                 {/* Reaction placeholders */}
                 <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#f43f5e', border: '1px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Heart size={10} color="#fff" fill="#fff" />
                 </div>
              </div>
              <button className="btn" style={{ fontSize: '0.7rem', padding: '0.4rem 0.8rem', background: 'rgba(255,255,255,0.05)' }}>
                Salute
              </button>
            </div>
          </div>
        ))}

        {wins.length === 0 && (
          <div className="text-center glass-panel" style={{ padding: '3rem', gridColumn: '1 / -1' }}>
            <p style={{ color: 'var(--text-muted)' }}>No wins broadcasted yet. Forge something notable.</p>
          </div>
        )}
      </div>
    </div>
  );
};
