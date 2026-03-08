import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-groq-api-key',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { message, debug_user_id } = await req.json();

    // 1. Get User Context (Allow debug_user_id for local testing)
    let user_id;
    if (debug_user_id) {
      user_id = debug_user_id;
    } else {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) throw new Error('Unauthorized');
      user_id = user.id;
    }

    // 2. Fetch User Data for Context
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: stats } = await supabaseClient
      .from('v_user_stats')
      .select('*')
      .eq('user_id', user_id)
      .single();

    const { data: reflections } = await supabaseClient
      .from('daily_reflections')
      .select('did_well, fell_short, what_differently, score_focus, date')
      .eq('user_id', user_id)
      .gte('date', sevenDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: false });

    // 3. Prepare Prompt
    const systemPrompt = `You are The Oracle, a mystical but analytical performance coach.
Analyze the user's data:
- Stream Name: ${stats?.username || 'Seeker'}
- Current Streak: ${stats?.current_streak || 0}
- Recent Reflections: ${JSON.stringify(reflections || [])}

Be direct. Use data. If they are failing, be stern. If winning, be mystical.
End with one tactical step.`;

    const groqApiKey = Deno.env.get('GROQ_API_KEY') || req.headers.get('X-Groq-Api-Key');
    
    if (!groqApiKey) throw new Error('GROQ_API_KEY is not set in Supabase secrets or headers');
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Groq API error (${response.status}): ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    if (!data.choices || !data.choices[0]) {
      throw new Error(`Invalid response from Groq: ${JSON.stringify(data)}`);
    }
    const reply = data.choices[0].message.content;

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
