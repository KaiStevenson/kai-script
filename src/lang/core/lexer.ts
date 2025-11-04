import { LexerCtx, Token, TokenSubType, TokenType } from "./common";

export type BreakingToken =
  | TokenType.OPEN_PAREN
  | TokenType.CLOSE_PAREN
  | TokenType.COMMA
  | TokenType.SEMICOLON
  | TokenType.SPACE;

export type IsWhitespace<T extends string> = T extends `${TokenType.SPACE}`
  ? true
  : T extends `${TokenType.COMMA}`
  ? true
  : T extends `${TokenType.SEMICOLON}`
  ? true
  : false;

export type ProcessNameCollection<
  Ctx extends LexerCtx,
  Tail extends string,
  _Token extends Token | null
> = {
  next: Tail;
  nameCollection: "";
  tokens: _Token extends null
    ? [
        ...Ctx["tokens"],
        ...(Ctx["nameCollection"] extends ""
          ? []
          : [Token<TokenType.NAME, Ctx["nameCollection"]>])
      ]
    : [
        ...Ctx["tokens"],
        ...(Ctx["nameCollection"] extends ""
          ? [_Token]
          : [Token<TokenType.NAME, Ctx["nameCollection"]>, _Token])
      ];
};

export type IsOpen<T> = T extends `${TokenType.OPEN_PAREN}` ? true : false;
export type IsClose<T> = T extends `${TokenType.CLOSE_PAREN}` ? true : false;

export type ChunkedLex<
  Ctx extends LexerCtx,
  Depth extends any[] = []
> = Depth["length"] extends 50
  ? Ctx & {
      endChunk: true;
    }
  : Ctx["next"] extends `${infer Head}${infer Tail}`
  ? IsWhitespace<Head> extends true
    ? ChunkedLex<ProcessNameCollection<Ctx, Tail, null>, [0, ...Depth]>
    : IsOpen<Head> extends true
    ? ChunkedLex<
        ProcessNameCollection<Ctx, Tail, Token<TokenType.OPEN_PAREN>>,
        [0, ...Depth]
      >
    : IsClose<Head> extends true
    ? ChunkedLex<
        ProcessNameCollection<Ctx, Tail, Token<TokenType.CLOSE_PAREN>>,
        [0, ...Depth]
      >
    : ChunkedLex<
        {
          next: Tail;
          nameCollection: `${Ctx["nameCollection"]}${Head}`;
          tokens: Ctx["tokens"];
        },
        [0, ...Depth]
      >
  : Ctx;

export type InnerLex<
  Next extends string,
  NameCollection extends LexerCtx["nameCollection"] = "",
  AccTokens extends Token[] = []
> = Next extends ""
  ? AccTokens
  : ChunkedLex<{
      next: Next;
      tokens: [];
      nameCollection: NameCollection;
    }> extends infer U
  ? U extends LexerCtx & { endChunk: true }
    ? InnerLex<U["next"], U["nameCollection"], [...AccTokens, ...U["tokens"]]>
    : U extends LexerCtx
    ? [...AccTokens, ...U["tokens"]]
    : never
  : never;

export type Lex<Raw extends string> = InnerLex<Raw>;
