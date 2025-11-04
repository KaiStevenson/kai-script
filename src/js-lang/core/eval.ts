import {
  ASTNode,
  StackFrame,
  Evaluate,
  EmptyStackFrame,
  NodeType,
  FnPrim,
  SENTINEL_NO_BUILTIN,
} from "../../ts-lang";
import { nameToBUILTIN, nameToSBUILTIN, V_SBUILTIN_Map } from "../builtin";

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

  if (!frame.parent) {
    throw new Error(`Can't find name ${nameToFind} on the stack`);
  }

  return findInStack(frame.parent, nameToFind);
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

export const callFn = (fn: FnPrim, values: any[], frame: StackFrame) =>
  _evaluate(fn.fn, {
    bindings: mapZip(fn.args as ASTNode[], values),
    parent: frame,
  });

export const _evaluate = (node: ASTNode, frame: StackFrame) => {
  if (node.type === NodeType.INT) {
    return node.value;
  }

  if (node.type === NodeType.EXT) {
    if (node.name === "fn") {
      return handleFn(node);
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

export const emptyStackFrame: EmptyStackFrame = { bindings: {}, parent: null };

export const evaluate = <const Node extends ASTNode>(
  node: Node
): Evaluate<Node> => _evaluate(node, emptyStackFrame) as Evaluate<Node>;
