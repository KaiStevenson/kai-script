import {
  AddNumbers,
  AddStrings,
  Multiply,
  ToString,
  UnarrayIfOnlyHead,
} from "../util";

export type FnError<T extends string> = `Function execution error: ${T}`;

export type BUILTIN_Arr<Args extends readonly any[]> = Args;

export type BUILTIN_ToString<Args extends readonly any[]> = ToString<
  UnarrayIfOnlyHead<{
    [Idx in keyof Args]: ToString<Args[Idx]>;
  }>
>;

export type BUILTIN_Add<Args extends readonly any[]> =
  Args extends readonly string[]
    ? AddStrings<Args>
    : Args extends readonly number[]
    ? AddNumbers<Args>
    : FnError<`Cannot add operands ${ToString<Args>}`>;

export type BUILTIN_Mul<Args extends readonly any[]> = Args extends [
  infer A,
  infer B,
  infer C
]
  ? FnError<`Can only multiply [number, number], but got ${ToString<Args>}`>
  : Args extends [infer M extends number, infer N extends number]
  ? Multiply<M, N>
  : FnError<`Can only multiply [number, number], but got ${ToString<Args>}`>;
