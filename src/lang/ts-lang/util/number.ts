export type NumberToArray<
  Number extends number,
  Carry extends readonly any[] = []
> = Number extends Carry["length"]
  ? Carry
  : NumberToArray<Number, [...Carry, any]>;

export type NumbersToArray<
  Numbers extends readonly number[],
  Carry extends readonly any[] = []
> = Numbers extends [
  infer Head extends number,
  ...infer Tail extends readonly number[]
]
  ? NumbersToArray<Tail, [...Carry, ...NumberToArray<Head>]>
  : Carry;

export type AddNumbers<Numbers extends readonly number[]> =
  NumbersToArray<Numbers> extends infer T extends readonly any[]
    ? T["length"]
    : never;

export type SubNumbersInternal<
  MS extends readonly unknown[],
  NS extends readonly unknown[]
> = MS extends readonly [...NS, ...infer Tail] ? Tail : never;

export type SubNumbers<M extends number, N extends number> = SubNumbersInternal<
  NumberToArray<M>,
  NumberToArray<N>
> extends infer T extends readonly any[]
  ? T["length"]
  : never;

export type MultiplyInner<
  N extends number,
  MS extends readonly any[],
  Carry extends number = 0
> = MS extends [infer Head extends number, ...infer Tail extends readonly any[]]
  ? MultiplyInner<N, Tail, AddNumbers<[Carry, N]>>
  : Carry;

export type Multiply<M extends number, N extends number> = MultiplyInner<
  M,
  NumberToArray<N>
>;

export type ExtractNumber<T extends any> =
  T extends `${infer Inner extends number}` ? Inner : never;
