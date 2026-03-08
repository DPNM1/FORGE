import cron from 'node-cron';
import { Bot } from 'grammy';
import { supabase } from '../supabase';

export function setupCronJobs(bot: Bot) {
  // Morning Activation: Runs every hour, checks who needs a reminder at this hour based on their timezone
  cron.schedule('0 * * * *', async () => {
    try {
      // In a real system, you'd match the server UTC time to the user's local time 
      // based on their configured `timezone` and `morning_reminder` mapping.
      // For simplicity here, we'll fetch users whose `morning_reminder` aligns with the current UTC hour.
      
      const { data: profiles } = await supabase
        .from('profiles')
        .select('telegram_id, first_name');
        
      if (!profiles) return;
      
      // Here you would do the timezone math and only message the relevant people.
      // This is a placeholder for the logic.
    } catch (e) {
      console.error('Error in morning cron:', e);
    }
  });

  // Monday 8 AM Weekly Briefing (Server time / simplified UTC)
  cron.schedule('0 8 * * 1', async () => {
    // Send weekly briefing to users
  });

  // Sunday 10 AM Weekly Review Prompt
  cron.schedule('0 10 * * 0', async () => {
    // Keep it simple for now as per Phase 2 requirements
  });
}
