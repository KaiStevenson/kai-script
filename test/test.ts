import { _Evaluate, createFn } from "../src";

const KS_boolToBin = "fn(b, ?(b, 1, 0))";

const boolArrToBinaryArr = createFn<[boolean[]]>()(
  `fn(boolArr, map(boolArr, ${KS_boolToBin}))`
);

const factorial = createFn<[number]>()(
  `bind(fac,fn(n,?(eq(n, 1),n,mul(n,call(fac,sub(n,1))))))`
);

const factRes = factorial(6);
console.log(factRes);

const closureTest = createFn<[number]>()(`fn(n, call(fn(m, add(m,n)), n))`);

const closureRes = closureTest(6);
console.log(closureRes);
