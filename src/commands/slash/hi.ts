import { Slash } from '@/decorators';
import { CommandInteraction } from 'discord.js';
import { InteractionTemplate } from '@/config/templates';
import {
  command_logger,
  Profile,
  member_options,
  member_module,
} from '@/tools';
import { InteractionGifsManager } from '@/tools/InteractionGifsModule';

@Slash({
  data: {
    name: 'hi',
    description: 'greeting',
    description_localizations: {
      ru: 'Приветствие!',
      'en-US': 'Greeting!',
    },
    options: member_options(),
  },
})
class Hi extends InteractionTemplate {
  private readonly amount: 300 = 300;
  interaction: CommandInteraction;
  constructor(interaction: CommandInteraction) {
    super(interaction);
    this.interaction = interaction;
    this._main();
  }

  private async _main() {
    const get_gif = await new InteractionGifsManager(
      this.interaction.guild!.id
    ).get_random_gif(this.interaction.commandName);
    const money_icon = await this.guild_settings.currency_icon();

    const member_work = await member_module(this.interaction);

    await new Profile(this.interaction.guild!.id).remove_money(
      this.interaction.user.id,
      this.amount
    );

    const get_embed = this.get_neutral(
      `\`${this.interaction.user.tag}\` said hello to \`${
        member_work!.user.tag
      }\`\n\n ${this.amount}${money_icon} has gone...`
    ).setImage(get_gif as string);
    this.send({ embeds: [get_embed] });

    command_logger({
      interaction: this.interaction,
      title: 'Hi command',
      description: `\`${this.interaction.user.tag}\` said hello to \`${member_work?.user.tag}\`\n Author id: \`${this.interaction.user.id}\`\n Member id: \`${member_work?.user.id}\``,
    });
    return;
  }
}
