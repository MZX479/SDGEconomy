/** @description Log error to console and write one to error file */
export function handle_error<T extends object>(
  err: string | Error,
  from: string,
  data?: T
) {
  console.log(err);
}
