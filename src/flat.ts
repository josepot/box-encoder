export interface Binary<T> extends Uint8Array {}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const encode = <T>(input: T): Binary<T> =>
  encoder.encode(JSON.stringify(input));
export const decode = <T>(input: Binary<T>): T =>
  JSON.parse(decoder.decode(input));
