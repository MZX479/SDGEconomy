import config from '#config';
import { client } from '@/Main';
import { EmbedBuilder, TextBasedChannel } from 'discord.js';
import { Logger } from '@/config/logger';

/** @description Log error to console and write one to error file */
export async function handle_error<Template extends object>(
  err: string | Error,
  from: string,
  data?: Template
) {
  console.error(err);
  Logger.error(err);

  const errors_channel = client.channels.cache.get(config.errors_channel) as
    | TextBasedChannel
    | undefined;

  const result = [
    {
      name: `🛠️ Error's place:`,
      value: `> \`${from}\``,
    },
    {
      name: '📄 Description:',
      value: `\`\`\`${JSON.stringify(err, null, '\t')}\`\`\``,
    },
  ];

  if (data)
    result.push({
      name: '📌 Additional parameters:',
      value: `\`\`\`${JSON.stringify(data, null, '\t')}\`\`\``,
    });

  const error_embed = new EmbedBuilder()
    .setTitle('⚠️ Unexpected error while bot working:')
    .addFields(...result)
    .setColor('#DF1515');

  if (!errors_channel) {
    const owner = await client.users.fetch(config.owner);

    owner.send({
      content: `> :warning: Provide an error channel!\n\n`,
      embeds: [error_embed],
    });

    return;
  }

  errors_channel.send({
    embeds: [error_embed],
  });
}
