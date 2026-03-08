import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Zap, Flame, Target, MessageSquare } from 'lucide-react';

export const ActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitialActivities();
    
    // Real-time subscription
    const channel = supabase
      .channel('public_activity')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'daily_tasks' }, () => fetchInitialActivities())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'deep_work_sessions' }, () => fetchInitialActivities())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchInitialActivities = async () => {
    setLoading(true);
    try {
      const { data: tasks } = await supabase
        .from('daily_tasks')
        .select('*, profiles(username)')
        .order('created_at', { ascending: false })
        .limit(10);
      
      const { data: sessions } = await supabase
        .from('deep_work_sessions')
        .select('*, profiles(username)')
        .order('start_time', { ascending: false })
        .limit(10);

      const combined = [
        ...(tasks || []).map((t: any) => ({ ...t, type: 'task', timestamp: t.created_at })),
        ...(sessions || []).map((s: any) => ({ ...s, type: 'deep_work', timestamp: s.start_time }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setActivities(combined.slice(0, 15));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center" style={{ padding: '2rem' }}>Pulsing the network...</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {activities.map((act, i) => (
        <div key={`${act.type}-${act.id}-${i}`} className="glass-panel" style={{ padding: '1rem' }}>
          <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div 
                style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  background: 'var(--accent-primary)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: '#000',
                  fontWeight: 800,
                  fontSize: '0.8rem'
                }}
              >
                {act.profiles?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{act.profiles?.username || 'Member'}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                  {act.type === 'task' ? 'locked in missions' : 'charged up deep focus'}
                </span>
              </div>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {act.type === 'task' ? (
              <>
                <Target size={18} color="var(--accent-primary)" />
                <span style={{ fontSize: '0.9rem' }}>{act.description}</span>
              </>
            ) : (
              <>
                <Flame size={18} color="#f97316" />
                <span style={{ fontSize: '0.9rem' }}>Deep Work: {act.actual_minutes || act.planned_minutes}m session</span>
              </>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem' }}>
            <button className="flex-center" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', gap: '0.25rem', fontSize: '0.75rem' }}>
              <Zap size={14} /> Celebrate
            </button>
            <button className="flex-center" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', gap: '0.25rem', fontSize: '0.75rem' }}>
              <MessageSquare size={14} /> Comment
            </button>
          </div>
        </div>
      ))}

      {activities.length === 0 && (
        <div className="text-center" style={{ padding: '3rem', opacity: 0.5 }}>
          <Zap size={48} style={{ marginBottom: '1rem' }} />
          <p>The Council is quiet. <br/>Be the first to act.</p>
        </div>
      )}
    </div>
  );
};
