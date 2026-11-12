/** @fileoverview Original const OUStringLiteral assignment and the relevant constructor/assignment assertions from StringLiterals::checkOUStringLiteral; full unrelated literal overload QA remains pending. */
import { expect, it } from "vitest";
import { OUString, OUStringLiteral } from "./ustring";
it("ports checkOUStringLiteral constructor and assignment assertions", /** Native source literals remain const lvalues with static storage. @returns Nothing. */ () => {
  const s1lit = new OUStringLiteral(Uint16Array.of(97, 98, 99, 0)),
    de = new OUStringLiteral(Uint16Array.of(100, 101, 0)),
    s1 = new OUString(s1lit),
    abc = new OUString(Uint16Array.of(97, 98, 99), 3),
    expected = new OUString(Uint16Array.of(100, 101), 2);
  try {
    expect(s1.equals(abc)).toBe(true);
    s1.assign(de);
    expect(s1.equals(expected)).toBe(true);
    expect(s1.pData).toBe(de.str);
    expect(de.str.refCount).toBe(0x40000000);
    s1.assign(de);
    expect(s1.pData).toBe(de.str);
  } finally {
    expected.dispose();
    abc.dispose();
    s1.dispose();
  }
  expect(de.str.refCount).toBe(0x40000000);
});
it("releases the prior live owned string and adopts the exact static pointer", /** A second real owner keeps the old data alive for valid refcount observation. @returns Nothing. */ () => {
  const value = new OUString(Uint16Array.of(111, 108, 100), 3),
    retained = new OUString(value),
    literal = new OUStringLiteral(Uint16Array.of(103, 101, 116, 0));
  try {
    expect(retained.pData?.refCount).toBe(2);
    value.assign(literal);
    expect(retained.pData?.refCount).toBe(1);
    expect(value.pData).toBe(literal.str);
    expect(Array.from(retained.getStr().subarray(0, retained.getLength()))).toEqual([
      111, 108, 100,
    ]);
    value.assign(retained);
    expect(value.pData).toBe(retained.pData);
    expect(retained.pData?.refCount).toBe(2);
  } finally {
    retained.dispose();
    value.dispose();
  }
});
