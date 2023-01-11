import { Slash } from '@/decorators';
import { CommandInteraction, time } from 'discord.js';
import { InteractionTemplate } from '@/config/templates';
import { Cooldowns } from '@/tools';

@Slash({
  data: {
    name: 'cooldowns_info',
    description: 'information about user cooldowns.',
    description_localizations: {
      ru: 'Информация о кулдаунах пользователя.',
      'en-US': 'Information about user cooldowns',
    },
  },
})
class CooldownsInfo extends InteractionTemplate {
  interaction: CommandInteraction;
  constructor(interaction: CommandInteraction) {
    super(interaction);
    this.interaction = interaction;
    this._main();
  }

  private async _main() {
    const cooldowns_db = new Cooldowns(this.interaction.guild!.id);
    const cooldowns_info =
      (await cooldowns_db.get_cooldowns_data(this.interaction.user.id)) || {};

    const { daily_cooldown, rob_cooldown, work_cooldown } = cooldowns_info;

    const get_embed = this.get_neutral('')
      .setDescription(
        `> 1) **Daily**: ${await this._used_before(daily_cooldown)}\n\n
       > 2) **Work**: ${await this._used_before(work_cooldown)}\n\n
       > 3) **Rob**: ${await this._used_before(rob_cooldown)}
      `
      )
      .setColor('Random')
      .setThumbnail(this.interaction.user.displayAvatarURL())
      .setTitle('Cooldowns');

    await this.send({ embeds: [get_embed] });
    return;
  }

  private async _used_before(cooldown: number | undefined): Promise<string> {
    if (cooldown && cooldown > new Date().getTime())
      return time(new Date(cooldown));
    else return '`Ready to use!`';
  }
}
