import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { CheckCircle2, Circle, Plus, Anchor, X } from 'lucide-react';

export const HabitTracker: React.FC = () => {
  const { profile } = useAuth();
  const [habits, setHabits] = useState<any[]>([]);
  const [logs, setLogs] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: '', anchor: '' });

  useEffect(() => {
    if (!profile?.id) return;
    fetchHabitsAndLogs();
  }, [profile?.id]);

  const fetchHabitsAndLogs = async () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    try {
      // 1. Fetch Active Habits
      const { data: activeHabits } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', profile?.id)
        .eq('active', true);

      if (activeHabits) setHabits(activeHabits);

      // 2. Fetch Today's Logs
      const { data: todayLogs } = await supabase
        .from('habit_logs')
        .select('habit_id, completed')
        .eq('user_id', profile?.id)
        .eq('date', today);

      if (todayLogs) {
        const logMap: Record<string, boolean> = {};
        todayLogs.forEach(log => {
          logMap[log.habit_id] = log.completed;
        });
        setLogs(logMap);
      }
    } catch (err) {
      console.error("Error fetching habits:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleHabit = async (habitId: string) => {
    const isCompleted = !!logs[habitId];
    const newStatus = !isCompleted;
    const today = new Date().toISOString().split('T')[0];

    // Optimistic Update
    setLogs({ ...logs, [habitId]: newStatus });

    try {
      // Upsert habit log
      const { data: existing } = await supabase
        .from('habit_logs')
        .select('id')
        .eq('habit_id', habitId)
        .eq('date', today)
        .single();

      if (existing) {
        await supabase
          .from('habit_logs')
          .update({ completed: newStatus })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('habit_logs')
          .insert({
            user_id: profile?.id,
            habit_id: habitId,
            date: today,
            completed: newStatus
          });
      }
    } catch (err) {
      console.error("Error toggling habit:", err);
      // Revert on error
      setLogs({ ...logs, [habitId]: isCompleted });
    }
  };

  const handleAddHabit = async () => {
    if (!newHabit.name || !newHabit.anchor || !profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('habits')
        .insert({
          user_id: profile.id,
          name: newHabit.name,
          anchor: newHabit.anchor,
          active: true
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setHabits([...habits, data]);
        setNewHabit({ name: '', anchor: '' });
        setShowAdd(false);
      }
    } catch (err) {
      console.error("Error adding habit:", err);
      alert("Failed to add habit.");
    }
  };

  if (loading) return <div className="text-center" style={{ padding: '2rem' }}>Syncing Habits...</div>;

  return (
    <div className="animate-fade-in" style={{ width: '100%' }}>
      
      {/* Add Habit Button */}
      {!showAdd && (
        <button 
          className="glass-panel flex-center" 
          onClick={() => setShowAdd(true)}
          style={{ 
            width: '100%', 
            padding: '1rem', 
            marginBottom: '1.5rem', 
            border: '1px dashed var(--glass-border)',
            gap: '0.5rem',
            color: 'var(--accent-primary)'
          }}
        >
          <Plus size={20} /> Add New Behavioral Anchor
        </button>
      )}

      {/* Add Habit Form */}
      {showAdd && (
        <div className="glass-panel slide-up" style={{ marginBottom: '1.5rem', position: 'relative' }}>
          <button 
            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-muted)' }}
            onClick={() => setShowAdd(false)}
          >
            <X size={20} />
          </button>
          <h3 style={{ marginBottom: '1rem' }}>Define New Hook</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>The Anchor (After I...)</span>
              <input 
                className="input-glass" 
                placeholder="e.g. Finish my morning coffee"
                value={newHabit.anchor}
                onChange={(e) => setNewHabit({ ...newHabit, anchor: e.target.value })}
              />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>The Habit (I will...)</span>
              <input 
                className="input-glass" 
                placeholder="e.g. Open the Arena and set my Daily 3"
                value={newHabit.name}
                onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
              />
            </div>
            <button className="btn btn-primary" onClick={handleAddHabit} style={{ marginTop: '0.5rem' }}>
              Create Anchor
            </button>
          </div>
        </div>
      )}

      {/* Habit List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {habits.length === 0 && !showAdd && (
          <div className="glass-panel text-center" style={{ padding: '2.5rem' }}>
            <p style={{ color: 'var(--text-muted)' }}>No behavioral hooks defined yet.</p>
          </div>
        )}
        
        {habits.map(habit => (
          <div 
            key={habit.id}
            className="glass-panel" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem',
              cursor: 'pointer',
              borderColor: logs[habit.id] ? 'var(--accent-primary)' : 'var(--glass-border)'
            }}
            onClick={() => toggleHabit(habit.id)}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <Anchor size={14} color="var(--accent-primary)" />
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
                  Anchor
                </span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                After I {habit.anchor}...
              </p>
              <h4 style={{ margin: 0, textDecoration: logs[habit.id] ? 'line-through' : 'none' }}>
                I will {habit.name}
              </h4>
            </div>
            
            <div style={{ padding: '0.5rem' }}>
              {logs[habit.id] ? (
                <CheckCircle2 color="var(--accent-primary)" size={32} strokeWidth={2.5} />
              ) : (
                <Circle color="rgba(255,255,255,0.1)" size={32} strokeWidth={2.5} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
