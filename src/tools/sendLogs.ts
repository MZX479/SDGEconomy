import {
  Colors,
  CommandInteraction,
  EmbedBuilder,
  TextBasedChannel,
} from 'discord.js';

export async function command_logger(data: {
  interaction: CommandInteraction;
  title: string;
  description: string;
}) {
  const { interaction, title, description } = data;

  const log_channel = interaction.guild?.channels.cache.get(
    '1015511147480371232'
  ) as TextBasedChannel;

  const get_embed = new EmbedBuilder()
    .setColor(Colors.Aqua)
    .setAuthor({
      name: interaction.user.tag,
    })
    .setTitle(title)
    .setThumbnail(interaction.user.displayAvatarURL())
    .setDescription(`>>> **${description}**`)
    .setTimestamp(new Date());

  return log_channel.send({ embeds: [get_embed] });
}
