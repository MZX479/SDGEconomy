import { Slash } from '@/decorators';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
  EmbedBuilder,
  Message,
  BitField,
} from 'discord.js';
import { InteractionTemplate } from '@/config/templates';
import { UserType, CooldownsType } from '#types';
import { MongoClient } from '@/Main';
import { SendLogs } from '@/tools/send_logs';

class DB {
  interaction: CommandInteraction;
  constructor(interaction: CommandInteraction) {
    this.interaction = interaction;
  }
  async _get_users_data() {
    const users_db = MongoClient.db(this.interaction.guild!.id).collection(
      'users'
    );

    const _users_data = await users_db.findOne<UserType>({
      id: this.interaction.user.id,
    });

    const info_return = {
      users_db,
      _users_data,
    };

    return info_return;
  }

  async _get_cooldowns_data() {
    const cooldowns_db = MongoClient.db(this.interaction.guild!.id).collection(
      'Cooldowns'
    );

    const _get_cooldowns_data = await cooldowns_db.findOne<CooldownsType>({
      id: this.interaction.user.id,
    });

    const info_return = {
      cooldowns_db,
      _get_cooldowns_data,
    };

    return info_return;
  }

  async _overwrite_data(amount: number, cooldown: number) {
    if (!amount || !cooldown)
      throw new Error(`${amount} or ${cooldown} was not given!`);
    const _get_users_data = await this._get_users_data();

    const _get_cooldowns_data = await this._get_cooldowns_data();

    const new_user_ballance =
      <number>(_get_users_data._users_data?.ballance || 0) + amount;

    const new_cooldown =
      <number>(_get_cooldowns_data._get_cooldowns_data?.daily_cooldown || 0) +
      cooldown;

    if (!_get_cooldowns_data._get_cooldowns_data?.id) {
      _get_cooldowns_data.cooldowns_db.insertOne({
        id: this.interaction.user.id,
        daily_cooldown: new_cooldown,
      });
    } else {
      _get_cooldowns_data.cooldowns_db.updateOne(
        {
          id: this.interaction.user.id,
        },
        {
          $set: {
            daily_cooldown: new_cooldown,
          },
        }
      );
    }

    if (!_get_users_data._users_data?.id) {
      _get_users_data.users_db.insertOne({
        id: this.interaction.user.id,
        ballance: new_user_ballance,
      });
    } else {
      _get_users_data.users_db.updateOne(
        {
          id: this.interaction.user.id,
        },
        {
          $set: {
            ballance: new_user_ballance,
          },
        }
      );
    }
  }
}

@Slash({
  data: {
    name: 'daily',
    description: 'daily payment',
  },
})
class Daily extends InteractionTemplate {
  private cooldown: number = 86000000;
  private amount: number = 300;
  interaction!: CommandInteraction;
  constructor(interaction: CommandInteraction) {
    super(interaction);
    this.interaction = interaction;
    this.main();
  }

  async main() {
    const logger = new SendLogs(this.interaction);

    const get_time = new Date().getTime();

    const new_cooldown = <number>get_time + this.cooldown;

    const db = new DB(this.interaction);

    const _get_users_data = await db._get_users_data();

    const _get_cooldowns_data = await db._get_cooldowns_data();

    if (
      _get_cooldowns_data._get_cooldowns_data?.daily_cooldown &&
      _get_cooldowns_data._get_cooldowns_data?.daily_cooldown > get_time
    ) {
      this.replyFalseH('Your cooldown has not expired!');
      return;
    }

    const check_buttons = await this.check_buttons();

    switch (check_buttons.customId) {
      case 'yes':
        await db._overwrite_data(this.amount, new_cooldown);
        await logger.send_logs(
          'Blue',
          'DailyMoney',
          `\`${this.interaction.user.tag}\` used a \`/daily\`\n Added \`${this.amount}💸\``,
          new Date(),
          {
            text: `Requested by ${this.interaction.user.tag}`,
            iconURL: this.interaction.user.displayAvatarURL(),
          }
        );
        this.final_response(
          this.amount,
          _get_users_data._users_data!.ballance!
        );
        break;

      case 'no':
        this.replyTrue('See you!');
        break;

      default:
        this.replyFalse('Something went wrong. Please contact our staff!');
        break;
    }
  }

  async check_buttons() {
    const check_buttons = [
      new ButtonBuilder()
        .setLabel('Yes')
        .setStyle(ButtonStyle.Success)
        .setCustomId('yes'),
      new ButtonBuilder()
        .setLabel('No')
        .setStyle(ButtonStyle.Danger)
        .setCustomId('no'),
    ];

    const ask_answer = <Message>await this.send({
      embeds: [
        new EmbedBuilder()
          .setColor('Random')
          .setTitle('Check!')
          .setAuthor({
            name: this.interaction.user.tag,
            iconURL: this.interaction.user.displayAvatarURL(),
          })
          .setDescription('**Are you sure?**')
          .setTimestamp(),
      ],
      components: [
        new ActionRowBuilder().addComponents(...check_buttons) as any,
      ],
    });

    const answer = await ask_answer.awaitMessageComponent({
      filter: (button) => button.user.id === this.interaction.user.id,
      time: 30000,
    });

    await ask_answer.edit({ components: [] });

    return answer;
  }

  async final_response(amount: number, ballance: number) {
    return this.send({
      embeds: [
        new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('Success!')
          .setAuthor({
            name: this.interaction.user.tag,
            iconURL: this.interaction.user.displayAvatarURL(),
          })
          .setDescription(
            `You successfully added \`${amount}\` to your account! \n Your ballance now is \`${ballance}\``
          )
          .setFooter({
            text: `Requested by ${this.interaction.user.tag}`,
            iconURL: this.interaction.user.displayAvatarURL(),
          })
          .setTimestamp(new Date()),
      ],
    });
  }
}
