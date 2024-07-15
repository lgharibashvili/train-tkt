import { inspect } from "node:util";

export function log<TFirst>(...args: [TFirst, ...unknown[]]) {
  console.log(
    ...args.map((arg) =>
      typeof arg === "object" ? inspect(arg, false, null, true) : arg,
    ),
  );
  return args[0];
}
