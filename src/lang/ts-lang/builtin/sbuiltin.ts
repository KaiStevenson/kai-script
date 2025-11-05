import { ASTNode, StackFrame } from "../core/common";
import { CallFn, FnPrim, GetEvaluatedChildren, EvalError } from "../core/eval";
import { ExtractNumber, ToString } from "../util";

export type SBUILTIN_Call<
  Node extends ASTNode,
  Frame extends StackFrame
> = GetEvaluatedChildren<Node, Frame> extends [
  infer Fn,
  ...infer Values extends readonly any[]
]
  ? CallFn<Fn, Values, Frame>
  : EvalError<`Invalid params for function call: ${ToString<
      GetEvaluatedChildren<Node, Frame>
    >}`>;

export type SBUILTIN_Map<
  Node extends ASTNode,
  Frame extends StackFrame
> = GetEvaluatedChildren<Node, Frame> extends [
  infer Arr extends readonly any[],
  infer Fn extends FnPrim
]
  ? { [Idx in keyof Arr]: CallFn<Fn, [Arr[Idx], ExtractNumber<Idx>], Frame> }
  : EvalError<`Invalid params for map: ${ToString<
      GetEvaluatedChildren<Node, Frame>
    >}`>;
