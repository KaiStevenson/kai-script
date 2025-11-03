import {
  BUILTIN_Add,
  BUILTIN_Arr,
  BUILTIN_Mul,
  BUILTIN_ToString,
  SBUILTIN_Call,
  SBUILTIN_Map,
} from "../builtin";
import { ToString } from "../util";
import { ASTNode, EmptyStackFrame, NodeType, StackFrame } from "./common";
import { Lex } from "./lexer";
import { Parse } from "./parser";

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

export type MapOnStack<
  Node extends ASTNode,
  Frame extends StackFrame
> = FindInStack<Frame, Node["name"]>;

export type FnPrim<
  Args extends readonly ASTNode[] = readonly ASTNode[],
  Fn extends ASTNode = ASTNode
> = { args: Args; fn: Fn };

// Can support multiple args, just need to make the last arg be the fn
export type HandleFn<Node extends ASTNode> = Node["children"] extends [
  infer Arg extends ASTNode,
  infer Fn extends ASTNode
]
  ? FnPrim<[Arg], Fn>
  : never;

type MapZip<T extends readonly ASTNode[], U extends readonly PropertyKey[]> = {
  [Idx in Exclude<
    keyof T,
    keyof any[]
  > as T[Idx] extends infer Node extends ASTNode
    ? Node["name"]
    : never]: Idx extends keyof U ? U[Idx] : never;
};

export type CallFn<
  Fn extends FnPrim,
  Values extends readonly any[],
  Frame extends StackFrame
> = Evaluate<Fn["fn"], StackFrame<MapZip<Fn["args"], Values>, Frame>>;

export type Evaluate<
  Node extends ASTNode,
  Frame extends StackFrame = EmptyStackFrame
> = Node["type"] extends NodeType.INT
  ? Node["value"]
  : Node["type"] extends NodeType.EXT
  ? // special builtin
    Node["name"] extends "fn"
    ? HandleFn<Node>
    : MapBuiltins<Node, Frame> extends infer BI
    ? BI extends SENTINEL_NO_BUILTIN
      ? MapOnStack<Node, Frame>
      : BI
    : never
  : EvalError<`Unhandled node type ${Node["type"]}`>;

export type GetEvaluatedChildren<
  Node extends ASTNode,
  Frame extends StackFrame
> = Node["children"] extends infer Children extends readonly ASTNode[]
  ? {
      [Idx in keyof Children]: Children[Idx] extends ASTNode
        ? Evaluate<Children[Idx], Frame>
        : never;
    }
  : never;

const input = `map(arr(5,5,5), fn(n, add(n, 1)))` as const;
const lex_result = null as unknown as Lex<typeof input>;
const parse_result = null as unknown as Parse<typeof lex_result>;
const eval_result = null as unknown as Evaluate<typeof parse_result>;
