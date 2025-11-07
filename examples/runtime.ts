/*
KaiScript isn't just a pretty face (IDE hint), it's also a full and complete interpreted language.
Any program you write in KaiScript will return exactly what it says it will.
*/

import { evaluate, lex, parse } from "../src";

// First, hover over myArray in your IDE...
// const myArray: [[1, 2, 3, 4, 5]]
const myArray = evaluate(parse(lex(`arr(1,2,3,4,5)`)));

// ...then run this file to see that the output matches
console.log(myArray);

// It's a nested tuple because all KaiScript programs are arrays. That is, the program <5, 3> would return [5, 3]
