import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// Helper component for animated list items
const ListItem = ({ index, value, onChange, placeholder }: any) => (
  <div className="flex-center" style={{ gap: '0.5rem', marginBottom: '0.75rem' }}>
    <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>{index + 1}.</span>
    <input 
      className="input-base" 
      placeholder={placeholder} 
      value={value}
      onChange={(e) => onChange(index, e.target.value)}
      style={{ margin: 0 }}
    />
  </div>
);

export const Onboarding: React.FC = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();
  const navigate = useNavigate();

  // Step 2: Identity
  const [identities, setIdentities] = useState(['', '', '']);
  
  // Step 3: North Star
  const [visions, setVisions] = useState({
    '1_year': '',
    '3_year': '',
    '10_year': ''
  });

  // Step 4: Anti-List
  const [antiList, setAntiList] = useState(['', '', '']);

  // Step 5: Big 3 Goals
  const [goals, setGoals] = useState(['', '', '']);
  
  // Handlers for lists
  const updateList = (list: string[], setter: any, index: number, value: string) => {
    const newList = [...list];
    newList[index] = value;
    setter(newList);
  };

  const handleFinish = async () => {
    if (!profile?.id) return;
    setLoading(true);
    try {
      // 1. Save Identities
      const validIdentities = identities.filter(i => i.trim() !== '');
      if (validIdentities.length > 0) {
        await supabase.from('identity_statements').insert(
          validIdentities.map((stmt, i) => ({
            user_id: profile.id,
            statement: stmt,
            sort_order: i
          }))
        );
      }

      // 2. Save North Stars
      const visionEntries = Object.entries(visions)
        .filter(([_, vis]) => vis.trim() !== '')
        .map(([timeframe, vision]) => ({
          user_id: profile.id,
          timeframe,
          vision
        }));
      if (visionEntries.length > 0) {
        await supabase.from('north_stars').insert(visionEntries);
      }

      // 3. Save Anti-List
      const validAnti = antiList.filter(a => a.trim() !== '');
      if (validAnti.length > 0) {
        await supabase.from('anti_list_items').insert(
          validAnti.map((item, i) => ({
            user_id: profile.id,
            item: item,
            sort_order: i
          }))
        );
      }

      // 4. Save Quarterly Goals (Big 3)
      const validGoals = goals.filter(g => g.trim() !== '');
      if (validGoals.length > 0) {
        // Calculate current quarter (e.g. "2026-Q1")
        const date = new Date();
        const year = date.getFullYear();
        const q = Math.floor(date.getMonth() / 3) + 1;
        
        await supabase.from('quarterly_goals').insert(
          validGoals.map((title) => ({
            user_id: profile.id,
            title: title,
            description: '',
            quarter: `${year}-Q${q}`,
            progress: 0,
            status: 'active'
          }))
        );
      }

      // 5. Mark Onboarding as Complete
      await supabase.from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', profile.id);

      navigate('/');
    } catch (err) {
      console.error("Error saving onboarding data:", err);
      // In a real app, show error toast
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step < 6) setStep(step + 1);
    else handleFinish();
  };

  return (
    <div className="app-container flex-center" style={{ minHeight: '100vh', flexDirection: 'column' }}>
      <div className="glass-panel animate-slide-up" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <h1 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>The FORGE</h1>
        
        <div style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {step === 1 && (
            <div>
              <h2>Welcome, {profile?.first_name || 'Initiate'}.</h2>
              <p style={{ margin: '1rem 0 2rem' }}>
                You are about to build your personal performance operating system.<br/><br/>
                This requires honesty, commitment, and action.
              </p>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2>Identity</h2>
              <p style={{ margin: '1rem 0' }}>Who are you becoming? Declare it.</p>
              {identities.map((val, i) => (
                <ListItem 
                  key={i} index={i} value={val} 
                  onChange={(idx: number, v: string) => updateList(identities, setIdentities, idx, v)} 
                  placeholder={["I am a disciplined athlete...", "I am a relentless builder...", "I am a calm leader..."][i]}
                />
              ))}
            </div>
          )}

          {step === 3 && (
            <div>
              <h2>North Star</h2>
              <p style={{ margin: '1rem 0' }}>Where is this trajectory taking you?</p>
              
              <div style={{ textAlign: 'left', marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>1 Year Vision</label>
                <textarea className="input-base" style={{ height: '60px', marginTop: '0.25rem' }} value={visions['1_year']} onChange={e => setVisions({...visions, '1_year': e.target.value})} />
              </div>
              <div style={{ textAlign: 'left', marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>3 Year Vision</label>
                <textarea className="input-base" style={{ height: '60px', marginTop: '0.25rem' }} value={visions['3_year']} onChange={e => setVisions({...visions, '3_year': e.target.value})} />
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2>The Anti-List</h2>
              <p style={{ margin: '1rem 0' }}>What behaviors are you permanently eliminating?</p>
              {antiList.map((val, i) => (
                <ListItem 
                  key={i} index={i} value={val} 
                  onChange={(idx: number, v: string) => updateList(antiList, setAntiList, idx, v)} 
                  placeholder={["No mindless scrolling...", "No complaining...", "No snooze button..."][i]}
                />
              ))}
            </div>
          )}

          {step === 5 && (
            <div>
              <h2>The Big 3 Goals</h2>
              <p style={{ margin: '1rem 0' }}>What 3 goals matter most this quarter?</p>
              {goals.map((val, i) => (
                <ListItem 
                  key={i} index={i} value={val} 
                  onChange={(idx: number, v: string) => updateList(goals, setGoals, idx, v)} 
                  placeholder={`Quarterly Goal #${i+1}`}
                />
              ))}
            </div>
          )}

          {step === 6 && (
            <div>
              <h2>Council</h2>
              <p style={{ margin: '1rem 0 2rem' }}>You are ready to forge.<br/><br/>Join a Council later for community, or step into the Arena alone now.</p>
            </div>
          )}
        </div>

        <div className="flex-between" style={{ gap: '1rem', marginTop: '2rem' }}>
          {step > 1 && (
            <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setStep(step - 1)}>
              Back
            </button>
          )}
          <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleNext} disabled={loading}>
            {loading ? 'Forging...' : step === 1 ? 'Begin' : step === 6 ? 'Enter Dashboard' : 'Next'}
          </button>
        </div>
        
        {/* Progress indicators */}
        <div className="flex-center" style={{ gap: '0.5rem', marginTop: '1.5rem' }}>
          {[1,2,3,4,5,6].map(i => (
            <div 
              key={i} 
              style={{
                width: step === i ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: step >= i ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                transition: 'var(--transition)'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
