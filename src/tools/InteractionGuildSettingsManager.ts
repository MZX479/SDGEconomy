import { GuildSettingsLoader } from '@/loaders';
import { GuildSettingsManager } from './GuildSettingsManager';

export class InteractionGuildsSettingsManager {
  protected _settings: GuildSettingsManager | null = null;
  protected _guild_id: string;

  constructor(guild_id: string) {
    this._guild_id = guild_id;
    this.load();
  }

  async json() {
    return this._settings || this.load();
  }

  async load() {
    this._settings = await GuildSettingsLoader.load(this._guild_id);
    return this._settings;
  }

  async currency_icon() {
    const settings = this._settings || (await this.load());
    return settings.get_currency_icon();
  }

  async slash_permissions() {
    const settings = this._settings || (await this.load());
    return settings.get_slash_permissions();
  }

  async context_permissions() {
    const settings = this._settings || (await this.load());
    return settings.get_context_permissions();
  }

  async message_permissions() {
    const settings = this._settings || (await this.load());
    return settings.get_message_permissions();
  }
}
