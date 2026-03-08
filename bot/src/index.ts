import { bot } from './bot';
import { setupStartCommand } from './commands/start';
import { setupTasksCommand } from './commands/tasks';
import { setupDoneCommand } from './commands/done';
import { setupDeepworkCommand } from './commands/deepwork';
import { setupStatsCommand } from './commands/stats';
import { setupReflectCommand } from './commands/reflect';
import { setupCronJobs } from './cron/system';

// Initialize commands
setupStartCommand(bot);
setupTasksCommand(bot);
setupDoneCommand(bot);
setupDeepworkCommand(bot);
setupStatsCommand(bot);
setupReflectCommand(bot);

// Initialize cron jobs
setupCronJobs(bot);

// Error handling
bot.catch((err) => {
  console.error(`Error while handling update ${err.ctx.update.update_id}:`);
  err.error && console.error(err.error);
});

// Start the bot using long polling for development
// In production, you might want to switch to webhooks
bot.start({
  onStart: (botInfo) => {
    console.log(`Bot started! @${botInfo.username}`);
  },
});
