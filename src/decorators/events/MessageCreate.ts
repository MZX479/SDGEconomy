import { client } from '@/Main';

type settings_type = {
  once?: boolean;
};
/** @description Register class as "messageCreate" event for bot */
export function InteractionCreate(seetings?: settings_type) {
  return function <T extends { new (...args: any[]): {} }>(Event: T) {
    if (seetings?.once)
      client.once('messageCreate', (...args: any) => {
        new Event(...args);
      });
    else
      client.on('messageCreate', (...args: any) => {
        new Event(...args);
      });
  };
}
