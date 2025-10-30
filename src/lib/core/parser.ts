import {
  ASTNode,
  NodeType,
  ParserCtx,
  Token,
  TokenSubType,
  TokenType,
} from "./common";
import { Lex } from "./lexer";

/* 
start
if no 'lastName'
then:
    expect nextToken to be a name
    lastName = nextToken
    goto start
    
else:
    if nextToken is name
    then:
        // we already have a lastName
        mutate last element of stack to push lastName as child
        lastName = nextToken
        goto start

    else:
        //nextToken is openParen or close paren
        if nextToken is closeParen
        then:
            set last element of stack as child of prev element on stack
            pop stack
            // [stack[last - 1].children.push(stack.pop)
            goto start
        else if nextToken is openParen:
            push lastName onto stack
            goto start


finally:
    // only one element remains on the stack
    return stack[0]


    CALL ( param, CALL2 ( param2 ) )

    param2 ret call2 param ret call

    | call
    |-- param
    |-- | call2
        |-- param2

 */

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

export type ResolveNodeFromToken<_Token extends Token> =
  _Token["subType"] extends TokenSubType.LITERAL
    ? ASTNode<NodeType.INT, "UNNAMED", _Token["name"], []>
    : ASTNode<NodeType.EXT, _Token["name"], null, []>;

export type _Parse<Ctx extends ParserCtx> = Ctx["remainingTokens"] extends [
  infer Head extends Token,
  ...infer Tail extends readonly Token[]
]
  ? Ctx["lastToken"] extends Token
    ? Head["type"] extends TokenType.NAME
      ? // we already have a lastName
        // mutate last element of stack to push lastName as child
        // lastName = nextToken
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
      ? // handle lastName
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
      ? // push lastName onto stack
        // goto start
        _Parse<{
          lastToken: null;
          remainingTokens: Tail;
          stack: [...Ctx["stack"], ResolveNodeFromToken<Ctx["lastToken"]>];
        }>
      : Ctx & Error<`Was not expecting ${Head["type"]}`>
    : // expect nextToken to be a name or close paren
    Head["type"] extends TokenType.NAME
    ? // lastName = nextToken
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
    : Ctx &
        Error<`Expected nextToken to be a name or close paren at ${Head["type"]}`>
  : Ctx["stack"][0];

export type Parse<Raw extends readonly Token[]> = _Parse<{
  lastToken: null;
  remainingTokens: Raw;
  stack: [ASTNode<NodeType.ROOT, "ROOT", null, []>];
}>;

const test_result = null as unknown as Parse<Lex<"test(a)">>;
