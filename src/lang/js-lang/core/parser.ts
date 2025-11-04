import { Token, Parse, TokenType, ASTNode, NodeType } from "../../ts-lang";
import { lex } from "./lexer";

const resolveNodeFromToken = (token: Token): ASTNode => {
  // FIXME not correct
  if (!isNaN(Number(token.name))) {
    return {
      type: NodeType.INT,
      name: "",
      value: Number(token.name),
      children: [],
    };
  }
  if (token.name[0] === '"' && token.name[token.name.length - 1] === '"') {
    return {
      type: NodeType.INT,
      name: "",
      value: token.name.slice(1, token.name.length - 1),
      children: [],
    };
  }
  return {
    type: NodeType.EXT,
    name: token.name,
    value: null,
    children: [],
  };
};

const _parse = ({
  remainingTokens,
  lastToken,
  stack,
}: {
  remainingTokens: Token[];
  lastToken: Token | null;
  stack: ASTNode[];
}): ASTNode | null => {
  const head = remainingTokens.shift();
  if (!head) {
    if (lastToken) {
      (stack[stack.length - 1].children as ASTNode[]).push(
        resolveNodeFromToken(lastToken)
      );

      return _parse({
        lastToken: null,
        remainingTokens: [],
        stack,
      });
    }

    return stack[0] ?? null;
  }

  if (lastToken) {
    if (head.type === TokenType.NAME) {
      (stack[stack.length - 1].children as ASTNode[]).push(
        resolveNodeFromToken(lastToken)
      );
      return _parse({
        lastToken: head,
        remainingTokens,
        stack,
      });
    }

    if (head.type === TokenType.CLOSE_PAREN) {
      const top = stack.pop()!;
      (top.children as ASTNode[]).push(resolveNodeFromToken(lastToken));
      (stack[stack.length - 1].children as ASTNode[]).push(top);

      return _parse({
        lastToken: null,
        remainingTokens,
        stack,
      });
    }

    if (head.type === TokenType.OPEN_PAREN) {
      return _parse({
        lastToken: null,
        remainingTokens,
        stack: [...stack, resolveNodeFromToken(lastToken)],
      });
    }

    throw new Error(
      `${JSON.stringify({
        lastToken,
        remainingTokens,
        stack,
      })} Was not expecting ${head.type}`
    );
  }

  if (head.type === TokenType.NAME) {
    return _parse({
      lastToken: head,
      remainingTokens,
      stack,
    });
  }

  if (head.type === TokenType.CLOSE_PAREN) {
    const top = stack.pop()!;
    (stack[stack.length - 1].children as ASTNode[]).push(top);

    return _parse({
      lastToken: null,
      remainingTokens,
      stack,
    });
  }

  throw new Error(
    `${JSON.stringify({
      lastToken,
      remainingTokens,
      stack,
    })} Expected nextToken to be a name or close paren at ${head.type}`
  );
};

export const parse = <const Raw extends readonly Token[]>(
  raw: Raw
): Parse<Raw> =>
  _parse({
    remainingTokens: raw as unknown as Token[],
    lastToken: null,
    stack: [{ type: NodeType.EXT, name: "arr", value: null, children: [] }],
  }) as Parse<Raw>;
