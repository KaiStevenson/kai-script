/*
Writing and immediately evaluating KaiScript programs is of little use.
You'll find the most benefit from its native interoperability with TypeScript.
*/

// createFn receives a KaiScript program and evaluates it. If it evaluates to a function,
// it will return a generic TypeScript function corresponding to this function.
import { createFn } from "../src";

// We define a function F(n) -> n
const myFn = createFn()(`fn(n, n)`);

// const result: 5
const result = myFn(5);
console.log(result);

// We can use this to define useful functions, and restrict their arguments
const myUsefulFn = createFn<[number, number]>()(
  `fn(m, n, add(tostring(m), "*", tostring(n), "=", tostring(mul(m,n))))`
);

// const usefulResult: "2*5=10"
const usefulResult = myUsefulFn(2, 5);
console.log(usefulResult);
