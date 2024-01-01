import filterAbsolute from './filters/FilterAbsolute';
import buildConfig from './buildConfig';
import filterDate from './filters/FilterDate';
import NotionDiscordClient from './NotionDiscordClient';
import dotenv from 'dotenv';

dotenv.config();

const CONFIG = buildConfig('./config.json', {
    absolute: filterAbsolute,
    date: filterDate,
});

const bot = new NotionDiscordClient(
    {
        intents: [],
    },
    CONFIG
);
bot.once('ready', (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});
(async () => {
    await bot.registerCommandsFromFolders('/commands');
    await bot.login(process.env.DISCORD_TOKEN);
    await bot.pushAllCommands();
})();
