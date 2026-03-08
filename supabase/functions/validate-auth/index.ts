import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import * as jose from "https://deno.land/x/jose@v4.14.4/index.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function verifyTelegramWebAppData(telegramInitData: string, botToken: string): Promise<any> {
  const initData = new URLSearchParams(telegramInitData);
  const hash = initData.get("hash");
  if (!hash) throw new Error("No hash in initData");
  
  initData.delete("hash");
  const dataToCheck = [...initData.entries()]
    .map(([key, value]) => `${key}=${value}`)
    .sort()
    .join("\n");
  
  const encoder = new TextEncoder();
  const secretKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode("WebAppData"),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const hmacKeyArrayBuffer = await crypto.subtle.sign("HMAC", secretKey, encoder.encode(botToken));
  
  const finalKey = await crypto.subtle.importKey(
    "raw",
    hmacKeyArrayBuffer,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  
  const hexHash = [...new Uint8Array(await crypto.subtle.sign("HMAC", finalKey, encoder.encode(dataToCheck)))]
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
    
  if (hexHash !== hash) throw new Error("Invalid hash - validation failed");
  
  const userJson = initData.get("user");
  if (!userJson) throw new Error("No user data found in initData");
  return JSON.parse(userJson);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { initData } = await req.json();
    if (!initData) throw new Error("Missing initData");

    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const jwtSecret = Deno.env.get('SUPABASE_JWT_SECRET');

    if (!botToken || !supabaseUrl || !supabaseKey || !jwtSecret) {
      throw new Error("Missing environment variables");
    }

    const tgUser = await verifyTelegramWebAppData(initData, botToken);
    
    if (!tgUser.id) throw new Error('Invalid user ID from Telegram');

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Check if user exists
    let { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('telegram_id', tgUser.id)
      .single();

    if (!profile) {
      // Create new profile
      const { data: newProfile, error } = await supabase
        .from('profiles')
        .insert({
          telegram_id: tgUser.id,
          first_name: tgUser.first_name,
          last_name: tgUser.last_name,
          username: tgUser.username,
        })
        .select()
        .single();
        
      if (error) throw error;
      profile = newProfile;
    }

    // Create a custom JWT
    const secret = new TextEncoder().encode(jwtSecret);
    const jwt = await new jose.SignJWT({
        sub: profile.id, // Supabase user's UUID
        role: "authenticated",
        user_metadata: { telegram_id: tgUser.id }
      })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30d')
      .sign(secret);

    return new Response(JSON.stringify({ token: jwt, user: profile }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 401, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
