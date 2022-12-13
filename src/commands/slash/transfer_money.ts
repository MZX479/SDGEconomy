import { Slash } from '@/decorators';
import { Colors, CommandInteraction, GuildMember } from 'discord.js';
import { InteractionTemplate } from '@/config/templates';
import { command_logger, member_module, member_options } from '@/tools';
import { check, discharge, Profile } from '@/tools';

@Slash({
  data: {
    name: 'transfermoney',
    description: 'accessibility transfering money from one user to another.',
    options: member_options([
      {
        name: 'amount',
        description: 'amount of money.',
        description_localizations: {
          ru: 'Укажите количество денег для передачи.',
          'en-US': 'Provide an amount of money to transfer.',
        },
        type: 4,
        required: true,
      },
    ]),
  },
})
class TransferMoney extends InteractionTemplate {
  amount: number = 10000;
  interaction: CommandInteraction;
  constructor(interaction: CommandInteraction) {
    super(interaction);
    this.interaction = interaction;
    this._main();
  }

  private async _main() {
    const money_icon = await this.guild_settings.currency_icon();

    const db_profile = new Profile(this.interaction.guild!.id);

    const amount = this.interaction.options.get('amount')!.value as number;

    const member_work = await member_module(this.interaction);

    const author_ballance = await db_profile.balance(this.interaction.user.id);

    if (!author_ballance || author_ballance < amount) {
      this.replyFalseH('You do not have enough money!');
      return;
    }
    const check_buttons = await check(this.interaction);
    switch (check_buttons) {
      case true:
        const discharge_amount = discharge(amount);
        await db_profile.remove_money(this.interaction.user.id, amount);
        await db_profile.add_money((member_work as GuildMember).id, amount);
        const get_embed = this.get_neutral(
          `\`${
            this.interaction.user.tag
          }\` successfully transfered \`${discharge_amount}\`${money_icon} to \`${
            (member_work as GuildMember).user.tag
          }\``
        )
          .setColor(Colors.Green)
          .setTitle('Success!')
          .setFooter({
            text: this.interaction.user.tag,
            iconURL: this.interaction.user.displayAvatarURL(),
          });
        await this.send({ embeds: [get_embed] });

        command_logger({
          interaction: this.interaction,
          title: 'Transfer Money command!',
          description: `\`${
            this.interaction.user.tag
          }\` transfered \`${discharge_amount}\`${money_icon} to \`${
            (member_work as GuildMember).user.tag
          }\`'s ballance!\n Author id: \`${
            this.interaction.user.id
          }\` \n Reciever id: \`${(member_work as GuildMember).user.id}\``,
        });
        break;

      case false:
        this.replyTrue('See you!');
        break;

      default:
        this.replyFalseH('Something went wrong. Please retry!');
        break;
    }
    return;
  }
}
