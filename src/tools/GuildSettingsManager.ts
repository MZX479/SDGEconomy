import { GuildSettingsType } from '#types';

/** @description Settings manager for current guild */
export class GuildSettingsManager {
  private _settings: GuildSettingsType;

  constructor(settings: GuildSettingsType) {
    this._settings = settings;
  }

  /** @description Get permissions for slash commands for current guild */
  get_slash_permissions() {
    return this._settings.commands_permissions?.slash;
  }

  /** @description Get permissions for context commands for current guild */
  get_context_permissions() {
    return this._settings.commands_permissions?.context;
  }

  /** @description Get permissions for message commands for current guild */
  get_message_permissions() {
    return this._settings.commands_permissions?.context;
  }

  get_currency_icon() {
    return this._settings.currency_icon;
  }
}
