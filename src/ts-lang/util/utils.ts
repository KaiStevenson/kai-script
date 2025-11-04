export type UnarrayIfOnlyHead<T extends readonly any[]> = T extends [
  infer Head,
  infer Next
]
  ? T
  : T extends [infer Head]
  ? Head
  : T;
