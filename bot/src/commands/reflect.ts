import { Bot } from 'grammy';

export function setupReflectCommand(bot: Bot) {
  bot.command('reflect', async (ctx) => {
    // Determine the web app URL from an environment variable
    const webAppUrl = process.env.WEB_APP_URL || 'https://example.com'; 
    const reflectUrl = `${webAppUrl}/mirror`; // Assuming /mirror is the route for reflections
    
    const message = `🧘 Time for The Franklin.\nReflect on your day, log your score, and build your foundation for tomorrow.`;
    
    await ctx.reply(message, {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Start Reflection', web_app: { url: reflectUrl } }]
        ]
      }
    });
  });
}
