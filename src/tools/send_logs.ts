import {
  ColorResolvable,
  CommandInteraction,
  EmbedBuilder,
  EmbedFooterOptions,
  TextChannel,
} from 'discord.js';

import { client } from '@/Main';

export class SendLogs {
  interaction: CommandInteraction;
  constructor(interaction: CommandInteraction) {
    this.interaction = interaction;
  }

  //Need to finish timestamp template
  send_logs(
    color: ColorResolvable,
    title: string,
    description: string,
    timestamp: Date | any,
    footer: EmbedFooterOptions
  ) {
    const bot = client;

    const log_channel = <TextChannel>(
      bot.channels.cache.get('1015511147480371232')
    );
    const log_embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(title)
      .setAuthor({
        name: bot.user!.tag,
        iconURL: bot.user!.displayAvatarURL(),
      })
      .setDescription(description)
      .setTimestamp(timestamp)
      .setFooter(footer);

    return log_channel.send({ embeds: [log_embed] });
  }
}
