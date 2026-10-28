/** @fileoverview Original variadic Sequence concatenation over actual CPPU element data/lifetime owners. */
import { expect, it } from "vitest";
import { concatSequences } from "./sequence";
import { Sequence, type SequenceElements } from "../../cppu/inc/com/sun/star/uno/Sequence";
import { OUString } from "../../sal/inc/rtl/ustring";
import { rtl_uString_assign, type rtl_uStringSlot } from "../../sal/inc/rtl/ustring.h";
it("allocates summed length and copies first and variadic operands in order, including empty operands", /** Actual initialized LONG cells share the native Sequence mechanism. @returns Nothing. */ () => {
  const Data = Sequence.specialize<number>("sal_Int32", 4),
    a = new Data(2),
    b = new Data(),
    c = new Data(1);
  const ap = a.getArray() as SequenceElements;
  (ap.get(0) as [number])[0] = 1;
  (ap.get(4) as [number])[0] = 2;
  ((c.getArray() as SequenceElements).get(0) as [number])[0] = 3;
  const result = concatSequences(Data, a, b, c),
    empty = concatSequences(Data, b, b);
  try {
    expect(result.getLength()).toBe(3);
    expect(result.get()).not.toBe(a.get());
    const p = result.getConstArray() as SequenceElements;
    expect(
      [0, 4, 8].map(
        /** Read initialized output scalar. @param i - Byte offset. @returns Value. */ (i) =>
          (p.get(i) as [number])[0],
      ),
    ).toEqual([1, 2, 3]);
    expect(empty.getLength()).toBe(0);
  } finally {
    empty.dispose();
    result.dispose();
    c.dispose();
    b.dispose();
    a.dispose();
  }
});
it("retains actual OUString field ownership across element copy assignment and destruction", /** String copy callbacks use the shared SAL owners, without callback/factory substitution. @returns Nothing. */ () => {
  const Strings = Sequence.specialize<OUString>("OUString", 8),
    a = new OUString(Uint16Array.of(65), 1),
    b = new OUString(Uint16Array.of(66), 1),
    first = new Strings(1),
    second = new Strings(1);
  rtl_uString_assign((first.getArray() as SequenceElements).get(0) as rtl_uStringSlot, a.pData);
  rtl_uString_assign((second.getArray() as SequenceElements).get(0) as rtl_uStringSlot, b.pData);
  const result = concatSequences(Strings, first, second);
  try {
    const p = result.getConstArray() as SequenceElements;
    expect((p.get(0) as rtl_uStringSlot)[0]).toBe(a.pData);
    expect((p.get(8) as rtl_uStringSlot)[0]).toBe(b.pData);
    expect(a.pData.refCount).toBe(3);
    expect(b.pData.refCount).toBe(3);
  } finally {
    result.dispose();
    second.dispose();
    first.dispose();
    expect(a.pData.refCount).toBe(1);
    expect(b.pData.refCount).toBe(1);
    b.dispose();
    a.dispose();
  }
});
