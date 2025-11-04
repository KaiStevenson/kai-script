import { callFn, emptyStackFrame, evaluate, lex, parse } from "../js-lang";
import {
  Evaluate,
  FnPrim,
  Lex,
  Parse,
  EvalError,
  CallFn,
  EmptyStackFrame,
} from "../ts-lang";

export const createFn = <Program extends string>(
  program: Program
): Evaluate<Parse<Lex<Program>>> extends [infer ProgramFn extends FnPrim]
  ? <const Args extends any[]>(
      ...args: Args
    ) => CallFn<ProgramFn, Args, EmptyStackFrame>
  : EvalError<"Cannot create a function from a program that does not eval to a function"> => {
  const [programFn] = evaluate(parse(lex(program))) as Array<FnPrim>;
  if (!programFn.fn) {
    throw new Error(
      "Cannot create a function from a program that does not eval to a function"
    );
  }

  return ((...args: any[]) => callFn(programFn, args, emptyStackFrame)) as any;
};
