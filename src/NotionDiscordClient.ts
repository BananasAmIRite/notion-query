import { Client, ClientOptions, Collection } from 'discord.js';
import { QueryConfig } from './buildConfig';
import Command from './Command';
import { realpathSync } from 'fs';
import { glob } from 'glob';

export default class NotionDiscordClient extends Client {
    private commands: Collection<string, Command> = new Collection();
    public constructor(discordOptions: ClientOptions, public readonly notionConfig: QueryConfig) {
        super(discordOptions);
        this.registerSlashCommandListeners();
    }

    public async registerCommandsFromFolders(p) {
        const files = await glob(__dirname + `${p}/**/*{.ts,.js}`, {
            realpath: true,
        });

        for (const commandFile of files) {
            if (commandFile) {
                const command: Command = new (await import(realpathSync(commandFile))).default(this);
                console.log(`Loaded command with name, ${command.commandOptions.name}. `);
                this.commands.set(command.commandOptions.name, command);
            }
        }
    }

    private registerSlashCommandListeners() {
        this.on('interactionCreate', async (interaction) => {
            if (!interaction.isChatInputCommand()) return;
            const command = this.commands.get(interaction.commandName);
            if (!command) return;
            await command.run(interaction, this);
        });
    }

    public async pushAllCommands(guildID?: string) {
        this.application.commands.set(
            Array.from(this.commands.values()).map((e) => e.commandOptions.toJSON()),
            guildID
        );
    }
}
