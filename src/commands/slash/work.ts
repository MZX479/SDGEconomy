import { Slash } from '@/decorators';
import { Colors, CommandInteraction, time } from 'discord.js';
import { InteractionTemplate } from '@/config/templates';
import { command_logger, random } from '@/tools';
import { Cooldowns } from '@/tools';
import parse from 'parse-duration';
import { Logger } from '@/config/logger';

@Slash({
  data: {
    name: 'work',
    description: 'Some money from work once a day... or twice.',
  },
})
class Work extends InteractionTemplate {
  private cooldown: number = parse('6h');
  interaction: CommandInteraction;
  constructor(interaction: CommandInteraction) {
    super(interaction);
    this.interaction = interaction;
    this._main();
  }

  private async _main() {
    const money_icon = await this.guild_settings.currency_icon();

    const cooldowns_db = new Cooldowns(this.interaction.guild!.id);

    const author_cooldowns = await cooldowns_db._get_cooldowns_data(
      this.interaction.user.id
    );

    const get_time = new Date().getTime();

    const new_cooldown = get_time + this.cooldown;

    if (
      author_cooldowns?.work_cooldown &&
      author_cooldowns.work_cooldown > get_time
    ) {
      Logger.log(
        `${this.interaction.user.id} on guild ${this.interaction.guild?.id} used work command but his cooldown has not expired!`
      );
      this.replyFalseH(
        `**Your cooldown has not expired**\n Remaining ${time(
          new Date(author_cooldowns.work_cooldown!),
          'R'
        )}`
      );
      return;
    }

    const work_money = await random(100, 700);

    const get_embed = this.get_neutral(
      `**You successfully added \`${work_money}\`${money_icon} to your account!**`
    )
      .setColor(Colors.Green)
      .setFooter({
        text: this.interaction.user.tag,
        iconURL: this.interaction.user.displayAvatarURL(),
      });

    await this.profile.add_money(this.interaction.user.id, work_money);
    await cooldowns_db._set_work_cooldown(
      this.interaction.user.id,
      new_cooldown
    );

    await this.send({ embeds: [get_embed] });

    await command_logger({
      interaction: this.interaction,
      title: 'Work command!',
      description: `\`${this.interaction.user.tag}\` added \`${work_money}\`${money_icon} to balance. \n Author id: \`${this.interaction.user.id}\``,
    });
    Logger.log(
      `${this.interaction.user.id} on guild ${this.interaction.guild?.id} used work command and added ${work_money} money to balance!`
    );
    return;
  }
}
