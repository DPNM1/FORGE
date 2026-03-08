import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getTelegramInitData } from '../lib/telegram';

interface Profile {
  id: string;
  telegram_id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}

interface AuthContextType {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  profile: null,
  loading: true,
  error: null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const authenticate = async () => {
      try {
        const initData = getTelegramInitData();
        
        // For local development without Telegram, we can mock or prompt for an ID
        // In a real app, you'd handle the 'no initData' case gracefully
        if (!initData) {
          // If we are developing locally outside of Telegram, maybe we shouldn't fail fatally
          if (import.meta.env.DEV) {
            console.warn("Running outside Telegram. Not authenticated.");
            setLoading(false);
            return;
          }
          throw new Error("No Telegram init data. Must run inside Telegram.");
        }

        // Call our Supabase Edge Function to validate initData and get a JWT
        const { data, error } = await supabase.functions.invoke('validate-auth', {
          body: { initData },
        });

        if (error) throw error;
        
        const { token, user } = data;

        // Ensure Supabase client uses this custom JWT for subsequent requests
        await supabase.auth.setSession({
          access_token: token,
          refresh_token: '', // We don't have refresh tokens in this flow
        });

        setProfile(user);
      } catch (err: any) {
        console.error('Authentication error:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    authenticate();
  }, []);

  return (
    <AuthContext.Provider value={{ profile, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
