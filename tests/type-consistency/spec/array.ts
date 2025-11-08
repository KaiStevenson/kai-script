import path from "path";
import { createTestHarness } from "../harness";

export default createTestHarness({
  harnessName: "Array",
  generatedPath: path.join(__dirname, "..", "generated"),
})
  .createProgramTest({
    name: "Number array",
    program: "arr(1,2,3)",
    expected: [[1, 2, 3]],
  })
  .createProgramTest({
    name: "String array",
    program: `arr("1","2","3")`,
    expected: [["1", "2", "3"]],
  });
