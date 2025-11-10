/*
You can do anything with map + reduce!
*/

import { createFn } from "../src";

const concatNumbers = createFn<[number[]]>()(
  `fn(a, reduce(map(a, fn(n, tostring(n))), fn(acc, cur, add(acc,cur)), ""))`
);

// const result: "1235"
const concatted = concatNumbers([1, 2, 35]);
console.log(concatted);

const arrayLength = createFn<[any[]]>()(
  `fn(a, reduce(a, fn(acc, add(acc, 1)), 0))`
);

// const length: 2
const length = arrayLength(["hello", "world"]);
console.log(length);
