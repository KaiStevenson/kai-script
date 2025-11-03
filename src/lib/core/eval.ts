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

export type NumberToArray<
  Number extends number,
  Carry extends readonly any[] = []
> = Number extends Carry["length"]
  ? Carry
  : NumberToArray<Number, [...Carry, any]>;

export type NumbersToArray<
  Numbers extends readonly number[],
  Carry extends readonly any[] = []
> = Numbers extends [
  infer Head extends number,
  ...infer Tail extends readonly number[]
]
  ? NumbersToArray<Tail, [...Carry, ...NumberToArray<Head>]>
  : Carry;

export type AddNumbers<Numbers extends readonly number[]> =
  NumbersToArray<Numbers> extends infer T extends readonly any[]
    ? T["length"]
    : never;

export type AddStrings<
  Strings extends readonly string[],
  Carry extends string = ""
> = Strings extends [infer Head extends string, ...infer Tail extends string[]]
  ? AddStrings<Tail, `${Carry}${Head}`>
  : Carry;

export type MultiplyInner<
  N extends number,
  MS extends readonly any[],
  Carry extends number = 0
> = MS extends [infer Head extends number, ...infer Tail extends readonly any[]]
  ? MultiplyInner<N, Tail, AddNumbers<[Carry, N]>>
  : Carry;
export type Multiply<M extends number, N extends number> = MultiplyInner<
  M,
  NumberToArray<N>
>;

export type BUILTIN_Arr<Args extends readonly any[]> = Args;

export type BUILTIN_ToString<Args extends readonly any[]> = ToStringInner<
  UnarrayIfOnlyHead<{
    [Idx in keyof Args]: ToStringInner<Args[Idx]>;
  }>
>;

export type BUILTIN_Add<Args extends readonly any[]> =
  Args extends readonly string[]
    ? AddStrings<Args>
    : Args extends readonly number[]
    ? AddNumbers<Args>
    : FnError<`Cannot add operands ${ToStringInner<Args>}`>;

export type BUILTIN_Mul<Args extends readonly any[]> = Args extends [
  infer A,
  infer B,
  infer C
]
  ? FnError<`Can only multiply [number, number], but got ${ToStringInner<Args>}`>
  : Args extends [infer M extends number, infer N extends number]
  ? Multiply<M, N>
  : FnError<`Can only multiply [number, number], but got ${ToStringInner<Args>}`>;

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
