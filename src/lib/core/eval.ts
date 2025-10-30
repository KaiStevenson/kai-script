import { ASTNode } from "./common";
import { Lex } from "./lexer";
import { Parse } from "./parser";

export type Evaluate<Node extends ASTNode> = "Not implemented";

const test_result = null as unknown as Evaluate<Parse<Lex<"print(a)">>>;
