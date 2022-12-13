import { Slash } from '@/decorators';
import { CommandInteraction, PermissionsBitField } from 'discord.js';
import { InteractionTemplate } from '@/config/templates';
import { command_logger } from '@/tools';
import { MongoClient } from '@/Main';

class DB {
  interaction: CommandInteraction;
  constructor(interaction: CommandInteraction) {
    this.interaction = interaction;
  }

  async overwrite_icon(icon: string) {
    if (!icon)
      throw new Error(
        'Icon was not given. class [DB], method [overwrite_icon]'
      );
    const collection = MongoClient.db(this.interaction.guild!.id).collection(
      'GuildSettings'
    );

    await collection.updateOne(
      {
        guild_id: this.interaction.guild!.id,
      },
      {
        $set: {
          currency_icon: icon,
        },
      }
    );
  }
}

@Slash({
  data: {
    name: 'set_money_icon',
    description: 'set or change a money icon for guild.',
    description_localizations: {
      ru: 'Установка иконки валюты для сервера.',
      'en-US': 'Set or change a money icon for guild.',
    },
    options: [
      {
        name: 'icon',
        description: 'provide an icon.',
        description_localizations: {
          ru: 'Укажите иконку!',
          'en-US': 'Provide an icon!',
        },
        type: 3,
        required: true,
      },
    ],
  },
})
class SetMoneyIcon extends InteractionTemplate {
  interaction: CommandInteraction;
  constructor(interaction: CommandInteraction) {
    super(interaction);
    this.interaction = interaction;
    this._main();
  }

  private async _main() {
    if (
      !(
        this.interaction.member?.permissions as Readonly<PermissionsBitField>
      ).has('Administrator')
    ) {
      this.replyFalseH('You do not have permission to do this!');
      return;
    }
    const icon = this.interaction.options.get('icon')!.value as string;

    await new DB(this.interaction).overwrite_icon(icon);

    const get_embed = this.get_neutral(
      `You successfully added new money icon ${icon}`
    ).setColor('Random');
    this.send({ embeds: [get_embed] });

    command_logger({
      interaction: this.interaction,
      title: 'SetIcon command',
      description: `\`${this.interaction.user.tag}\` changed money icon. Added ${icon}\n Author id: \`${this.interaction.user.id}\``,
    });
    return;
  }
}
