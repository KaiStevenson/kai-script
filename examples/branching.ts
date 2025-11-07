/*
KaiScript is turing complete. Use the "?" function to branch execution.
Only the branch matching the condition will be evaluated.
*/

import { createFn } from "../src";

const myBranchingFn = createFn<[boolean]>()("fn(b, ?(b, 1, 0))");

// const result: 1
const result = myBranchingFn(true);

// This is very powerful! For example, if you're bad at addition, KaiScript can check your work
const isAdditionCorrect = createFn<[m: number, n: number, expected: number]>()(
  `fn(m,n,e, ?(eq(add(m, n), e), "correct", "incorrect"))`
);

// const badAddition: "incorrect"
const badAddition = isAdditionCorrect(5, 10, 2);
console.log(badAddition);

// const goodAddition: "correct"
const goodAddition = isAdditionCorrect(5, 10, 15);
console.log(goodAddition);
