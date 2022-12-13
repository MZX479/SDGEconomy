import { InteractionTemplate } from '@/config/templates';
import { Slash } from '@/decorators';
import { client } from '@/Main';
import { discharge } from '@/tools';
import {
  CommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
  time,
} from 'discord.js';

@Slash({
  data: new SlashCommandBuilder()
    .setName('status')
    .setNameLocalization('ru', 'статус')
    .setDescription("Show bot's status")
    .setDescriptionLocalization('ru', 'Показать статус бота')
    .toJSON(),
})
class Command extends InteractionTemplate {
  private interaction: CommandInteraction;

  constructor(interaction: CommandInteraction) {
    super(interaction);
    this.interaction = interaction;
    this.execute();
  }

  async execute() {
    const status_emed = new EmbedBuilder()
      .setAuthor({
        name: `♾️ Bot's status ${client.user?.tag}`,
        iconURL: client.user?.displayAvatarURL(),
      })
      .setColor('#732ADC')
      .addFields([
        {
          name: '❕ Status',
          value: '✅ Alive!',
          inline: true,
        },
        {
          name: '\u200b',
          value: `\u200b`,
          inline: true,
        },
        {
          name: '🏓 Ping',
          value: discharge(client.ws.ping),
          inline: true,
        },
        {
          name: '🕰️ Live from',
          value: time(client.readyAt!, 'D') + ` ` + time(client.readyAt!, 'T'),
          inline: true,
        },
        {
          name: '\u200b',
          value: `\u200b`,
          inline: true,
        },
        {
          name: '⏲️ On',
          value: time(client!.readyAt!, 'R'),
          inline: true,
        },
      ])
      .setFooter({
        text: `Version: ${process.env.npm_package_version}`,
      });

    this.send({
      embeds: [status_emed],
    });
  }
}
