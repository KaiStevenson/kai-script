export enum TokenType {
  OPEN_PAREN = "(",
  CLOSE_PAREN = ")",
  SPACE = " ",
  SEMICOLON = ";",
  COMMA = ",",
  NAME = "NAME",
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
  INT = "INT",
  EXT = "EXT",
  PARSER_ERROR = "PARSER_ERROR",
}

export type ASTNode<
  Type extends NodeType = NodeType,
  Name extends string = string,
  Value extends any = any,
  Children extends readonly ASTNode[] = readonly ASTNode<
    NodeType,
    string,
    any,
    any
  >[]
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

export type StackFrame<
  Bindings extends Record<ASTNode["name"], any> = Record<ASTNode["name"], any>,
  Parent extends StackFrame | null = any
> = {
  bindings: Bindings;
  parent: Parent;
};

export type EmptyStackFrame = StackFrame<{}, null>;

export type WithPushedBindings<
  OldFrame extends StackFrame,
  Bindings extends StackFrame["bindings"]
> = StackFrame<Bindings, OldFrame>;
