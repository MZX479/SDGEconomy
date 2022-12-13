import { item_type, PageWithComponentsType, user_type } from '#types';
import { InteractionTemplate } from '@/config/templates';
import { Slash } from '@/decorators';
import { MongoClient } from '@/Main';
import { ButtonMenu, discharge } from '@/tools';
import {
  ActionRowBuilder,
  CommandInteraction,
  EmbedBuilder,
  EmbedField,
  GuildMember,
  Interaction,
  SelectMenuBuilder,
  SelectMenuOptionBuilder,
  SlashCommandBuilder,
} from 'discord.js';

type fields_type = {
  fields: EmbedField[];
  components: SelectMenuOptionBuilder[];
};

@Slash({
  data: new SlashCommandBuilder()
    .setName('shop')
    .setNameLocalization('ru', 'магазин')
    .setDescription('Buy something in the shop')
    .setDescriptionLocalization('ru', 'Купить что-нибудь в магазине')
    .toJSON(),
})
class Command extends InteractionTemplate {
  private interaction: CommandInteraction;

  private _items: item_type[] | null = null;
  private _pages: PageWithComponentsType[] = [];
  private _menu: ButtonMenu;

  constructor(interaction: CommandInteraction) {
    super(interaction);
    this.interaction = interaction;
    this._menu = new ButtonMenu()
      .add_listener('buy_item', this._check_item.bind(this))
      .set_interaction(interaction);
    this.execute();
  }

  async execute() {
    this._items = await this._get_items();

    await this._build_menu();
  }

  private async _build_menu() {
    const user_balance = await this.profile.balance(this.interaction.user.id);

    const items = this._items;
    this._pages = [];

    if (!items || !items[0])
      return this.replyFalseH('Список предметов в магазине пуст');

    const fields: fields_type[] = [];

    const currency_icon = await this.guild_settings.currency_icon();

    let num = 1;
    let current_page = 0;
    for (let item_pos = 0; item_pos < items.length; item_pos++) {
      const item = items[item_pos];

      const field: EmbedField = {
        name: `${item_pos + 1}. ${item.name} - ${discharge(
          item.price
        )}${currency_icon}`,
        value: `>>> ${item.description || 'No description!'}`,
        inline: false,
      };

      const components = new SelectMenuOptionBuilder()
        .setLabel(`🛍️ ${item_pos + 1}. ${item.name}`)
        .setDescription(`💸 Купить предмет ${item.name}`)
        .setValue(`${item._id}`);

      if (fields[current_page]) {
        fields[current_page].fields.push(field);
        fields[current_page].components.push(components);
      } else
        fields[current_page] = { fields: [field], components: [components] };

      num++;

      if (num >= 10) {
        num = 0;
        current_page++;
      }
    }

    for (let field_pos = 0; field_pos < fields.length; field_pos++) {
      const field_data = fields[field_pos];

      const page_embed = new EmbedBuilder()
        .setThumbnail(this.interaction.guild?.iconURL()!)
        .setTitle(`Магазин сервера: ${this.interaction.guild?.name}`)
        .setDescription(
          `> 💸 Ваш баланс: ${discharge(user_balance)}${currency_icon}`
        )
        .addFields(field_data.fields)
        .setColor('Yellow')
        .setFooter({
          text: this.interaction.user.tag,
          iconURL: (this.interaction.member as GuildMember).displayAvatarURL(),
        })
        .setTimestamp();

      const select_menu = new SelectMenuBuilder()
        .setCustomId('buy_item')
        .setPlaceholder('Выберите предмет для покупки')
        .setMaxValues(1)
        .setMinValues(1)
        .setOptions(field_data.components);

      const components = new ActionRowBuilder().addComponents(select_menu);

      const page: PageWithComponentsType = {
        page: page_embed,
        components,
      };

      this._pages.push(page);
    }

    this._menu.set_pages(this._pages);

    if (!this._menu.launched) await this._menu.start();
  }

  private async _check_item(select: Interaction) {
    if (!select.isSelectMenu()) return;

    await select.update({
      components: select.message.components,
    });

    const item_id = select.values[0];

    const collection = MongoClient.db(this.interaction.guildId!).collection(
      'Shop'
    );

    const items_data = await collection.find<item_type>({}).toArray();

    const item_data = items_data.filter(
      (item) => item._id?.toString() === item_id
    )[0];

    if (!item_data)
      return this.replyFalse('Указанного вами предмета не существует.');

    const balance = await this.profile.balance(this.interaction.user.id);

    this._items = items_data;

    if (item_data.price > balance)
      return this.replyFalseH(
        `У вас недостаточно средств для покупки \`${item_data.name}\``
      );

    this._buy_item(item_data);
  }

  private async _buy_item(item: item_type) {
    await this.profile.remove_money(this.interaction.user.id, item.price);

    this.profile.add_item(this.interaction.user.id, item);
    const currency_icon = await this.guild_settings.currency_icon();

    this.replyTrueH(
      `Вы успешно приобрели предмет \`${item.name}\` ${discharge(
        item.price
      )}${currency_icon}`
    );
    this._build_menu();
  }

  private async _get_items() {
    const collection = MongoClient.db(this.interaction.guildId!).collection(
      'Shop'
    );

    const items_data = await collection.find<item_type>({}).toArray();

    return items_data;
  }
}
