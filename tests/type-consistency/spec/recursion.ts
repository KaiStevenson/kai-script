import path from "path";
import { createTestHarness } from "../harness";

export default createTestHarness({
  harnessName: "Recursive functions",
  generatedPath: path.join(__dirname, "..", "generated"),
})
  .createFunctionTest({
    name: "n!",
    program: "bind(fac,fn(n,?(eq(n, 1),n,mul(n,call(fac,sub(n,1))))))",
    cases: [
      { input: 3, output: 6 },
      { input: 1, output: 1 },
      { input: 5, output: 120 },
    ],
  })
  .createFunctionTest({
    name: "Sum of natural numbers on [0, n]",
    program: "bind(sumnn,fn(n,?(eq(n, 1),n,add(n,call(sumnn,sub(n,1))))))",
    cases: [
      { input: 5, output: 15 },
      { input: 1, output: 1 },
      { input: 2, output: 3 },
    ],
  });
