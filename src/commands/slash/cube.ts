import { Slash } from '@/decorators';
import { CommandInteraction, Colors } from 'discord.js';
import { InteractionTemplate } from '@/config/templates';
import { Profile, command_logger, discharge } from '@/tools';

interface CubePics {
  cube_1: string;
  cube_2: string;
  cube_3: string;
  cube_4: string;
  cube_5: string;
  cube_6: string;
}

@Slash({
  data: {
    name: 'cube',
    description: 'Droping a cube with random number.',
    description_localizations: {
      ru: 'Выбрасывание кубика со случайным числом!',
      'en-US': 'Droping a cube with random number!',
    },
    options: [
      {
        name: 'number',
        description: 'Choose your number!',
        description_localizations: {
          ru: 'Выберите число!',
          'en-US': 'Choose your number!',
        },
        type: 4,
        required: true,
      },
      {
        name: 'bet',
        description: 'Make your bet!',
        description_localizations: {
          ru: 'Сделайте свою ставку!',
          'en-US': 'Make your bet!',
        },
        type: 4,
        required: true,
      },
    ],
  },
})
class Cube extends InteractionTemplate {
  interaction: CommandInteraction;
  constructor(interaction: CommandInteraction) {
    super(interaction);
    this.interaction = interaction;
    this._main();
  }

  protected async _main() {
    const money_icon = await this.guild_settings.currency_icon();
    const cube_pics: CubePics = {
      cube_1:
        'https://media.discordapp.net/attachments/1037704565950271518/1037704646665445446/Screenshot_1162.png',
      cube_2:
        'https://media.discordapp.net/attachments/1037704565950271518/1037704646292160522/Screenshot_1161.png',
      cube_3:
        'https://media.discordapp.net/attachments/1037704565950271518/1037704754450681896/Screenshot_1166.png',
      cube_4:
        'https://media.discordapp.net/attachments/1037704565950271518/1037704647919534080/Screenshot_1165.png',
      cube_5:
        'https://media.discordapp.net/attachments/1037704565950271518/1037704647554637894/Screenshot_1164.png',
      cube_6:
        'https://media.discordapp.net/attachments/1037704565950271518/1037704647089061978/Screenshot_1163.png',
    };

    const user_choice = this.interaction.options.get('number')!.value as number;

    const user_bet = this.interaction.options.get('bet')!.value as number;

    const profile_db = new Profile(this.interaction.guild!.id);
    const get_balance = await profile_db.balance(this.interaction.user.id);

    if (get_balance && get_balance < user_bet) {
      this.replyFalseH('You do not have enough money!');
      return;
    }

    if (user_choice >= 7) {
      this.replyFalseH('Cube has only **1, 2, 3, 4, 5, 6**');
      return;
    }

    const game = await this._game();

    type winner_type = Partial<{
      number: number;
      picture: string;
    }>;

    let win_number: winner_type = {};

    switch (true) {
      case game === 0:
        win_number.number = 1;
        win_number.picture = cube_pics.cube_1;
        break;
      case game === 1:
        win_number.number = 2;
        win_number.picture = cube_pics.cube_2;
        break;
      case game === 2:
        win_number.number = 3;
        win_number.picture = cube_pics.cube_3;
        break;
      case game === 3:
        win_number.number = 4;
        win_number.picture = cube_pics.cube_4;
        break;
      case game === 4:
        win_number.number = 5;
        win_number.picture = cube_pics.cube_5;
        break;
      case game === 5:
        win_number.number = 6;
        win_number.picture = cube_pics.cube_6;
        break;

      default:
        throw new Error('Created unexpected number!');
    }

    const win_balance = get_balance - user_bet + user_bet * 4;
    const lose_balance = get_balance - user_bet;

    if (user_choice === win_number.number) {
      profile_db.remove_money(this.interaction.user.id, user_bet);
      profile_db.add_money(this.interaction.user.id, user_bet * 4);
      const get_embed = this.get_neutral(
        `You win a \`${
          user_bet * 4
        }\`${money_icon}.\n Your balance now is \`${discharge(
          win_balance
        )}\`${money_icon}`
      )
        .setColor(Colors.Green)
        .setTitle('Win!')
        .setThumbnail(win_number.picture)
        .setFooter({
          text: this.interaction.user.tag,
          iconURL: this.interaction.user.displayAvatarURL(),
        });
      await this.send({ embeds: [get_embed] });
      command_logger({
        interaction: this.interaction,
        title: 'Cube command',
        description: `\`${this.interaction.user.tag}\` dropped cube and has \`${
          win_number.number
        }\`. Win \`${discharge(
          user_bet
        )}\`${money_icon}.\n His(er) balance now is ${discharge(
          win_balance
        )}${money_icon}.\n Author id: \`${this.interaction.user.id}\``,
      });
      return;
    } else {
      await profile_db.remove_money(this.interaction.user.id, user_bet);
      const get_embed = this.get_neutral(
        `You lose!\n Your balance now is ${discharge(
          lose_balance
        )}${money_icon}`
      )
        .setColor('#ff0000')
        .setTitle('Lose!')
        .setThumbnail(win_number.picture)
        .setFooter({
          text: this.interaction.user.tag,
          iconURL: this.interaction.user.displayAvatarURL(),
        });
      await this.send({ embeds: [get_embed] });
      command_logger({
        interaction: this.interaction,
        title: 'Cube command',
        description: `\`${this.interaction.user.tag}\` dropped cube and has \`${
          win_number.number
        }\`. Lose ${discharge(
          user_bet
        )}${money_icon}.\n His(er) ballance now is \`${lose_balance}\`.\n Author id: \`${
          this.interaction.user.id
        }\``,
      });
    }
    return;
  }

  private async _game() {
    return Math.floor(Math.random() * 6);
  }
}
