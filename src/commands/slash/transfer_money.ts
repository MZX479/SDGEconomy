import { Slash } from '@/decorators';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
  EmbedBuilder,
  GuildMember,
  Message,
} from 'discord.js';
import { InteractionTemplate } from '@/config/templates';
import { UserType } from '#types';
import { MongoClient } from '@/Main';
import { SendLogs } from '@/tools/send_logs';

class DB {
  interaction: CommandInteraction;
  constructor(interaction: CommandInteraction) {
    this.interaction = interaction;
  }
  async _get_data() {
    const _get_data = MongoClient.db(this.interaction.guild!.id).collection(
      'users'
    );

    const _author_data = await _get_data.findOne<UserType>({
      id: this.interaction.user.id,
    });

    const info_return = {
      _get_data,
      _author_data,
    };

    return info_return;
  }

  async _overwrite_data(amount: number, member_id: string) {
    if (!amount || !member_id)
      throw new Error(`${amount} or ${member_id} were not given!`);

    const _get_data = await this._get_data();

    const _member_data = await _get_data._get_data.findOne<UserType>({
      id: member_id,
    });

    const author_ballance = _get_data._author_data?.ballance;

    const _member_ballance = _member_data?.ballance;

    if (!_member_data?.id) {
      _get_data._get_data.insertOne({
        id: member_id,
        ballance: (_member_ballance || 0) + amount,
      });
    } else {
      _get_data._get_data.updateOne(
        {
          id: member_id,
        },
        {
          $set: {
            ballance: (_member_ballance || 0) + amount,
          },
        }
      );
    }

    _get_data._get_data.updateOne(
      {
        id: this.interaction.user.id,
      },
      {
        $set: {
          ballance: (author_ballance || 0) - amount,
        },
      }
    );
  }
}

@Slash({
  data: {
    name: 'transfermoney',
    description: 'accessibility transfering money from one user to another.',
    options: [
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
    ],
  },
})
class Transfer_money extends InteractionTemplate {
  amount: number = 10000;
  interaction: CommandInteraction;
  constructor(interaction: CommandInteraction) {
    super(interaction);
    this.interaction = interaction;
    this.main();
  }

  async main() {
    const db = new DB(this.interaction);

    const send_logs = new SendLogs(this.interaction);

    const _get_data = await db._get_data();

    const amount = <number>this.interaction.options.get('amount')!.value;

    let member = <GuildMember>this.interaction.options.get('member')?.member;

    const member_id = <string>this.interaction.options.get('member_id')?.value;

    if (!member && !member_id) {
      this.replyFalseH('Provide a member or member_id!');
      return;
    }

    if (!member && member_id) {
      member = await this.interaction.guild!.members.fetch(member_id);
    }

    const author_ballance = _get_data._author_data?.ballance;

    if (!author_ballance || author_ballance < amount) {
      this.replyFalseH('You do not have enough money!');
      return;
    }
    const check_buttons = await this.check_buttons();
    switch (check_buttons.customId) {
      case 'yes':
        await db._overwrite_data(amount, member.id);
        await this.final_response(amount, member.user.tag);
        send_logs.send_logs(
          'Aqua',
          'Transfer money',
          `\`${this.interaction.user.tag}\` transfered \`${amount}💸\` to \`${member.user.tag}\` ballance`,
          new Date(),
          { text: `Used by ${this.interaction.user.tag}` }
        );
        break;

      case 'no':
        this.replyTrue('See you!', { components: [] });
        break;

      default:
        this.replyFalseH('Something went wrong. Please retry!');
        break;
    }
  }

  async final_response(amount: number, member_tag: string) {
    if (!amount || !member_tag)
      throw new Error(`${amount} or ${member_tag} were not given!`);

    await this.send({
      embeds: [
        new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('**Success!**')
          .setAuthor({
            name: this.interaction.user.tag,
            iconURL: this.interaction.user.displayAvatarURL(),
          })
          .setDescription(
            `**You successfully transfered your money \`(3333💸)\` to \`Loli-Knight#3678\` ballance.\n See you!**`
          )
          .setTimestamp(new Date())
          .setFooter({
            text: `Requested by ${this.interaction.user.tag}`,
            iconURL: this.interaction.user.displayAvatarURL(),
          }),
      ],
    });
  }

  async check_buttons() {
    const check_buttons = [
      new ButtonBuilder()
        .setLabel('Yes')
        .setCustomId('yes')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setLabel('No')
        .setCustomId('no')
        .setStyle(ButtonStyle.Danger),
    ];

    const ask_answer = <Message>await this.send({
      embeds: [
        new EmbedBuilder()
          .setColor('Random')
          .setTitle('Check')
          .setAuthor({
            name: this.interaction.user.tag,
            iconURL: this.interaction.user.avatarURL()!,
          })
          .setDescription('**Are you sure?**')
          .setTimestamp(new Date())
          .setFooter({ text: `Requested by ${this.interaction.user.tag}` }),
      ],
      components: [
        new ActionRowBuilder().setComponents(...check_buttons) as any,
      ],
      fetchReply: true,
    });

    const answer = await ask_answer.awaitMessageComponent({
      filter: (button) => button.user.id === this.interaction.user.id,
      time: 30000,
    });

    await ask_answer.edit({ components: [] });

    return answer;
  }
}
