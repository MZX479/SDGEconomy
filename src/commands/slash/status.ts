import { InteractionTemplate } from '@/config/templates';
import { Slash } from '@/decorators';
import {
  CommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';

@Slash({
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription("Show bot's status")
    .setDefaultMemberPermissions(PermissionFlagsBits.AddReactions)
    .toJSON(),
})
class Command extends InteractionTemplate {
  constructor(interaction: CommandInteraction) {
    super(interaction);
    this.execute(interaction);
  }

  async execute(interaction: CommandInteraction) {
    this.replyTrue("I'm alive!");
  }
}
