import { ASTNode } from "../core/common";
import {
  CallFn,
  FnPrim,
  GetEvaluatedChildren,
  StackFrame,
  EvalError,
} from "../core/eval";
import { ToString } from "../util";

export type SBUILTIN_Call<
  Node extends ASTNode,
  Frame extends StackFrame
> = GetEvaluatedChildren<Node, Frame> extends [
  infer Fn extends FnPrim,
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
  ? { [Idx in keyof Arr]: CallFn<Fn, [Arr[Idx]], Frame> }
  : EvalError<`Invalid params for map: ${ToString<
      GetEvaluatedChildren<Node, Frame>
    >}`>;
