import { GuildSettingsType } from '#types';
import { GuildSettingsTemplate } from '@/config/templates';
import { MongoClient } from '@/Main';
import { GuildSettingsManager } from '@/tools';

class _GuildSettingsLoader {
  // /** @description Get cached settings or load ones from db */
  // async get(guild_id: string) {
  //   const guild_settings = await this.load(guild_id);

  //   return guild_settings;
  // }

  /** @description Load and cache settings for defined guild */
  async load(guild_id: string) {
    const settings = await this._get_settings(guild_id);

    const filled_settings = Object.assign(GuildSettingsTemplate, settings);
    return new GuildSettingsManager(filled_settings);
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

export const GuildSettingsLoader = new _GuildSettingsLoader();
