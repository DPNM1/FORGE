"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupDoneCommand = setupDoneCommand;
const supabase_1 = require("../supabase");
function setupDoneCommand(bot) {
    bot.command('done', async (ctx) => {
        const telegramId = ctx.from?.id;
        if (!telegramId)
            return;
        // Get task number from args
        const match = ctx.match;
        const taskNumber = parseInt(match.trim(), 10);
        if (isNaN(taskNumber) || taskNumber < 1 || taskNumber > 3) {
            return ctx.reply('Please specify a task number (1, 2, or 3).\nExample: `/done 1`', { parse_mode: 'Markdown' });
        }
        // Find profile
        const { data: profile } = await supabase_1.supabase
            .from('profiles')
            .select('id')
            .eq('telegram_id', telegramId)
            .single();
        if (!profile)
            return ctx.reply('Profile not found.');
        const today = new Date().toISOString().split('T')[0];
        // Find that specific task
        const { data: tasks } = await supabase_1.supabase
            .from('daily_tasks')
            .select('id, title, completed')
            .eq('user_id', profile.id)
            .eq('date', today)
            .eq('sort_order', taskNumber);
        if (!tasks || tasks.length === 0) {
            return ctx.reply(`You haven't set task #${taskNumber} yet today.`);
        }
        const task = tasks[0];
        if (task.completed) {
            return ctx.reply(`Task #${taskNumber} is already completed!`);
        }
        // Mark as done
        const { error } = await supabase_1.supabase
            .from('daily_tasks')
            .update({ completed: true, completed_at: new Date().toISOString() })
            .eq('id', task.id);
        if (error) {
            return ctx.reply('Error updating task. Please try again.');
        }
        await ctx.reply(`✅ *Completed:* ${task.title}\nGreat job! Keep the momentum going.`, { parse_mode: 'Markdown' });
    });
}
