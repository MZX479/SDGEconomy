import 'colors';
import { IntentsBitField, Client, REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
import { readdirSync } from 'fs';
import './prototypes';

import { MongoClient as _MongoClient } from 'mongodb';

const intents_flags = IntentsBitField.Flags;

export const client = new Client({
  intents: Object.values(intents_flags).filter((intent) =>
    Number(intent)
  ) as number[],
});

import dev_config from '#dev_config';
import prod_config from './config/config';
import { SlashLoader } from './loaders';

const DEV = process.argv.includes('--dev');

let env_path = '';

if (DEV) env_path = '../.env.dev';
else env_path = '../.env.production';

console.log(
  `Setting up env variables from ${env_path.green.split('/')[1].green}`
);
const envOutput = dotenv.config({
  path: env_path,
});

const defined_variables = envOutput.parsed
  ? Object.keys(envOutput.parsed)
  : ['None'];
console.group();
console.log(`Defined env variables:`, `${defined_variables.join(', ')}`.green);
console.groupEnd();

console.log('Setted up env variables');
console.log();

export const config = DEV ? dev_config : prod_config;

if (!process.env.DB_CONNECTION_LINK)
  throw new Error("DB connection link isn't defined. Define one in .env file");
export const MongoClient = new _MongoClient(process.env.DB_CONNECTION_LINK);

class BotBuilder {
  client = client;
  constructor() {
    this._start();
  }

  private async _start() {
    console.log(`Starting Bot...`.green);
    await this._load_mongoose();
    console.log();

    await this._load_commands();
    console.log();

    await this._load_events();
    console.log();

    await this._login();
    console.log();

    await this._post_commands();

    console.log();

    console.log(`Bot succesfully started!`.green);
  }

  async _load_mongoose() {
    console.group();
    console.log('Loading Mongoose');

    const connection_link = process.env.DB_CONNECTION_LINK;

    if (!connection_link)
      throw new Error(
        "DB connection link isn't defined. Define one in .env file"
      );

    await MongoClient.connect();
    console.log('Mongoose successfuly loaded'.green);
    console.groupEnd();
  }

  async _load_commands(): Promise<void> {
    console.group();
    console.log('Loading commands');

    const enabled_modules = Object.keys(config.modules).filter(
      (key) => config.modules[key as keyof typeof config.modules]
    );
    console.group();
    console.log(`Modules to load: ` + enabled_modules.join(', ').green);

    console.log();
    for (let i = 0; i < enabled_modules.length; i++) {
      const module_name = enabled_modules[i];
      console.log(`Searching module files ${module_name.green}`);

      const commands_folder = readdirSync(`./commands/${module_name}`);

      for (let i = 0; i < commands_folder.length; i++) {
        console.group();
        const file = commands_folder[i];
        const file_path = `./commands/${module_name}/${file}`;
        await import(file_path);
        console.log(`Loaded file: ` + file_path.green);
        console.groupEnd();
      }
    }

    console.groupEnd();
    console.log('Loaded commands');
    console.groupEnd();
  }

  async _load_events(): Promise<void> {
    console.group();
    console.log('Loading events');

    const events_folder = readdirSync(`./events`);

    for (let i = 0; i < events_folder.length; i++) {
      console.group();
      const file = events_folder[i];
      const file_path = `./events/${file}`;
      await import(file_path);
      console.log(`Loaded file: ` + file_path.green);
      console.groupEnd();
    }

    console.log('Loaded events');
    console.groupEnd();
  }

  async _post_commands(): Promise<void> {
    console.group();
    console.log('Pushing commands');
    if (client.user) {
      console.group();
      if (!process.env.TOKEN)
        throw new Error("Token isn't defined! Define token in .env file");
      const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
      const commands = SlashLoader.commands;

      const GLOBAL = JSON.parse(process.env.GLOBAL || 'false');

      if (GLOBAL) {
        console.log(`Pushing commands as GLOBAL`.green);

        await rest.put(Routes.applicationCommands(client.user.id), {
          body: commands,
        });
        await rest.put(
          Routes.applicationGuildCommands(client.user.id, config.guild_id),
          {
            body: [],
          }
        );
      } else {
        console.log(`Pushing commands as LOCAL to ${config.guild_id}`.green);

        await rest.put(
          Routes.applicationGuildCommands(client.user.id, config.guild_id),
          {
            body: commands,
          }
        );
        await rest.put(Routes.applicationCommands(client.user.id), {
          body: [],
        });
      }
      console.log(`Successfully registered application commands.`);
      console.groupEnd();
    }
    console.log('Pushed commands');
    console.groupEnd();
  }

  async _login() {
    console.group();
    console.log('Authorising bot');
    await this.client.login(process.env.TOKEN);
    console.log('Bot authorised');
    console.groupEnd();
  }
}

export const Bot = new BotBuilder();
