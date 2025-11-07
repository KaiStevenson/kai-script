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
  StackFrame,
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
  ): Evaluate<Parse<Lex<Program>>> extends infer E
    ? E extends [infer ProgramFn extends FnPrim]
      ? TransformArgs<ProgramFn["args"]> extends ArgsConstraint
        ? <const Args extends ArgsConstraint>(
            ...args: Args
          ) => CallFn<ProgramFn, Args, EmptyStackFrame, []>
        : EvalError<`Program's args do not extend args constraint`>
      : E extends readonly [
          readonly [infer Prim extends FnPrim, infer StackFrame, infer Name]
        ]
      ? TransformArgs<Prim["args"]> extends ArgsConstraint
        ? <const Args extends ArgsConstraint>(
            ...args: Args
          ) => CallFn<E[0], Args, EmptyStackFrame, []>
        : EvalError<`Program's args do not extend args constraint`>
      : EvalError<"Cannot create a function from a program that does not eval to a function">
    : never => {
    const [e] = evaluate(parse(lex(program))) as [
      FnPrim | [FnPrim, StackFrame, ASTNode["name"]]
    ];

    const fn: FnPrim = Array.isArray(e) ? e[0] : e;

    if (!fn.fn) {
      throw new Error(
        "Cannot create a function from a program that does not eval to a function"
      );
    }

    return ((...args: any[]) => callFn(e, args, emptyStackFrame)) as any;
  };
