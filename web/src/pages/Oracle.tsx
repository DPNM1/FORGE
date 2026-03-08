import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Send, Sparkles, History, Mic } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const Oracle: React.FC = () => {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Greetings, ${(profile as any)?.username || 'Seeker'}. I am the Oracle. I see your data, your habits, and your struggles. What shall we analyze today?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-coach', {
        body: { 
          message: input,
          debug_user_id: import.meta.env.DEV ? profile?.id : undefined
        },
        headers: {
          'X-Groq-Api-Key': import.meta.env.VITE_GROQ_API_KEY || ''
        }
      });
      
      if (error) throw error;

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || "I am momentarily blinded by the streams of fate. Try again soon.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err: any) {
      console.error('Oracle Error:', err);
      let errorMsg = "The connection to the Reality Stream is severed. Check your network, Seeker.";
      
      // If we have a specific error message from the Edge Function, try to extract it
      if (import.meta.env.DEV) {
        if (err.context && typeof err.context.json === 'function') {
          try {
            const errorData = await err.context.json();
            console.log('Oracle: Debug Error Body from Edge Function:', errorData);
            if (errorData && errorData.error) {
              errorMsg = `Oracle Error: ${errorData.error}`;
            }
          } catch (e) {
            errorMsg = `Error: ${err.message}`;
          }
        } else if (err.message) {
          errorMsg = `Error: ${err.message}`;
        }
      }

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorMsg,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-fade-in" style={{ width: '100%', gap: '1rem' }}>
      
      {/* Header Info */}
      <div className="glass-panel flex-between" style={{ padding: '0.75rem 1rem', background: 'linear-gradient(to right, rgba(139, 92, 246, 0.1), rgba(0,0,0,0.4))' }}>
        <div className="flex items-center" style={{ gap: '0.75rem' }}>
          <div className="flex-center" style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent-primary)', color: '#000' }}>
            <Sparkles size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '0.95rem' }}>The Oracle</h3>
            <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>Connected to Reality Stream</p>
          </div>
        </div>
        <History size={20} className="text-muted" style={{ cursor: 'pointer' }} />
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto scrollbar-hide" 
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem' }}
      >
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            style={{ 
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem'
            }}
          >
            <div 
              className="glass-panel" 
              style={{ 
                padding: '0.75rem 1rem',
                borderRadius: msg.role === 'user' ? '18px 18px 2px 18px' : '2px 18px 18px 18px',
                background: msg.role === 'user' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                color: msg.role === 'user' ? '#000' : 'var(--text-main)',
                fontSize: '0.9rem',
                lineHeight: 1.5,
                boxShadow: msg.role === 'user' ? '0 4px 15px rgba(167, 139, 250, 0.3)' : 'none'
              }}
            >
              {msg.content}
            </div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: msg.role === 'user' ? 'right' : 'left', padding: '0 0.5rem' }}>
              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        {isTyping && (
          <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '4px', paddingLeft: '1rem' }}>
            <div className="animate-pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-primary)' }}></div>
            <div className="animate-pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-primary)', animationDelay: '0.2s' }}></div>
            <div className="animate-pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-primary)', animationDelay: '0.4s' }}></div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="glass-panel" style={{ padding: '0.5rem', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button className="flex-center" style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)', border: 'none' }}>
          <Mic size={20} />
        </button>
        <input 
          type="text" 
          placeholder="Consult the Oracle..." 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          style={{ 
            flex: 1, 
            background: 'transparent', 
            border: 'none', 
            color: '#fff', 
            padding: '0.5rem',
            outline: 'none',
            fontSize: '0.95rem'
          }}
        />
        <button 
          onClick={handleSendMessage}
          className="flex-center" 
          style={{ 
            width: 40, 
            height: 40, 
            borderRadius: '50%', 
            background: input.trim() ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)', 
            color: input.trim() ? '#000' : 'var(--text-muted)', 
            border: 'none',
            transition: 'all 0.3s ease'
          }}
        >
          <Send size={18} />
        </button>
      </div>

      {/* Quick Action Suggestions */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }} className="scrollbar-hide">
         {['Am I on track?', 'Find my weak patterns', 'Analyze my focus', 'Motivate me'].map(text => (
           <button 
             key={text}
             onClick={() => setInput(text)}
             style={{ 
               whiteSpace: 'nowrap', 
               padding: '0.4rem 0.8rem', 
               borderRadius: '9999px', 
               background: 'rgba(255,255,255,0.03)', 
               border: '1px solid var(--glass-border)',
               fontSize: '0.75rem',
               color: 'var(--text-muted)',
               cursor: 'pointer'
             }}
           >
             {text}
           </button>
         ))}
      </div>
    </div>
  );
};
