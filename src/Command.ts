import { CommandInteraction, Interaction, SlashCommandBuilder } from 'discord.js';
import NotionDiscordClient from './NotionDiscordClient';

abstract class Command {
    public constructor(public readonly commandOptions: SlashCommandBuilder) {}

    public abstract run(interaction: CommandInteraction, client: NotionDiscordClient);
}

export default Command;
