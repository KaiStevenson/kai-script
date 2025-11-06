import { FnError } from ".";
import { ASTNode, StackFrame } from "../core/common";
import {
  CallFn,
  FnPrim,
  GetEvaluatedChildren,
  EvalError,
  _Evaluate,
} from "../core/eval";
import { ExtractNumber, ToString } from "../util";

export type SBUILTIN_Call<
  Node extends ASTNode,
  Frame extends StackFrame,
  Callstack extends readonly string[]
> = GetEvaluatedChildren<Node, Frame, Callstack> extends [
  infer Fn,
  ...infer Values extends readonly any[]
]
  ? CallFn<Fn, Values, Frame, Callstack>
  : EvalError<`Invalid params for function call: ${ToString<
      GetEvaluatedChildren<Node, Frame, Callstack>
    >}`>;

export type SBUILTIN_Map<
  Node extends ASTNode,
  Frame extends StackFrame,
  Callstack extends readonly string[]
> = GetEvaluatedChildren<Node, Frame, Callstack> extends [
  infer Arr extends readonly any[],
  infer Fn extends FnPrim
]
  ? {
      [Idx in keyof Arr]: CallFn<
        Fn,
        [Arr[Idx], ExtractNumber<Idx>],
        Frame,
        Callstack
      >;
    }
  : EvalError<`Invalid params for map: ${ToString<
      GetEvaluatedChildren<Node, Frame, Callstack>
    >}`>;

export type SBUILTIN_IfElse<
  Node extends ASTNode,
  Frame extends StackFrame,
  Callstack extends readonly string[]
> = Node["children"] extends infer Children extends readonly ASTNode[]
  ? Children extends [infer A, infer B, infer C, infer D]
    ? FnError<`Invalid args for "if": ${ToString<Children>}`>
    : Children extends [
        infer Cond extends ASTNode,
        infer TrueVal extends ASTNode,
        infer FalseVal extends ASTNode
      ]
    ? _Evaluate<Cond, Frame, Callstack> extends true
      ? _Evaluate<TrueVal, Frame, Callstack>
      : _Evaluate<Cond, Frame, Callstack> extends false
      ? _Evaluate<FalseVal, Frame, Callstack>
      : FnError<`Condition value ${ToString<Cond>} is not a boolean`>
    : FnError<`Invalid args for "if": ${ToString<Children>}`>
  : never;
