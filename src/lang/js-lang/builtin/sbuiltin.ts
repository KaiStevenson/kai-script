import { callFn, getEvaluatedChildren } from "../core/eval";
import { ASTNode, FnPrim, StackFrame } from "../../ts-lang";

type SBUILTIN = (node: ASTNode, frame: StackFrame) => any;

export const V_SBUITLIN_Call: SBUILTIN = (node, frame) => {
  const children = getEvaluatedChildren(node, frame);
  const fn = children[0] as FnPrim | undefined;

  if (!fn?.fn) {
    throw new Error(
      `Invalid params for function call: ${JSON.stringify(
        children,
        undefined,
        2
      )}`
    );
  }

  return callFn(fn, children.slice(1), frame);
};

export const V_SBUILTIN_Map: SBUILTIN = (node, frame) => {
  const children = getEvaluatedChildren(node, frame);
  const fn = children[1] as FnPrim | undefined;

  if (!fn?.fn) {
    throw new Error(
      `Invalid params for map: ${JSON.stringify(children, undefined, 2)}`
    );
  }

  const values = children[0];

  if (!Array.isArray(values)) {
    // add to ts
    throw new Error(`Can't map non-array value: ${values}`);
  }

  return values.map((v, i) => callFn(fn, [v, i], frame));
};

export const nameToSBUILTIN: Record<string, SBUILTIN> = {
  call: V_SBUITLIN_Call,
  map: V_SBUILTIN_Map,
};
