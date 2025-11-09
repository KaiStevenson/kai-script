import path from "path";
import { createTestHarness } from "../harness";

export default createTestHarness({
  harnessName: "ToString",
  generatedPath: path.join(__dirname, "..", "generated"),
})
  .createFunctionTest({
    name: "Passes through strings literally",
    program: "fn(x, tostring(x))",
    cases: [
      { input: "hello", output: "hello" },
      { input: "1", output: "1" },
      { input: "[1,2,3]", output: "[1,2,3]" },
    ],
  })
  .createFunctionTest({
    name: "Is idempotent",
    program: "fn(x, tostring(tostring(x)))",
    cases: [
      { input: "hello", output: "hello" },
      { input: "1", output: "1" },
      { input: "[1,2,3]", output: "[1,2,3]" },
    ],
  })
  .createFunctionTest({
    name: "Handles primitives",
    program: "fn(x, tostring(x))",
    cases: [
      { input: 5, output: "5" },
      { input: true, output: "true" },
    ],
  })
  .createFunctionTest({
    name: "Handles arrays and nested arrays",
    program: "fn(x, tostring(x))",
    cases: [
      { input: [1, 2, 3], output: "[1, 2, 3]" },
      { input: [1, 2, [3, 4, 5]], output: "[1, 2, [3, 4, 5]]" },
    ],
  });
