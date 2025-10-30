import { ASTNode, NodeType } from "./common";
import { Lex } from "./lexer";
import { Parse } from "./parser";

export type FnError<T extends string> = `Function execution error: ${T}`;

export type ToStringInner<T, Carry extends string = ""> = T extends
  | string
  | number
  ? `${T}`
  : T extends readonly any[]
  ? T extends readonly [infer Head, ...infer Tail]
    ? `${ToStringInner<
        Tail,
        `${Carry extends "" ? "" : `${Carry}, `}${ToStringInner<Head>}`
      >}`
    : `[${Carry}]`
  : FnError<`Can't stringify`>;

export type UnarrayIfOnlyHead<T extends readonly any[]> = T extends [
  infer Head,
  infer Next
]
  ? T
  : T extends [infer Head]
  ? Head
  : T;

export type BUILTIN_ToString<Args extends readonly ASTNode[]> = ToStringInner<
  UnarrayIfOnlyHead<{
    [Idx in keyof Args]: Args[Idx] extends ASTNode
      ? ToStringInner<Evaluate<Args[Idx]>>
      : never;
  }>
>;
// export type BUILTIN_Print<Args extends readonly ASTNode[]>

export type SENTINEL_NO_BUILTIN = "__NO_BUILTIN__";
export type MapBuiltins<Node extends ASTNode> = Node["name"] extends "tostring"
  ? BUILTIN_ToString<Node["children"]>
  : SENTINEL_NO_BUILTIN;

export type EvalError<T extends string> = `Eval error: ${T}`;

export type Evaluate<Node extends ASTNode> = Node["type"] extends NodeType.INT
  ? Node["value"]
  : Node["type"] extends NodeType.ROOT
  ? Node["children"] extends infer Children extends readonly ASTNode[]
    ? UnarrayIfOnlyHead<{
        [Idx in keyof Children]: Children[Idx] extends ASTNode
          ? Evaluate<Children[Idx]>
          : never;
      }>
    : EvalError<`Unexpected error parsing children of ${Node["type"]}`>
  : Node["type"] extends NodeType.EXT
  ? MapBuiltins<Node>
  : EvalError<`Unhandled node type ${Node["type"]}`>;

const input = `tostring(5, 2)` as const;
const lex_result = null as unknown as Lex<typeof input>;
const parse_result = null as unknown as Parse<typeof lex_result>;
const eval_result = null as unknown as Evaluate<typeof parse_result>;
