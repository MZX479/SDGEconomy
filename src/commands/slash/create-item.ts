import { item_type } from '#types';
import { InteractionTemplate } from '@/config/templates';
import { Slash } from '@/decorators';
import { discharge, ItemsEditor } from '@/tools';
import {
  CommandInteraction,
  SlashCommandBuilder,
  SlashCommandNumberOption,
  SlashCommandStringOption,
} from 'discord.js';

const max_price_value = 10e8;
const min_price_value = 100;

@Slash({
  data: new SlashCommandBuilder()
    .setName('create-item')
    .setNameLocalization('ru', 'создать-предмет')
    .setDescription('Create item for shop')
    .setDescriptionLocalization('ru', 'Создать предмет для магазина')
    .addStringOption(
      new SlashCommandStringOption()
        .setName('name')
        .setNameLocalization('ru', 'название')
        .setDescription('Item name')
        .setDescriptionLocalization('ru', 'Название предмета')
        .setRequired(true)
        .setMaxLength(30)
        .setMinLength(5)
    )
    .addNumberOption(
      new SlashCommandNumberOption()
        .setName('price')
        .setNameLocalization('ru', 'цена')
        .setDescription('Item price')
        .setDescriptionLocalization('ru', 'Цена предмета')
        .setRequired(true)
        .setMinValue(min_price_value)
        .setMaxValue(max_price_value)
    )
    .toJSON(),
})
class Command extends InteractionTemplate {
  interaction: CommandInteraction;

  private _item: item_type | null = null;
  constructor(interaction: CommandInteraction) {
    super(interaction);

    this.interaction = interaction;
    this.execute();
  }

  async execute() {
    const item_name = this.interaction.options.get('name')?.value as
      | string
      | undefined;

    if (!item_name)
      return this.replyFalseH('Вы не указали название для предмета');

    if (!item_name || !this._check_string(item_name))
      return this.replyFalseH(
        'Название предмета не должно быть короче 5ти символов и не должно быть длиннее 30ти символов'
      );

    const item_price = this.interaction.options.get('price')?.value as
      | number
      | undefined;

    if (!item_price || !this._check_price(item_price))
      return this.replyFalseH('Вы не указали стоимость предмета');

    const currency = await this.guild_settings.currency_icon();

    if (item_price < min_price_value || item_price > max_price_value)
      return this.replyFalseH(
        `Стоимость предмета не может быть меньше ${discharge(
          min_price_value
        )}${currency} и не может быть больше ${discharge(
          max_price_value
        )}${currency}`
      );

    this._item = {
      name: item_name,
      price: item_price,
    };

    new ItemsEditor(this.interaction, this._item);
  }

  private _check_price(price: number) {
    return (
      !isNaN(price) && price >= min_price_value && price <= max_price_value
    );
  }

  private _check_string(
    str: string,
    min_length: number = 5,
    max_length: number = 30
  ) {
    return (
      !!str &&
      str.length != 0 &&
      str.length >= min_length &&
      str.length <= max_length
    );
  }
}
