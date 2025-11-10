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
  })
  .createFunctionTest({
    name: "Filter: remove 0s",
    program: "fn(a, filter(a, fn(n, ?(eq(n, 0), false, true))))",
    cases: [
      { input: [1, 2, 3], output: [1, 2, 3] },
      { input: [1, 0, 10], output: [1, 10] },
      { input: [0, 0, 0], output: [] },
      { input: [0, 0, 3, 0, 5, 0, 7, 0], output: [3, 5, 7] },
    ],
  })
  .createFunctionTest({
    name: "Filter: remove first element",
    program: "fn(a, filter(a, fn(n, idx, ?(eq(idx, 0), false, true))))",
    cases: [
      { input: [true, true, false], output: [true, false] },
      { input: [1, 0, 10], output: [0, 10] },
      { input: ["hi", ["test", "test2"]], output: [["test", "test2"]] },
    ],
  });
