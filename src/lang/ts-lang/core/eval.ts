import {
  BUILTIN_Add,
  BUILTIN_Arr,
  BUILTIN_Eq,
  BUILTIN_IfElse,
  BUILTIN_Mul,
  BUILTIN_Sub,
  BUILTIN_ToString,
  SBUILTIN_Call,
  SBUILTIN_Map,
} from "../builtin";
import { NumberToArray, ToString } from "../util";
import {
  ASTNode,
  EmptyStackFrame,
  MergeStackFrames,
  NodeType,
  StackFrame,
} from "./common";

export type SENTINEL_NO_BUILTIN = "__NO_BUILTIN__";
export type MapBuiltins<
  Node extends ASTNode,
  Frame extends StackFrame
> = GetEvaluatedChildren<Node, Frame> extends infer Args extends readonly any[]
  ? Node["name"] extends "call"
    ? SBUILTIN_Call<Node, Frame>
    : Node["name"] extends "map"
    ? SBUILTIN_Map<Node, Frame>
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
    : Node["name"] extends "?"
    ? BUILTIN_IfElse<Args>
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

export type NamedFnPrim<
  Args extends readonly ASTNode[],
  Fn extends ASTNode,
  Name extends string,
  CapturedFrame extends StackFrame
> = { args: Args; fn: Fn; name: Name; frame: CapturedFrame };

type BuildDeepBinding<
  FnPrim extends NamedFnPrim<any, any, any, any>,
  Depth extends readonly any[] = [any, any, any, any, any, any, any]
> = Depth extends []
  ? FnPrim
  : BuildDeepBinding<
      NamedFnPrim<
        FnPrim["args"],
        FnPrim["fn"],
        FnPrim["name"],
        MergeStackFrames<
          FnPrim["frame"],
          StackFrame<{
            [K in FnPrim["name"]]: NamedFnPrim<
              FnPrim["args"],
              FnPrim["fn"],
              FnPrim["name"],
              FnPrim["frame"]
            >;
          }>
        >
      >,
      Depth extends [infer Head, ...infer Tail] ? Tail : []
    >;

export type HandleBind<
  Node extends ASTNode,
  Frame extends StackFrame
> = Node["children"] extends [
  infer Name extends ASTNode,
  infer Value extends ASTNode
]
  ? _Evaluate<Value, Frame> extends infer U
    ? U extends FnPrim
      ? NamedFnPrim<
          U["args"],
          U["fn"],
          Name["name"],
          Frame
        > extends infer NamedFn
        ? NamedFn extends NamedFnPrim<infer A, infer F, infer N, any>
          ? // RECURSION DEPTH LIMIT = 5
            BuildDeepBinding<NamedFn, NumberToArray<5>>
          : never
        : never
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
  Frame extends StackFrame
> = Fn extends NamedFnPrim<
  infer Args,
  infer FnBody,
  infer Name,
  infer CapturedFrame
>
  ? _Evaluate<
      FnBody,
      MergeStackFrames<CapturedFrame, StackFrame<MapZip<Args, Values>>>
    >
  : Fn extends FnPrim<infer Args, infer FnBody>
  ? _Evaluate<FnBody, MergeStackFrames<Frame, StackFrame<MapZip<Args, Values>>>>
  : Fn;

export type _Evaluate<
  Node extends ASTNode,
  Frame extends StackFrame
> = Node["type"] extends NodeType.INT
  ? Node["value"]
  : Node["type"] extends NodeType.EXT
  ? // special builtins
    Node["name"] extends "bind"
    ? HandleBind<Node, Frame>
    : Node["name"] extends "fn"
    ? HandleFn<Node, Frame>
    : MapBuiltins<Node, Frame> extends infer BI
    ? BI extends SENTINEL_NO_BUILTIN
      ? FindInStack<Frame, Node["name"]>
      : BI
    : never
  : EvalError<`Unhandled node type ${Node["type"]}`>;

export type GetEvaluatedChildren<
  Node extends ASTNode,
  Frame extends StackFrame
> = Node["children"] extends infer Children extends readonly ASTNode[]
  ? {
      [Idx in keyof Children]: Children[Idx] extends ASTNode
        ? _Evaluate<Children[Idx], Frame>
        : never;
    }
  : never;

export type Evaluate<Node extends ASTNode> = _Evaluate<Node, EmptyStackFrame>;
