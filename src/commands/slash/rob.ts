import { Slash } from '@/decorators';
import { Colors, CommandInteraction, GuildMember, time } from 'discord.js';
import { InteractionTemplate } from '@/config/templates';
import {
  Cooldowns,
  command_logger,
  Profile,
  random,
  discharge,
  member_options,
  member_module,
} from '@/tools';
import parse from 'parse-duration';

@Slash({
  data: {
    name: 'rob',
    description: 'choose a person and rob him(er)',
    options: member_options(),
  },
})
class Rob extends InteractionTemplate {
  private readonly cooldown: number = parse('8h');
  interaction: CommandInteraction;
  constructor(interaction: CommandInteraction) {
    super(interaction);
    this.interaction = interaction;
    this._main();
  }

  private async _main() {
    const money_icon = await this.guild_settings.currency_icon();
    const profile_db = new Profile(this.interaction.guild!.id);
    const author_ballance = await profile_db.balance(this.interaction.user.id);
    const cooldowns_db = new Cooldowns(this.interaction.guild!.id);
    const get_cooldown = await cooldowns_db.get_cooldowns_data(
      this.interaction.user.id
    );
    const get_time = new Date().getTime();
    const new_cooldown = get_time + this.cooldown;

    const member_work = await member_module(this.interaction);

    if (get_cooldown?.rob_cooldown && get_cooldown.rob_cooldown > get_time) {
      this.replyFalseH(
        `Your cooldown has not expired!\n Remaining ${time(
          new Date(get_cooldown.rob_cooldown),
          'R'
        )}`
      );
      return;
    }

    const random_money = await random(200, 700);

    await profile_db.remove_money(member_work?.id as string, random_money);
    await profile_db.add_money(this.interaction.user.id, random_money);
    const get_embed = this.get_neutral(
      `You robbed \`${
        member_work?.user.tag
      }\` for \`${random_money}\`${money_icon}\n Your ballance now is ${discharge(
        author_ballance + random_money
      )}💸`
    ).setColor(Colors.Green);
    await this.send({ embeds: [get_embed] });
    await cooldowns_db.set_rob_cooldown(this.interaction.user.id, new_cooldown);
    command_logger({
      interaction: this.interaction,
      title: 'Rob command',
      description: `${this.interaction.user.tag} robbed \`${member_work?.user.tag}\` for \`${random_money}\`${money_icon}!\n Robber id: \`${this.interaction.user.id}\`\n Victim id: \`${member_work?.user.id}\``,
    });
    return;
  }
}
