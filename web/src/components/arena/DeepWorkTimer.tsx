import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Play, Square, Pause } from 'lucide-react';

export const DeepWorkTimer: React.FC = () => {
  const { profile } = useAuth();
  
  // States: 'idle', 'running', 'paused', 'finished'
  const [sessionState, setSessionState] = useState<'idle' | 'running' | 'paused'>('idle');
  const [selectedMinutes, setSelectedMinutes] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60 * 60);
  
  // Timer tracking (delta time approach for background accuracy)
  const timerRef = useRef<number | null>(null);
  const targetEndTimeRef = useRef<number | null>(null);
  const pausedTimeLeftRef = useRef<number | null>(null);

  // We should track when the session officially started to record the DB row later
  const [startTime, setStartTime] = useState<Date | null>(null);

  const startTimer = () => {
    if (sessionState === 'idle') {
      setTimeLeft(selectedMinutes * 60);
      setStartTime(new Date());
      targetEndTimeRef.current = Date.now() + (selectedMinutes * 60 * 1000);
    } else if (sessionState === 'paused' && pausedTimeLeftRef.current) {
      // Resume from pause
      targetEndTimeRef.current = Date.now() + (pausedTimeLeftRef.current * 1000);
    }

    setSessionState('running');
  };

  const pauseTimer = () => {
    setSessionState('paused');
    pausedTimeLeftRef.current = timeLeft;
    if (timerRef.current) {
      cancelAnimationFrame(timerRef.current);
    }
  };

  const endSession = async () => {
    if (timerRef.current) cancelAnimationFrame(timerRef.current);
    
    // Calculate total actual minutes performed
    const totalSelectedSeconds = selectedMinutes * 60;
    const actualSeconds = totalSelectedSeconds - timeLeft;
    const actualMinutes = Math.floor(actualSeconds / 60);

    setSessionState('idle');
    setTimeLeft(selectedMinutes * 60);

    // Save to DB if more than 1 minute was completed
    if (actualMinutes > 0 && profile?.id && startTime) {
      const today = new Date().toISOString().split('T')[0];
      try {
        await supabase.from('deep_work_sessions').insert({
          user_id: profile.id,
          date: today,
          planned_minutes: selectedMinutes,
          actual_minutes: actualMinutes,
          completed: actualMinutes >= selectedMinutes - 5 // Considers it "completed" if within 5 min of target
        });
      } catch (err) {
        console.error("Error saving deep work session:", err);
      }
    }
  };

  useEffect(() => {
    if (sessionState === 'running') {
      const updateTimer = () => {
        if (!targetEndTimeRef.current) return;
        
        const now = Date.now();
        const difference = targetEndTimeRef.current - now;

        if (difference <= 0) {
          setTimeLeft(0);
          endSession(); // Auto-end when time is up
        } else {
          setTimeLeft(Math.ceil(difference / 1000));
          timerRef.current = requestAnimationFrame(updateTimer);
        }
      };

      timerRef.current = requestAnimationFrame(updateTimer);
    }

    return () => {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
    };
  }, [sessionState]);

  // Formatting MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercentage = sessionState !== 'idle' 
    ? ((selectedMinutes * 60 - timeLeft) / (selectedMinutes * 60)) * 100 
    : 0;

  return (
    <div className="glass-panel text-center animate-fade-in" style={{ width: '100%', padding: '2rem 1.5rem' }}>
      
      {sessionState === 'idle' ? (
        <>
          <h2 style={{ marginBottom: '1.5rem' }}>Deep Work</h2>
          <div className="flex-center" style={{ gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            {[25, 45, 60, 90, 120].map(mins => (
              <button
                key={mins}
                className="btn"
                style={{
                  background: selectedMinutes === mins ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                  color: selectedMinutes === mins ? '#000' : 'var(--text-main)',
                  minWidth: '60px',
                  padding: '0.5rem'
                }}
                onClick={() => setSelectedMinutes(mins)}
              >
                {mins}m
              </button>
            ))}
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={startTimer}>
            <Play size={20} /> Enter The Flow
          </button>
        </>
      ) : (
        <div className="flex-center" style={{ flexDirection: 'column' }}>
          {/* Progress Ring / Timer Display */}
          <div style={{ position: 'relative', width: '240px', height: '240px', margin: '2rem 0' }}>
            {/* SVG Ring background */}
            <svg width="240" height="240" viewBox="0 0 240 240" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="120" cy="120" r="110" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <circle 
                cx="120" cy="120" r="110" 
                fill="none" 
                stroke="var(--accent-primary)" 
                strokeWidth="8" 
                strokeDasharray={2 * Math.PI * 110}
                strokeDashoffset={2 * Math.PI * 110 * (1 - progressPercentage / 100)}
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            
            {/* Countdown Text */}
            <div className="flex-center" style={{ 
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              flexDirection: 'column'
            }}>
              <span style={{ 
                fontSize: '3.5rem', 
                fontWeight: 700, 
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-0.05em'
              }}>
                {formatTime(timeLeft)}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {sessionState === 'paused' ? 'PAUSED' : 'DEEP WORK'}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex-center" style={{ gap: '1rem', width: '100%' }}>
            {sessionState === 'running' ? (
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={pauseTimer}>
                <Pause size={20} /> Pause
              </button>
            ) : (
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={startTimer}>
                <Play size={20} /> Resume
              </button>
            )}
            <button 
              className="btn" 
              style={{ flex: 1, background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)' }} 
              onClick={endSession}
            >
              <Square size={20} /> End Session
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
