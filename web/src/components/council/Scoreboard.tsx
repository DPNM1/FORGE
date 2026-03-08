import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Crown, TrendingUp } from 'lucide-react';

export const Scoreboard: React.FC = () => {
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRankings();
  }, []);

  const fetchRankings = async () => {
    setLoading(true);
    try {
      // Fetching from v_user_stats view
      const { data } = await supabase
        .from('v_user_stats')
        .select('*')
        .order('consistency_score', { ascending: false });
      
      if (data) setRankings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center" style={{ padding: '2rem' }}>Calculating rankings...</div>;

  return (
    <div className="animate-fade-in">
      <div className="glass-panel" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(0,0,0,0.4))' }}>
        <div className="flex-between">
          <div>
            <h3 style={{ margin: 0 }}>The Apex Board</h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Highest consistency over last 7 days.</p>
          </div>
          <Crown size={32} color="#fbbf24" style={{ filter: 'drop-shadow(0 0 10px rgba(251, 191, 36, 0.5))' }} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {rankings.map((user, index) => {
          const isTop3 = index < 3;
          const colors = ['#fbbf24', '#cbd5e1', '#92400e']; // Gold, Silver, Bronze
          
          return (
            <div 
              key={user.user_id} 
              className="glass-panel" 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '1rem',
                borderLeft: isTop3 ? `4px solid ${colors[index]}` : '1px solid var(--glass-border)'
              }}
            >
              <div 
                style={{ 
                  width: '30px', 
                  fontWeight: 800, 
                  fontSize: isTop3 ? '1.2rem' : '1rem',
                  color: isTop3 ? colors[index] : 'var(--text-muted)'
                }}
              >
                #{index + 1}
              </div>

              <div 
                style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  background: isTop3 ? colors[index] : 'rgba(255,255,255,0.05)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: isTop3 ? '#000' : 'var(--text-main)',
                  fontWeight: 800,
                  marginRight: '1rem'
                }}
              >
                {user.username?.[0]?.toUpperCase() || 'U'}
              </div>

              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {user.username}
                  {index === 0 && <Crown size={14} color="#fbbf24" />}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <TrendingUp size={12} /> {user.current_streak}d streak
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--accent-primary)' }}>
                  {Math.round(user.consistency_score || 0)}
                </div>
                <div style={{ fontSize: '0.6rem', fontWeight: 700, opacity: 0.5 }}>POINTS</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
