import { InteractionCreate } from '@/decorators';
import { SlashLoader } from '@/loaders';
import { CommandInteraction } from 'discord.js';

@InteractionCreate()
class Event {
  constructor(interaction: CommandInteraction) {
    this.execute(interaction);
  }

  async execute(interaction: CommandInteraction) {
    if (!interaction.isCommand()) return;

    const command_name = interaction.commandName;

    const command_data = SlashLoader.get_command(command_name);

    if (!command_data)
      return interaction.reply({
        ephemeral: true,
        content: ":x: This command doesn't exist",
      });

    await interaction.deferReply();

    SlashLoader.invoke(command_data.name, interaction);
  }
}
