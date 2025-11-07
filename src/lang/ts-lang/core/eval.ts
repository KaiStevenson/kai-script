import {
  BUILTIN_Add,
  BUILTIN_Arr,
  BUILTIN_Eq,
  BUILTIN_Mul,
  BUILTIN_Sub,
  BUILTIN_ToString,
  SBUILTIN_Call,
  SBUILTIN_IfElse,
  SBUILTIN_Map,
} from "../builtin";
import { ToString } from "../util";
import {
  ASTNode,
  EmptyStackFrame,
  MergeStackFrames,
  NodeType,
  StackFrame,
} from "./common";

export type RECURSION_DEPTH_LIMIT = 7;

export type SENTINEL_NO_BUILTIN = "__NO_BUILTIN__";
export type MapBuiltins<
  Node extends ASTNode,
  Frame extends StackFrame,
  Callstack extends readonly string[]
> = GetEvaluatedChildren<
  Node,
  Frame,
  Callstack
> extends infer Args extends readonly any[]
  ? Node["name"] extends "call"
    ? SBUILTIN_Call<Node, Frame, Callstack>
    : Node["name"] extends "map"
    ? SBUILTIN_Map<Node, Frame, Callstack>
    : Node["name"] extends "?"
    ? SBUILTIN_IfElse<Node, Frame, Callstack>
    : Node["name"] extends "tostring"
    ? BUILTIN_ToString<Args>
    : Node["name"] extends "arr"
    ? BUILTIN_Arr<Args>
    : Node["name"] extends "add"
    ? BUILTIN_Add<Args>
    : Node["name"] extends "sub"
    ? BUILTIN_Sub<Args>
    : Node["name"] extends "mul"
    ? BUILTIN_Mul<Args>
    : Node["name"] extends "eq"
    ? BUILTIN_Eq<Args>
    : SENTINEL_NO_BUILTIN
  : never;

export type EvalError<T extends string> = `Eval error: ${T}`;

export type FindInStack<
  Frame extends StackFrame,
  NameToFind
> = NameToFind extends keyof Frame["bindings"]
  ? Frame["bindings"][NameToFind] extends never
    ? EvalError<`Can't find name "${ToString<NameToFind>}" on the stack`>
    : Frame["bindings"][NameToFind]
  : EvalError<`Can't find name "${ToString<NameToFind>}" on the stack`>;

export type FnPrim<
  Args extends readonly ASTNode[] = readonly ASTNode[],
  Fn extends ASTNode = ASTNode
> = { args: Args; fn: Fn };

export type HandleBind<
  Node extends ASTNode,
  Frame extends StackFrame,
  Callstack extends readonly string[]
> = Node["children"] extends [
  infer Name extends ASTNode,
  infer Value extends ASTNode
]
  ? _Evaluate<Value, Frame, [...Callstack, "bind"]> extends infer U
    ? U extends FnPrim
      ? readonly [U, Frame, Name["name"]]
      : U
    : never
  : never;

export type HandleFn<
  Node extends ASTNode,
  Frame extends StackFrame
> = Node["children"] extends [
  ...infer Args extends ASTNode[],
  infer Fn extends ASTNode
]
  ? FnPrim<Args, Fn>
  : EvalError<"Invalid args for function call">;

export type MapZip<
  Args extends readonly ASTNode[],
  Values extends readonly any[]
> = {
  [Idx in Exclude<
    keyof Args,
    keyof any[]
  > as Args[Idx] extends infer Node extends ASTNode
    ? Node["name"]
    : never]: Idx extends keyof Values ? Values[Idx] : never;
};

export type CallFn<
  Fn,
  Values extends readonly any[],
  Frame extends StackFrame = EmptyStackFrame,
  Callstack extends readonly string[] = []
> = Fn extends readonly [
  infer Prim extends FnPrim,
  infer CapturedFrame extends StackFrame,
  infer Name extends ASTNode["name"]
]
  ? _Evaluate<
      Prim["fn"],
      MergeStackFrames<
        CapturedFrame,
        MergeStackFrames<
          StackFrame<{ [K in Name]: Fn }>,
          StackFrame<MapZip<Prim["args"], Values>>
        >
      >,
      [...Callstack, "call"]
    >
  : Fn extends FnPrim<infer Args, infer FnBody>
  ? _Evaluate<
      FnBody,
      MergeStackFrames<Frame, StackFrame<MapZip<Args, Values>>>,
      [...Callstack, "call"]
    >
  : Fn;

export type _Evaluate<
  Node extends ASTNode,
  Frame extends StackFrame,
  Callstack extends readonly string[]
> = Callstack extends infer C extends readonly any[]
  ? C["length"] extends RECURSION_DEPTH_LIMIT
    ? EvalError<`Too deep: ${ToString<Callstack>}`>
    : Node["type"] extends NodeType.INT
    ? Node["value"]
    : Node["type"] extends NodeType.EXT
    ? // special builtins
      Node["name"] extends "bind"
      ? HandleBind<Node, Frame, Callstack>
      : Node["name"] extends "fn"
      ? HandleFn<Node, Frame>
      : MapBuiltins<Node, Frame, Callstack> extends infer BI
      ? BI extends SENTINEL_NO_BUILTIN
        ? FindInStack<Frame, Node["name"]>
        : BI
      : never
    : EvalError<`Unhandled node type ${Node["type"]}`>
  : never;

export type GetEvaluatedChildren<
  Node extends ASTNode,
  Frame extends StackFrame,
  Callstack extends readonly string[]
> = Node["children"] extends infer Children extends readonly ASTNode[]
  ? {
      [Idx in keyof Children]: Children[Idx] extends ASTNode
        ? _Evaluate<Children[Idx], Frame, Callstack>
        : never;
    }
  : never;

export type Evaluate<Node extends ASTNode> = _Evaluate<
  Node,
  EmptyStackFrame,
  []
>;
