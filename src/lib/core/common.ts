export enum TokenType {
  OPEN_PAREN = "(",
  CLOSE_PAREN = ")",
  SPACE = " ",
  SEMICOLON = ";",
  COMMA = ",",
  NAME = "NAME",
}

export enum TokenSubType {
  NA = "NA",
  LITERAL = "LITERAL",
  REFERENCE = "REFERENCE",
}

export type Token<
  Type extends TokenType = TokenType,
  Subtype extends TokenSubType = TokenSubType,
  Name extends string = string
> = {
  type: Type;
  subType: Subtype;
  name: Name;
};

export type LexerCtx = {
  next: string;
  nameCollection: string;
  tokens: readonly Token[];
};

export enum NodeType {
  ROOT = "ROOT",
  INT = "INT",
  EXT = "EXT",
  PARSER_ERROR = "PARSER_ERROR",
}

export type ASTNode<
  Type extends NodeType = NodeType,
  Name extends string = string,
  Value extends any = any,
  Children extends ASTNode[] = ASTNode<NodeType, string, any, any>[]
> = {
  type: Type;
  name: Name;
  value: Value;
  children: Children;
};

export type ParserCtx = {
  remainingTokens: readonly Token[];
  lastToken: Token | null;
  stack: readonly ASTNode[];
};
