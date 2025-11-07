# KaiScript

#### KaiScript is a simple functional programming language implemented inside of the TypeScript type system and inside of the TypeScript language.

This means that you can write programs inside TypeScript that evaluate without running the code. The inferred type of a KaiScript program is always exactly equal to the runtime value.

![KaiScript example code](https://imgur.com/a/kaiscript-example-IXCEB4d)

## Using KaiScript

To see what KaiScript is capable of, take a look at the guided tour here: [[EXAMPLES]](./examples/README.md)

## Source code

https://git.aberrantflux.xyz/kai-script.git/

## FAQ

> Why would I want to use this?

You probably wouldn't!

> Why did you make this?

TypeScript has a fantastic type system that is somewhat underappreciated in the public consciousness. Writing this was super fun, and I discovered a lot along the way. You should do it too! If you're interested in trying, I recommend not looking at the implementation of KaiScript. **Most of the fun is in figuring it out for yourself**.

> How can I write imperative code?

You can't.

> How can I publish a package for KaiScript?

KaiScript doesn't have its own package manager yet, but it works natively with npm.
If you've written a useful library, just export it like so:

```typescript
export const myKaiScriptFunction = "fn(...)";
```

Publish it to npm, and anyone else can easily use it via template literals:

```typescript
import { myKaiScriptFunction } from "my-kai-script-function";
export const usesLibrary = `call(${myKaiScriptFunction}, args)`;
```
