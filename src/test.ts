import { evaluate, lex, parse } from "./lang";
import { createFn } from "./lang";

const adder = createFn("fn(x, add(x, 5))");

const result = adder(5);
console.log(result);
