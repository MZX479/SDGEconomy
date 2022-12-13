import { Slash } from '@/decorators';
import { Colors, CommandInteraction } from 'discord.js';
import { InteractionTemplate } from '@/config/templates';
import { discharge, command_logger, Profile } from '@/tools';

interface SideType {
  name: string;
  picture: string;
}

@Slash({
  data: {
    name: 'coinflip',
    description: 'mini game with bets.',
    options: [
      {
        name: 'bet',
        description: 'make your bet!',
        description_localizations: {
          ru: 'сделайте свою ставку!',
          'en-US': 'make your bet!',
        },
        type: 4,
        required: true,
      },
      {
        name: 'side',
        description: 'choose coin side!',
        description_localizations: {
          ru: 'выберите сторону монетки!',
          'en-US': 'choose coin side!',
        },
        type: 3,
        required: true,
      },
    ],
  },
})
class Coinflip extends InteractionTemplate {
  interaction: CommandInteraction;
  constructor(interaction: CommandInteraction) {
    super(interaction);
    this.interaction = interaction;
    this._main();
  }

  private async _main() {
    const money_icon = await this.guild_settings.currency_icon();
    const author_id = this.interaction.user.id;
    const user_bet = this.interaction.options.get('bet')!.value as number;
    const user_side_choice = this.interaction.options.get('side')!
      .value as string;

    if (user_side_choice !== 'tails' && user_side_choice !== 'heads') {
      this.replyFalseH('Choose a correct side!\n tails or heads!');
      return;
    }

    if (!user_bet || !user_side_choice) {
      this.replyFalseH('Please check your input!');
      return;
    }
    const profile_db = new Profile(this.interaction.guild!.id);
    const get_balance = await profile_db.balance(author_id);
    if (!get_balance || get_balance < user_bet) {
      this.replyFalseH('You do not have enough money!');
      return;
    }

    const tails: SideType = {
      name: 'tails',
      picture:
        'https://challengepost-s3-challengepost.netdna-ssl.com/photos/production/solution_photos/000/134/599/datas/original.png',
    };

    const heads: SideType = {
      name: 'heads',
      picture:
        'https://challengepost-s3-challengepost.netdna-ssl.com/photos/production/solution_photos/000/134/598/datas/original.png',
    };

    let winner: SideType | any;
    let loser: SideType | any;

    let game = await this._game();

    switch (true) {
      case game <= 50:
        winner = tails;
        loser = heads;
        break;

      case game >= 51:
        winner = heads;
        loser = tails;
        break;

      default:
        break;
    }

    const win_balance = get_balance - user_bet + user_bet * 2;
    const lose_balance = get_balance - user_bet;

    if (user_side_choice === winner.name) {
      await profile_db.remove_money(author_id, user_bet);
      await profile_db.add_money(author_id, user_bet * 2);
      const get_embed = this.get_neutral(
        `You win!\n Your ballance now is ${discharge(win_balance)}${money_icon}`
      )
        .setColor(Colors.Green)
        .setAuthor({
          name: this.interaction.user.tag,
          iconURL: this.interaction.user.displayAvatarURL(),
        })
        .setThumbnail(winner.picture);
      await this.send({ embeds: [get_embed] });
      command_logger({
        interaction: this.interaction,
        title: 'Coinflip command!',
        description: `\`${this.interaction.user.tag}\` win a ${discharge(
          user_bet
        )}${money_icon}.\n His(er) balance now is ${discharge(win_balance)}\n
        Author id: \`${this.interaction.user.id}\``,
      });
      return;
    } else {
      await profile_db.remove_money(author_id, user_bet);
      const get_embed = this.get_neutral(
        `You lose! \n Your balance now is ${discharge(
          lose_balance
        )}${money_icon}`
      )
        .setColor(Colors.Red)
        .setAuthor({
          name: this.interaction.user.tag,
          iconURL: this.interaction.user.displayAvatarURL(),
        })
        .setThumbnail(winner.picture);
      await this.send({ embeds: [get_embed] });
      command_logger({
        interaction: this.interaction,
        title: 'Coinflip command',
        description: `\`${this.interaction.user.tag}\` lose a ${discharge(
          user_bet
        )}${money_icon}.\n His(er) balance now is ${discharge(
          lose_balance
        )}\n Author id: \`${this.interaction.user.id}\``,
      });
      return;
    }
  }

  private async _game() {
    return Math.floor(Math.random() * 101);
  }
}
