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
  async get_cooldowns_data<InputType extends cooldowns_type = cooldowns_type>(
    id: string,
    options?: FindOptions
  ) {
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

  /**@description Sets a daily cooldown by user_id */
  async set_daily_cooldown(id: string, daily_cooldown: number) {
    if (!id || !daily_cooldown)
      throw new Error(
        `${id} or ${daily_cooldown} were not taken! class [Cooldowns], method [set_daily_cooldown]`
      );
    try {
      const get_data = await this.get_cooldowns_data(id);
      if (!get_data?.id) {
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
      handle_error(error, 'class [Cooldowns], method [set_daily_cooldown]', {
        id,
        daily_cooldown,
      });
      throw err;
    }
  }

  /**@description Sets a work cooldown by user_id*/
  async set_work_cooldown(id: string, work_cooldown: number) {
    if (!id || !work_cooldown)
      throw new Error(
        `${id} or ${work_cooldown} were not taken! class [Cooldowns], method [set_work_cooldown]`
      );
    try {
      const get_data = await this.get_cooldowns_data(id);
      if (!get_data?.id) {
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
      handle_error(error, 'class [Cooldowns], method [set_work_cooldown]', {
        id,
        work_cooldown,
      });
    }
  }

  /**@description Sets a rob cooldown by user_id*/
  async set_rob_cooldown(id: string, rob_cooldown: number) {
    if (!id || !rob_cooldown)
      throw new Error(`${id} or ${rob_cooldown} were not taken!`);
    try {
      const get_data = await this.get_cooldowns_data(id);
      if (!get_data?.id) {
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
      handle_error(error, 'class [Cooldowns], method [set_rob_cooldown]', {
        id,
        rob_cooldown,
      });
    }
  }

  /**@description Sets a reputation cooldown by user id!*/
  async set_reputation_cooldown(id: string, rep_cooldown: number) {
    if (!id || !rep_cooldown)
      throw new Error(
        'Id or rep_cooldown were not given. class [Cooldowns], method [set_reputation_cooldown]'
      );
    try {
      const get_data = await this.get_cooldowns_data(id);
      if (!get_data?.id) {
        return this._db_collection.insertOne({
          id,
          rep_cooldown,
        });
      } else {
        return this._db_collection.updateOne(
          {
            id,
          },
          {
            $set: {
              rep_cooldown,
            },
          }
        );
      }
    } catch (err) {
      const error = err as Error;
      handle_error(error, 'class [Cooldowns], method [set_rep_cooldown]', {
        id,
        rep_cooldown,
      });
    }
  }
}
