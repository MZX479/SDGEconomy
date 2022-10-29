import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
  EmbedBuilder,
  Interaction,
  Message,
  TextBasedChannel,
} from 'discord.js';
import duration from 'parse-duration';

type listener_callback_type = (interaction: Interaction) => any;

type listeners_list_type = {
  [custom_id: string]: listener_callback_type;
};

type filter_type = (interaction: Interaction) => boolean;

enum ButtonsEnum {
  Prev = 'previous_page',
  Next = 'next_page',
}

const registered_buttons: Readonly<string[]> = [
  ButtonsEnum.Prev,
  ButtonsEnum.Next,
];

const default_time = duration('3m');

/** @description Builder for interactieve menu with pages
 * @example new ButtonMenu()
 * .set_channel(interaction.channel)
 * .set_pages(pages)
 * .start()
 */
export class ButtonMenu {
  private _pages: EmbedBuilder[] | null = null;
  private _channel: TextBasedChannel | null = null;
  private _filter: filter_type | null = null;
  private _time: number = default_time;
  private _interaction: CommandInteraction | null = null;
  private _custom_components: ActionRowBuilder[] | null = null;

  private _menu_message: Message | null = null;
  private _current_page: number = 0;
  private _custom_buttons: ButtonBuilder[] | null = null;
  private _listeners_list: listeners_list_type = {};
  private _launched: boolean = false;

  private _prev_page_button = new ButtonBuilder()
    .setCustomId(ButtonsEnum.Prev)
    .setStyle(ButtonStyle.Secondary)
    .setEmoji('⬅️')
    .setLabel('Назад')
    .setDisabled(true);

  private _next_page_button = new ButtonBuilder()
    .setCustomId(ButtonsEnum.Next)
    .setStyle(ButtonStyle.Secondary)
    .setEmoji('➡️')
    .setLabel('Вперед');

  /**
   * @description Set channel to send menu
   * @required or use set_interaction
   */
  set_channel(channel: TextBasedChannel) {
    this._channel = channel;
    return this;
  }

  /**
   *  @description If no channel is specified, bot will send menu by editing specified interaction
   *  @required or use set_channel
   */
  set_interaction(interaction: CommandInteraction) {
    this._interaction = interaction;
    return this;
  }

  /**
   *  @description Set life time for menu
   *  @optional
   */
  set_time(time: number) {
    const max = duration('1d');
    if (time > max) throw new Error("You can't specify time more than 1 day!");

    if (time <= 0)
      throw new Error("You entered a wrong time! Time can't be less or 0");
    this._time = time;
    return this;
  }

  /**
   *  @description Set filter for each interaction for current menu
   *  @optional
   */
  set_filter(filter: filter_type) {
    this._filter = filter;
    return this;
  }

  /**
   *  @description Set pages for your menu
   *  @required
   */
  set_pages(pages: EmbedBuilder[]) {
    if (!pages[0]) throw new Error('Pages array cannot be empty');
    this._pages = pages;
    return this;
  }

  /**
   *  @description Add custom buttons in the additional to default ones
   *  @optional
   */
  set_custom_buttons(...buttons: ButtonBuilder[]) {
    if (buttons.length > 3)
      throw new Error("You can't attach more than 3 custom buttons");
    this._custom_buttons = buttons;
    return this;
  }

  /**
   *  @description Add custom components in the additional to default ones
   *  @optional
   */
  set_custom_components(...components: ActionRowBuilder[]) {
    if (components.length > 4)
      throw new Error("You can't set more than 4 custom components");
    this._custom_components = components;
    return this;
  }

  /**
   *  @description Add custon events listener for interaction by their custom id
   *  @optional
   */
  add_listener(custom_id: string, callback: listener_callback_type) {
    this._listeners_list[custom_id] = callback;
    return this;
  }

  /**
   *  @description Remove custom events listener by their custom id
   *  @optional
   */
  remove_listener(custom_id: string) {
    if (custom_id in this._listeners_list)
      delete this._listeners_list[custom_id];
  }

  /**
   *  @description Launch menu
   *  @required
   */
  async start() {
    await this._build();
    await this._listen();
  }

  private async _build() {
    if (!this._channel && !this._interaction)
      throw new Error('No channel or interaction specified to send menu');
    if (!this._pages || !this._pages[0]) throw new Error('No pages specified');

    const components = this._get_components() as any;

    if (this._interaction)
      this._menu_message = await this._interaction.editReply({
        embeds: [this._pages[this._current_page]],
        components: components,
      });
    else if (this._channel)
      this._menu_message = await this._channel.send({
        embeds: [this._pages[this._current_page]],
        components: components,
      });

    this._launched = true;
  }

  private _listen() {
    if (!this._menu_message) throw new Error("Menu message isn't exist.");
    const filter = this._filter || (() => true);

    const collector = this._menu_message.createMessageComponentCollector({
      filter,
      time: this._time,
    });

    collector.on('collect', this._change_page.bind(this));
    collector.on('collect', this._handle_listeners.bind(this));
  }

  private async _change_page(button: Interaction) {
    if (!button.isButton()) return;
    if (!registered_buttons.includes(button.customId)) return;

    if (!this._pages) return;
    await button.update({
      components: button.message.components,
    });

    const custom_id = button.customId as ButtonsEnum;

    switch (custom_id) {
      case ButtonsEnum.Prev:
        if (this._current_page - 1 < 0) return;
        --this._current_page;
        await this._update_menu();
        break;

      case ButtonsEnum.Next:
        if (this._current_page + 1 > this._pages.length - 1) return;
        ++this._current_page;
        await this._update_menu();
        break;
    }
  }

  private _handle_listeners(interaction: Interaction) {
    if (!interaction.isMessageComponent()) return;

    if (!(interaction.customId in this._listeners_list)) return;

    this._listeners_list[interaction.customId](interaction);
  }

  private async _update_menu() {
    if (!this._pages) throw new Error('No pages specified');

    const current_page = this._current_page;

    if (current_page - 1 < 0) this._prev_page_button.setDisabled(true);
    else this._prev_page_button.setDisabled(false);

    if (current_page + 1 > this._pages.length - 1)
      this._next_page_button.setDisabled(true);
    else this._next_page_button.setDisabled(false);

    const components = this._get_components() as any;
    const pages = this._pages;

    this._menu_message?.edit({
      embeds: [pages[current_page]],
      components,
    });
  }

  private _get_buttons() {
    const custom_buttons = this._custom_buttons || [];

    return [this._prev_page_button, ...custom_buttons, this._next_page_button];
  }

  private _get_components() {
    const custom_components = this._custom_components || [];

    const buttons = this._get_buttons();
    const buttons_component = new ActionRowBuilder()
      .setComponents(...buttons)
      .toJSON();

    return [buttons_component, ...custom_components];
  }
}
