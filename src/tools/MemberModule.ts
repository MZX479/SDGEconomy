import { InteractionTemplate } from '@/config/templates';
import { CommandInteraction, GuildMember } from 'discord.js';
import { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord.js';
import { handle_error } from './handle_error';

export const member_options = (
  options: RESTPostAPIChatInputApplicationCommandsJSONBody['options'] = []
) => {
  const member_options = [
    ...options,
    {
      name: 'member',
      description: 'guild member.',
      description_localizations: {
        ru: 'Укажите участника для передачи денег.',
        'en-US': 'Provide a member to transfer money!',
      },
      type: 6,
    },
    {
      name: 'member_id',
      description: 'id of Guild Member.',
      description_localizations: {
        ru: 'Укажите айди участника.',
        'en-US': 'Provide a member id.',
      },
      type: 3,
    },
  ];
  return member_options;
};

/**@description Member check and work with user id*/
export async function member_module(interaction: CommandInteraction) {
  try {
    const template = new InteractionTemplate(interaction);
    let member = interaction.options.get('member')?.member as
      | GuildMember
      | undefined;

    const member_id = interaction.options.get('member_id')?.value as
      | string
      | undefined;

    if (!member && !member_id) {
      template.replyFalseH('Please, provide a member or his(er) id!');
      return;
    }

    if (!member && member_id) {
      member = await interaction.guild!.members.fetch(member_id);
    }
    return member;
  } catch (err) {
    const error = err as Error;
    handle_error(error, 'function [member_module]', {
      interaction,
    });
  }
}
