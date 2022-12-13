import { ObjectId } from 'mongodb';
import {
  CommandInteraction,
  SlashCommandBuilder,
  ActionRowBuilder,
  EmbedBuilder,
  ButtonBuilder,
} from 'discord.js';

type GuildSettingsCommandsType = 'slash' | 'context' | 'message';

type GuildSettingsCommandsPermissionsType = {
  [command_type in GuildSettingsCommandsType]?: {
    [command_name: string]: {
      allowed_roles?: string[];
      restricted_roles?: string[];
    };
  };
};

export type GuildSettingsType = {
  guild_id?: string;
  commands_permissions?: GuildSettingsCommandsPermissionsType;
  currency_icon: string;
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
  T extends { new (interaction: CommandInteraction): {} }
> = T;

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

export type config_type = {
  modules: {
    message_context: boolean;
    slash: boolean;
    user_context: boolean;
  };

  logger: boolean;
  errors_channel: string;
  owner: string;
  guild_id: string;
};

export type inventory_type = Array<{
  _id: ObjectId;
  amount: number;
}>;

export type user_type = Partial<{
  id: string;
  balance: number;
  inventory: inventory_type;
}>;

export type cooldowns_type = Partial<{
  _id: ObjectId;
  id: string;
  daily_cooldown: number;
  work_cooldown: number;
  rob_cooldown: number;
}>;

export type item_type = {
  _id?: ObjectId;
  name: string;
  price: number;
  description?: string;
  role?: string;
  buy_message?: string;
  buy_message_channel?: string;
  use_message?: string;
  use_message_channel?: string;
};

export type PageWithComponentsType = {
  page: EmbedBuilder;
  components?: ActionRowBuilder;
  buttons?: ButtonBuilder[];
};

export type GifsType = {
  _id: ObjectId;
  command_name: string;
  pictures: Array<string>;
};
