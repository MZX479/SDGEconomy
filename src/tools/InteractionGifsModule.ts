import { MongoClient } from '@/Main';
import { GifsType } from '#types';
import { Collection, Db } from 'mongodb';
import { handle_error } from './handle_error';
import { random } from './random';

/**@description Class works with gifs for interaction commands. Get a collection and a random gif*/
export class InteractionGifsManager {
  private readonly _collection: string = 'Gifs';
  private _db: Db;
  private _db_collection: Collection;
  constructor(_guild_id: string) {
    this._db = MongoClient.db(_guild_id);
    this._db_collection = this._db.collection(this._collection);
  }

  /**@description Getting an info from DataBase by command_name*/
  async get_data<InputType extends GifsType = GifsType>(command_name: string) {
    if (!command_name)
      throw new Error(
        'command_name was not given. class [InteractionGifsManager], method [get_data]'
      );
    try {
      return this._db_collection.findOne<InputType>({
        command_name,
      });
    } catch (err) {
      const error = err as Error;
      handle_error(
        error,
        'class [InteractionGifsManager], method [get_greeting_data]',
        {
          command_name,
        }
      );
    }
  }

  /**@description Get a random gif from array*/
  async get_random_gif(command_name: string) {
    if (!command_name)
      throw new Error(
        'command_name was not given! class [InteractionGifsManager], method [get_random_gif]'
      );
    try {
      const get_data = await this.get_data(command_name);
      const gif_array = get_data!.pictures;
      const get_random_element = await random(0, gif_array.length - 1);
      return gif_array[get_random_element];
    } catch (err) {
      const error = err as Error;
      handle_error(
        error,
        'class [InteractionGifsManager], method [get_greeting_data]',
        { command_name }
      );
    }
  }
}
