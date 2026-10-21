/** @fileoverview Source-derived Partial include/exclude grammar, constructor ordering and preserved native root/prefix contracts. */
import { expect, it } from "vitest";
import { RuntimeException } from "../../cppu/inc/com/sun/star/uno/RuntimeException";
import { OUString } from "../../sal/inc/rtl/ustring";
import { Partial } from "./partial";
/** Constructs an actual UTF16 path. @param value - Exact path. @returns Native value. */
function u(value: string): OUString {
  const units = new Uint16Array(value.length);
  for (let i = 0; i < value.length; i++) units[i] = value.charCodeAt(i);
  return new OUString(units, units.length);
}
/** Copies original path sequence values. @param values - Exact values. @returns Native values. */
function paths(values: readonly string[]): OUString[] {
  return values.map(
    /** Constructs each actual value. @param value - Exact text. @returns String. */ (value) =>
      u(value),
  );
}
/** Reads the original UNO exception Message rather than inventing an Error.message field. @param run - Public parser call. @param diagnostic - Original message fragment. @returns Nothing. */
function rejects(run: () => unknown, diagnostic: string): void {
  let caught: unknown;
  try {
    run();
  } catch (error) {
    caught = error;
  }
  expect(caught).toBeInstanceOf(RuntimeException);
  const message = (caught as RuntimeException).Message;
  let out = "";
  for (let i = 0; i < message.getLength(); i++)
    out += String.fromCharCode(message.getStr()[i] as number);
  expect(out).toContain(diagnostic);
}
it.each([
  [[], [], [], 0],
  [[], [], ["x"], 0],
  [["/a"], [], [], 1],
  [["/a"], [], ["a"], 2],
  [["/a"], [], ["a", "b"], 2],
  [["/a"], [], ["b"], 0],
  [["/a/b"], [], ["a"], 1],
  [["/a/b"], [], ["a", "b"], 2],
  [["/a/b"], [], ["a", "c"], 0],
  [["/a"], ["/a"], ["a"], 0],
  [["/a"], ["/a/b"], ["a", "b"], 0],
  [["/a"], ["/a/b"], ["a", "c"], 2],
  [["/a", "/a/b"], [], ["a", "b"], 2],
  [["/a/b", "/a"], [], ["a"], 2],
  [["/"], [], [], 1],
  [["/"], [], ["x"], 2],
  [["/"], ["/"], ["x"], 2],
  [["/a"], ["/a/b/c"], ["a", "b", "c"], 2],
  [["/a/T['x&amp;y']"], [], ["a", "T['x&amp;y']"], 2],
  [["/a/T['x']"], [], ["a", "x"], 0],
  [["/a", "/a/[bad"], [], ["a"], 2],
  [["/a"], ["/unknown/[bad"], ["a"], 2],
  [["/a/b", "/a/c"], ["/a/b"], ["a", "c"], 2],
])(
  "retains native path-tree case %#",
  /** Checks independently specified native containment. @param included - Include sequence. @param excluded - Exclude sequence. @param query - Actual node path. @param expected - Original identity. @returns Nothing. */ (
    included,
    excluded,
    query,
    expected,
  ) => {
    const partial = new Partial(paths(included as string[]), paths(excluded as string[]));
    expect(partial.contains(paths(query as string[]))).toBe(expected);
  },
);
it.each(["", "a", "//a[", "/a[", '/a["x"', '/a["&bad;"]', "/a/b["])(
  "rejects native malformed path %s",
  /** Uses the public initialized constructor. @param value - Invalid path. @returns Nothing. */ (
    value,
  ) => {
    rejects(
      /** Builds the original include tree. @returns Filter if accepted. */ () =>
        new Partial([u(value)], []),
      "bad path",
    );
  },
);
it("retains excluded leaf clearing and include collapse ordering", /** Repeated excluded paths operate on stable real tree nodes. @returns Nothing. */ () => {
  const partial = new Partial(paths(["/a/b", "/a/c"]), paths(["/a/b", "/a/b"]));
  expect(partial.contains(paths(["a", "b"]))).toBe(Partial.CONTAINS_NOT);
  expect(partial.contains(paths(["a"]))).toBe(Partial.CONTAINS_SUBNODES);
});
