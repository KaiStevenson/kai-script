import { createFn } from "../src";

const adder = createFn("fn(x, map(arr(10,20,30), fn(y, add(x, y))))");

const result = adder(5);
console.log(result);
