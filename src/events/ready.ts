import { Ready } from '@/decorators';
import { client } from '@/Main';

@Ready()
class Event {
  constructor() {
    this.execute();
  }

  execute() {
    if (client.user)
      console.log(`${client.user.tag} successfuly started!`.green);
  }
}
