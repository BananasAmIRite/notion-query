import {
    CommandInteraction,
    CacheType,
    SlashCommandBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    TextInputBuilder,
    ActionRowBuilder,
    APIActionRowComponent,
    APIMessageActionRowComponent,
} from 'discord.js';
import Command from '../Command';
import NotionDiscordClient from '../NotionDiscordClient';
import { getTasksForUser } from '../getTasks';
import { formatReminderMessage } from '../notion/Notion';

export default class Lookup extends Command {
    public constructor() {
        super(
            new SlashCommandBuilder()
                .setName('lookup')
                .addStringOption((option) =>
                    option.setName('email').setDescription('Email of task holder').setRequired(true)
                )
                .addStringOption((option) =>
                    option
                        .setName('type')
                        .setDescription('Task type')
                        .setChoices(
                            { name: 'Current Tasks', value: 'CURRENT' },
                            { name: 'Overdue Tasks', value: 'OVERDUE' },
                            { name: 'Upcoming Tasks', value: 'UPCOMING' },
                            { name: 'All other tasks', value: 'NONE' }
                        )
                        .setRequired(true)
                )
                .setDescription('Gets all currently necessary tasks')
        );
    }

    public async run(interaction: CommandInteraction<CacheType>, client: NotionDiscordClient) {
        const email = interaction.options.get('email', true).value as string;
        const type = interaction.options.get('type', true).value as string;

        const MAX_INC = 10;

        interaction.deferReply({ ephemeral: true });
        const tasks = await getTasksForUser(client.notionConfig, email, type);

        const BACK_ID = 'BACK';
        const NEXT_ID = 'NEXT';

        // make scrollable buttons
        const backBtn = new ButtonBuilder().setLabel('⬅️').setStyle(ButtonStyle.Secondary).setCustomId(BACK_ID);
        const nextBtn = new ButtonBuilder().setLabel('➡️').setStyle(ButtonStyle.Secondary).setCustomId(NEXT_ID);

        const actionRow = new ActionRowBuilder()
            .addComponents(backBtn, nextBtn)
            .toJSON() as APIActionRowComponent<APIMessageActionRowComponent>;

        const tasksStringed = tasks.map((e, i) =>
            formatReminderMessage({ ...e, index: `${i + 1}` }, client.notionConfig.messageTemplate)
        );

        const canFitOnOnePage = tasksStringed.length <= MAX_INC;
        const MAX_INDEX = tasksStringed.length === 0 ? 0 : Math.ceil(tasksStringed.length / MAX_INC) - 1;

        let index = 0;

        const getPage = (page: number) => {
            const text = tasksStringed.slice(page * MAX_INC, (page + 1) * MAX_INC).join('\n');
            return new EmbedBuilder()
                .setTitle(`Tasks`)
                .setColor('Green')
                .setDescription(text.length === 0 ? 'No tasks found' : text)
                .setFooter({ text: `Page ${page + 1} of ${MAX_INDEX + 1}` });
        };

        const generateMessage = (page: number) => {
            return {
                embeds: [getPage(page)],
                components: canFitOnOnePage ? [] : [actionRow],
            };
        };

        const message = await interaction.editReply(generateMessage(index));
        const collector = message.createMessageComponentCollector({
            filter: ({ user }) => user.id === interaction.user.id,
        });

        collector.on('collect', async (interaction) => {
            switch (interaction.customId) {
                case BACK_ID:
                    index = Math.max(0, index - 1);
                    interaction.update(generateMessage(index));
                    break;
                case NEXT_ID:
                    index = Math.min(MAX_INDEX, index + 1);
                    interaction.update(generateMessage(index));
                    break;
            }
        });
    }
}
