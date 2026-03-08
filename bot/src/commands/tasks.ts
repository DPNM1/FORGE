import { Bot } from 'grammy';
import { supabase } from '../supabase';

export function setupTasksCommand(bot: Bot) {
  bot.command('tasks', async (ctx) => {
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    // First find the user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('telegram_id', telegramId)
      .single();

    if (!profile) {
      return ctx.reply('Profile not found. Please click /start to initialize.');
    }

    // Get today's tasks
    const today = new Date().toISOString().split('T')[0];
    const { data: tasks, error } = await supabase
      .from('daily_tasks')
      .select('id, title, completed, sort_order')
      .eq('user_id', profile.id)
      .eq('date', today)
      .order('sort_order', { ascending: true });

    if (error || !tasks || tasks.length === 0) {
      return ctx.reply('You have no tasks set for today.\nCreate them in the Mini App!');
    }

    let message = "📅 *Today's Tasks*\n\n";
    tasks.forEach((t) => {
      const checkbox = t.completed ? '✅' : '⬜️';
      message += `${checkbox} ${t.sort_order}. ${t.title}\n`;
    });

    message += '\nUse `/done <number>` to mark a task as complete.';

    await ctx.reply(message, { parse_mode: 'Markdown' });
  });
}
