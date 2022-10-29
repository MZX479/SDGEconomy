import { SlashLoaderCommandType } from '#types';
import { CommandInteraction } from 'discord.js';

type mapped_type = SlashLoaderCommandType['payload']['data'];

/** @description Slash commands loader */
class SlashBuilder {
  private _commands_list: SlashLoaderCommandType[] = [];

  /** @description Get array of Slash commands payloads data */
  get commands(): mapped_type[] {
    return this._commands_list.map((command) => command.payload.data);
  }

  /** @description Get command payload data */
  get_command(name: string): mapped_type | undefined {
    return this.commands.filter(
      (command) => command.name.toLowerCase() === name.toLowerCase()
    )[0];
  }

  invoke(name: string, interaction: CommandInteraction) {
    const command_to_invoke = this._commands_list.filter(
      (command) => command.payload.data.name === name
    )[0];

    if (!command_to_invoke) return;

    new command_to_invoke.command(interaction);

    setTimeout(async () => {
      if (!interaction.replied) await interaction.deferReply();
    }, 2000);
  }

  load(SlashDecorator: SlashLoaderCommandType) {
    this._commands_list.push(SlashDecorator);
  }
}

export const SlashLoader = new SlashBuilder();
