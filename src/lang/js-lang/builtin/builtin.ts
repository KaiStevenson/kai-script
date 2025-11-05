type BUILTIN = (args: any[]) => any;

export const V_BUILTIN_Arr: BUILTIN = (args) => args;

// FIXME actually implement this properly
export const V_BUILTIN_ToString: BUILTIN = (args) =>
  args.length === 1 ? JSON.stringify(args[0]) : JSON.stringify(args);

export const V_BUILTIN_Add: BUILTIN = (args) => {
  if (args.every((arg) => ["string", "number"].includes(typeof arg))) {
    return args.reduce(
      (acc, cur) => acc + cur,
      typeof args[0] === "string" ? "" : 0
    );
  }

  throw new Error(`Cannot add operands ${JSON.stringify(args, undefined, 2)}`);
};

export const V_BUILTIN_Mul: BUILTIN = (args) => {
  if (args.every((arg) => typeof arg === "number") && args.length === 2) {
    return args.reduce((acc, cur) => acc * cur, 1);
  }

  throw new Error(
    `Can only multiply [number, number], but got ${JSON.stringify(
      args,
      undefined,
      2
    )}`
  );
};

export const V_BUILTIN_IfElse: BUILTIN = (args) => {
  if (args.length !== 3) {
    throw new Error(`Invalid args for "if": ${JSON.stringify(args)}`);
  }

  const [cond, trueVal, falseVal] = args;

  if (typeof cond !== "boolean") {
    throw new Error(`Condition value ${JSON.stringify(cond)} is not a boolean`);
  }

  return cond ? trueVal : falseVal;
};

export const nameToBUILTIN: Record<string, BUILTIN> = {
  arr: V_BUILTIN_Arr,
  tostring: V_BUILTIN_ToString,
  add: V_BUILTIN_Add,
  mul: V_BUILTIN_Mul,
  "?": V_BUILTIN_IfElse,
};
