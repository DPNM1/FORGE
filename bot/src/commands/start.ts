import { Bot } from 'grammy';
import { supabase } from '../supabase';

export function setupStartCommand(bot: Bot) {
  bot.command('start', async (ctx) => {
    // Determine the web app URL from an environment variable
    const webAppUrl = process.env.WEB_APP_URL || 'https://example.com'; 
    
    const message = `Welcome to The FORGE.\nYour system for identity, execution, and growth.\n\nOpen the Mini App to begin your journey:`;
    
    await ctx.reply(message, {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Enter The FORGE', web_app: { url: webAppUrl } }]
        ]
      }
    });

    // We can also ensure the user's basic record exists in the database
    // Though primarily handled by the Mini App via initData, it's good practice
    // if the bot discovers them first. (We'll let the Mini App handle full auth for now).
  });
}
