import { _Evaluate, createFn, evaluate, lex, parse } from "../src";

const KS_boolToBin = "fn(b, ?(b, 1, 0))";

const boolArrToBinaryArr = createFn<[boolean[]]>()(
  `fn(boolArr, map(boolArr, ${KS_boolToBin}))`
);

const factorial = createFn<[number]>()(
  `bind(fac,fn(n,?(eq(n, 1),n,mul(n,call(fac,sub(n,1))))))`
);

const res = factorial(6);
console.log(res);

const closureTest = createFn<[number]>()(`fn(n, call(fn(m, add(m,n)), n))`);

const res2 = closureTest(5);
console.log(res2);
