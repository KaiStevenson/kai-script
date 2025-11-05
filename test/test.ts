import { createFn } from "../src";

const KS_boolToBin = "fn(b, ?(b, 1, 0))";

const boolArrToBinaryArr = createFn<[boolean[]]>()(
  `fn(boolArr, map(boolArr, ${KS_boolToBin}))`
);

const result = boolArrToBinaryArr([true, false, true]);
console.log(result);
