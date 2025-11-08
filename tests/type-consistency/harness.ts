import fs from "fs/promises";
import path from "path";

const convertName = (name: string) => name.replace(" ", "-").toLowerCase();

export const createTestHarness = ({
  harnessName,
  generatedPath,
}: {
  harnessName: string;
  generatedPath: string;
}) => {
  const tests: string[] = [];

  return {
    async writeTests() {
      const file = `import { evaluateProgram, createFn } from "../../../src";
import { describe, expect, expectTypeOf, test } from "vitest";

describe(\`${harnessName}\`, () => {
      ${tests.join("\n")}
    });`;

      await fs.mkdir(generatedPath, { recursive: true });

      await fs.writeFile(
        path.join(generatedPath, `${convertName(harnessName)}.test.ts`),
        file,
        "utf-8"
      );

      console.log(`Wrote ${tests.length} test(s) for "${harnessName}"!`);
    },

    createProgramTest({
      name,
      program,
      expected,
    }: {
      name: string;
      program: string;
      expected: any;
    }) {
      tests.push(`test(\`${name}\`, () => {
    const PROGRAM = \`${program}\` as const;
    const expected: ${JSON.stringify(expected)} = ${JSON.stringify(expected)};
    const result = evaluateProgram(PROGRAM);

    expect(result).toStrictEqual(expected);
    expectTypeOf<typeof result>().toEqualTypeOf<typeof expected>();
      });`);

      return this;
    },

    createFunctionTest({
      name,
      program,
      cases,
    }: {
      name: string;
      program: string;
      cases: Array<{ input: any; output: any }>;
    }) {
      tests.push(`describe(\`${name}\`, () => {
    const PROGRAM = \`${program}\` as const;
    ${cases.map(
      ({ input, output }) => `test(\`${JSON.stringify(
        input
      )} -> ${JSON.stringify(output)}\`, () => {
    const input: ${JSON.stringify(input)} = ${JSON.stringify(input)};
    const expected: ${JSON.stringify(output)} = ${JSON.stringify(output)};
    const fn = createFn()(PROGRAM)
    const result = fn(input)

    expect(result).toStrictEqual(expected);
    expectTypeOf<typeof result>().toEqualTypeOf<typeof expected>();
      })
      `
    )}});`);

      return this;
    },
  };
};
