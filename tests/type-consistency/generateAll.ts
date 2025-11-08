import harnesses from "./spec/index";

Promise.all(harnesses.map((harness) => harness.writeTests())).catch(
  (e) => `Failed to generate tests: ${e}`
);
