import { user_type } from '#types';
import { MongoClient } from '@/Main';
import { Collection, Db, FindOptions } from 'mongodb';
import { handle_error } from './handle_error';
import { item_type } from '#types';

/**@description Class works with users data like get, rewrite, see balance and inventory etc...*/
export class Profile {
  private _db: Db;
  private _collection: Collection;

  constructor(guild_id: string) {
    this._db = MongoClient.db(guild_id);
    this._collection = this._db.collection('Users');
  }

  /** @description Get user data by his id */
  async get_data<InputType extends user_type = user_type>(
    id: string,
    options?: FindOptions
  ) {
    if (!id)
      throw new Error('Id was not given. class [Profile], method [_get_data]');
    try {
      return this._collection.findOne<InputType>({ id }, options);
    } catch (err) {
      const error = err as Error;
      handle_error(error, 'class [Profile], method [_get_data]');
      throw err;
    }
  }

  /**@description Method updates data of current user by id */
  async update_data(id: string, data: user_type) {
    if (!id || !data)
      throw new Error(
        'Id or data were not given. class [Profile], method [_update_data]'
      );
    try {
      const exist_user = await this.get_data<Pick<user_type, 'id'>>(id, {
        projection: { id: 1 },
      });

      if (exist_user && exist_user.id) {
        return this._collection.updateOne(
          {
            id,
          },
          { $set: data }
        );
      } else {
        return this._collection.insertOne({
          id,
          ...data,
        });
      }
    } catch (err) {
      const error = err as Error;
      handle_error(error, 'class [Profile], method [_update_data]', {
        id,
        data,
      });
      throw err;
    }
  }

  async add_item(id: string, item: item_type, amount: number = 1) {
    if (!item._id) throw new Error("Item doesn't have an id");

    const user_data = await this.get_data(id);

    const { inventory = [] } = user_data || {};

    const exist_item = inventory.filter(
      (inv_item) => inv_item._id.toString() === item._id!.toString()
    )[0];

    if (exist_item) inventory[inventory.indexOf(exist_item)].amount++;
    else
      inventory.push({
        _id: item._id,
        amount,
      });

    this.update_data(id, { inventory });
  }

  async add_money(id: string, amount: number) {
    if (!id || !amount)
      throw new Error(
        'Id or amount were not given! class [Profile], method [_add_money]'
      );
    try {
      let balance = await this.balance(id);

      balance += amount;

      return this.update_data(id, { balance });
    } catch (err) {
      const error = err as Error;
      handle_error(error, 'class [Profile], method [_add_money]');
      throw err;
    }
  }

  async remove_money(id: string, amount: number) {
    if (!id || !amount)
      throw new Error(
        'Id or amount were not given. class [Profile], method [remove_money]'
      );
    try {
      let balance = await this.balance(id);

      balance -= amount;

      return this.update_data(id, { balance });
    } catch (err) {
      const error = err as Error;
      handle_error(error, 'class [Profile], method [remove_money]', {
        id,
        amount,
      });
      throw err;
    }
  }

  /**@description Method displays ballance of current member by id*/
  async balance(id: string): Promise<number> {
    if (!id)
      throw new Error(`Id was not given! class [Profile], method [ballance]`);
    try {
      const user_data = await this.get_data(id, {
        projection: {
          balance: 1,
        },
      });

      const balance = user_data?.balance || 0;
      return balance;
    } catch (err) {
      const error = err as Error;
      handle_error(error, '', {
        id,
      });
      throw err;
    }
  }

  /**@description Method displays inventory of current member by id */
  async inventory(id: string): Promise<user_type['inventory']> {
    if (!id)
      throw new Error('Id was not given. class [Profile], method [inventory]');
    try {
      const user_data = await this.get_data(id, {
        projection: {
          inventory: 1,
        },
      });

      const inventory = user_data?.inventory;
      return inventory;
    } catch (err) {
      const error = err as Error;
      handle_error(error, 'class [Profile], method [inventory]', {
        id,
      });
      throw err;
    }
  }
}
