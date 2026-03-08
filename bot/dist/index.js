"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bot_1 = require("./bot");
const start_1 = require("./commands/start");
const tasks_1 = require("./commands/tasks");
const done_1 = require("./commands/done");
const deepwork_1 = require("./commands/deepwork");
const stats_1 = require("./commands/stats");
const reflect_1 = require("./commands/reflect");
const system_1 = require("./cron/system");
// Initialize commands
(0, start_1.setupStartCommand)(bot_1.bot);
(0, tasks_1.setupTasksCommand)(bot_1.bot);
(0, done_1.setupDoneCommand)(bot_1.bot);
(0, deepwork_1.setupDeepworkCommand)(bot_1.bot);
(0, stats_1.setupStatsCommand)(bot_1.bot);
(0, reflect_1.setupReflectCommand)(bot_1.bot);
// Initialize cron jobs
(0, system_1.setupCronJobs)(bot_1.bot);
// Error handling
bot_1.bot.catch((err) => {
    console.error(`Error while handling update ${err.ctx.update.update_id}:`);
    err.error && console.error(err.error);
});
// Start the bot using long polling for development
// In production, you might want to switch to webhooks
bot_1.bot.start({
    onStart: (botInfo) => {
        console.log(`Bot started! @${botInfo.username}`);
    },
});
