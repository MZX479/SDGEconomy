import { CommandInteraction, SlashCommandBuilder } from 'discord.js';

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

export type event_type = {
  name:
    | 'applicationCommandPermissionsUpdate'
    | 'channelCreate'
    | 'channelDelete'
    | 'channelPinsUpdate'
    | 'channelUpdate'
    | 'debug'
    | 'emojiCreate'
    | 'emojiDelete'
    | 'emojiUpdate'
    | 'error'
    | 'guildBanAdd'
    | 'guildBanRemove'
    | 'guildCreate'
    | 'guildDelete'
    | 'guildIntegrationsUpdate'
    | 'guildMemberAdd'
    | 'guildMemberAvailable'
    | 'guildMemberRemove'
    | 'guildMembersChunk'
    | 'guildMemberUpdate'
    | 'guildScheduledEventCreate'
    | 'guildScheduledEventDelete'
    | 'guildScheduledEventUpdate'
    | 'guildScheduledEventUserAdd'
    | 'guildScheduledEventUserRemove'
    | 'guildUnavailable'
    | 'guildUpdate'
    | 'interactionCreate'
    | 'invalidated'
    | 'inviteCreate'
    | 'inviteDelete'
    | 'messageCreate'
    | 'messageDelete'
    | 'messageDeleteBulk'
    | 'messageReactionAdd'
    | 'messageReactionRemove'
    | 'messageReactionRemoveAll'
    | 'messageReactionRemoveEmoji'
    | 'messageUpdate'
    | 'presenceUpdate'
    | 'ready'
    | 'roleCreate'
    | 'roleDelete'
    | 'roleUpdate'
    | 'shardDisconnect'
    | 'shardError'
    | 'shardReady'
    | 'shardReconnecting'
    | 'shardResume'
    | 'stageInstanceCreate'
    | 'stageInstanceDelete'
    | 'stageInstanceUpdate'
    | 'stickerCreate'
    | 'stickerDelete'
    | 'stickerUpdate'
    | 'threadCreate'
    | 'threadDelete'
    | 'threadListSync'
    | 'threadMembersUpdate'
    | 'threadMemberUpdate'
    | 'threadUpdate'
    | 'typingStart'
    | 'userUpdate'
    | 'voiceStateUpdate'
    | 'warn'
    | 'webhookUpdate';
};
