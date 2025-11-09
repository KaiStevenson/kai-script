type BUILTIN = (args: any[]) => any;

export const V_BUILTIN_Arr: BUILTIN = (args) => args;

const toStringInner = (o: any): string => {
  if (Array.isArray(o)) {
    return `[${o.map(toStringInner).join(", ")}]`;
  }

  return o.toString();
};

export const V_BUILTIN_ToString: BUILTIN = (args) => {
  return args.length === 1 ? toStringInner(args[0]) : toStringInner(args);
};

export const V_BUILTIN_Add: BUILTIN = (args) => {
  if (args.every((arg) => ["string", "number"].includes(typeof arg))) {
    return args.reduce(
      (acc, cur) => acc + cur,
      typeof args[0] === "string" ? "" : 0
    );
  }

  throw new Error(`Cannot add operands ${JSON.stringify(args, undefined, 2)}`);
};

export const V_BUILTIN_Sub: BUILTIN = (args) => {
  if (args.length !== 2) {
    throw new Error(
      `Can only sub [number, number], but got ${JSON.stringify(args)}`
    );
  }

  if (isNaN(args[0]) || isNaN(args[1])) {
    throw new Error(
      `Can only sub [number, number], but got ${JSON.stringify(args)}`
    );
  }

  return args[0] - args[1];
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

export const V_BUILTIN_Eq: BUILTIN = (args) => {
  const firstLast = {};
  let last = firstLast;

  for (const arg of args) {
    if (!["number", "string", "boolean"].includes(typeof arg)) {
      throw new Error(
        `Can only check equality of numbers or string or boolean, but got ${JSON.stringify(
          args
        )}`
      );
    }

    if (last === firstLast) {
      last = arg;
      continue;
    }

    if (arg === last) {
      last = arg;
      continue;
    }

    return false;
  }

  return true;
};

export const nameToBUILTIN: Record<string, BUILTIN> = {
  arr: V_BUILTIN_Arr,
  tostring: V_BUILTIN_ToString,
  add: V_BUILTIN_Add,
  sub: V_BUILTIN_Sub,
  mul: V_BUILTIN_Mul,
  eq: V_BUILTIN_Eq,
};
