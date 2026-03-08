import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { CheckCircle2, Circle, Sparkles } from 'lucide-react';
import { Skeleton } from '../components/ui/Skeleton';

export const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  
  // State
  const [stats, setStats] = useState({ streak: 0, total_deep_work_minutes: 0, tasks_completed: 0 });
  const [dailyTasks, setDailyTasks] = useState<any[]>([]);
  const [identity, setIdentity] = useState<string>("Forging your path...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.id) return;

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Stats (Using the view we created in Phase 1)
        const { data: statsData } = await supabase
          .from('v_user_stats')
          .select('*')
          .eq('id', profile.id)
          .single();
        
        if (statsData) {
          setStats({
            streak: statsData.current_streak || 0,
            total_deep_work_minutes: statsData.total_deep_work_minutes || 0,
            tasks_completed: statsData.tasks_completed || 0
          });
        }

        // 2. Fetch a random Identity Statement
        const { data: identities } = await supabase
          .from('identity_statements')
          .select('statement')
          .eq('user_id', profile.id);
          
        if (identities && identities.length > 0) {
          const randomIndex = Math.floor(Math.random() * identities.length);
          setIdentity(identities[randomIndex].statement);
        }

        // 3. Fetch Today's Daily 3 Tasks
        const today = new Date().toISOString().split('T')[0];
        const { data: tasks } = await supabase
          .from('daily_tasks')
          .select('*')
          .eq('user_id', profile.id)
          .eq('date', today)
          .order('created_at', { ascending: true });
          
        if (tasks) {
          setDailyTasks(tasks);
        }

      } catch (err) {
        console.error("Error fetching dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [profile?.id]);

  const toggleTask = async (task: any) => {
    // Optimistic UI update
    const updatedTasks = dailyTasks.map((t: any) => 
      t.id === task.id ? { ...t, is_completed: !t.is_completed } : t
    );
    setDailyTasks(updatedTasks);

    // Backend update
    await supabase
      .from('daily_tasks')
      .update({ is_completed: !task.is_completed })
      .eq('id', task.id);
  };

  const hoursDeepWork = Math.round((stats.total_deep_work_minutes / 60) * 10) / 10;

  if (loading) {
    return (
      <div className="flex-center" style={{ flexDirection: 'column', gap: '1.5rem', marginTop: '1rem', width: '100%' }}>
        <Skeleton width="100%" height="120px" />
        <Skeleton width="100%" height="80px" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', width: '100%' }}>
          <Skeleton height="100px" />
          <Skeleton height="100px" />
        </div>
        <Skeleton width="100%" height="200px" />
      </div>
    );
  }

  return (
    <div className="flex-center" style={{ flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
      
      {/* Greeting & Identity */}
      <div className="glass-panel" style={{ width: '100%' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h2 style={{ marginBottom: '0.5rem' }}>Welcome, {profile?.first_name}</h2>
        <p style={{ color: 'var(--accent-primary)', fontStyle: 'italic', fontWeight: 500 }}>"{identity}"</p>
      </div>

      {/* AI Insights Card (Phase 8) */}
      <div className="glass-panel animate-fade-in" style={{ width: '100%', padding: '1rem', borderLeft: '4px solid var(--accent-primary)', background: 'rgba(167, 139, 250, 0.05)' }}>
        <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)' }}>
            <Sparkles size={16} />
            <span style={{ fontWeight: 800, fontSize: '0.75rem', letterSpacing: '0.05em' }}>ORACLE INSIGHT</span>
          </div>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>LVL 1</span>
        </div>
        <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5 }}>
          "Focus on the 'Anti-List' today. Your momentum is building, but late-night fatigue is your primary leak."
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', width: '100%' }}>
        <div className="glass-panel flex-center" style={{ flexDirection: 'column', padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1.75rem', color: 'var(--accent-primary)' }}>🔥 {stats.streak}</h3>
          <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>Day Streak</p>
        </div>
        <div className="glass-panel flex-center" style={{ flexDirection: 'column', padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1.75rem', color: 'var(--secondary)' }}>🧠 {hoursDeepWork}h</h3>
          <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>Deep Work</p>
        </div>
      </div>

      {/* Today's Arena (Daily 3) */}
      <div className="glass-panel" style={{ width: '100%' }}>
        <div className="flex-between" style={{ marginBottom: '1rem' }}>
          <h3>Today's Arena</h3>
          <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
            {dailyTasks.filter((t: any) => t.is_completed).length} / 3
          </span>
        </div>
        
        {dailyTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <p style={{ marginBottom: '1rem' }}>Your Arena is empty.</p>
            <button className="btn btn-primary" style={{ width: '100%' }}>Lock In Daily 3</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {dailyTasks.map(task => (
              <div 
                key={task.id} 
                className="flex-center" 
                style={{ 
                  justifyContent: 'flex-start', 
                  gap: '0.75rem',
                  padding: '0.75rem',
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  opacity: task.is_completed ? 0.6 : 1,
                  transition: 'var(--transition)'
                }}
                onClick={() => toggleTask(task)}
              >
                {task.is_completed ? 
                  <CheckCircle2 color="var(--success)" size={20} /> : 
                  <Circle color="var(--text-muted)" size={20} />
                }
                <span style={{ 
                  textDecoration: task.is_completed ? 'line-through' : 'none',
                  flex: 1
                }}>
                  {task.title}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Action FAB Placeholder */}
      <div style={{ height: '4rem' }}></div> 

    </div>
  );
};
