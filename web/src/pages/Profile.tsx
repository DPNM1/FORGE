import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Shield, Target, Scroll, BarChart3, Edit2, Check, X } from 'lucide-react';

export const Profile: React.FC = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [identity, setIdentity] = useState<any[]>([]);
  const [northStar, setNorthStar] = useState<any[]>([]);
  const [antiList, setAntiList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editBuffer, setEditBuffer] = useState<string>('');

  useEffect(() => {
    if (!profile?.id) return;

    const fetchProfileData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Stats
        const { data: statsData } = await supabase
          .from('v_user_stats')
          .select('*')
          .eq('id', profile.id)
          .single();
        setStats(statsData);

        // 2. Fetch Identity
        const { data: idData } = await supabase
          .from('identity_statements')
          .select('*')
          .eq('user_id', profile.id)
          .order('sort_order', { ascending: true });
        setIdentity(idData || []);

        // 3. Fetch North Star
        const { data: nsData } = await supabase
          .from('north_stars')
          .select('*')
          .eq('user_id', profile.id);
        setNorthStar(nsData || []);

        // 4. Fetch Anti-List
        const { data: alData } = await supabase
          .from('anti_list_items')
          .select('*')
          .eq('user_id', profile.id)
          .order('sort_order', { ascending: true });
        setAntiList(alData || []);

      } catch (err) {
        console.error("Error fetching profile data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [profile?.id]);

  if (loading) return <div className="flex-center" style={{ height: '50vh' }}>Opening your codex...</div>;

  return (
    <div className="flex-center" style={{ flexDirection: 'column', gap: '1.5rem', paddingBottom: '8rem' }}>
      
      {/* Header */}
      <div className="flex-center" style={{ flexDirection: 'column', gap: '1rem', width: '100%', marginTop: '1rem' }}>
        <div 
          style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--secondary), var(--accent-primary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: 'white',
            boxShadow: '0 0 20px rgba(167, 139, 250, 0.3)'
          }}
        >
          {profile?.first_name?.charAt(0)}
        </div>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{profile?.first_name} {profile?.last_name}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Member since {new Date(stats?.member_since).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="glass-panel" style={{ width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', color: 'var(--accent-primary)' }}>
          <BarChart3 size={20} />
          <h3 style={{ fontSize: '1rem' }}>Legacy Stats</h3>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>{stats?.current_streak || 0}</p>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Streak</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>{stats?.total_tasks_completed || 0}</p>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tasks</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>{Math.round(stats?.total_deep_work_minutes / 60) || 0}h</p>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Focus</p>
          </div>
        </div>
      </div>

      {/* Identity Statements */}
      <div className="glass-panel" style={{ width: '100%' }}>
        <div className="flex-between" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)' }}>
            <Shield size={20} />
            <h3 style={{ fontSize: '1rem' }}>Identity</h3>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {identity.map(id => (
            <div key={id.id} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.9rem', borderLeft: '3px solid var(--secondary)' }}>
              {id.statement}
            </div>
          ))}
        </div>
      </div>

      {/* North Stars */}
      <div className="glass-panel" style={{ width: '100%' }}>
        <div className="flex-between" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary)' }}>
            <Target size={20} />
            <h3 style={{ fontSize: '1rem' }}>North Stars</h3>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {northStar.map(ns => (
            <div key={ns.id}>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem', textTransform: 'uppercase', fontWeight: 700 }}>{ns.timeframe.replace('_', ' ')}</p>
              <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.9rem' }}>
                {ns.vision}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Anti-List */}
      <div className="glass-panel" style={{ width: '100%', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
        <div className="flex-between" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444' }}>
            <Scroll size={20} />
            <h3 style={{ fontSize: '1rem' }}>Anti-List</h3>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {antiList.map(item => (
            <div key={item.id} style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>
              • {item.item}
            </div>
          ))}
        </div>
      </div>

      <button 
        className="btn" 
        style={{ width: '100%', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}
        onClick={() => {
          if (confirm("Reset Mock Profile? This will clear local state.")) {
             localStorage.clear();
             window.location.reload();
          }
        }}
      >
        Sign Out (Mock)
      </button>

    </div>
  );
};
