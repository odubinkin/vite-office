/** @fileoverview Actual source persistence stream identity, seek/length transfer, logical closure, IO capability and native ByteReader delegation over real UNO memory owners; no fake successful stream/monitor. */
import { afterEach, beforeAll, expect, it } from "vitest";
import { own, releaseDomScope } from "../../../test/native-dom";
import { initializeExceptionAbi } from "../../../cppuhelper/browser/exception-abi";
import { initializeRuntime } from "../../../external/emscripten/runtime";
import { SwitchablePersistenceStream } from "./switchpersistencestream";
import { UNOMemoryStream } from "../../../comphelper/source/streaming/memorystream";
import { SequenceInputStream } from "../../../comphelper/source/streaming/seqstream";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { NotConnectedException } from "../../../cppu/inc/com/sun/star/io/NotConnectedException";
import { IOException } from "../../../cppu/inc/com/sun/star/io/IOException";
import { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { XOutputStream } from "../../../udkapi/com/sun/star/io/XOutputStream";
import { XStream } from "../../../udkapi/com/sun/star/io/XStream";
import { XSeekable } from "../../../udkapi/com/sun/star/io/XSeekable";
import { XTruncate } from "../../../udkapi/com/sun/star/io/XTruncate";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import {
  XAsyncOutputMonitor,
  getCppuType,
} from "../../../udkapi/com/sun/star/io/XAsyncOutputMonitor";
import { ByteReader } from "../../../comphelper/inc/bytereader";
import { getFileSystem } from "../../../external/emscripten/runtime";
import { SvMemoryStream, StreamMode } from "../../../tools/inc/stream";
import { OStreamWrapper } from "../../../unotools/source/streaming/streamwrap";
import { BufferSizeExceededException } from "../../../cppu/inc/com/sun/star/io/BufferSizeExceededException";
const Bytes = Sequence.specialize<number>("sal_Int8", 1);
beforeAll(initializeExceptionAbi);
beforeAll(initializeRuntime);
afterEach(releaseDomScope);
it.each(["memory", "temporary"] as const)(
  "copies and switches original input-only persistence to actual %s storage",
  /** Original empty-target selection, full copy, saved position and open flags run on actual native owners. @param mode - Original supplied/implicit target path. @returns Nothing. */ (
    mode,
  ) => {
    const payload: number[] = [];
    for (let index = 0; index < 64001; ++index) payload.push((index << 24) >> 24);
    const source = own(new Reference(new SequenceInputStream(bytes(payload)))),
      wrapper = own(new Reference(new SwitchablePersistenceStream(source, "input"))),
      value = wrapper.operatorStar(),
      before = getFileSystem().readdir("/tmp").length;
    own(value.getInputStream());
    value.seek(31999n);
    const target =
      mode === "memory" ? own(new Reference<XStream>(memory([]))) : own(new Reference<XStream>());
    value.CopyAndSwitchPersistenceTo(target);
    expect(value.getPosition()).toBe(31999n);
    expect(value.getLength()).toBe(64001n);
    expect(source.operatorStar().getPosition()).toBe(64001n);
    expect(getFileSystem().readdir("/tmp").length).toBe(before + (mode === "temporary" ? 1 : 0));
    const data = bytes([]);
    expect(value.readBytes(data, 2)).toBe(2);
    expect(values(data)).toEqual([-1, 0]);
    own(value.getOutputStream());
    value.writeBytes(bytes([99]));
    value.seek(31999n);
    value.readBytes(data, 4);
    expect(values(data)).toEqual([-1, 0, 99, 2]);
    value.closeInput();
    expect(value.getLength()).toBe(64001n);
    value.closeOutput();
    expect(getFileSystem().readdir("/tmp").length).toBe(before);
  },
);
it("rejects a nonempty copy target before changing source position and preserves genuine write failure side effects", /** Source failure retains original persistence; a failed copy does not roll back the original read cursor. @returns Nothing. */ () => {
  const source = memory([1, 2, 3]),
    wrapper = own(new Reference(new SwitchablePersistenceStream(source, "stream"))),
    value = wrapper.operatorStar();
  value.seek(1n);
  fails(
    /** Original target admission. @returns Nothing. */ () =>
      value.CopyAndSwitchPersistenceTo(memory([8])),
    IOException,
  );
  expect(value.getPosition()).toBe(1n);
  const fixed = own(new SvMemoryStream(new Uint8Array(0), 0, StreamMode.READ)),
    target = own(new Reference(new OStreamWrapper(fixed)));
  fails(
    /** Actual readonly stream rejects the copied write. @returns Nothing. */ () =>
      value.CopyAndSwitchPersistenceTo(target),
    BufferSizeExceededException,
  );
  expect(value.getPosition()).toBe(3n);
  expect(value.getLength()).toBe(3n);
  value.seek(0n);
  const data = bytes([]);
  value.readBytes(data, 3);
  expect(values(data)).toEqual([1, 2, 3]);
});
it("ports qadevOOo input and output interface assertions through actual persistence facets", /** Source write/byte comparison/flush/close and available/single-byte reads/skip/close run on real UNO backing storage. @returns Nothing. */ () => {
  const backing = memory([]),
    wrapper = own(new Reference(new SwitchablePersistenceStream(backing, "stream"))),
    stream = wrapper.operatorStar(),
    input = own(stream.getInputStream()),
    output = own(stream.getOutputStream()),
    payload = bytes([11, 22, 33, 44]),
    data = own(new Bytes());
  output.operatorStar().writeBytes(payload);
  stream.seek(0n);
  expect(input.operatorStar().readBytes(data, payload.getLength())).toBe(payload.getLength());
  expect(values(data)).toEqual(values(payload));
  output.operatorStar().flush();
  output.operatorStar().closeOutput();
  stream.seek(0n);
  expect(input.operatorStar().available()).toBe(4);
  expect(input.operatorStar().readBytes(data, 1)).toBe(1);
  expect(data.getLength()).toBe(1);
  expect(values(data)).toEqual([11]);
  expect(input.operatorStar().readSomeBytes(data, 1)).toBe(1);
  expect(data.getLength()).toBe(1);
  expect(values(data)).toEqual([22]);
  input.operatorStar().skipBytes(1);
  expect(stream.getPosition()).toBe(3n);
  input.operatorStar().closeInput();
  expect(backing.operatorStar().getLength()).toBe(4n);
  fails(
    /** Source closes persistence after both logical endpoints close. @returns Position. */ () =>
      stream.getPosition(),
    NotConnectedException,
  );
});
it.each(["stream", "input"] as const)(
  "unwinds original constructor members when the %s source lacks required capabilities",
  /** Failed native query must leave subsequent real stream construction usable, with no replacement provider. @param mode - Original overload. @returns Nothing. */ (
    mode,
  ) => {
    const missing = own(new Reference<XStream>());
    fails(
      /** Original mandatory XSeekable/XTruncate queries fail before persistence installation. @returns Never on this source. */ () =>
        new SwitchablePersistenceStream(missing, mode),
      RuntimeException,
    );
    const wrapper = own(new Reference(new SwitchablePersistenceStream(memory([7]), "stream")));
    expect(wrapper.operatorStar().getLength()).toBe(1n);
    expect(wrapper.operatorStar().getPosition()).toBe(0n);
  },
);
/** Actual native byte Sequence. @param values - Original signed byte values. @returns Owned sequence. */
function bytes(values: readonly number[]): Sequence<number> {
  const result = own(new Bytes(values.length)),
    data = result.getArray() as SequenceElements;
  for (let i = 0; i < values.length; ++i) (data.get(i) as [number])[0] = values[i] as number;
  return result;
}
/** Reads actual native output cells. @param value - Native sequence. @returns Scalar observations. */
function values(value: Sequence<number>): number[] {
  const result: number[] = [],
    data = value.getConstArray() as SequenceElements;
  for (let i = 0; i < value.getLength(); ++i) result.push((data.get(i) as [number])[0]);
  return result;
}
/** Real source stream constructor and initial bytes. @param data - Native bytes. @returns Owned actual component. */
function memory(data: readonly number[]): Reference<UNOMemoryStream> {
  const result = own(new Reference(new UNOMemoryStream()));
  result.operatorStar().writeBytes(bytes(data));
  return result;
}
/** Inspects and destroys actual UNO exceptions without leaking caught native records. @param action - Source operation. @param kind - Native expected class. @returns Nothing. */
function fails(action: () => unknown, kind: typeof Exception): void {
  let caught: unknown;
  try {
    action();
  } catch (error) {
    caught = error;
  }
  expect(caught).toBeInstanceOf(kind);
  (caught as Exception).dispose();
}
it("retains actual six UNO facets, native ByteReader and initial position reset", /** Interface queries share the same source component; no monitor implementation is manufactured. @returns Nothing. */ () => {
  const backing = memory([1, 2, 3, 4]),
    stream = own(new Reference(new SwitchablePersistenceStream(backing, "stream"))),
    component = stream.operatorStar();
  expect(backing.operatorStar().getPosition()).toBe(0n);
  expect(component.getLength()).toBe(4n);
  for (const type of [
    XStream.static_type,
    XInputStream.static_type,
    XOutputStream.static_type,
    XSeekable.static_type,
    XTruncate.static_type,
    XAsyncOutputMonitor.static_type,
  ])
    expect(own(new Reference(stream, UNO_QUERY_THROW, type)).get()).toBe(component);
  expect(component instanceof ByteReader).toBe(true);
  const output = own(component.getOutputStream()),
    input = own(component.getInputStream()),
    data = own(new Bytes());
  expect(input.get()).toBe(component);
  expect(output.get()).toBe(component);
  expect(component.readBytes(data, 2)).toBe(2);
  expect(values(data)).toEqual([1, 2]);
  component.skipBytes(1);
  expect(component.available()).toBe(1);
  expect(component.readSomeBytes(data, 5)).toBe(1);
  expect(values(data)).toEqual([4]);
  component.seek(1n);
  const target = bytes([0, 0, 0, 0]),
    pointer = target.getArray() as SequenceElements;
  expect(component.readSomeBytes(pointer, 2)).toBe(2);
  expect(values(target)).toEqual([2, 3, 0, 0]);
  component.seek(0n);
  component.writeBytes(bytes([-1, 7]));
  component.flush();
  component.waitForCompletion();
  component.seek(0n);
  component.readBytes(data, 4);
  expect(values(data)).toEqual([-1, 7, 3, 4]);
  component.truncate();
  expect(component.getLength()).toBe(0n);
  expect(component.getPosition()).toBe(0n);
});
it.each(["stream", "input"] as const)(
  "switches same-length persistence to %s preserving position and open flags",
  /** Real old/new native streams expose whether original close methods were incorrectly called. @param mode - Original overload. @returns Nothing. */ (
    mode,
  ) => {
    const first = memory([1, 2, 3, 4]),
      second = memory([9, 8, 7, 6]),
      stream = own(new Reference(new SwitchablePersistenceStream(first, "stream"))),
      component = stream.operatorStar();
    own(component.getInputStream());
    own(component.getOutputStream());
    component.seek(2n);
    const replacement =
      mode === "stream" ? second : own(new Reference(new SequenceInputStream(bytes([9, 8, 7, 6]))));
    component.SwitchPersistenceTo(replacement, mode);
    expect(first.operatorStar().getPosition()).toBe(2n);
    expect(component.getPosition()).toBe(2n);
    const data = own(new Bytes());
    component.readBytes(data, 1);
    expect(values(data)).toEqual([7]);
    component.closeInput();
    expect(component.getLength()).toBe(4n); // Output flag was transferred.
    component.closeOutput();
    fails(
      /** Original disconnect after both logical facets close. @returns Length. */ () =>
        component.getLength(),
      NotConnectedException,
    );
    component.SwitchPersistenceTo(first, "stream");
    expect(component.getPosition()).toBe(0n);
  },
);
it("rejects length mismatch before releasing old persistence and remains usable", /** Original failure does not switch original owner/position. @returns Nothing. */ () => {
  const original = memory([1, 2, 3]),
    mismatch = memory([8, 9]),
    stream = own(new Reference(new SwitchablePersistenceStream(original, "stream"))),
    component = stream.operatorStar();
  component.seek(1n);
  fails(
    /** Original length mismatch. @returns Nothing. */ () =>
      component.SwitchPersistenceTo(mismatch, "stream"),
    RuntimeException,
  );
  const input = own(new Reference(new SequenceInputStream(bytes([4]))));
  fails(
    /** Original input overload mismatch. @returns Nothing. */ () =>
      component.SwitchPersistenceTo(input, "input"),
    RuntimeException,
  );
  expect(component.getPosition()).toBe(1n);
  const data = own(new Bytes());
  component.readBytes(data, 2);
  expect(values(data)).toEqual([2, 3]);
});
it("retains input-only output exposure, IO rejection and diagnostic-only flush", /** Original output/monitor interfaces are exposed independently of backing capabilities. @returns Nothing. */ () => {
  const input = own(new Reference(new SequenceInputStream(bytes([1, 2])))),
    stream = own(new Reference(new SwitchablePersistenceStream(input, "input"))),
    component = stream.operatorStar();
  expect(own(component.getOutputStream()).get()).toBe(component);
  fails(
    /** Original input-only write. @returns Nothing. */ () => component.writeBytes(bytes([3])),
    IOException,
  );
  fails(
    /** Original input-only truncate. @returns Nothing. */ () => component.truncate(),
    IOException,
  );
  component.flush();
  component.waitForCompletion();
  component.closeOutput();
  expect(input.operatorStar().available()).toBe(2); // Original reset releases references without closing input.
  component.flush();
});
it("retains disconnected facet returns and every original NotConnectedException guard", /** Closing an unrequested opposite side disconnects without requiring an earlier getInputStream/getOutputStream call. @returns Nothing. */ () => {
  const backing = memory([1]),
    stream = own(new Reference(new SwitchablePersistenceStream(backing, "stream"))),
    component = stream.operatorStar(),
    data = own(new Bytes(1));
  component.closeInput();
  expect(backing.operatorStar().getPosition()).toBe(0n);
  expect(own(component.getInputStream()).get()).toBe(component);
  expect(own(component.getOutputStream()).get()).toBe(component);
  const calls = [
    /** Disconnected full read. @returns Count. */ () => component.readBytes(data, 1),
    /** Disconnected Sequence read. @returns Count. */ () => component.readSomeBytes(data, 1),
    /** Disconnected pointer read. @returns Count. */ () =>
      component.readSomeBytes(data.getArray() as SequenceElements, 1),
    /** Disconnected skip. @returns Nothing. */ () => component.skipBytes(1),
    /** Disconnected available. @returns Count. */ () => component.available(),
    /** Disconnected input close. @returns Nothing. */ () => component.closeInput(),
    /** Disconnected write. @returns Nothing. */ () => component.writeBytes(data),
    /** Disconnected output close. @returns Nothing. */ () => component.closeOutput(),
    /** Disconnected truncate. @returns Nothing. */ () => component.truncate(),
    /** Disconnected seek. @returns Nothing. */ () => component.seek(0n),
    /** Disconnected position. @returns Offset. */ () => component.getPosition(),
    /** Disconnected length. @returns Size. */ () => component.getLength(),
    /** Disconnected monitor. @returns Nothing. */ () => component.waitForCompletion(),
  ];
  for (const call of calls) fails(call, NotConnectedException);
  component.flush();
  component.SwitchPersistenceTo(backing, "stream");
  expect(component.getLength()).toBe(1n);
});
it("forwards a real monitor call through nested original persistence components", /** Closing the inner actual stream proves monitor delegation without a fake successful monitor. @returns Nothing. */ () => {
  const inner = own(new Reference(new SwitchablePersistenceStream(memory([1]), "stream"))),
    outer = own(new Reference(new SwitchablePersistenceStream(inner, "stream")));
  outer.operatorStar().waitForCompletion();
  inner.operatorStar().closeInput();
  inner.operatorStar().closeOutput();
  fails(
    /** Real inner monitor reports its disconnected source state. @returns Nothing. */ () =>
      outer.operatorStar().waitForCompletion(),
    NotConnectedException,
  );
});

it("transports the actual monitor facet through native Any using the generated deprecated type getter", /** Normal generated interface metadata must retain real component ownership and dispatch, not merely a static name. @returns Nothing. */ () => {
  const component = own(new Reference(new SwitchablePersistenceStream(memory([1]), "stream"))),
    monitor = own(
      new Reference<XAsyncOutputMonitor>(
        component,
        UNO_QUERY_THROW,
        XAsyncOutputMonitor.static_type,
      ),
    ),
    value = own(new Any(monitor.getAddress(), getCppuType(monitor))),
    restored = own(new Reference<XAsyncOutputMonitor>());
  expect(value.extract(restored.getAddress(), ["Reference", XAsyncOutputMonitor.static_type])).toBe(
    true,
  );
  expect(restored.get()).toBe(component.get());
  component.clear();
  monitor.clear();
  restored.operatorStar().waitForCompletion();
});
