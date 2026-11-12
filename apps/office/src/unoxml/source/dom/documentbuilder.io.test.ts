/** @fileoverview Original document builder IO callbacks on actual input streams, native memory and genuine UNO exception/refcount lifetimes. */
import { afterEach, expect, it } from "vitest";
import { initializeLibXml2 } from "../../../external/libxml2/libxml2";
import { MemoryInputStream } from "../../../comphelper/source/streaming/seqstream";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { WeakReferenceHelper } from "../../../cppuhelper/inc/weakref";
import { own, releaseDomScope } from "../../../test/native-dom";
import {
  context_t,
  nativeIoContext,
  xmlIO_read_func,
  xmlIO_close_func,
} from "./documentbuilder.io";
afterEach(releaseDomScope);

it("copies actual readBytes output into C memory and preserves EOF, absence and UNO read failures", /** Exercises signed bytes without a substitute stream service. @returns Async completion. */ async () => {
  const m = await initializeLibXml2(),
    buffer = m._malloc(8),
    context = new context_t();
  context.close = false;
  context.freeOnClose = false;
  try {
    const native = nativeIoContext(context);
    expect(nativeIoContext(context)).toEqual(native);
    expect(xmlIO_read_func(context, buffer, 8)).toBe(-1);
    const input = own(new Reference(new MemoryInputStream(new Uint8Array([0, 127, 128, 255]), 4)));
    context.rInputStream.assign(input);
    expect(xmlIO_read_func(context, buffer, 8)).toBe(4);
    expect([...m.HEAPU8.subarray(buffer, buffer + 4)]).toEqual([0, 127, 128, 255]);
    expect(xmlIO_read_func(context, buffer, 8)).toBe(0);
    input.get()?.closeInput();
    expect(xmlIO_read_func(context, buffer, 8)).toBe(-1);
  } finally {
    context.dispose();
    m._free(buffer);
  }
});

/** Concrete stream observation retains original reads and close operation. */
class Input extends MemoryInputStream {
  closed = 0;
  failure: RuntimeException | Error | null = null;
  /** Actual MemoryInputStream with empty owned fixture bytes. @returns Stream. */
  constructor() {
    super(new Uint8Array(), 0);
  }
  /** Observes source close ownership and callback failures. @returns Nothing. */
  override closeInput(): void {
    ++this.closed;
    if (this.failure) throw this.failure;
    super.closeInput();
  }
}

it.each([
  [false, false],
  [true, false],
  [false, true],
  [true, true],
])(
  "retains source close=%s/freeOnClose=%s ownership",
  /** Callback deletion releases the real input reference only on success. @param close - Source close flag. @param free - Source deletion flag. @returns Nothing. */ (
    close,
    free,
  ) => {
    const input = own(new Reference(new Input())),
      stream = input.get() as Input,
      weak = own(new WeakReferenceHelper(input)),
      context = new context_t();
    context.rInputStream.assign(input);
    context.close = close;
    context.freeOnClose = free;
    input.clear();
    expect(xmlIO_close_func(context)).toBe(0);
    expect(stream.closed).toBe(close ? 1 : 0);
    const acquired = weak.get();
    try {
      expect(acquired.is()).toBe(!free);
    } finally {
      acquired.dispose();
    }
    if (!free) context.dispose();
  },
);

it("preserves empty-stream early return and contains only UNO close failures", /** Failed close leaves the context reference live, matching the source statement order. @returns Nothing. */ () => {
  const context = new context_t();
  context.close = true;
  context.freeOnClose = true;
  expect(xmlIO_close_func(context)).toBe(0);
  const input = own(new Reference(new Input())),
    stream = input.get() as Input,
    weak = own(new WeakReferenceHelper(input));
  context.rInputStream.assign(input);
  input.clear();
  stream.failure = new RuntimeException();
  expect(xmlIO_close_func(context)).toBe(-1);
  const alive = weak.get();
  try {
    expect(alive.is()).toBe(true);
  } finally {
    alive.dispose();
  }
  const sentinel = new Error("host failure");
  stream.failure = sentinel;
  expect(
    /** Host failures retain their original identity. @returns Callback status if accepted. */ () =>
      xmlIO_close_func(context),
  ).toThrow(sentinel);
  stream.failure = null;
  context.dispose();
});
