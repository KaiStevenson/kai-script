import path from "path";
import { createTestHarness } from "../harness";

export default createTestHarness({
  harnessName: "Map reduce",
  generatedPath: path.join(__dirname, "..", "generated"),
})
  .createFunctionTest({
    name: "Map: numbers to string",
    program: "fn(a, map(a, fn(n, tostring(n))))",
    cases: [
      { input: [1, 2, 3], output: ["1", "2", "3"] },
      { input: [50], output: ["50"] },
      { input: [], output: [] },
    ],
  })
  .createFunctionTest({
    name: "Reduce: array length",
    program: "fn(a, reduce(a, fn(acc, add(acc, 1)), 0))",
    cases: [
      { input: [1, 2, 3], output: 3 },
      { input: ["hello", ["hello", "world"]], output: 2 },
      { input: [], output: 0 },
    ],
  })
  .createFunctionTest({
    name: "Reduce: sum of numbers times index",
    program: "fn(a, reduce(a, fn(acc, cur, idx, add(acc, mul(cur, idx))), 0))",
    cases: [
      { input: [1, 2, 3], output: 8 },
      { input: [], output: 0 },
      { input: [50, 10, 0], output: 10 },
    ],
  });
