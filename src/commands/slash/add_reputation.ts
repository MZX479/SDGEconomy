import { Slash } from '@/decorators';
import {
  Colors,
  CommandInteraction,
  GuildMember,
  time,
  EmbedBuilder,
} from 'discord.js';
import { InteractionTemplate } from '@/config/templates';
import {
  command_logger,
  Cooldowns,
  member_module,
  member_options,
} from '@/tools';
import { MongoClient } from '@/Main';
import { user_type } from '#types';

class DB {
  interaction: CommandInteraction;
  constructor(interaction: CommandInteraction) {
    this.interaction = interaction;
  }

  async overwrite_data(user_id: string, amount: number) {
    if (!user_id || !amount)
      throw new Error(
        'User_id or amount were not given! class [DB], method [overwrite_data]'
      );

    const data_base = MongoClient.db(this.interaction.guild!.id).collection(
      'Users'
    );

    const get_data = await data_base.findOne<user_type>({ id: user_id });

    const add_reputation = ((get_data?.reputation || 0) + amount) as number;

    if (!get_data?.id) {
      return data_base.insertOne({
        id: user_id,
        reputation: add_reputation,
      });
    } else {
      return data_base.updateOne(
        {
          id: user_id,
        },
        {
          $set: {
            reputation: add_reputation,
          },
        }
      );
    }
  }
}

@Slash({
  data: {
    name: 'add_reputation',
    description: 'you can send 1 point reputation to another user.',
    options: member_options(),
  },
})
class Rep extends InteractionTemplate {
  interaction: CommandInteraction;
  private readonly rep_amount: 1 = 1;
  private readonly cooldown: 10800000 = 10800000;
  constructor(interaction: CommandInteraction) {
    super(interaction);
    this.interaction = interaction;
    this._main();
  }

  private async _main() {
    const get_time = new Date().getTime();
    const new_cooldown = get_time + this.cooldown;
    const member = await member_module(this.interaction);
    if (!member) {
      this.send({
        embeds: [
          new EmbedBuilder()
            .setDescription('You provided a wrong id!')
            .setColor(Colors.Red),
        ],
        ephemeral: true,
      });
      return;
    }
    const get_cooldowns_data = new Cooldowns(this.interaction.guild!.id);
    const get_author_cd_data = await get_cooldowns_data.get_cooldowns_data(
      this.interaction.user.id
    );
    const db = new DB(this.interaction);

    if (
      get_author_cd_data?.rep_cooldown &&
      get_author_cd_data.rep_cooldown > get_time
    ) {
      this.replyFalseH(
        `Your cooldown has not expired!\n Remaining ${time(
          new Date(get_author_cd_data.rep_cooldown),
          'R'
        )}`
      );
      return;
    }

    await db.overwrite_data((member as GuildMember).user.id, this.rep_amount);
    await get_cooldowns_data.set_reputation_cooldown(
      this.interaction.user.id,
      new_cooldown
    );
    const get_embed = this.get_neutral(
      `\`${this.interaction.user.tag}\` added \`${
        this.rep_amount
      }\` point reputation to \`${(member as GuildMember).user.tag}\``
    );
    get_embed.setColor(Colors.Green);
    await this.send({ embeds: [get_embed] });
    await command_logger({
      interaction: this.interaction,
      title: 'Add_Reputation command',
      description: `${this.interaction.user.tag} added reputation to ${
        (member as GuildMember).user.tag
      }\n Author id: \`${this.interaction.user.id}\`\n Member id\`${
        (member as GuildMember).user.id
      }\``,
    });
    return;
  }
}
