import { client } from '../Main';

type event_callback = () => Promise<any> | any;

/** @description Loader for Client's events */
export class EventsLoader {
  /** @description Register callback as Client's event */
  load(event_name: string, callback: event_callback) {
    client.on(event_name, callback);
  }
}
