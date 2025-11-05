import { ASTNode, NodeType, ParserCtx, Token, TokenType } from "./common";

export type Error<T extends string> = ASTNode<
  NodeType.PARSER_ERROR,
  "Error",
  T,
  []
>;

export type PushChild<Node extends ASTNode, Child extends ASTNode> = {
  type: Node["type"];
  value: Node["value"];
  name: Node["name"];
  children: [...Node["children"], Child];
};

export type PushChildToLastElementOfStack<
  Stack extends ParserCtx["stack"],
  Child extends ASTNode
> = Stack extends [...infer Head, infer Tail extends ASTNode]
  ? [...Head, PushChild<Tail, Child>]
  : Stack extends [infer Only extends ASTNode]
  ? [PushChild<Only, Child>]
  : never;

export type PushChildToSecondLastElementOfStack<
  Stack extends ParserCtx["stack"],
  Child extends ASTNode
> = Stack extends [
  ...infer Head,
  infer Tail extends ASTNode,
  infer Final extends ASTNode
]
  ? [...Head, PushChild<Tail, Child>, Final]
  : Stack extends [infer Only extends ASTNode, infer Final extends ASTNode]
  ? [PushChild<Only, Child>, Final]
  : never;

export type GetLastOnStack<Stack extends ParserCtx["stack"]> = Stack extends [
  ...infer Head,
  infer Tail extends ASTNode
]
  ? Tail
  : Stack extends [infer Only extends ASTNode]
  ? Only
  : never;

export type StackWithoutLast<Stack extends ParserCtx["stack"]> = Stack extends [
  ...infer Head extends ASTNode[],
  infer Tail
]
  ? [...Head]
  : Stack extends [infer Only extends ASTNode]
  ? []
  : never;

type NULL_SENTINEL = {
  NULL: true;
};

export type ParseNumberLiteral<T extends string> =
  T extends `${infer Inner extends number}` ? Inner : NULL_SENTINEL;

export type ParseStringLiteral<T extends string> =
  T extends `"${infer Inner extends string}"` ? Inner : NULL_SENTINEL;

export type ResolveNodeFromToken<_Token extends Token> = ParseNumberLiteral<
  _Token["name"]
> extends number
  ? ASTNode<NodeType.INT, "", ParseNumberLiteral<_Token["name"]>, []>
  : ParseStringLiteral<_Token["name"]> extends string
  ? ASTNode<NodeType.INT, "", ParseStringLiteral<_Token["name"]>, []>
  : ASTNode<NodeType.EXT, _Token["name"], null, []>;

// FIXME don't need lastToken
export type _Parse<Ctx extends ParserCtx> = Ctx["remainingTokens"] extends [
  infer Head extends Token,
  ...infer Tail extends readonly Token[]
]
  ? Ctx["lastToken"] extends Token
    ? Head["type"] extends TokenType.NAME
      ? // we already have a lastToken
        // mutate last element of stack to push lastToken as child
        // lastToken = nextToken
        // goto start
        _Parse<{
          lastToken: Head;
          remainingTokens: Tail;
          stack: PushChildToLastElementOfStack<
            Ctx["stack"],
            ResolveNodeFromToken<Ctx["lastToken"]>
          >;
        }>
      : //nextToken is openParen or close paren
      Head["type"] extends TokenType.CLOSE_PAREN
      ? // handle lastToken
        // set last element of stack as child of prev element on stack
        // pop stack
        // [stack[last - 1].children.push(stack.pop)
        // goto start
        _Parse<{
          lastToken: null;
          remainingTokens: Tail;
          // first push the last name onto the children of the top
          // then push the top onto the children of the next
          // then remove the top
          stack: StackWithoutLast<
            PushChildToSecondLastElementOfStack<
              Ctx["stack"],
              PushChild<
                GetLastOnStack<Ctx["stack"]>,
                ResolveNodeFromToken<Ctx["lastToken"]>
              >
            >
          >;
        }>
      : Head["type"] extends TokenType.OPEN_PAREN
      ? // push lastToken onto stack
        // goto start
        _Parse<{
          lastToken: null;
          remainingTokens: Tail;
          stack: [...Ctx["stack"], ResolveNodeFromToken<Ctx["lastToken"]>];
        }>
      : Ctx & Error<`Was not expecting ${Head["type"]}`>
    : // expect nextToken to be a name or open paren or close paren
    Head["type"] extends TokenType.NAME
    ? // lastToken = nextToken
      // goto start
      _Parse<{
        lastToken: Head;
        remainingTokens: Tail;
        stack: Ctx["stack"];
      }>
    : Head["type"] extends TokenType.CLOSE_PAREN
    ? _Parse<{
        lastToken: null;
        remainingTokens: Tail;
        // push the top onto the children of the next
        // then remove the top
        stack: StackWithoutLast<
          PushChildToSecondLastElementOfStack<
            Ctx["stack"],
            GetLastOnStack<Ctx["stack"]>
          >
        >;
      }>
    : Head["type"] extends TokenType.OPEN_PAREN
    ? // push lastToken onto stack
      // goto start
      _Parse<{
        lastToken: null;
        remainingTokens: Tail;
        stack: Ctx["stack"];
      }>
    : Ctx & Error<`Was not expecting ${Head["type"]}`>
  : Ctx["lastToken"] extends Token
  ? // case where we ended with a name
    _Parse<{
      lastToken: null;
      remainingTokens: [];
      stack: PushChildToLastElementOfStack<
        Ctx["stack"],
        ResolveNodeFromToken<Ctx["lastToken"]>
      >;
    }>
  : Ctx["stack"][0];

export type Parse<Raw extends readonly Token[]> = _Parse<{
  lastToken: null;
  remainingTokens: Raw;
  stack: [ASTNode<NodeType.EXT, "arr", null, []>];
}>;
