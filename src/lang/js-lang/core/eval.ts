import {
  ASTNode,
  StackFrame,
  Evaluate,
  EmptyStackFrame,
  NodeType,
  FnPrim,
  SENTINEL_NO_BUILTIN,
} from "../../ts-lang";
import { nameToBUILTIN, nameToSBUILTIN } from "../builtin";

const V_SENTINEL_NO_BUILTIN: SENTINEL_NO_BUILTIN = "__NO_BUILTIN__";

const mapBuiltins = (node: ASTNode, frame: StackFrame): any => {
  if (node.name in nameToSBUILTIN) {
    return nameToSBUILTIN[node.name](node, frame);
  }
  if (node.name in nameToBUILTIN) {
    return nameToBUILTIN[node.name](getEvaluatedChildren(node, frame));
  }

  return V_SENTINEL_NO_BUILTIN;
};

const findInStack = (frame: StackFrame, nameToFind: string) => {
  if (nameToFind in frame.bindings) {
    return frame.bindings[nameToFind];
  }

  throw new Error(`Can't find name ${nameToFind} on the stack`);
};

const handleBind = (node: ASTNode, frame: StackFrame) => {
  const inner = _evaluate(node.children[1], frame);

  if (inner.fn) {
    return [inner, frame, node.children[0]["name"]];
  }

  return inner;
};

const handleFn = (node: ASTNode): FnPrim => {
  const fn = node.children[node.children.length - 1];

  return {
    args: node.children.slice(0, node.children.length - 1),
    fn,
  };
};

const mapZip = (args: ASTNode[], values: any[]) =>
  Object.fromEntries(args.map(({ name }, i) => [name, values[i]]));

export const callFn = (
  fn: FnPrim | [FnPrim, StackFrame, ASTNode["name"]],
  values: any[],
  frame: StackFrame
) => {
  if (Array.isArray(fn)) {
    const [prim, frame, name] = fn;
    return _evaluate(prim.fn, {
      bindings: {
        ...frame.bindings,
        [name]: fn,
        ...mapZip(prim.args as ASTNode[], values),
      },
    });
  }
  return _evaluate(fn.fn, {
    bindings: { ...frame.bindings, ...mapZip(fn.args as ASTNode[], values) },
  });
};

export const _evaluate = (node: ASTNode, frame: StackFrame): any => {
  if (node.type === NodeType.INT) {
    return node.value;
  }

  if (node.type === NodeType.EXT) {
    if (node.name === "fn") {
      return handleFn(node);
    }

    if (node.name === "bind") {
      return handleBind(node, frame);
    }

    const builtinResult = mapBuiltins(node, frame);
    if (builtinResult !== V_SENTINEL_NO_BUILTIN) {
      return builtinResult;
    }

    return findInStack(frame, node.name);
  }

  throw new Error(`Unhandled node type ${node.type}`);
};

export const getEvaluatedChildren = (node: ASTNode, frame: StackFrame) =>
  node.children.map((child) => _evaluate(child, frame));

export const emptyStackFrame: EmptyStackFrame = { bindings: {} };

export const evaluate = <const Node extends ASTNode>(
  node: Node
): Evaluate<Node> => _evaluate(node, emptyStackFrame) as Evaluate<Node>;
