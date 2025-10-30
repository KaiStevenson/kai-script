import { ASTNode, NodeType } from "./common";
import { Lex } from "./lexer";
import { Parse } from "./parser";

export type FnError<T extends string> = `Function execution error: ${T}`;

export type ToStringInner<T, Carry extends string = ""> = T extends
  | string
  | number
  ? `${T}`
  : T extends readonly any[]
  ? T extends [infer Head, ...infer Tail]
    ? `${ToStringInner<
        Tail,
        `${Carry extends "" ? "" : `${Carry}, `}${ToStringInner<Head>}`
      >}`
    : `[${Carry}]`
  : FnError<`Can't stringify`>;

export type BUILTIN_ToString<Args extends readonly ASTNode[]> = {
  [Idx in Exclude<keyof Args, keyof any[]>]: Args[Idx] extends ASTNode
    ? ToStringInner<Evaluate<Args[Idx]>>
    : never;
};
// export type BUILTIN_Print<Args extends readonly ASTNode[]>

export type SENTINEL_NO_BUILTIN = "__NO_BUILTIN__";
export type MapBuiltins<Node extends ASTNode> = Node["name"] extends "tostring"
  ? BUILTIN_ToString<Node["children"]>
  : SENTINEL_NO_BUILTIN;

export type EvalError<T extends string> = `Eval error: ${T}`;

export type Evaluate<Node extends ASTNode> = Node["type"] extends NodeType.INT
  ? Node["value"]
  : Node["type"] extends NodeType.ROOT
  ? {
      // FIXME render as array??
      [Idx in Exclude<
        keyof Node["children"],
        keyof any[]
      >]: Node["children"][Idx] extends ASTNode
        ? Evaluate<Node["children"][Idx]>
        : never;
      // indexing for now to remove object syntax
      // pls fix
    }[Exclude<keyof Node["children"], keyof any[]>]
  : Node["type"] extends NodeType.EXT
  ? MapBuiltins<Node>
  : EvalError<`Unhandled node type ${Node["type"]}`>;

const input = `tostring(5, 3)` as const;
const lex_result = null as unknown as Lex<typeof input>;
const parse_result = null as unknown as Parse<typeof lex_result>;
const eval_result = null as unknown as Evaluate<typeof parse_result>;
