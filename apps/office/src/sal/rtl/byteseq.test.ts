/** @fileoverview Actual SAL byte-sequence owners share counts and initialized byte storage with genuine UNO Sequence values; empty COW source quirks remain unchanged. */
import { Any } from "../../cppu/inc/com/sun/star/uno/Any";
import native from "./byteseq.native.json";
import { expect, it } from "vitest";
import { ByteSequence, BYTESEQ_NODEFAULT, BYTESEQ_NOACQUIRE } from "../inc/rtl/byteseq";
import * as C from "./byteseq";
import { type sal_Sequence, salSequenceCountAddress } from "../inc/types";
import {
  Sequence,
  toUnoSequence,
  type SequenceElements,
} from "../../cppu/inc/com/sun/star/uno/Sequence";
import { g_emptySeq, emptySequenceCountAddress } from "../../cppu/source/uno/data";
import { sequenceCountAddress } from "../../cppu/source/uno/sequence";
/** Reads only initialized native bytes. @param owner - Actual owner. @returns Signed byte values. */
function values(owner: ByteSequence): number[] {
  const p = owner.getConstArray();
  return Array.from(
    { length: owner.getLength() },
    /** Native initialized byte read. @param _ - Unused. @param i - Offset. @returns Signed byte. */ (
      _,
      i,
    ) => (ArrayBuffer.isView(p) ? (p[i] as number) : (p.get(i) as [number])[0]),
  );
}
/** Writes an initialized byte lvalue after original getArray COW. @param owner - Actual owner. @param index - Offset. @param value - Signed byte. @returns Nothing. */
function put(owner: ByteSequence, index: number, value: number): void {
  const p = owner.getArray();
  if (ArrayBuffer.isView(p)) p[index] = value;
  else (p.get(index) as [number])[0] = value;
}
it("uses default static empty, independent no-default zero and initialized byte values", /** Original constructor overloads retain actual ownership and signed byte bits. @returns Nothing. */ () => {
  const empty = new ByteSequence(),
    other = new ByteSequence(),
    zero = new ByteSequence(0, BYTESEQ_NODEFAULT),
    zeros = new ByteSequence(3),
    bytes = new ByteSequence(new Uint8Array([0, 127, 128, 255]), 4),
    signed = new ByteSequence(new Int8Array([0, 127, -128, -1]), 4),
    arrayZero = new ByteSequence(null, 0);
  try {
    expect(empty.get()).toBe(other.get());
    expect(empty.get()).not.toBe(zero.get());
    expect(arrayZero.get()).not.toBe(empty.get());
    expect(values(zeros)).toEqual([0, 0, 0]);
    expect(values(bytes)).toEqual([0, 127, -128, -1]);
    expect(bytes.equals(signed)).toBe(true);
    expect(bytes.notEquals(zeros)).toBe(true);
    expect(empty.equals(zero)).toBe(true);
    expect(empty.get()).not.toBe(g_emptySeq);
  } finally {
    arrayZero.dispose();
    signed.dispose();
    bytes.dispose();
    zeros.dispose();
    zero.dispose();
    other.dispose();
    empty.dispose();
  }
});
it("copies C handles and detaches nonempty shared bytes without affecting retained owners", /** Real public C handles and pointer reads expose source reference counts. @returns Nothing. */ () => {
  const source = new ByteSequence(new Int8Array([1, 2, 3]), 3),
    copy = new ByteSequence(source),
    handle = new ByteSequence(source.get() as sal_Sequence),
    before = source.get() as sal_Sequence;
  expect(before.nRefCount).toBe(3);
  copy.assign(copy);
  expect(before.nRefCount).toBe(3);
  put(copy, 1, 9);
  expect(copy.get()).not.toBe(before);
  expect(before.nRefCount).toBe(2);
  expect(values(source)).toEqual([1, 2, 3]);
  expect(values(copy)).toEqual([1, 9, 3]);
  expect(copy.equals(source)).toBe(false);
  copy.assign(source);
  expect(copy.get()).toBe(before);
  expect(before.nRefCount).toBe(3);
  copy.dispose();
  handle.dispose();
  source.dispose();
});
it("preserves the original missing decrement when empty reference2One allocates a unique header", /** The old empty handle retains an extra reference as in the pinned C branch. @returns Nothing. */ () => {
  const first = new ByteSequence(),
    second = new ByteSequence(first),
    old = first.get() as sal_Sequence,
    count = old.nRefCount;
  first.getArray();
  expect(first.get()).not.toBe(old);
  expect(first.getLength()).toBe(0);
  expect(old.nRefCount).toBe(count);
  first.dispose();
  second.dispose();
  expect(old.nRefCount).toBe(count - 1);
});
it("retains original realloc shared zero-tail, unique initialized prefix and count-equal no-op", /** Uninitialized unique growth bytes are written before observation. @returns Nothing. */ () => {
  const first = new ByteSequence(new Int8Array([7, 8]), 2),
    second = new ByteSequence(first),
    old = first.get();
  first.realloc(2);
  expect(first.get()).toBe(old);
  first.realloc(4);
  expect(values(first)).toEqual([7, 8, 0, 0]);
  expect(values(second)).toEqual([7, 8]);
  first.realloc(1);
  expect(values(first)).toEqual([7]);
  first.realloc(3);
  put(first, 1, 5);
  put(first, 2, 6);
  expect(values(first)).toEqual([7, 5, 6]);
  const third = new ByteSequence(first);
  first.realloc(1);
  expect(values(first)).toEqual([7]);
  expect(values(third)).toEqual([7, 5, 6]);
  third.dispose();
  second.dispose();
  first.dispose();
});
it("uses native move transfer/null and no-acquire ownership without an extra reference", /** A moved-from nullable handle is destructible but not readable as a sequence. @returns Nothing. */ () => {
  const source = new ByteSequence(new Int8Array([4]), 1),
    handle = source.get() as sal_Sequence,
    moved = ByteSequence.move(source),
    target = new ByteSequence(1);
  expect(source.get()).toBeNull();
  expect(moved.get()).toBe(handle);
  expect(handle.nRefCount).toBe(1);
  target.moveAssign(moved);
  expect(moved.get()).toBeNull();
  expect(target.get()).toBe(handle);
  const slot: C.ByteSequenceSlot = [null];
  C.rtl_byte_sequence_construct(slot, 2);
  const adopted = new ByteSequence(slot[0], BYTESEQ_NOACQUIRE);
  expect((adopted.get() as sal_Sequence).nRefCount).toBe(1);
  adopted.dispose();
  target.dispose();
  moved.dispose();
  source.dispose();
});
it("shares real storage and one SAL count with toUnoSequence, retaining UNO COW", /** No rebuilt Sequence/default/type provider is used for the reinterpret-view copy. @returns Nothing. */ () => {
  const source = new ByteSequence(new Int8Array([3, -1]), 2),
    uno = toUnoSequence(source),
    handle = source.get() as sal_Sequence;
  expect(uno.get()).toBe(handle);
  expect(uno.getConstArray()).toBe(source.getConstArray());
  expect(sequenceCountAddress(handle)).toBe(salSequenceCountAddress(handle));
  expect(handle.nRefCount).toBe(2);
  ((uno.getArray() as SequenceElements).get(0) as [number])[0] = 9;
  expect(uno.get()).not.toBe(handle);
  expect(values(source)).toEqual([3, -1]);
  expect(handle.nRefCount).toBe(1);
  uno.dispose();
  source.dispose();
  const Bytes = Sequence.specialize<number>("sal_Int8", 1),
    empty = new Bytes(),
    borrow = new ByteSequence(empty.get() as sal_Sequence);
  expect(salSequenceCountAddress(g_emptySeq)).toBe(emptySequenceCountAddress());
  expect(sequenceCountAddress(g_emptySeq)).toBe(emptySequenceCountAddress());
  borrow.dispose();
  empty.dispose();
});
it("retains SAL C slot replacement and actual initialized address input", /** Covers source release/assign/construct and logical pointer copying with no allocator override. @returns Nothing. */ () => {
  const slot: C.ByteSequenceSlot = [null],
    source = new ByteSequence(new Int8Array([6, 7]), 2);
  C.rtl_byte_sequence_construct(slot, 0);
  C.rtl_byte_sequence_construct(slot, 1);
  C.rtl_byte_sequence_constructNoDefault(slot, 2);
  C.rtl_byte_sequence_constructFromArray(slot, source.getConstArray(), 2);
  const result = new ByteSequence(slot[0], BYTESEQ_NOACQUIRE);
  expect(values(result)).toEqual([6, 7]);
  expect(result.equals(source)).toBe(true);
  expect(result.equals(result)).toBe(true);
  const nil: C.ByteSequenceSlot = [null];
  C.rtl_byte_sequence_assign(nil, source.get() as sal_Sequence);
  C.rtl_byte_sequence_release(nil[0]);
  result.dispose();
  source.dispose();
  C.rtl_byte_sequence_release(null);
});

it("matches the compiled unchanged original SAL C/C++ ownership trace", /** Native bodies and their actual allocator/OSL primitive branch produce the committed initialized-domain witness. @returns Nothing. */ () => {
  const a = new ByteSequence(),
    b = new ByteSequence(),
    zero = new ByteSequence(0, BYTESEQ_NODEFAULT),
    old = a.get() as sal_Sequence,
    count = old.nRefCount;
  const emptyShared = Number(a.get() === b.get()),
    noDefaultZeroIndependent = Number(zero.get() !== a.get());
  a.getArray();
  const emptyCowOldCountDelta = old.nRefCount - count,
    x = new ByteSequence(new Int8Array([1, 2, -128, -1]), 4),
    y = new ByteSequence(x),
    copyShared = Number(x.get() === y.get());
  put(y, 1, 9);
  const cowDetached = Number(x.get() !== y.get()),
    grow = new ByteSequence(x);
  grow.realloc(6);
  const shrink = new ByteSequence(grow);
  shrink.realloc(2);
  shrink.realloc(3);
  put(shrink, 2, 7);
  const moved = ByteSequence.move(shrink),
    movedNull = Number(shrink.get() === null),
    assigned = new ByteSequence(1);
  assigned.moveAssign(moved);
  try {
    expect({
      emptyShared,
      noDefaultZeroIndependent,
      emptyCowOldCountDelta,
      copyShared,
      cowDetached,
      movedNull,
      moveAssignedNull: Number(moved.get() === null),
      source: values(x),
      detached: values(y),
      sharedGrowth: values(grow),
      initializedUniqueGrowth: values(assigned),
    }).toEqual(native.result);
  } finally {
    assigned.dispose();
    moved.dispose();
    shrink.dispose();
    grow.dispose();
    y.dispose();
    x.dispose();
    zero.dispose();
    b.dispose();
    a.dispose();
  }
});
it("keeps SAL and UNO count agreement after actual unique UNO reallocation", /** A genuine native reallocation producer writes the initialized header after SAL/UNO sharing ends. @returns Nothing. */ () => {
  const Bytes = Sequence.specialize<number>("sal_Int8", 1),
    uno = new Bytes(2),
    borrow = new ByteSequence(uno.get() as sal_Sequence);
  borrow.dispose();
  uno.realloc(3);
  expect(sequenceCountAddress(uno.get() as sal_Sequence)).toBe(
    salSequenceCountAddress(uno.get() as sal_Sequence),
  );
  expect((uno.get() as sal_Sequence).nRefCount).toBe(1);
  const copy = new ByteSequence(uno.get() as sal_Sequence);
  expect(values(copy)).toEqual([0, 0, 0]);
  copy.dispose();
  uno.dispose();
});

it("retains the same byte allocation through actual UNO Any transport", /** Property transport copies the genuine Sequence field address and releases each native owner once. @returns Nothing. */ () => {
  const source = new ByteSequence(new Int8Array([-128, 7]), 2),
    value = toUnoSequence(source),
    any = new Any(value.getAddress(), ["Sequence", "sal_Int8"]),
    Bytes = Sequence.specialize<number>("sal_Int8", 1),
    extracted = new Bytes();
  try {
    expect(any.extract(extracted.getAddress(), ["Sequence", "sal_Int8"])).toBe(true);
    expect(extracted.get()).toBe(source.get());
    expect(((extracted.getConstArray() as SequenceElements).get(0) as [number])[0]).toBe(-128);
  } finally {
    extracted.dispose();
    any.dispose();
    value.dispose();
    source.dispose();
  }
});
