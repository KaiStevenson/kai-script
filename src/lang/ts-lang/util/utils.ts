export type UnarrayIfOnlyHead<T extends readonly any[]> = T extends [
  infer Head,
  infer Next
]
  ? T
  : T extends [infer Head]
  ? Head
  : T;

type ARR_EQUAL_SENTINEL = { __arrEq: true };
export type ArrayEqual<
  T extends readonly any[],
  Last = ARR_EQUAL_SENTINEL
> = T extends [infer Head, ...infer Tail]
  ? Last extends ARR_EQUAL_SENTINEL
    ? ArrayEqual<Tail, Head>
    : Head extends Last
    ? Last extends Head
      ? ArrayEqual<Tail, Head>
      : false
    : false
  : true;
