import path from "path";
import { createTestHarness } from "../harness";

export default createTestHarness({
  harnessName: "Function",
  generatedPath: path.join(__dirname, "..", "generated"),
})
  .createFunctionTest({
    name: "f(x) = x",
    program: "fn(x, x)",
    cases: [
      { input: "hello", output: "hello" },
      { input: 1, output: 1 },
      { input: [1, 2, 3], output: [1, 2, 3] },
      { input: true, output: true },
    ],
  })
  .createFunctionTest({
    name: "f(x) = x + 5",
    program: "fn(x, add(x,5))",
    cases: [
      { input: 0, output: 5 },
      { input: 5, output: 10 },
      { input: 500, output: 505 },
    ],
  });
