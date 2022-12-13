/** @description Discharge number by symbols
 * @example 1000000 -> 1.000.000
 */
export function discharge(number: number) {
  try {
    if (!number && number !== 0) throw new Error('Argument is not a number!');
    if (!Number.isInteger(number)) throw new Error('Argument is not a number');

    const discharge_symbol = '.';

    const betweens_result = `${number}`;
    const result = betweens_result.replace(
      /(\d)(?=(\d\d\d)+([^\d]|$))/g,
      '$1' + discharge_symbol
    );
    return `\`${result}\``;
  } catch (e) {
    return (<Error>e).message;
  }
}
