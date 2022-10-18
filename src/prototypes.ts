import 'colors';

function _curr_time() {
  const date = new Date();
  return `[${date.toLocaleDateString()} ${date.toLocaleTimeString()}] `;
}

const _log = console.log;

/** @description Mutation for success log. Adding time in the start of the string */
console.log = function (...args: any[]) {
  process.stdout.write(_curr_time().white);
  _log(...args);
};

/** @description Mutation for warn log. Adding yellow color for text and time in the start of the string */
console.warn = function (...args: any[]) {
  process.stdout.write(_curr_time().yellow);
  _log(...args.map((arg) => (typeof arg === 'string' ? arg.yellow : arg)));
};

/** @description Mutation for error log. Adding red color for the text and time in the start of the string */
console.error = function (...args: any[]) {
  process.stdout.write(_curr_time().red);
  _log(...args.map((arg) => (typeof arg === 'string' ? arg.red : arg)));
};
