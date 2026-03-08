import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { CheckCircle2, Circle, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';

export const DailyThree: React.FC = () => {
  const { profile } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [inputTasks, setInputTasks] = useState(['', '', '']);
  const [loading, setLoading] = useState(true);
  const [lockingIn, setLockingIn] = useState(false);

  useEffect(() => {
    if (!profile?.id) return;
    fetchTasks();
  }, [profile?.id]);

  const fetchTasks = async () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    try {
      const { data } = await supabase
        .from('daily_tasks')
        .select('*')
        .eq('user_id', profile?.id)
        .eq('date', today)
        .order('created_at', { ascending: true });
        
      if (data && data.length > 0) {
        setTasks(data);
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLockIn = async () => {
    if (!profile?.id) return;
    
    // Validate we have exactly 3 non-empty tasks
    const validTasks = inputTasks.filter((t: string) => t.trim() !== '');
    if (validTasks.length !== 3) {
      alert("You must define exactly 3 tasks to enter the Arena.");
      return;
    }

    setLockingIn(true);
    const today = new Date().toISOString().split('T')[0];

    try {
      const { data, error } = await supabase
        .from('daily_tasks')
        .insert(
          validTasks.map((title: string) => ({
            user_id: profile.id,
            date: today,
            title: title.trim(),
            is_completed: false
          }))
        )
        .select();

      if (error) throw error;
      if (data) setTasks(data);
    } catch (err) {
      console.error("Error locking in tasks:", err);
      alert("Failed to lock in tasks.");
    } finally {
      setLockingIn(false);
    }
  };

  const toggleTask = async (task: any) => {
    const updatedTasks = tasks.map((t: any) => 
      t.id === task.id ? { ...t, is_completed: !t.is_completed } : t
    );
    setTasks(updatedTasks);

    await supabase
      .from('daily_tasks')
      .update({ is_completed: !task.is_completed })
      .eq('id', task.id);

    // If all tasks are now completed, celebrate!
    const allDone = updatedTasks.every((t: any) => t.is_completed);
    if (allDone && !task.is_completed) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#3b82f6', '#10b981']
      });
    }
  };

  if (loading) return <div className="text-center" style={{ padding: '2rem' }}>Loading Arena...</div>;

  const isLockedIn = tasks.length > 0;
  const completedCount = tasks.filter(t => t.is_completed).length;

  return (
    <div className="animate-fade-in" style={{ width: '100%' }}>
      
      {!isLockedIn ? (
        <div className="glass-panel text-center">
          <h2 style={{ marginBottom: '0.5rem' }}>The Daily 3</h2>
          <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            What 3 things will move the needle today? <br/>
            Once locked in, they cannot be changed.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            {[0, 1, 2].map(index => (
              <input 
                key={index}
                className="input-glass"
                placeholder={`Mission Object ${index + 1}`}
                value={inputTasks[index]}
                onChange={(e) => {
                  const newInputs = [...inputTasks];
                  newInputs[index] = e.target.value;
                  setInputTasks(newInputs);
                }}
              />
            ))}
          </div>

          <button 
            className="btn btn-primary" 
            style={{ width: '100%' }}
            onClick={handleLockIn}
            disabled={lockingIn || inputTasks.filter((t: string) => t.trim() !== '').length !== 3}
          >
            {lockingIn ? 'Forging...' : 'Lock In Daily 3'}
          </button>
        </div>
      ) : (
        <div className="glass-panel">
          <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Today's Arena</h2>
              <p style={{ fontSize: '0.85rem' }}>Show up and execute.</p>
            </div>
            
            {/* Celebration logic: if all 3 done, show pulsing flame */}
            {completedCount === 3 && (
              <div className="animate-pulse-glow" style={{ color: 'var(--accent-primary)' }}>
                <Flame size={32} />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {tasks.map((task: any) => (
              <div 
                key={task.id} 
                className="flex-center" 
                style={{ 
                  justifyContent: 'flex-start', 
                  gap: '1rem',
                  padding: '1rem',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  opacity: task.is_completed ? 0.6 : 1,
                  transition: 'var(--transition)'
                }}
                onClick={() => toggleTask(task)}
              >
                {task.is_completed ? 
                  <CheckCircle2 color="var(--success)" size={24} /> : 
                  <Circle color="var(--text-muted)" size={24} />
                }
                <span style={{ 
                  fontSize: '1.1rem',
                  fontWeight: 500,
                  textDecoration: task.is_completed ? 'line-through' : 'none',
                  flex: 1
                }}>
                  {task.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
