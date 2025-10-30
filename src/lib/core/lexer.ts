import { LexerCtx, Token, TokenSubType, TokenType } from "./common";

export type BreakingToken =
  | TokenType.OPEN_PAREN
  | TokenType.CLOSE_PAREN
  | TokenType.COMMA
  | TokenType.SEMICOLON
  | TokenType.SPACE;

export type IsWhitespace<T> = T extends `${TokenType.SPACE}`
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
          : [
              Token<
                TokenType.NAME,
                TokenSubType.REFERENCE,
                Ctx["nameCollection"]
              >
            ])
      ]
    : [
        ...Ctx["tokens"],
        ...(Ctx["nameCollection"] extends ""
          ? [_Token]
          : [
              Token<
                TokenType.NAME,
                TokenSubType.REFERENCE,
                Ctx["nameCollection"]
              >,
              _Token
            ])
      ];
};

export type IsOpen<T> = T extends `${TokenType.OPEN_PAREN}` ? true : false;
export type IsClose<T> = T extends `${TokenType.CLOSE_PAREN}` ? true : false;

export type _Lex<Ctx extends LexerCtx> =
  Ctx["next"] extends `${infer Head}${infer Tail}`
    ? IsWhitespace<Head> extends true
      ? _Lex<ProcessNameCollection<Ctx, Tail, null>>
      : IsOpen<Head> extends true
      ? _Lex<ProcessNameCollection<Ctx, Tail, Token<TokenType.OPEN_PAREN>>>
      : IsClose<Head> extends true
      ? _Lex<ProcessNameCollection<Ctx, Tail, Token<TokenType.CLOSE_PAREN>>>
      : _Lex<{
          next: Tail;
          nameCollection: `${Ctx["nameCollection"]}${Head}`;
          tokens: Ctx["tokens"];
        }>
    : Ctx["tokens"];

export type Lex<Raw extends string> = _Lex<{
  next: `${Raw};`;
  tokens: [];
  nameCollection: "";
}>;
