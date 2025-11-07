/*
If you've ever said "I wish generic types were first class," you're probably doing something wrong.
On the other hand, you might be doing something right! KaiScript makes this possible.
*/

import { CallFn, Evaluate, FnPrim, Lex, Parse } from "../src";

// You might have a type that looks like this
type MyGenericMapper<T extends number> = `${T}`;
// And another that looks like this
type MyGenericMapper2<T extends number> = `number:${T}`;

// And another type that wants to consume them
//@ts-expect-error
type Map5<Mapper> = Mapper<5>;

// Hmm, can't do that. ...maybe this?
type Map5_2<Mapper extends <T extends number>() => string> = ReturnType<
  //@ts-expect-error
  Mapper<5>
>;

// But with KaiScript:

type MyKaiScriptMapper = Evaluate<Parse<Lex<"fn(n, tostring(n))">>>[0];
type MyKaiScriptMapper2 = Evaluate<
  Parse<Lex<'fn(n, tostring(add("number:", tostring(n))))'>>
>[0];

type Map5KaiScript<Mapper extends FnPrim> = CallFn<Mapper, [5]>;
// "5"
type Mapped1 = Map5KaiScript<MyKaiScriptMapper>;
// "number:5"
type Mapped2 = Map5KaiScript<MyKaiScriptMapper2>;

// KaiScript lets you get an extra order of primitivity out of your types
