export enum TokenType {
  OPEN_PAREN = "(",
  CLOSE_PAREN = ")",
  SPACE = " ",
  SEMICOLON = ";",
  COMMA = ",",
  UNIQUE_SYMBOL = "UNIQUE_SYMBOL",
}

export type Token<
  Type extends TokenType = TokenType,
  Name extends string = string
> = {
  type: Type;
  name: Name;
};

export type LexerCtx = {
  next: string;
  nameCollection: string;
  tokens: readonly Token[];
};

export enum NodeType {
  ROOT = "ROOT",
  LITERAL = "LITERAL",
  CALL = "CALL",
  PARSER_ERROR = "PARSER_ERROR",
}

export type ASTNode<
  Type extends NodeType = NodeType,
  Name extends string = string,
  Children extends ASTNode[] = ASTNode<NodeType, string, any>[]
> = {
  type: Type;
  name: Name;
  children: Children;
};

export type ParserCtx = {
  remainingTokens: readonly Token[];
  lastName: string | null;
  stack: readonly ASTNode[];
};
