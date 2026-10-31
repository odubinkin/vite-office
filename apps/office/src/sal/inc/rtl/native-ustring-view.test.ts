/** @fileoverview Original OUString replaceAt counted-view overload over the actual existing SAL replacement C boundary. */
import { expect, it } from "vitest";
import { OUString } from "./ustring";

it("retains every counted replacement unit including embedded NUL and unpaired surrogates", /** No null-terminated conversion or owned temporary replaces the original std::u16string_view overload. @returns Nothing. */ () => {
  const original = new OUString(Uint16Array.of(65, 66, 67, 68), 4),
    replacement = Uint16Array.of(0, 0xd800, 90),
    result = original.replaceAt(1, 2, replacement);
  try {
    expect(Array.from(result.subView(0))).toEqual([65, 0, 0xd800, 90, 68]);
    expect(Array.from(original.subView(0))).toEqual([65, 66, 67, 68]);
    replacement[1] = 88;
    expect(Array.from(result.subView(0))).toEqual([65, 0, 0xd800, 90, 68]);
  } finally {
    result.dispose();
    original.dispose();
  }
});

it("uses actual borrowed source storage safely and preserves the owned-string overload", /** An aliasing view is evaluated by the original C function before replacing any value owner. @returns Nothing. */ () => {
  const original = new OUString(Uint16Array.of(65, 66, 67), 3),
    suffix = original.subView(1, 2),
    result = original.replaceAt(0, 1, suffix),
    owned = new OUString(Uint16Array.of(0, 90), 2),
    fromOwned = original.replaceAt(1, 1, owned);
  try {
    expect(Array.from(result.subView(0))).toEqual([66, 67, 66, 67]);
    expect(Array.from(fromOwned.subView(0))).toEqual([65, 0, 90, 67]);
    original.clear();
    expect(Array.from(result.subView(0))).toEqual([66, 67, 66, 67]);
    expect(Array.from(fromOwned.subView(0))).toEqual([65, 0, 90, 67]);
  } finally {
    result.dispose();
    fromOwned.dispose();
    owned.dispose();
    original.dispose();
  }
});
