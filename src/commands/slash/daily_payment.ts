import { Slash } from '@/decorators';
import { Colors, CommandInteraction, time } from 'discord.js';
import { InteractionTemplate } from '@/config/templates';
import { command_logger } from '@/tools';
import { Cooldowns } from '@/tools/CooldownsDbModule';
import parse from 'parse-duration';

@Slash({
  data: {
    name: 'daily',
    description: 'daily payment',
  },
})
class Daily extends InteractionTemplate {
  private cooldown: number = parse('1d');
  private readonly amount: 800 = 800;
  interaction!: CommandInteraction;
  constructor(interaction: CommandInteraction) {
    super(interaction);
    this.interaction = interaction;
    this._main();
  }

  private async _main() {
    const money_icon = await this.guild_settings.currency_icon();
    const get_time = new Date().getTime();

    const cooldowns_db = new Cooldowns(this.interaction.guild!.id);

    const get_cooldown = await cooldowns_db.get_cooldowns_data(
      this.interaction.user.id
    );

    const new_cooldown = get_time + this.cooldown;

    if (
      get_cooldown?.daily_cooldown &&
      get_cooldown.daily_cooldown > get_time
    ) {
      this.replyFalseH(
        `Your cooldown has not expired!\n Remaining ${time(
          new Date(get_cooldown.daily_cooldown),
          'R'
        )}`
      );
      return;
    }

    this.profile.add_money(this.interaction.user.id, this.amount);
    const get_embed = this.get_neutral(
      `**You successfully added a \`${this.amount}\`${money_icon} to your balance.**`
    ).setColor(Colors.Green);

    await cooldowns_db.set_daily_cooldown(
      this.interaction.user.id,
      new_cooldown
    );

    await this.send({ embeds: [get_embed] });

    command_logger({
      interaction: this.interaction,
      title: 'Daily command',
      description: `\`${this.interaction.user.tag}\` added \`${this.amount}\`${money_icon} to balance.\n Author id: \`${this.interaction.user.id}\``,
    });
    return;
  }
}
