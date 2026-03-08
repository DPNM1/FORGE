"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupDeepworkCommand = setupDeepworkCommand;
const supabase_1 = require("../supabase");
function setupDeepworkCommand(bot) {
    bot.command('deepwork', async (ctx) => {
        const telegramId = ctx.from?.id;
        if (!telegramId)
            return;
        // Get minutes from args
        const match = ctx.match;
        const minutes = parseInt(match.trim(), 10);
        if (isNaN(minutes) || minutes <= 0) {
            return ctx.reply('Please specify duration in minutes.\nExample: `/deepwork 60`', { parse_mode: 'Markdown' });
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
        // Log the deep work session
        const { error } = await supabase_1.supabase
            .from('deep_work_sessions')
            .insert({
            user_id: profile.id,
            date: today,
            planned_minutes: minutes,
            completed: false, // Could be marked completed later or assume done if logged after
        });
        if (error) {
            return ctx.reply('Error starting deep work session. Please try again.');
        }
        await ctx.reply(`🧠 *Deep Work Started:* ${minutes} minutes.\nFocus intensely. I will record this session.`, { parse_mode: 'Markdown' });
    });
}
