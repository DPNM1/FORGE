import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Beaker, Calendar, TrendingUp, Plus, X, CheckCircle2 } from 'lucide-react';

export const ExperimentManager: React.FC = () => {
  const { profile } = useAuth();
  const [experiments, setExperiments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const [form, setForm] = useState({
    hypothesis: '',
    measurement: '',
    start_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (profile?.id) fetchExperiments();
  }, [profile?.id]);

  const fetchExperiments = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('experiments')
        .select('*')
        .eq('user_id', profile?.id)
        .order('start_date', { ascending: false });
      if (data) setExperiments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.hypothesis || !form.measurement || !profile?.id) return;

    const endDate = new Date(form.start_date);
    endDate.setDate(endDate.getDate() + 30);

    try {
      const { data, error } = await supabase
        .from('experiments')
        .insert({
          user_id: profile.id,
          hypothesis: form.hypothesis,
          measurement: form.measurement,
          start_date: form.start_date,
          end_date: endDate.toISOString().split('T')[0],
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;
      setExperiments([data, ...experiments]);
      setShowAdd(false);
      setForm({ hypothesis: '', measurement: '', start_date: new Date().toISOString().split('T')[0] });
    } catch (err) {
      console.error(err);
    }
  };

  const calculateProgress = (start: string, end: string) => {
    const startDate = new Date(start).getTime();
    const endDate = new Date(end).getTime();
    const now = new Date().getTime();
    
    if (now < startDate) return 0;
    if (now > endDate) return 100;
    
    const total = endDate - startDate;
    const elapsed = now - startDate;
    return Math.floor((elapsed / total) * 100);
  };

  if (loading) return <div className="text-center" style={{ padding: '2rem' }}>Calibrating instruments...</div>;

  return (
    <div className="animate-fade-in">
      {!showAdd ? (
        <button 
          className="glass-panel flex-center" 
          onClick={() => setShowAdd(true)}
          style={{ width: '100%', padding: '1rem', border: '1px dashed var(--glass-border)', color: 'var(--accent-primary)', gap: '0.5rem', marginBottom: '1.5rem' }}
        >
          <Plus size={20} /> Design 30-Day Experiment
        </button>
      ) : (
        <div className="glass-panel" style={{ marginBottom: '1.5rem', position: 'relative' }}>
          <button style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-muted)' }} onClick={() => setShowAdd(false)}>
            <X size={20} />
          </button>
          <h3 style={{ marginBottom: '1.5rem' }}>New Life Design</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Hypothesis (If I..., then...)</span>
              <textarea className="input-glass" style={{ minHeight: '80px' }} placeholder="If I wake up at 5AM and drink 1L of water, then my morning focus will increase by 20%." value={form.hypothesis} onChange={e => setForm({ ...form, hypothesis: e.target.value })} />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>How will you measure this?</span>
              <input className="input-glass" placeholder="Self-reported focus score (1-10) in reflection." value={form.measurement} onChange={e => setForm({ ...form, measurement: e.target.value })} />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Start Date</span>
              <input type="date" className="input-glass" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
            </div>
            
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleCreate}>
              Launch Experiment
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {experiments.map(exp => {
          const progress = calculateProgress(exp.start_date, exp.end_date);
          return (
            <div key={exp.id} className="glass-panel">
              <div className="flex-between" style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Beaker size={20} color={exp.status === 'active' ? 'var(--accent-primary)' : 'var(--text-muted)'} />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: exp.status === 'active' ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                    {exp.status.toUpperCase()}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  <Calendar size={14} />
                  {new Date(exp.start_date).toLocaleDateString()} - {new Date(exp.end_date).toLocaleDateString()}
                </div>
              </div>

              <h4 style={{ marginBottom: '0.75rem', lineHeight: 1.4 }}>{exp.hypothesis}</h4>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <TrendingUp size={14} />
                Metric: {exp.measurement}
              </div>

              {/* Progress Bar */}
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: 'var(--accent-primary)', transition: 'width 0.5s ease' }}></div>
              </div>
              <div className="flex-between" style={{ marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>PROGRESS</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: 700 }}>{progress}%</span>
              </div>
            </div>
          );
        })}
        {experiments.length === 0 && !showAdd && (
          <div className="text-center" style={{ padding: '3rem', opacity: 0.5 }}>
            <Beaker size={48} style={{ marginBottom: '1rem' }} />
            <p>No active experiments. <br/>Challenge your defaults.</p>
          </div>
        )}
      </div>
    </div>
  );
};
