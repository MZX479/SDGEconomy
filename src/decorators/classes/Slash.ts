import { SlashDecoratorArgsType, SlashLoaderCommandType } from '#types';
import { SlashLoader } from '@/loaders';
import { CommandInteraction } from 'discord.js';

/** @description Setup class as Slash command */
export function Slash(data: SlashDecoratorArgsType) {
  return function <
    Template extends { new (interaction: CommandInteraction): {} }
  >(Command: Template) {
    const loader_args: SlashLoaderCommandType = {
      command: Command,
      payload: data,
    };

    SlashLoader.load(loader_args);
  };
}
