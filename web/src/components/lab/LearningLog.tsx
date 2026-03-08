import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Book, Podcast, FileText, Video, GraduationCap, Plus, Send, X } from 'lucide-react';

const CONTENT_TYPES = [
  { value: 'book', label: 'Book', icon: Book },
  { value: 'podcast', label: 'Podcast', icon: Podcast },
  { value: 'article', label: 'Article', icon: FileText },
  { value: 'video', label: 'Video', icon: Video },
  { value: 'course', label: 'Course', icon: GraduationCap }
];

export const LearningLog: React.FC = () => {
  const { profile } = useAuth();
  const [learnings, setLearnings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  
  const [form, setForm] = useState({
    title: '',
    content_type: 'book',
    summary: '',
    takeaway: ''
  });

  useEffect(() => {
    if (profile?.id) fetchLearnings();
  }, [profile?.id]);

  const fetchLearnings = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('learnings')
        .select('*')
        .eq('user_id', profile?.id)
        .order('created_at', { ascending: false });
      
      if (data) setLearnings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.summary || !form.takeaway || !profile?.id) return;

    try {
      const { data, error } = await supabase
        .from('learnings')
        .insert({
          user_id: profile.id,
          ...form
        })
        .select()
        .single();

      if (error) throw error;
      setLearnings([data, ...learnings]);
      setShowAdd(false);
      setForm({ title: '', content_type: 'book', summary: '', takeaway: '' });
    } catch (err) {
      console.error(err);
      alert("Failed to save learning.");
    }
  };

  if (loading) return <div className="text-center" style={{ padding: '2rem' }}>Loading knowledge...</div>;

  return (
    <div className="animate-fade-in">
      {!showAdd ? (
        <button 
          className="glass-panel flex-center" 
          onClick={() => setShowAdd(true)}
          style={{ width: '100%', padding: '1rem', border: '1px dashed var(--glass-border)', color: 'var(--accent-primary)', gap: '0.5rem', marginBottom: '1.5rem' }}
        >
          <Plus size={20} /> Log New Learning
        </button>
      ) : (
        <div className="glass-panel" style={{ marginBottom: '1.5rem', position: 'relative' }}>
          <button style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-muted)' }} onClick={() => setShowAdd(false)}>
            <X size={20} />
          </button>
          <h3 style={{ marginBottom: '1.5rem' }}>Knowledge Capture</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <input className="input-glass" placeholder="Source Title (e.g. Atomic Habits)" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            
            <div className="flex-between" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
              {CONTENT_TYPES.map(type => (
                <button 
                  key={type.value}
                  className="btn"
                  style={{ 
                    flex: 1, 
                    fontSize: '0.8rem',
                    padding: '0.5rem',
                    background: form.content_type === type.value ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                    color: form.content_type === type.value ? '#000' : 'var(--text-main)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  onClick={() => setForm({ ...form, content_type: type.value })}
                >
                  <type.icon size={16} />
                  {type.label}
                </button>
              ))}
            </div>

            <textarea className="input-glass" placeholder="3-Sentence Summary" style={{ minHeight: '100px' }} value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} />
            <textarea className="input-glass" placeholder="The #1 Actionable Takeaway" style={{ minHeight: '80px' }} value={form.takeaway} onChange={e => setForm({ ...form, takeaway: e.target.value })} />
            
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSubmit}>
              <Send size={18} style={{ marginRight: '8px' }} /> Save to Lab
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {learnings.map(item => (
          <div key={item.id} className="glass-panel">
            <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {(() => {
                  const Icon = CONTENT_TYPES.find(t => t.value === item.content_type)?.icon || Book;
                  return <Icon size={16} color="var(--accent-primary)" />;
                })()}
                <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-primary)' }}>{item.content_type}</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(item.created_at).toLocaleDateString()}</span>
            </div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>{item.title}</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem', fontStyle: 'italic' }}>"{item.summary}"</p>
            <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: '3px solid var(--accent-primary)' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, display: 'block', color: 'var(--accent-primary)', marginBottom: '2px' }}>CORE TAKEAWAY</span>
              <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 500 }}>{item.takeaway}</p>
            </div>
          </div>
        ))}
        {learnings.length === 0 && !showAdd && (
          <div className="text-center" style={{ padding: '3rem', opacity: 0.5 }}>
            <GraduationCap size={48} style={{ marginBottom: '1rem' }} />
            <p>Your library is empty. <br/>Start logging your growth.</p>
          </div>
        )}
      </div>
    </div>
  );
};
