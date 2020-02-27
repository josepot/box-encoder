import { Binary, encode, decode } from './flat';

type PayloadT<T> = T extends { __innerBox: infer R }
  ? R extends Binary<infer RR>
    ? RR
    : R
  : undefined;
type Boxed<T extends {}> = Binary<
  Omit<T, '__innerBox'> & {
    __innerBox: PayloadT<T> extends undefined ? undefined : Binary<PayloadT<T>>;
  }
>;

type Unboxed<T extends Boxed<any>> = T extends Binary<infer R> ? R : never;

const emptyUint8Array = new Uint8Array(0);

export const boxEncode = <T extends {}>(input: T): Boxed<T> => {
  const { __innerBox, ...rest } = input as any;
  const outter = encode(rest) as Uint8Array;
  const inner = (__innerBox instanceof Uint8Array
    ? __innerBox
    : __innerBox
    ? encode(__innerBox)
    : emptyUint8Array) as Uint8Array;
  const result = new Uint8Array(outter.length + inner.length + 4);
  let len = outter.length;

  for (let i = 0; i < 4; i++) {
    const byte = len & 0xff;
    result[i] = byte;
    len = (len - byte) / 256;
  }
  result.set(outter, 4);
  result.set(inner, outter.length + 4);
  return result as Boxed<T>;
};

export const boxDecode = <T extends Boxed<any>>(input: T): Unboxed<T> => {
  let len = 0;
  for (let i = 3; i > -1; i--) {
    len = len * 256 + input[i];
  }
  const outerLimit = len + 4;
  const result = decode(input.slice(4, outerLimit)) as any;
  result.__innerBox =
    outerLimit === input.length ? undefined : input.slice(outerLimit);
  return result;
};
