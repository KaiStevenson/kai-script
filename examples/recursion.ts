/*
Any practical programming language can of course handle recursion, and KaiScript is no exception.
Factorial is a function that is particularly easy to define recursively.
*/

import { createFn } from "../src";

// bind(name, fn) returns fn inside a closure containing itself bound to name
const factorial = createFn<[number]>()(
  `bind(fac,fn(n,?(eq(n, 1),n,mul(n,call(fac,sub(n,1))))))`
);

// const factRes: 720
const factRes = factorial(6);
console.log(factRes);

// You might be disappointed to learn that computing factorials larger than 6
// fails catastrophically. Blame TypeScript.
