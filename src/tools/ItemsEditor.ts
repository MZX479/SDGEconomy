import { item_type } from '#types';
import { InteractionTemplate } from '@/config/templates';
import { MongoClient } from '@/Main';
import { discharge, handle_error } from '@/tools';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  Channel,
  Colors,
  CommandInteraction,
  EmbedBuilder,
  GuildMember,
  InteractionCollector,
  Message,
  MessageComponentInteraction,
  ModalBuilder,
  ModalSubmitInteraction,
  Role,
  SelectMenuBuilder,
  SelectMenuInteraction,
  SelectMenuOptionBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import parse from 'parse-duration';

const max_price_value = 10e8;
const min_price_value = 100;

type actions_values =
  | 'name'
  | 'description'
  | 'price'
  | 'role'
  | 'buy_message'
  | 'use_message'
  | 'save';

const Actions: Record<actions_values, string> = {
  name: 'name',
  description: 'description',
  price: 'price',
  role: 'role',
  buy_message: 'buy_message',
  use_message: 'use_message',
  save: 'save',
};

const ActionsEmojis: Record<actions_values, string> = {
  name: '✏️',
  description: '📓',
  price: '💸',
  buy_message: '🛍️',
  role: '🧿',
  use_message: '⚙️',
  save: '✅',
};
type other_text_values = 'buy_message' | 'use_message';

export class ItemsEditor {
  interaction: CommandInteraction;

  private _item: item_type | null = null;
  private _menu_message: Message | null = null;
  private _collector: InteractionCollector<
    ButtonInteraction | SelectMenuInteraction
  > | null = null;

  private _template: InteractionTemplate;

  constructor(interaction: CommandInteraction, item: item_type) {
    this._item = item;
    this.interaction = interaction;

    this._template = new InteractionTemplate(interaction);
    this.execute();
  }

  async execute() {
    if (!this._item) throw new Error("Item isn't defined");

    await this._show_result();

    this._create_collector();
  }

  private async _show_result() {
    if (!this._item) return;
    const {
      price,
      name,
      buy_message,
      description,
      role,
      use_message,
      buy_message_channel,
      use_message_channel,
    } = this._item;

    const currency = await this._template.guild_settings.currency_icon();

    const save_button = new ButtonBuilder()
      .setLabel('Сохранить предмет')
      .setEmoji('✅')
      .setCustomId(Actions.save)
      .setStyle(ButtonStyle.Success);

    const action_options = [
      new SelectMenuOptionBuilder()
        .setLabel('Название')
        .setEmoji(ActionsEmojis.name)
        .setDescription('Установить новое название для предмета')
        .setValue(Actions.name),
      new SelectMenuOptionBuilder()
        .setLabel('Описание')
        .setEmoji(ActionsEmojis.description)
        .setDescription('Установить новое описание для предмета')
        .setValue(Actions.description),
      new SelectMenuOptionBuilder()
        .setLabel('Цена')
        .setEmoji(ActionsEmojis.price)
        .setDescription('Установить новую цену для предмета')
        .setValue(Actions.price),
      new SelectMenuOptionBuilder()
        .setLabel('Роль')
        .setEmoji(ActionsEmojis.role)
        .setDescription(
          'Установить роль, выдающуюся при использовании предмета'
        )
        .setValue(Actions.role),
      new SelectMenuOptionBuilder()
        .setLabel('Сообщение при покупке')
        .setEmoji(ActionsEmojis.buy_message)
        .setDescription(
          'Установить сообщение, отправляющееся в выбранный чат при покупке'
        )
        .setValue(Actions.buy_message),
      new SelectMenuOptionBuilder()
        .setLabel('Сообщение при использовании')
        .setEmoji(ActionsEmojis.use_message)
        .setDescription(
          'Установить сообщение, отправляющееся в выбранный чат при покупке'
        )
        .setValue(Actions.use_message),
    ];

    const actions_menu = new SelectMenuBuilder()
      .setPlaceholder('✏️ Установить значение...')
      .setCustomId('actions_menu')
      .setMaxValues(1)
      .setMinValues(1)
      .addOptions(...action_options);

    const actions_row = [
      new ActionRowBuilder().addComponents(actions_menu),
      new ActionRowBuilder().addComponents(save_button),
    ];
    let result_overwiew = `> Название: \`${name}\`\n> Цена: ${discharge(
      price
    )}${currency}\n`;

    if (role) result_overwiew += `> Роль: <@&${role}>\n`;

    if (description)
      result_overwiew += `> Описание: ${this._validate_string(description)}\n`;

    if (buy_message && buy_message_channel)
      result_overwiew += `> Сообщение при покупке: ${this._validate_string(
        buy_message
      )}\n> Канал для отправки сообщения про покупке: <#${buy_message_channel}>\n`;

    if (use_message && use_message_channel)
      result_overwiew += `> Сообщение при использовании: ${this._validate_string(
        use_message
      )}\n> Канал для отправки сообщения про покупке: <#${use_message_channel}>\n`;

    const embed = new EmbedBuilder()
      .setTitle('Предпросмотр результата:')
      .setDescription(
        `${result_overwiew}\n\n*Если вы хотите оставить все как есть и создать предмет, то нажмите на соответствующую кнопку ниже. Если хотите добавить / изменить значение, то выберите соответствующее значение из списка снизу*`
      )
      .setFooter({
        text: this.interaction.user.tag,
        iconURL: (this.interaction.member as GuildMember).displayAvatarURL(),
      })
      .setColor(Colors.Yellow);

    if (this._menu_message)
      this._menu_message.edit({
        embeds: [embed],
        components: actions_row as any,
      });
    else
      this._menu_message = await this._template.send({
        embeds: [embed],
        components: actions_row as any,
      });
  }

  private async _create_collector() {
    if (!this._menu_message) return;

    const filter = (inter: ButtonInteraction | SelectMenuInteraction) =>
      inter.user.id === this.interaction.user.id;

    this._collector = this._menu_message.createMessageComponentCollector({
      filter,
      time: parse('10m'),
    });

    this._collector.on('collect', this._check_action.bind(this));
    this._collector.on('collect', this._check_save.bind(this));

    this._collector.on('end', this._destroy.bind(this));
  }

  private async _destroy() {
    this._menu_message?.edit({ components: [] });
  }

  private async _check_action(inter: MessageComponentInteraction) {
    if (!inter.isSelectMenu()) return;

    await this._menu_message?.edit({
      components: inter.message.components,
    });

    const select_value = inter.values[0] as other_text_values;

    try {
      switch (select_value) {
        case Actions.name:
          this._set_name(inter);
          break;
        case Actions.price:
          this._set_price(inter);
          break;
        case Actions.description:
          this._set_decription(inter);
          break;
        case Actions.role:
          this._set_role(inter);
          break;
        default:
          const other_values: other_text_values[] = [
            'buy_message',
            'use_message',
          ];
          if (other_values.includes(select_value))
            this._set_other_text_values(inter);
      }
    } catch (err) {
      handle_error(err as Error, '/-command create-item: _check_action');
    }
  }

  private async _check_save(inter: MessageComponentInteraction) {
    if (!this._item) return;
    if (!inter.isButton() || inter.customId != Actions.save) return;
    const { name, price } = this._item;

    if (!name || !price) return;

    await this._create_item();

    this._collector?.stop();

    await inter.update({
      components: [],
    });
  }

  private async _create_item() {
    if (!this._item) return;
    const db = MongoClient.db(this.interaction.guildId!);
    const collection = db.collection('Shop');
    const { name, price } = this._item;
    const currency = await this._template.guild_settings.currency_icon();

    if (this._item._id) {
      collection.updateOne(
        {
          _id: this._item._id,
        },
        {
          $set: this._item,
        }
      );
      this._template.replyTrue(
        `Вы успешно отредактировали предмет \`${name}\``
      );
    } else {
      collection.insertOne(this._item);

      this._template.replyTrue(
        `Вы успешно создали предмет \`${name}\` и установили ему цену ${discharge(
          price
        )}${currency}`
      );
    }
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

  private _validate_string(str: string) {
    const validated = str
      .trim()
      .split(/\n/)
      .map((s) => `\n> ${s}`)
      .join(' ');
    return `\`\`\`${validated}\`\`\``;
  }
  private reply_false(modal: ModalSubmitInteraction, content: string) {
    const embed = this._template.get_false(content);

    modal.reply({
      embeds: [embed],
      ephemeral: true,
    });
  }

  private async _set_name(select: SelectMenuInteraction) {
    try {
      if (!this._item) return;
      const modal = new ModalBuilder()
        .setCustomId('set_name_modal')
        .setTitle('Укажите новое название для предмета');

      const input_field = new TextInputBuilder()
        .setLabel('✏️ Введите новое название предмета...')
        .setCustomId('set_name')
        .setMaxLength(30)
        .setMinLength(5)
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const row = new ActionRowBuilder<TextInputBuilder>().addComponents(
        input_field
      );

      modal.addComponents(row);
      await select.showModal(modal);

      const modal_result = await select
        .awaitModalSubmit({
          time: 180000,
          filter: (submit) => submit.user.id === this.interaction.user.id,
        })
        .catch(() => undefined);

      if (!modal_result) return;

      const result_field = modal_result.fields.fields.get('set_name');

      if (!result_field) return;
      const new_name =
        result_field.type === 4 ? result_field.value.trim() : undefined;

      if (!new_name || !this._check_string(new_name)) return;

      modal_result.reply({
        content: 'Вы успешно установили новое название для предмета',
        ephemeral: true,
      });

      this._item.name = new_name;

      await this._show_result();
    } catch (err) {
      throw err;
    }
  }

  private async _set_price(select: SelectMenuInteraction) {
    try {
      if (!this._item) return;
      const currency = await this._template.guild_settings.currency_icon();

      const modal = new ModalBuilder()
        .setCustomId('set_price_modal')
        .setTitle('Укажите новую цену для предмета');

      const input_field = new TextInputBuilder()
        .setLabel('💸 Введите новую стоимость для предмета...')
        .setCustomId('set_price')
        .setMaxLength(10)
        .setMinLength(3)
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const row = new ActionRowBuilder<TextInputBuilder>().addComponents(
        input_field
      );

      modal.addComponents(row);
      await select
        .showModal(modal)
        .catch((e) => handle_error(e, '[ItemsEditor] _set_price'));

      const modal_result = await select
        .awaitModalSubmit({
          time: 180000,
          filter: (submit) => submit.user.id === this.interaction.user.id,
        })
        .catch(() => undefined);

      if (!modal_result) return;

      const result_field = modal_result.fields.fields.get('set_price');
      if (!result_field) return;

      const new_price =
        result_field.type === 4
          ? Math.floor(Number(result_field.value))
          : undefined;

      if (!new_price || !this._check_price(new_price))
        return this.reply_false(
          modal_result,
          `Вы указали неверное значение для стоимости!\n\n*Стоимость должна быть числом, лежащим в диапозоне от ${discharge(
            min_price_value
          )} до ${discharge(max_price_value)} ${currency}*`
        );
      modal_result.reply({
        content: 'Вы успешно установили стоимость для предмета',
        ephemeral: true,
      });

      this._item.price = new_price;

      await this._show_result();
    } catch (err) {
      throw err;
    }
  }

  private async _set_decription(select: SelectMenuInteraction) {
    try {
      if (!this._item) return;

      const modal = new ModalBuilder()
        .setCustomId('set_description_modal')
        .setTitle('Укажите новую цену для предмета');

      const input_field = new TextInputBuilder()
        .setLabel(`${ActionsEmojis.description} Укажите новое описание `)
        .setCustomId(`set_description`)
        .setMaxLength(100)
        .setMinLength(5)
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)
        .setPlaceholder(
          'Укажите новое описание или "пусто" чтобы оставить поле пустым'
        );

      const row = new ActionRowBuilder<TextInputBuilder>().addComponents(
        input_field
      );

      modal.addComponents(row);
      await select.showModal(modal);

      const modal_result = await select
        .awaitModalSubmit({
          time: 180000,
          filter: (submit) => submit.user.id === this.interaction.user.id,
        })
        .catch(() => undefined);

      if (!modal_result) return;

      const result_field = modal_result.fields.fields.get(`set_description`);

      if (!result_field) return;

      const new_decription =
        result_field.type === 4 ? result_field.value.trim() : undefined;

      if (!new_decription) return;

      if (new_decription === 'пусто') {
        this._item.description = undefined;

        modal_result.reply({
          content: `Вы успешно удалили описание для предмета`,
          ephemeral: true,
        });
      } else {
        this._item.description = new_decription;

        modal_result.reply({
          content: `Вы успешно установили новое описание для предмета`,
          ephemeral: true,
        });
      }

      await this._show_result();
    } catch (err) {
      throw err;
    }
  }

  private async _set_role(select: SelectMenuInteraction) {
    try {
      if (!this._item) return;

      await select.reply({
        content: `${ActionsEmojis.role} Укажите айди или упоминание роли для выдачи или напишите "пусто" чтобы удалить данное поле:`,
        ephemeral: true,
      });

      const answer_role = await this.interaction.channel
        ?.awaitMessages({
          filter: (message) => message.author.id === this.interaction.user.id,
          max: 1,
        })
        .catch(() => undefined);
      const answer = answer_role?.first();

      if (!answer_role || !answer) return;

      answer.delete();

      if (answer.content === 'пусто') {
        select.editReply({
          content: `Вы успешно удалили поле роли для предмета`,
        });

        this._item.role = undefined;
        await this._show_result();

        return;
      }

      let role = answer.mentions.roles.first();

      if (!role)
        role = (await this.interaction.guild?.channels
          .fetch(answer.content.trim())
          .catch(() => undefined)) as Role | undefined;

      if (!role) return;

      if (
        role.position >=
        this.interaction.guild?.members.me?.roles.highest.position!
      ) {
        return select.editReply({
          content: `Бот не может управлять указанной ролью`,
        });
      }

      this._item.role = role?.id;

      select.editReply({
        content: `Вы успешно указали ${role} роль для выдачи`,
      });

      await this._show_result();
    } catch (err) {
      throw err;
    }
  }

  private async _set_other_text_values(select: SelectMenuInteraction) {
    try {
      if (!this._item) return;
      const select_value = select.values[0] as other_text_values;

      const values_text: Partial<Record<actions_values, string>> = {
        use_message:
          '🧿 Вы успешно установили сообщение, отправляемое при использовании предмета',
        buy_message:
          '🛍️ Вы успешно установили сообщение, отправляемое при покупке предмета',
      };

      const modal = new ModalBuilder()
        .setCustomId('set_text_modal')
        .setTitle('Укажите новое значение');

      const input_field = new TextInputBuilder()
        .setLabel(
          `${ActionsEmojis[select_value]} Укажите новое значение для поля...`
        )
        .setCustomId(`set_${select_value}`)
        .setMaxLength(100)
        .setMinLength(5)
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)
        .setPlaceholder(
          'Укажите новое значение или "пусто" чтобы оставить поле пустым'
        );

      const row = new ActionRowBuilder<TextInputBuilder>().addComponents(
        input_field
      );

      modal.addComponents(row);
      await select.showModal(modal);

      const modal_result = await select
        .awaitModalSubmit({
          time: 180000,
          filter: (submit) => submit.user.id === this.interaction.user.id,
        })
        .catch(() => undefined);

      if (!modal_result) return;

      const result_field = modal_result.fields.fields.get(
        `set_${select_value}`
      );

      if (!result_field) return;
      const new_value =
        result_field.type === 4 ? result_field.value.trim() : undefined;

      if (new_value === 'пусто') {
        this._item[select_value] = undefined;
        this._show_result();

        modal_result.reply({
          content: `Вы успешно удалили значение для выбранного поля`,
          ephemeral: true,
        });
        return;
      }

      const ask_channel = await modal_result.reply({
        content: ':gear: Укажите канал для отправки сообщения:',
        ephemeral: true,
      });

      const answer_channel = await this.interaction.channel
        ?.awaitMessages({
          filter: (message) => message.author.id === this.interaction.user.id,
          max: 1,
        })
        .catch(() => undefined);
      const answer = answer_channel?.first();

      if (!answer_channel || !answer) return;

      answer.delete();

      let channel = answer.mentions.channels.first();

      if (!channel)
        channel = (await this.interaction.guild?.channels
          .fetch(answer.content)
          .catch(() => undefined)) as Channel | undefined;

      if (!channel) return;

      const key = `${select_value}_channel` as
        | 'buy_message_channel'
        | 'use_message_channel';

      if (!new_value) return;
      this._item[select_value] = new_value;
      this._item[key] = channel?.id;

      modal_result.editReply({
        content: values_text[select_value],
      });

      await this._show_result();
    } catch (err) {
      throw err;
    }
  }
}
