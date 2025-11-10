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

type Reduce<
  Arr extends readonly any[],
  Fn extends FnPrim,
  Acc,
  IdxLen extends readonly any[] = readonly []
> = Arr extends [infer Head, ...infer Tail]
  ? Reduce<
      Tail,
      Fn,
      CallFn<Fn, [Acc, Head, IdxLen["length"]]>,
      [...IdxLen, any]
    >
  : Acc;

export type SBUILTIN_Reduce<
  Node extends ASTNode,
  Frame extends StackFrame,
  Callstack extends readonly string[]
> = GetEvaluatedChildren<Node, Frame, Callstack> extends [
  infer Arr extends readonly any[],
  infer Fn extends FnPrim,
  infer Acc
]
  ? Reduce<Arr, Fn, Acc>
  : EvalError<`Invalid params for reduce: ${ToString<
      GetEvaluatedChildren<Node, Frame, Callstack>
    >}`>;

type Filter<
  Arr extends readonly any[],
  Fn extends FnPrim,
  Collected extends readonly any[] = [],
  IdxLen extends readonly any[] = readonly []
> = Arr extends [infer Head, ...infer Tail]
  ? Filter<
      Tail,
      Fn,
      CallFn<Fn, [Head, IdxLen["length"]]> extends true
        ? [...Collected, Head]
        : Collected,
      [...IdxLen, any]
    >
  : Collected;

export type SBUILTIN_Filter<
  Node extends ASTNode,
  Frame extends StackFrame,
  Callstack extends readonly string[]
> = GetEvaluatedChildren<Node, Frame, Callstack> extends [
  infer Arr extends readonly any[],
  infer Fn extends FnPrim
]
  ? Filter<Arr, Fn>
  : EvalError<`Invalid params for filter: ${ToString<
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
