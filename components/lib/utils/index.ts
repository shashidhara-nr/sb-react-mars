import { accountNumberlayout } from '../config';

export function accountNumberFormat(input: string | number) {
  const raw = input.toString().replace(/\D/g, '');

  const result: string[] = [];

  let index = 0;
  for (const length of accountNumberlayout) {
    if (index >= raw.length) break;
    result.push(raw.slice(index, index + length));
    index += length;
  }

  return result.join(' ');
}
