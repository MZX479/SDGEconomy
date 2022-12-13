import {
  handle_error,
  InteractionGuildsSettingsManager,
  Profile,
} from '@/tools';
import {
  CommandInteraction,
  InteractionReplyOptions,
  Message,
  EmbedBuilder,
  EmbedData,
  Colors,
} from 'discord.js';

/** @description Template for interaction commands */
export class InteractionTemplate {
  private _interaction: CommandInteraction;
  private _embed_sample: EmbedData;

  guild_settings: InteractionGuildsSettingsManager;
  profile: Profile;

  constructor(_interaction: CommandInteraction) {
    this._interaction = _interaction;

    this.guild_settings = new InteractionGuildsSettingsManager(
      this._interaction.guildId!
    );
    this.profile = new Profile(_interaction.guildId!);
    this._embed_sample = {
      footer: {
        text: this._interaction.user.tag,
        iconURL: this._interaction.user.displayAvatarURL(),
      },
      timestamp: new Date(),
    };
  }

  /** @description Get command argument by his name */
  get_argument(argument_name: string) {
    return this._interaction.options.data.filter(
      (arg) => arg.name === argument_name
    )[0];
  }

  /** @description Send success embed visible for everyone */
  async replyTrue(
    content: string,
    options?: InteractionReplyOptions
  ): Promise<Message<boolean>> {
    try {
      const embed_true = this.get_true(content);
      if (!embed_true)
        throw new Error('Something went wrong while creating Embed');
      return this.send({ embeds: [embed_true], ...options }) as Promise<
        Message<boolean>
      >;
    } catch (err) {
      const error = err as Error;
      handle_error(error, '[Interaction_template] method replyTrue', {
        emit_data: {
          content,
          options,
        },
      });
      throw err;
    }
  }

  /** @description Send error embed visible only for member invoked current command */
  async replyFalseH(
    content: string,
    options: InteractionReplyOptions = {}
  ): ReturnType<typeof this.replyFalse> {
    options.ephemeral = true;

    return this.replyFalse(content, options);
  }

  /** @description Send success embed visible only for member invoked current command */
  async replyTrueH(
    content: string,
    options: InteractionReplyOptions = {}
  ): ReturnType<typeof this.replyTrue> {
    options.ephemeral = true;

    return this.replyTrue(content, options);
  }

  /** @description Send error embed visible for everyone */
  replyFalse(
    content: string,
    options?: InteractionReplyOptions
  ): Promise<Message<boolean>> {
    if (!content)
      throw new Error(
        `Сontent was not given! class [InteractionTemplate], method [replyFalse]`
      );
    try {
      const embed_false = this.get_false(content);
      if (!embed_false)
        throw new Error('Something went wrong while creating embed');

      return this.send({ embeds: [embed_false], ...options }) as Promise<
        Message<boolean>
      >;
    } catch (err) {
      const error = err as Error;
      handle_error(error, '[Interaction_template] method replyFalse', {
        emit_data: {
          content,
          options,
        },
      });
      throw err;
    }
  }

  reply(
    content: string,
    options?: InteractionReplyOptions
  ): Promise<Message<boolean>> {
    try {
      const embed_neutral = this.get_neutral(content);
      if (!embed_neutral)
        throw new Error(
          'Something went wrong while creating embed. class [InteractionTemplate], method [reply]'
        );

      return this.send({ embeds: [embed_neutral], ...options }) as Promise<
        Message<boolean>
      >;
    } catch (err) {
      const error = err as Error;
      handle_error(error, '[Interaction_template] method replyFalse', {
        emit_data: {
          content,
          options,
        },
      });
      throw err;
    }
  }

  replyH(
    content: string,
    options: InteractionReplyOptions = {}
  ): Promise<Message<boolean>> {
    try {
      options.ephemeral = true;
      return this.reply(content, options);
    } catch (err) {
      const error = err as Error;
      handle_error(error, '[Interaction_template] method replyFalse', {
        emit_data: {
          content,
          options,
        },
      });
      throw err;
    }
  }

  get_neutral(content: string) {
    try {
      const false_embed = this._generate_embed({
        description: `>>> ${content}`,
        ...this._embed_sample,
        color: Colors.Yellow,
      });

      return false_embed;
    } catch (err) {
      const error = err as Error;
      handle_error(error, '[Interaction_template] method replyTrue', {
        emit_data: {
          content,
        },
      });
      throw err;
    }
  }

  get_false(content: string) {
    try {
      const false_embed = this._generate_embed({
        description: `>>> ${content}`,
        color: Colors.Red,
        ...this._embed_sample,
      });

      return false_embed;
    } catch (err) {
      const error = err as Error;
      handle_error(error, '[Interaction_template] method replyTrue', {
        emit_data: {
          content,
        },
      });
      throw err;
    }
  }
  get_true(content: string) {
    try {
      const true_embed = this._generate_embed({
        description: `>>> ${content}`,
        color: Colors.Green,
        ...this._embed_sample,
      });

      return true_embed;
    } catch (err) {
      const error = err as Error;
      handle_error(error, '[Interaction_template] method replyTrue', {
        emit_data: {
          content,
        },
      });
      throw err;
    }
  }

  protected _generate_embed(options: EmbedData) {
    return new EmbedBuilder(options);
  }

  async send(options: InteractionReplyOptions): Promise<Message | null> {
    options.fetchReply = true;
    try {
      if (this._interaction.replied || this._interaction.deferred) {
        if (options?.ephemeral) {
          if (this._interaction.ephemeral)
            return this._interaction.editReply(options);
          else return this._interaction.followUp(options);
        } else return this._interaction.editReply(options);
      } else {
        return this._interaction.reply(options) as unknown as Promise<Message>;
      }
    } catch (err) {
      const error = err as Error;
      handle_error(error, '[Interaction_template] method replyTrue', {
        emit_data: {
          options,
        },
      });

      return null;
    }
  }
}
