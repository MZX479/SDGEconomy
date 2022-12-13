import { MongoClient } from '@/Main';
import { Collection, Db, FindOptions } from 'mongodb';
import { cooldowns_type } from '#types';
import { handle_error } from './handle_error';

/**@description Class works with cooldowns. Data and rewrite notes.*/
export class Cooldowns {
  private readonly _collection = 'Cooldowns';
  private _db_collection: Collection;
  private _db: Db;
  private _guild_id!: string;
  constructor(_guild_id: string) {
    this._db = MongoClient.db(_guild_id);
    this._db_collection = this._db.collection(this._collection);
  }

  /**@description Getting cooldowns info by user_id */
  async _get_cooldowns_data(id: string, options?: FindOptions) {
    if (!id) throw new Error(`${id} was not taken!`);
    try {
      return this._db_collection.findOne<cooldowns_type>({ id }, options);
    } catch (err) {
      const error = err as Error;
      handle_error(error, 'class [Cooldowns], method [_get_cooldowns_data]', {
        id,
        options,
      });
      throw err;
    }
  }

  /**@description method which set a daily cooldown by user_id */
  async _set_daily_cooldown(id: string, daily_cooldown: number) {
    if (!id || !daily_cooldown)
      throw new Error(
        `${id} or ${daily_cooldown} were not taken! class [Cooldowns], method [_set_daily_cooldown]`
      );
    try {
      const _get_cooldowns_data = await this._get_cooldowns_data(id);
      if (!_get_cooldowns_data?.id) {
        return this._db_collection.insertOne({
          id,
          daily_cooldown,
        });
      } else {
        return this._db_collection.updateOne(
          {
            id,
          },
          {
            $set: {
              daily_cooldown,
            },
          }
        );
      }
    } catch (err) {
      const error = err as Error;
      handle_error(error, 'class [Cooldowns], method [_set_daily_cooldown]', {
        id,
        daily_cooldown,
      });
      throw err;
    }
  }

  /**@description method which set a work cooldown by user_id*/
  async _set_work_cooldown(id: string, work_cooldown: number) {
    if (!id || !work_cooldown)
      throw new Error(
        `${id} or ${work_cooldown} were not taken! class [Cooldowns], method [_set_work_cooldown]`
      );
    try {
      const _get_cooldowns_data = await this._get_cooldowns_data(id);
      if (!_get_cooldowns_data?.id) {
        return this._db_collection.insertOne({
          id,
          work_cooldown,
        });
      } else {
        return this._db_collection.updateOne(
          {
            id,
          },
          {
            $set: {
              work_cooldown,
            },
          }
        );
      }
    } catch (err) {
      const error = err as Error;
      handle_error(error, 'class [Cooldowns], method [_set_work_cooldown]', {
        id,
        work_cooldown,
      });
    }
  }

  /**@description method which set a rob cooldown by user_id*/
  async _set_rob_cooldown(id: string, rob_cooldown: number) {
    if (!id || !rob_cooldown)
      throw new Error(`${id} or ${rob_cooldown} were not taken!`);
    try {
      const _get_cooldowns_data = await this._get_cooldowns_data(id);
      if (!_get_cooldowns_data?.id) {
        return this._db_collection.insertOne({
          id,
          rob_cooldown,
        });
      } else {
        return this._db_collection.updateOne(
          {
            id,
          },
          {
            $set: {
              rob_cooldown,
            },
          }
        );
      }
    } catch (err) {
      const error = err as Error;
      handle_error(error, 'class [Cooldowns], method [_set_rob_cooldown]', {
        id,
        rob_cooldown,
      });
    }
  }
}
