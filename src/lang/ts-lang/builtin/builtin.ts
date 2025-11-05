import { FnError } from ".";
import {
  AddNumbers,
  AddStrings,
  ArrayEqual,
  Multiply,
  SubNumbers,
  ToString,
  UnarrayIfOnlyHead,
} from "../util";

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

export type BUILTIN_Sub<Args extends readonly any[]> = Args extends [
  infer A,
  infer B,
  infer C
]
  ? FnError<`Can only sub [number, number], but got ${ToString<Args>}`>
  : Args extends [infer M extends number, infer N extends number]
  ? SubNumbers<M, N>
  : FnError<`Can only sub [number, number], but got ${ToString<Args>}`>;

export type BUILTIN_Mul<Args extends readonly any[]> = Args extends [
  infer A,
  infer B,
  infer C
]
  ? FnError<`Can only multiply [number, number], but got ${ToString<Args>}`>
  : Args extends [infer M extends number, infer N extends number]
  ? Multiply<M, N>
  : FnError<`Can only multiply [number, number], but got ${ToString<Args>}`>;

export type BUILTIN_Eq<Args extends readonly any[]> = Args extends
  | readonly number[]
  | readonly string[]
  | readonly boolean[]
  ? ArrayEqual<Args>
  : FnError<`Can only check equality of numbers or string or boolean, but got ${ToString<Args>}`>;

export type BUILTIN_IfElse<Args extends readonly any[]> = Args extends [
  infer A,
  infer B,
  infer C,
  infer D
]
  ? FnError<`Invalid args for "if": ${ToString<Args>}`>
  : Args extends [infer Cond, infer TrueVal, infer FalseVal]
  ? Cond extends true
    ? TrueVal
    : Cond extends false
    ? FalseVal
    : FnError<`Condition value ${ToString<Cond>} is not a boolean`>
  : FnError<`Invalid args for "if": ${ToString<Args>}`>;
