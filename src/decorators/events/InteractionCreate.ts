import { client } from '@/Main';

type settings_type = {
  once?: boolean;
};
/** @description Register class as "interactionCreate" event for bot */
export function InteractionCreate(seetings?: settings_type) {
  return function <Template extends { new (...args: any[]): {} }>(
    Event: Template
  ) {
    if (seetings?.once)
      client.once('interactionCreate', (...args: any) => {
        new Event(...args);
      });
    else
      client.on('interactionCreate', (...args: any) => {
        new Event(...args);
      });
  };
}
