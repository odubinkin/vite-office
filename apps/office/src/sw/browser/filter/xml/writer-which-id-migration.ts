/** @fileoverview Explicit v16 browser graph migration from obsolete Writer WhichIds to pinned native identities; native core and current records never carry aliases. */

/** Migrates the old browser record without mutating its caller-owned graph or binary font data. @param input - Untrusted graph. @returns Current graph or unchanged non-v16 input. */
export function upgradeWriterWhichIds(input: unknown): unknown {
  if (
    typeof input !== "object" ||
    input === null ||
    !("swModelVersion" in input) ||
    input.swModelVersion !== 16
  )
    return input;
  const copies = new Map<object, object>();
  const pending: [object, Record<string, unknown>][] = [];
  const copy =
    /** Copies one graph edge; queued traversal avoids a recursive stack and retains shared references. @param value - Input edge. @returns Independent edge. */ (
      value: unknown,
    ): unknown => {
      if (typeof value !== "object" || value === null) return value;
      if (copies.has(value)) return copies.get(value);
      if (value instanceof Uint8Array) {
        const result = value.slice();
        copies.set(value, result);
        return result;
      }
      const result = (Array.isArray(value) ? [] : {}) as Record<string, unknown>;
      copies.set(value, result);
      pending.push([value, result]);
      return result;
    };
  const result = copy(input) as Record<string, unknown>;
  while (pending.length) {
    const [source, target] = pending.pop() as [object, Record<string, unknown>];
    for (const [key, value] of Object.entries(source)) {
      // v16 has only native item identities under `which`, including cell borders.
      // Old paragraph IDs64..82 predate two text attributes; IDs83..160 also
      // predate the extra paragraph attribute before RES_PARATR_LIST_BEGIN.
      // The old registry additionally misidentified protection as127; its actual
      // native RES_PROTECT identity is110, independently of the range shift.
      const migrated =
        key === "which" &&
        typeof value === "number" &&
        Number.isInteger(value) &&
        value >= 64 &&
        value <= 160
          ? value === 127
            ? 110
            : value + (value < 83 ? 2 : 3)
          : copy(value);
      Object.defineProperty(target, key, {
        value: migrated,
        writable: true,
        enumerable: true,
        configurable: true,
      });
    }
  }
  result.swModelVersion = 17;
  return result;
}
