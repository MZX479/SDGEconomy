import { handle_error } from '@/tools';
import { readFileSync, writeFile, existsSync, mkdirSync } from 'fs';

const { logger } = { logger: true };

export class Logger {
  private _logs_query: string[] = [];
  private _errors_query: string[] = [];
  private _warnings_query: string[] = [];

  constructor() {
    this._setup();
  }

  private _setup() {
    setInterval(() => this._write_logs(), 15000);
  }

  /** @description Write success logs to file */
  log(content: string) {
    if (logger) console.log(content.yellow);
    this._logs_query.push(this._curr_time() + content);
  }

  /** @description Write error logs to file */
  error(content: string) {
    if (logger) console.error(content);
    const err_content = `\n${this._curr_time()} [ ERROR ]\n${this._curr_time()} ${content}\n${this._curr_time()} [ ERROR ]\n`;
    this._logs_query.push(err_content);
    this._errors_query.push(this._curr_time() + content);
  }

  /** @description Write warning logs to file */
  warning(content: string) {
    if (logger) console.warn(content);
    const warning_content = `\n${this._curr_time()} [ WARNING ]\n${this._curr_time()} ${content}\n${this._curr_time()} [ WARNING ]\n`;
    this._logs_query.push(warning_content);
    this._warnings_query.push(this._curr_time() + content);
  }

  private _curr_time() {
    const date = new Date();
    return `[${date.toLocaleDateString()} ${date.toLocaleTimeString()}] `;
  }

  private async _write_logs() {
    try {
      const is_data_exist = existsSync('../data');
      if (!is_data_exist) mkdirSync('../data');
      const today_folder = new Date().toLocaleDateString().replace(/\//g, '-');
      const is_today_exist = existsSync('../data/' + today_folder);
      if (!is_today_exist) mkdirSync('../data/' + today_folder);
      const is_today_logs_exist = existsSync(
        `../data/${today_folder}/logs.txt`
      );
      const is_today_errors_exist = existsSync(
        `../data/${today_folder}/errors.txt`
      );
      const is_today_warnings_exist = existsSync(
        `../data/${today_folder}/warnings.txt`
      );

      if (this._logs_query[0]) {
        let line = this._logs_query.join('\n');
        this._logs_query = [];
        if (!is_today_logs_exist) {
          line = `[Начато логирование дебаг-логов: ${new Date().toLocaleDateString()}]\n\n${line}`;
        }

        if (is_today_logs_exist) {
          const file_content = readFileSync(`../data/${today_folder}/logs.txt`);
          line = file_content + '\n' + line;
        }

        writeFile(`../data/${today_folder}/logs.txt`, line, (err) => {
          if (err) {
            handle_error(err, '[Logger] method _write_logs');
          }
        });
      }

      if (this._errors_query[0]) {
        let line = this._errors_query.join('\n');
        this._errors_query = [];
        if (!is_today_errors_exist) {
          line = `[Начато логирование ошибок: ${new Date().toLocaleDateString()}]\n\n${line}`;
        }

        if (is_today_errors_exist) {
          const file_content = readFileSync(
            `../data/${today_folder}/errors.txt`
          );
          line = file_content + '\n' + line;
        }

        writeFile(`../data/${today_folder}/errors.txt`, line, (err) => {
          if (err) {
            handle_error(err, '[Logger] method _write_logs');
          }
        });
      }

      if (this._warnings_query[0]) {
        let line = this._warnings_query.join('\n');
        this._warnings_query = [];
        if (!is_today_warnings_exist) {
          line = `[Начато логирование предупреждений: ${new Date().toLocaleDateString()}]\n\n${line}`;
        }

        if (is_today_warnings_exist) {
          const file_content = readFileSync(
            `../data/${today_folder}/warnings.txt`
          );
          line = file_content + '\n' + line;
        }

        writeFile(`../data/${today_folder}/warnings.txt`, line, (err) => {
          if (err) {
            handle_error(err, '[Logger] method _write_logs');
          }
        });
      }
    } catch (err) {
      handle_error(<Error>err, '[Logger] method _write_logs');
    }
  }
}
