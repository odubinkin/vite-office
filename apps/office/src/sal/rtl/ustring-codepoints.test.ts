/** @fileoverview Original rtl_OUString2.cxx createFromCodePoints test and consumed mixed Unicode/ASCII comparison specialization over actual SAL owners. */
import { afterEach, expect, it } from "vitest";
import { OUString } from "../inc/rtl/ustring";
import {
  rtl_uString_newFromCodePoints,
  rtl_uString_release,
  type rtl_uStringSlot,
} from "../inc/rtl/ustring.h";
import { own, u, releaseDomScope } from "../../test/native-dom";
afterEach(releaseDomScope);
it("ports every rtl_OUString::createFromCodePoints::test assertion", /** Original pinned sal/qa/rtl/oustring/rtl_OUString2.cxx inputs and expected seven code units. @returns Nothing. */ () => {
  const empty: rtl_uStringSlot = [null];
  rtl_uString_newFromCodePoints(empty, null, 0);
  expect(empty[0]?.length).toBe(0);
  if (empty[0] !== null) rtl_uString_release(empty[0]);
  const value = own(new OUString(new Uint32Array([0, 0xd800, 0xffff, 0x10000, 0x10ffff]), 5));
  expect(value.getLength()).toBe(7);
  expect(Array.from(value.getStr().subarray(0, 7))).toEqual([
    0, 0xd800, 0xffff, 0xd800, 0xdc00, 0xdbff, 0xdfff,
  ]);
});
it("replaces a real C pointer slot and preserves shared native input copies", /** Source release-before-allocation/empty rules execute without a fake allocator. @returns Nothing. */ () => {
  const old = u("old"),
    copy = own(new OUString(old)),
    actual = own(new OUString(old)),
    slot = actual.getDataAddress();
  rtl_uString_newFromCodePoints(slot, new Uint32Array([0x41, 0x1f600]), 2);
  expect(slot[0]?.length).toBe(3);
  expect(Array.from(slot[0]?.buffer.subarray(0, 3) ?? [])).toEqual([65, 0xd83d, 0xde00]);
  expect(copy.getLength()).toBe(3);
  rtl_uString_newFromCodePoints(slot, null, 0);
  expect(slot[0]?.length).toBe(0);
});
it.each([
  ["", "", 0],
  ["a", "", 1],
  ["", "a", -1],
  ["a", "a", 0],
  ["ab", "a", 1],
  ["a", "ab", -1],
  ["b", "a", 1],
  ["a", "c", -2],
  ["a\0b", "a", 1],
])(
  "retains source mixed comparison %s / %s",
  /** Actual native comparator does not convert to host strings or erase counted embedded zero. @param left - Native Unicode input. @param right - Terminated ASCII input. @param expected - Exact source result. @returns Nothing. */ (
    left,
    right,
    expected,
  ) => {
    const ascii = Uint8Array.from(
      right + "\0",
      /** Known ASCII fixture unit. @param unit - Input unit. @returns Byte. */ (unit) =>
        unit.charCodeAt(0),
    );
    expect(u(left).compareToAscii(ascii)).toBe(expected);
  },
);
