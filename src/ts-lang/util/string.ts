export type AddStrings<
  Strings extends readonly string[],
  Carry extends string = ""
> = Strings extends [infer Head extends string, ...infer Tail extends string[]]
  ? AddStrings<Tail, `${Carry}${Head}`>
  : Carry;

export type ToString<T, Carry extends string = ""> = T extends string | number
  ? `${T}`
  : T extends readonly any[]
  ? T extends readonly [infer Head, ...infer Tail]
    ? `${ToString<
        Tail,
        `${Carry extends "" ? "" : `${Carry}, `}${ToString<Head>}`
      >}`
    : `[${Carry}]`
  : never;
