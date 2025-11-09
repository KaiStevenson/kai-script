import { TokenType, Lex, Token } from "../../ts-lang";

const WHITESPACE_TOKENS = [
  TokenType.SPACE,
  TokenType.COMMA,
  TokenType.SEMICOLON,
] as string[];

const _lex = (raw: string): Token[] => {
  let _raw: string = raw;
  let nameCollection = "";
  const tokens: Token[] = [];

  while (_raw) {
    const head = _raw[0];
    _raw = _raw.slice(1);

    const processNameCollection = () => {
      if (nameCollection) {
        tokens.push({ type: TokenType.NAME, name: nameCollection });
        nameCollection = "";
      }
    };

    if (WHITESPACE_TOKENS.includes(head)) {
      processNameCollection();
      continue;
    }

    if (head === TokenType.OPEN_PAREN) {
      processNameCollection();
      tokens.push({ type: TokenType.OPEN_PAREN, name: "" });
      continue;
    }

    if (head === TokenType.CLOSE_PAREN) {
      processNameCollection();
      tokens.push({ type: TokenType.CLOSE_PAREN, name: "" });
      continue;
    }

    nameCollection += head;
  }

  return tokens;
};

export const lex = <const Raw extends string>(raw: Raw): Lex<Raw> =>
  _lex(`${raw};`) as Lex<Raw>;
