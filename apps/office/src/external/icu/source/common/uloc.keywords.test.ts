/** @fileoverview Original legacy keyword normalization and sorting retain deferred outputs, native name limits and first-duplicate semantics. */
import { expect, it } from "vitest";
import { ulocimp_getKeywords } from "./uloc.keywords";
import { uprv_sortArray } from "./uarrsort";
/** Observes the exact append boundary. @param text - Raw view after separator. @param values - Includes values. @param incoming - Sticky status. @param prev - Original delimiter. @returns Output and status. */
function parse(text: string, values = true, incoming = 0, prev = "@") {
  let output = "seed";
  const status: [number] = [incoming];
  ulocimp_getKeywords(
    text,
    prev,
    {
      /** Preserves existing sink contents. @param value - Span. @returns Nothing. */ Append(
        value,
      ) {
        output += value;
      },
    },
    values,
    status,
  );
  return { output, status: status[0] };
}
it("normalizes spaces and key casing, sorts, and retains first duplicate", /** Preserves source ordering and value case. @returns Nothing. */ () => {
  expect(parse("z=VaL; A a=first ;aa=second")).toEqual({ output: "seedaa=first;z=VaL", status: 0 });
  expect(parse("z=VaL; A a=first ;aa=second", false).output).toBe("seedaa\0z\0");
  expect(parse("a@=punctuation").output).toBe("seeda@=punctuation");
});
it("defers output on errors and retains source-specific error codes", /** This internal routine differs from the public keyword-value validator. @returns Nothing. */ () => {
  expect(parse("a=v;b")).toEqual({ output: "seed", status: 3 });
  expect(parse("a=v; b= ")).toEqual({ output: "seed", status: 3 });
  expect(parse("a".repeat(25) + "=v")).toEqual({ output: "seed", status: 5 });
  expect(parse("a".repeat(24) + "=v").status).toBe(0);
  expect(parse("a=v; ")).toEqual({ output: "seeda=v", status: 0 });
});
it("checks capacity before ignoring an additional duplicate", /** Preserves the exact source count check. @returns Nothing. */ () => {
  const text = Array.from(
    { length: 25 },
    /** Builds distinct keys. @param _unused - Slot. @param i - Index. @returns Pair. */ (
      _unused,
      i,
    ) => `k${i}=v`,
  ).join(";");
  expect(parse(text).status).toBe(0);
  expect(parse(text + ";k0=duplicate")).toEqual({ output: "seed", status: 5 });
  expect(parse(text + "; ").status).toBe(0);
});
it("compares NUL-terminated names while appending the counted key span", /** Retains original strcmp versus keywordLen distinction. @returns Nothing. */ () => {
  expect(parse("a\0x=first;a\0y=second")).toEqual({ output: "seeda\0x=first", status: 0 });
  expect(parse("a=b", true, 1)).toEqual({ output: "seed", status: 1 });
  expect(parse("a=b", true, -128)).toEqual({ output: "seeda=b", status: -128 });
  expect(parse("a=b", true, 0, "_")).toEqual({ output: "seed", status: 0 });
});
it("preserves stable order and original unstable equal-key permutation", /** Exercises both actual source sort branches around the quicksort threshold. @returns Nothing. */ () => {
  for (const stable of [true, false]) {
    const items = Array.from(
        { length: 10 },
        /** Creates immutable equal-key records. @param _unused - Slot. @param id - Source identity. @returns Item. */ (
          _unused,
          id,
        ) => ({ key: 0, id }),
      ),
      status: [number] = [0];
    uprv_sortArray(
      items,
      10,
      8,
      /** Original equal-key comparator. @param a - Left. @param b - Right. @returns Equality. */ (
        a,
        b,
      ) => a.key - b.key,
      stable,
      status,
    );
    expect(
      items.map(
        /** Reads source identity. @param value - Item. @returns Identity. */ (value) => value.id,
      ),
    ).toEqual(stable ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] : [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]);
  }
  const status: [number] = [0];
  uprv_sortArray(
    null,
    1,
    8,
    /** Comparator is never reached for null input. @param a - Left. @param b - Right. @returns Difference. */ (
      a: number,
      b: number,
    ) => a - b,
    false,
    status,
  );
  expect(status[0]).toBe(1);
});
