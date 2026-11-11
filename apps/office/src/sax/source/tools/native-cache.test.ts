/** @fileoverview Native CachedOutputStream sequence aliasing, failed-write state, shared mark lifetime and actual UNOMemoryStream output integration. */
import { expect, it } from "vitest";
import { CachedOutputStream, ForMergeBase } from "./CachedOutputStream";
import { ByteSequence } from "../../../sal/inc/rtl/byteseq";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { XOutputStream } from "../../../udkapi/com/sun/star/io/XOutputStream";
import { UNOMemoryStream } from "../../../comphelper/source/streaming/memorystream";
const Bytes = Sequence.specialize<number>("sal_Int8", 1);
/** Assertion-only read of initialized native bytes. @param value - Native input sequence. @returns Scalar copy. */
function values(value: Sequence<number>): number[] {
  const result: number[] = [],
    data = value.getConstArray() as SequenceElements;
  for (let i = 0; i < value.getLength(); ++i) result.push((data.get(i) as [number])[0]);
  return result;
}
/** Complete caller-selected output component retains real UNO sequence copies; original WeakImplHelper supplies genuine interface/type/lifetime behavior. */
class RetainingOutput extends WeakImplHelper.specialize(XOutputStream) implements XOutputStream {
  readonly writes: Sequence<number>[] = [];
  fail = false;
  /** Retains native values, without copying their underlying allocation. @param data - Borrowed native value. @returns Nothing. */
  writeBytes(data: Sequence<number>): void {
    if (this.fail) throw new Error("write failure");
    this.writes.push(new Bytes(data));
  }
  /** Caller-selected no-op flush. @returns Nothing. */
  flush(): void {}
  /** Caller-selected no-op close; no subsequent writes are requested. @returns Nothing. */
  closeOutput(): void {}
  /** Destroys every real retained Sequence exactly once. @returns Nothing. */
  protected override destroy(): void {
    for (const value of this.writes) value.dispose();
    super.destroy();
  }
}
it("preserves native reused-buffer content and length aliasing rather than silently applying COW", /** Source WRITER137/CALC-303 remains an upstream suspicion, with this actual SAL/UNO value witness. @returns Nothing. */ () => {
  const output = new RetainingOutput(),
    owner = new Reference(output),
    cache = new CachedOutputStream();
  try {
    cache.setOutputStream(output);
    cache.writeBytes(Uint8Array.of(65, 255), 2);
    cache.flush();
    const first = output.writes[0] as Sequence<number>,
      handle = first.getAddress()[0];
    expect(values(first)).toEqual([65, -1]);
    cache.writeBytes(Uint8Array.of(66), 1);
    expect(values(first)).toEqual([66, -1]);
    cache.flush();
    expect(first.getLength()).toBe(1);
    expect(values(first)).toEqual([66]);
    expect((output.writes[1] as Sequence<number>).getAddress()[0]).toBe(handle);
    cache.writeBytes(Uint8Array.of(67), 1);
    output.fail = true;
    expect(
      /** Failed flush retains the written-size cursor. @returns Nothing. */ () => cache.flush(),
    ).toThrow("write failure");
    output.fail = false;
    cache.flush();
    expect(values(output.writes[2] as Sequence<number>)).toEqual([67]);
    cache.flush();
    expect(first.getLength()).toBe(0);
  } finally {
    cache.dispose();
    owner.dispose();
  }
});
it("writes actual native signed-byte sequences into the package cache component", /** The caller retains the genuine output component while the remaining package transport binding borrows its write operation. @returns Nothing. */ () => {
  const memory = new UNOMemoryStream(),
    owner = new Reference(memory),
    cache = new CachedOutputStream(),
    data = new Bytes();
  try {
    cache.setOutputStream(memory);
    cache.writeBytes(Int8Array.of(-128, -1, 0, 127), 4);
    cache.flush();
    memory.seek(0n);
    expect(memory.readBytes(data, 9)).toBe(4);
    expect(values(data)).toEqual([-128, -1, 0, 127]);
  } finally {
    data.dispose();
    cache.dispose();
    owner.dispose();
  }
});
it("retains the old shared mark when flush fails during a destination change", /** Failed publication must not destroy a mark still referenced by the cache. @returns Nothing. */ () => {
  const cache = new CachedOutputStream(),
    output = new UNOMemoryStream(),
    owner = new Reference(output),
    calls: number[] = [];
  /** Original mark fixture with genuine compiler-erased shared ownership and destructor. */
  class Mark extends ForMergeBase {
    fail = false;
    /** Keeps destructor identity. @param id - Mark identifier. @returns Mark. */
    constructor(private readonly id: number) {
      super();
    }
    /** Failing old destination. @param data - Borrowed SAL value. @returns Nothing. */
    override append(data: ByteSequence): void {
      void data;
      if (this.fail) throw new Error("mark failure");
    }
    /** Source shared_ptr last-owner destruction witness. @returns Nothing. */
    protected override destroy(): void {
      calls.push(this.id);
    }
  }
  const first = new Mark(1),
    second = new Mark(2);
  first.acquire();
  second.acquire();
  try {
    cache.setOutputStream(output);
    cache.setOutput(first);
    first.fail = true;
    expect(
      /** Old mark flush fails before assignment. @returns Nothing. */ () =>
        cache.setOutput(second),
    ).toThrow("mark failure");
    first.release();
    expect(calls).toEqual([]);
    second.release();
    expect(calls).toEqual([2]);
  } finally {
    cache.dispose();
    owner.dispose();
  }
  expect(calls).toEqual([2, 1]);
});
