import {
  BUILTIN_Add,
  BUILTIN_Arr,
  BUILTIN_IfElse,
  BUILTIN_Mul,
  BUILTIN_ToString,
  SBUILTIN_Call,
  SBUILTIN_Map,
} from "../builtin";
import { ToString } from "../util";
import { ASTNode, EmptyStackFrame, NodeType, StackFrame } from "./common";

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
    : Node["name"] extends "mul"
    ? BUILTIN_Mul<Args>
    : Node["name"] extends "?"
    ? BUILTIN_IfElse<Args>
    : SENTINEL_NO_BUILTIN
  : never;

export type EvalError<T extends string> = `Eval error: ${T}`;

export type FindInStack<
  Frame extends StackFrame,
  NameToFind
> = NameToFind extends keyof Frame["bindings"]
  ? Frame["bindings"][NameToFind]
  : Frame["parent"] extends null
  ? EvalError<`Can't find name "${ToString<NameToFind>}" on the stack`>
  : FindInStack<Frame["parent"], NameToFind>;

export type FnPrim<
  Args extends readonly ASTNode[] = readonly ASTNode[],
  Fn extends ASTNode = ASTNode
> = { args: Args; fn: Fn };

export type HandleFn<Node extends ASTNode> = Node["children"] extends [
  ...infer Args extends ASTNode[],
  infer Fn extends ASTNode
]
  ? FnPrim<Args, Fn>
  : // error?
    never;

// any[] was propertykey
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
  Fn extends FnPrim,
  Values extends readonly any[],
  Frame extends StackFrame
> = _Evaluate<Fn["fn"], StackFrame<MapZip<Fn["args"], Values>, Frame>>;

export type _Evaluate<
  Node extends ASTNode,
  Frame extends StackFrame
> = Node["type"] extends NodeType.INT
  ? Node["value"]
  : Node["type"] extends NodeType.EXT
  ? // special builtin
    Node["name"] extends "fn"
    ? HandleFn<Node>
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
