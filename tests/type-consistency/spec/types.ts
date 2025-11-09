import path from "path";
import { createTestHarness } from "../harness";

export default createTestHarness({
  harnessName: "Types",
  generatedPath: path.join(__dirname, "..", "generated"),
})
  .createProgramTest({
    name: "Handles number inputs",
    program: "1,2,3",
    expected: [1, 2, 3],
  })
  .createProgramTest({
    name: "Handles string inputs",
    program: `"hello", "world"`,
    expected: ["hello", "world"],
  })
  .createProgramTest({
    name: "Handles boolean inputs",
    program: `true, false`,
    expected: [true, false],
  });
