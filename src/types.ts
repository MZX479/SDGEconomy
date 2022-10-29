import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { ObjectId } from 'mongodb';

export type GuildSettingsType = {
  guild_id?: string;
  commands_permissions?: {
    [command_name: string]: {
      allowed_roles?: string[];
      restricted_roles?: string[];
    };
  };
};

const _to_json = new SlashCommandBuilder().toJSON;

export type SlashDecoratorDataType = ReturnType<typeof _to_json>;

export type SlashDecoratorPermissionsType = {};

export type SlashDecoratorArgsType = {
  data: SlashDecoratorDataType;
  permissions?: SlashDecoratorPermissionsType;
  dev_permissions?: SlashDecoratorPermissionsType;
};

export type DecoratorClass<
  ClassType extends { new (interaction: CommandInteraction): {} }
> = ClassType;

interface SlashDecoratorPlate {
  data?: SlashDecoratorDataType;
  dev_permissions?: SlashDecoratorPermissionsType | undefined;
  permissions?: SlashDecoratorPermissionsType | undefined;

  new (interaction: CommandInteraction): {};
}

export type SlashLoaderCommandType = {
  command: DecoratorClass<SlashDecoratorPlate>;
  payload: SlashDecoratorArgsType;
};

export type UserType = Partial<{
  _id: ObjectId;
  id: string;
  ballance: number;
}>;

export type CooldownsType = Partial<{
  _id: ObjectId;
  id: number;
  daily_cooldown: number;
}>;
