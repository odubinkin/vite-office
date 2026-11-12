/** @fileoverview Actual Content property-read defaults and native Date/Any sequence element ownership; positive row/provider execution remains pending a genuine service graph. */
import { afterEach, expect, it } from "vitest";
import { Content } from "../../inc/content";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { reservedDataAddress } from "../../../cppu/source/uno/copy";
import type { rtl_uStringSlot } from "../../../sal/inc/rtl/ustring.h";
import {
  Date,
  cppu_detail_getUnoType_Date as dateType,
} from "../../../offapi/com/sun/star/util/Date";
import { own, u, releaseDomScope } from "../../../test/native-dom";
afterEach(releaseDomScope);
it("preserves empty-row results, one Any per requested property and singleton copy lifetime", /** Default Content has no processor and returns native void values. @returns Nothing. */ () => {
  const content = own(new Content()),
    first = u("IsDocument"),
    second = u("Title Ω\0尾"),
    names = own(
      new (Sequence.specialize<rtl_uStringSlot>("OUString", 8))(
        {
          /** Actual source initializer-array field addresses. @param offset - Logical byte offset. @returns Existing string pointer field. */
          get(offset: number): rtl_uStringSlot {
            return offset === 0 ? first.getDataAddress() : second.getDataAddress();
          },
        },
        2,
      ),
    );
  const counts = [first.pData?.refCount, second.pData?.refCount];
  expect(own(content.getPropertyValuesInterface(names)).is()).toBe(false);
  const values = own(content.getPropertyValues(names));
  expect(values.getLength()).toBe(2);
  for (let i = 0; i < 2; ++i) expect(own(new Any(values.operatorIndex(i))).hasValue()).toBe(false);
  expect(own(content.getPropertyValue(second)).hasValue()).toBe(false);
  expect([first.pData?.refCount, second.pData?.refCount]).toEqual(counts);
  const emptyNames = own(new (Sequence.specialize<rtl_uStringSlot>("OUString", 8))());
  expect(own(content.getPropertyValues(emptyNames)).getLength()).toBe(0);
});
it("moves actual inline Any values into a native sequence element and repairs both reserved addresses", /** Qualified native method binding uses the existing allocation, not a new class/value provider. @returns Nothing. */ () => {
  const values = own(new (Sequence.specialize<Any>("Any", 24))(1)),
    destination = values.operatorIndex(0),
    result = own(new Any(true)),
    replacement = own(new Any(false));
  Any.prototype.moveAssign.call(destination, result);
  expect(destination.pData).toBe(reservedDataAddress(destination));
  expect(result.hasValue()).toBe(false);
  const output: [boolean] = [false];
  expect(Any.prototype.extract.call(destination, output, "bool")).toBe(true);
  expect(output[0]).toBe(true);
  Any.prototype.moveAssign.call(destination, replacement);
  expect(destination.pData).toBe(reservedDataAddress(destination));
  expect(replacement.pData).toBe(reservedDataAddress(replacement));
  expect(replacement.extract(output, "bool")).toBe(true);
  expect(output[0]).toBe(true);
  expect(Any.prototype.extract.call(destination, output, "bool")).toBe(true);
  expect(output[0]).toBe(false);
  const copy = own(new Any(destination));
  expect(copy.extract(output, "bool")).toBe(true);
  expect(output[0]).toBe(false);
});
it("retains Date defaults, declared field types and normal compound Any transport", /** Signed Year remains distinct from unsigned Day/Month, without calendar normalization. @returns Nothing. */ () => {
  const empty = new Date(),
    source = new Date(31, 12, -1),
    copy = new Date(source),
    envelope = own(new Any(source, dateType));
  expect([empty.Day, empty.Month, empty.Year]).toEqual([0, 0, 0]);
  expect(copy.equals(source)).toBe(true);
  expect(copy.notEquals(source)).toBe(false);
  source.Day = 1;
  source.Month = 2;
  source.Year = 2026;
  expect([source.Day, source.Month, source.Year]).toEqual([1, 2, 2026]);
  expect(envelope.extract(empty, dateType)).toBe(true);
  expect([empty.Day, empty.Month, empty.Year]).toEqual([31, 12, -1]);
  expect(source.notEquals(empty)).toBe(true);
  empty.assign(copy).assign(empty);
  expect(empty.equals(copy)).toBe(true);
  expect(dateType()).toBe(dateType());
});
