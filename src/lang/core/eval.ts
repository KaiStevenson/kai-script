import {
  BUILTIN_Add,
  BUILTIN_Arr,
  BUILTIN_Mul,
  BUILTIN_ToString,
} from "../builtin";
import { ASTNode, NodeType } from "./common";
import { Lex } from "./lexer";
import { Parse } from "./parser";

export type SENTINEL_NO_BUILTIN = "__NO_BUILTIN__";
export type MapBuiltins<Node extends ASTNode> =
  Node["children"] extends infer Children extends readonly ASTNode[]
    ? {
        [Idx in keyof Children]: Children[Idx] extends ASTNode
          ? Evaluate<Children[Idx]>
          : never;
      } extends infer Args extends readonly any[]
      ? Node["name"] extends "tostring"
        ? BUILTIN_ToString<Args>
        : Node["name"] extends "arr"
        ? BUILTIN_Arr<Args>
        : Node["name"] extends "add"
        ? BUILTIN_Add<Args>
        : Node["name"] extends "mul"
        ? BUILTIN_Mul<Args>
        : SENTINEL_NO_BUILTIN
      : never
    : never;

export type EvalError<T extends string> = `Eval error: ${T}`;

export type Evaluate<Node extends ASTNode> = Node["type"] extends NodeType.INT
  ? Node["value"]
  : Node["type"] extends NodeType.EXT
  ? MapBuiltins<Node>
  : EvalError<`Unhandled node type ${Node["type"]}`>;

const input = `` as const;
const lex_result = null as unknown as Lex<typeof input>;
const parse_result = null as unknown as Parse<typeof lex_result>;
const eval_result = null as unknown as Evaluate<typeof parse_result>;
