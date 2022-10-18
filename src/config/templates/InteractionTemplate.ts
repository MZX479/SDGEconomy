import { handle_error } from '@/tools';
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

  constructor(_interaction: CommandInteraction) {
    this._interaction = _interaction;
    this._embed_sample = {
      footer: {
        text: this._interaction.user.tag,
        iconURL: this._interaction.user.displayAvatarURL(),
      },
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
      if (typeof content === 'string') {
        const embed_true = this._get_true(content);
        if (!embed_true)
          throw new Error('Something went wrong while creating Embed');
        return this._send(embed_true, options) as Promise<Message<boolean>>;
      } else if (typeof content != 'string') {
        return this._send(content, options) as Promise<Message<boolean>>;
      } else {
        throw new Error("Content for embed isn't defined");
      }
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
    try {
      const embed_false = this._get_false(content);
      if (!embed_false)
        throw new Error('Something went wrong while creating embed');

      return this._send(embed_false, options) as Promise<Message<boolean>>;
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

  private _get_false(content: string) {
    try {
      const false_embed = this._generate_embed({
        description: content,
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
  private _get_true(content: string) {
    try {
      const true_embed = this._generate_embed({
        description: content,
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

  private _generate_embed(options: EmbedData) {
    return new EmbedBuilder(options);
  }

  private _send(embed: EmbedBuilder, options?: InteractionReplyOptions) {
    try {
      if (this._interaction.replied || this._interaction.deferred) {
        return this._interaction
          .editReply({
            embeds: [embed],
            ...options,
          })
          .catch((err) => err);
      } else {
        return this._interaction
          .reply({
            embeds: [embed],
            ...options,
          })
          .catch((err) => err);
      }
    } catch (err) {
      const error = err as Error;
      handle_error(error, '[Interaction_template] method replyTrue', {
        emit_data: {
          embed,
          options,
        },
      });
      return error;
    }
  }
}
