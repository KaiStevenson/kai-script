import { callFn, emptyStackFrame, evaluate, lex, parse } from "../js-lang";
import {
  Evaluate,
  FnPrim,
  Lex,
  Parse,
  EvalError,
  CallFn,
  EmptyStackFrame,
  ASTNode,
} from "../ts-lang";

export type TransformArgs<Args extends readonly ASTNode[]> = {
  [Idx in keyof Args]: any;
};

export type AssertArgs<
  Args extends readonly ASTNode[],
  ArgsConstraint extends readonly any[]
> = TransformArgs<Args> extends ArgsConstraint ? ArgsConstraint : never;

export const createFn =
  <ArgsConstraint extends any[]>() =>
  <Program extends string>(
    program: Program
  ): Evaluate<Parse<Lex<Program>>> extends [infer ProgramFn extends FnPrim]
    ? TransformArgs<ProgramFn["args"]> extends ArgsConstraint
      ? <const Args extends ArgsConstraint>(
          ...args: Args
        ) => CallFn<ProgramFn, Args, EmptyStackFrame>
      : EvalError<`Program's args do not extend args constraint`>
    : EvalError<"Cannot create a function from a program that does not eval to a function"> => {
    const [programFn] = evaluate(parse(lex(program))) as Array<FnPrim>;
    if (!programFn.fn) {
      throw new Error(
        "Cannot create a function from a program that does not eval to a function"
      );
    }

    return ((...args: any[]) =>
      callFn(programFn, args, emptyStackFrame)) as any;
  };
