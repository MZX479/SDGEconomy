import { GuildSettingsType } from '#types';
import { GuildSettingsTemplate } from '@/config/templates/GuildSettingsTemplate';
import { MongoClient } from '@/Main';

class _SettingsLoader {
  private _settings_list: Map<string, GuildSettingsType> = new Map();

  /** @description Get cached settings or load ones from db */
  async get(guild_id: string) {
    return this._settings_list.get(guild_id) || this.load(guild_id);
  }

  /** @description Load and cache settings for defined guild */
  async load(guild_id: string): Promise<GuildSettingsType> {
    if (this._settings_list.has(guild_id))
      return this._settings_list.get(guild_id)!;

    const settings = await this._get_settings(guild_id);

    this._settings_list.set(guild_id, settings);
    return settings;
  }

  private async _get_settings(guild_id: string): Promise<GuildSettingsType> {
    const db = MongoClient.db(guild_id);

    const GuildSettingsCollection = db.collection('GuildSettings');
    const settings_data =
      await GuildSettingsCollection.findOne<GuildSettingsType>({
        guild_id,
      });

    if (!settings_data) {
      GuildSettingsCollection.insertOne({
        guild_id,
        ...GuildSettingsTemplate,
      });
    }

    return settings_data || GuildSettingsTemplate;
  }
}

export const SettingsLoader = new _SettingsLoader();
