import { InteractionTemplate } from '@/config/templates';
import { ActionRowBuilder, ButtonBuilder } from '@discordjs/builders';
import { ButtonStyle, CommandInteraction, Message } from 'discord.js';

export async function check(interaction: CommandInteraction): Promise<boolean> {
  const template = new InteractionTemplate(interaction);

  const true_button = new ButtonBuilder()
    .setLabel('Yes')
    .setStyle(ButtonStyle.Success)
    .setCustomId('yes');
  const false_button = new ButtonBuilder()
    .setLabel('No')
    .setStyle(ButtonStyle.Danger)
    .setCustomId('no');

  const get_embed = template.get_neutral('⚠️ Are you sure?');

  get_embed.setColor('#FFCC4D');

  const ask_answer = <Message>await template.send({
    embeds: [get_embed],
    components: [
      new ActionRowBuilder().addComponents(true_button, false_button),
    ] as any,
    fetchReply: true,
  });

  const await_answer = await ask_answer.awaitMessageComponent({
    filter: (button) => button.user.id === interaction.user.id,
    time: 30000,
  });

  await ask_answer.edit({ components: [] });

  const to_boolean = await_answer.customId === 'yes';

  return to_boolean;
}
