"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupStatsCommand = setupStatsCommand;
const supabase_1 = require("../supabase");
function setupStatsCommand(bot) {
    bot.command('stats', async (ctx) => {
        const telegramId = ctx.from?.id;
        if (!telegramId)
            return;
        // Find profile
        const { data: profile } = await supabase_1.supabase
            .from('profiles')
            .select('id')
            .eq('telegram_id', telegramId)
            .single();
        if (!profile)
            return ctx.reply('Profile not found.');
        // Fetch stats from our view
        const { data: stats, error } = await supabase_1.supabase
            .from('v_user_stats')
            .select('*')
            .eq('user_id', profile.id)
            .single();
        if (error || !stats) {
            return ctx.reply('Could not load your statistics.');
        }
        const msg = `📊 *Your FORGE Stats*\n\n` +
            `🔥 Current Streak: *${stats.current_streak} days*\n` +
            `🏆 Longest Streak: *${stats.longest_streak} days*\n\n` +
            `✅ Tasks Completed: *${stats.total_tasks_completed}*\n` +
            `🧠 Deep Work: *${Math.round(stats.total_deep_work_minutes / 60)} hours*\n` +
            `🧘 Reflections: *${stats.total_reflections}*\n\n` +
            `⚡ Energy (30d): *${stats.avg_energy_30d ? Number(stats.avg_energy_30d).toFixed(1) : '-'} / 10*\n` +
            `🎯 Focus (30d): *${stats.avg_focus_30d ? Number(stats.avg_focus_30d).toFixed(1) : '-'} / 10*\n` +
            `📈 Progress (30d): *${stats.avg_progress_30d ? Number(stats.avg_progress_30d).toFixed(1) : '-'} / 10*`;
        await ctx.reply(msg, { parse_mode: 'Markdown' });
    });
}
