/** @fileoverview Genuine generated Pair<string,long> values, field addresses, Any/Sequence copies and implicit native copy/move contracts. */
import { afterEach, expect, it } from "vitest";
import { PairStringLong, cppu_detail_getUnoType_PairStringLong as pairType } from "./Pair";
import { Any } from "../../../../../cppu/inc/com/sun/star/uno/Any";
import { Sequence, type SequenceElements } from "../../../../../cppu/inc/com/sun/star/uno/Sequence";
import { own, u, releaseDomScope } from "../../../../../test/native-dom";
import { text } from "../../../../../i18nlangtag/source/isolang/isolang.tables";
const Pairs = Sequence.specialize<PairStringLong>(pairType, 16);
afterEach(releaseDomScope);
it("retains actual default/copy/field/equality semantics and signed32 storage", /** Native members and operands are observed without replacements. @returns Nothing. */ () => {
  const empty = own(new PairStringLong()),
    value = own(new PairStringLong(u("urn:字"), 65536)),
    copy = own(new PairStringLong(value)),
    other = own(new PairStringLong(u("different"), 65536));
  expect(empty.First.isEmpty()).toBe(true);
  expect(empty.Second).toBe(0);
  expect(copy.equals(value)).toBe(true);
  expect(copy.notEquals(value)).toBe(false);
  expect(copy.equals(other)).toBe(false);
  other.assign(value);
  other.Second = 7;
  expect(copy.notEquals(other)).toBe(true);
  empty.assign(value);
  expect(empty.equals(value)).toBe(true);
  empty.Second = 0xffffffff;
  expect(empty.Second).toBe(-1);
  expect(empty.get(8)).toEqual([-1]);
  expect(empty.get(0)).toBe(empty.First.getDataAddress());
});
it("moves the actual string but retains the source scalar", /** Original compiler-generated memberwise moves are represented explicitly. @returns Nothing. */ () => {
  const source = own(new PairStringLong(u("move"), 42)),
    moved = own(PairStringLong.move(source));
  expect(source.First.isEmpty()).toBe(true);
  expect(source.Second).toBe(42);
  expect(text(moved.First)).toBe("move");
  expect(moved.Second).toBe(42);
  const destination = own(new PairStringLong(u("old"), 1));
  destination.moveAssign(moved);
  expect(text(destination.First)).toBe("move");
  expect(destination.Second).toBe(42);
  expect(text(moved.First)).toBe("old");
  expect(moved.Second).toBe(42);
});
it("copies real native Any/Sequence fields and keeps borrowed aggregate views live", /** Shared CPPU copies the actual native declared fields. @returns Nothing. */ () => {
  const original = own(new PairStringLong(u("urn:native"), 0x30000)),
    any = own(new Any(original, pairType)),
    extracted = own(new PairStringLong());
  original.First = u("changed");
  original.Second = 1;
  expect(Any.prototype.extract.call(any, extracted, pairType)).toBe(true);
  expect(text(extracted.First)).toBe("urn:native");
  expect(extracted.Second).toBe(0x30000);
  const values = own(
      new Pairs(
        { /** Actual initializer-list address. @returns Pair fields. */ get: () => extracted },
        1,
      ),
    ),
    fields = (values.getArray() as SequenceElements).get(0) as ReadonlyMap<number, unknown>,
    view = PairStringLong.unacquired(fields);
  expect(PairStringLong.unacquired(fields)).toBe(view);
  expect(text(view.First)).toBe("urn:native");
  expect(view.Second).toBe(0x30000);
  (fields.get(8) as [number])[0] = -7;
  expect(view.Second).toBe(-7);
  const retained = own(new PairStringLong(view));
  values.realloc(0);
  expect(text(retained.First)).toBe("urn:native");
  expect(retained.Second).toBe(-7);
  expect(pairType()).toBe(pairType());
});
