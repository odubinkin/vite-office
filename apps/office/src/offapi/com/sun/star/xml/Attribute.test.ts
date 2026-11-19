/** @fileoverview Genuine generated SAX attribute owners, native Any/sequence copies and live borrowed scalar contracts. */
import { afterEach, expect, it } from "vitest";
import { Attribute, cppu_detail_getUnoType_Attribute } from "./Attribute";
import { FastAttribute, cppu_detail_getUnoType_FastAttribute } from "./FastAttribute";
import { Any } from "../../../../../cppu/inc/com/sun/star/uno/Any";
import { Sequence } from "../../../../../cppu/inc/com/sun/star/uno/Sequence";
import { OUString } from "../../../../../sal/inc/rtl/ustring";
import { own, u, read, releaseDomScope } from "../../../../../test/native-dom";
afterEach(releaseDomScope);

it("copies complete ordinary attributes through native compound storage and moves owned strings", /** Checks the original field order and generated operations. @returns Nothing. */ () => {
  const source = own(new Attribute(u("name"), u("urn:test"), u("value"))),
    any = own(new Any(source, cppu_detail_getUnoType_Attribute)),
    result = own(new Attribute());
  expect(any.extract(result, cppu_detail_getUnoType_Attribute)).toBe(true);
  expect(result.equals(source)).toBe(true);
  const moved = own(Attribute.move(source));
  expect(moved.equals(result)).toBe(true);
  expect(source.Name.isEmpty()).toBe(true);
  expect(source.NamespaceURL.isEmpty()).toBe(true);
  expect(source.Value.isEmpty()).toBe(true);
  source.moveAssign(moved);
  expect(source.equals(result)).toBe(true);
  const copy = own(new Attribute(source));
  copy.Value = u("changed");
  expect(copy.notEquals(source)).toBe(true);
  expect(read(new OUString(source.Value))).toBe("value");
});

it("keeps borrowed fast tokens live and retains source scalar values when moving", /** Checks actual sequence addresses rather than fabricated aggregate records. @returns Nothing. */ () => {
  const source = own(new FastAttribute(-2147483648, u("fast"))),
    seq = own(
      new (Sequence.specialize<FastAttribute>(cppu_detail_getUnoType_FastAttribute, 16))(
        {
          /** Supplies the real source aggregate. @returns Native address. */ get() {
            return source;
          },
        },
        1,
      ),
    ),
    address = seq.operatorIndex(0) as unknown as Parameters<typeof FastAttribute.unacquired>[0],
    borrowed = FastAttribute.unacquired(address);
  expect(borrowed.Token).toBe(-2147483648);
  (address.get(0) as [number])[0] = 42;
  expect(borrowed.Token).toBe(42);
  expect(FastAttribute.unacquired(address)).toBe(borrowed);
  expect(read(new OUString(borrowed.Value))).toBe("fast");
  const moved = own(FastAttribute.move(source));
  expect(source.Token).toBe(-2147483648);
  expect(source.Value.isEmpty()).toBe(true);
  expect(moved.Token).toBe(-2147483648);
  source.moveAssign(moved);
  expect(source.equals(moved)).toBe(false);
  const any = own(new Any(source, cppu_detail_getUnoType_FastAttribute)),
    copy = own(new FastAttribute());
  expect(any.extract(copy, cppu_detail_getUnoType_FastAttribute)).toBe(true);
  expect(copy.equals(source)).toBe(true);
});
