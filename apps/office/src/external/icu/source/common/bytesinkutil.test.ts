/** @fileoverview Source checked sink/capacity/termination behavior over actual writable owners and borrowed append views. */
import { expect, it } from "vitest";
import { CheckedArrayByteSink } from "./unicode/bytestream";
import { ByteSinkUtil } from "./bytesinkutil";
import { u_terminateChars } from "./ustring";
it("borrows the actual append buffer, counts writes only on Append and retains bytes on reset", /** Tests original direct-pointer and self-copy semantics. @returns Nothing. */ () => {
  const out = new Uint8Array(8).fill(77),
    scratch = new Uint8Array(4).fill(88),
    sink = new CheckedArrayByteSink(out, 8),
    capacity: [number] = [0];
  sink.Append("ab");
  const view = sink.GetAppendBuffer(2, 99, scratch, 4, capacity) as Uint8Array;
  expect(view.buffer).toBe(out.buffer);
  expect(view.byteOffset).toBe(out.byteOffset + 2);
  expect(capacity[0]).toBe(6);
  view[0] = 67;
  view[1] = 68;
  expect(sink.NumberOfBytesWritten()).toBe(2);
  sink.Append(view, 2);
  expect(sink.NumberOfBytesAppended()).toBe(4);
  expect([...out]).toEqual([97, 98, 67, 68, 77, 77, 77, 77]);
  expect(sink.Reset()).toBe(sink);
  expect(sink.NumberOfBytesWritten()).toBe(0);
  expect([...out]).toEqual([97, 98, 67, 68, 77, 77, 77, 77]);
});
it("preserves source scratch guards, truncation and attempted count", /** A shorter writable output does not reduce the required count. @returns Nothing. */ () => {
  const out = new Uint8Array(3).fill(77),
    scratch = new Uint8Array(4),
    sink = new CheckedArrayByteSink(out, 3),
    capacity: [number] = [77];
  expect(sink.GetAppendBuffer(2, 99, scratch, 1, capacity)).toBeNull();
  expect(capacity[0]).toBe(0);
  sink.Append("abcdef");
  expect([...out]).toEqual([97, 98, 99]);
  expect(sink.NumberOfBytesWritten()).toBe(3);
  expect(sink.NumberOfBytesAppended()).toBe(6);
  expect(sink.Overflowed()).toBe(true);
});
it("distinguishes exact-fit warning, required overflow and failed-lambda prefix", /** Original conversion errors return zero before NUL termination. @returns Nothing. */ () => {
  const out = new Uint8Array(5).fill(77),
    status: [number] = [0];
  expect(
    ByteSinkUtil.viaByteSinkToTerminatedChars(
      out,
      2,
      /** Emits exactly two counted units. @param sink - Owner. @returns Nothing. */ (sink) =>
        sink.Append("ab"),
      status,
    ),
  ).toBe(2);
  expect(status[0]).toBe(-124);
  expect([...out]).toEqual([97, 98, 77, 77, 77]);
  status[0] = 0;
  out.fill(77);
  expect(
    ByteSinkUtil.viaByteSinkToTerminatedChars(
      out,
      1,
      /** Emits beyond capacity. @param sink - Owner. @returns Nothing. */ (sink) =>
        sink.Append("ab"),
      status,
    ),
  ).toBe(2);
  expect(status[0]).toBe(15);
  expect([...out]).toEqual([97, 77, 77, 77, 77]);
  status[0] = 0;
  out.fill(77);
  expect(
    ByteSinkUtil.viaByteSinkToTerminatedChars(
      out,
      5,
      /** Fails after a source prefix. @param sink - Owner. @param s - Status. @returns Nothing. */ (
        sink,
        s,
      ) => {
        sink.Append("ab");
        s[0] = 1;
      },
      status,
    ),
  ).toBe(0);
  expect([...out]).toEqual([97, 98, 77, 77, 77]);
});
it("clears only the original termination warning and leaves negative lengths alone", /** Private termination helper does not invent public argument errors. @returns Nothing. */ () => {
  const out = new Uint8Array(4).fill(77),
    s: [number] = [-124];
  expect(u_terminateChars(out, 4, 2, s)).toBe(2);
  expect(s[0]).toBe(0);
  expect([...out]).toEqual([77, 77, 0, 77]);
  s[0] = -128;
  u_terminateChars(out, 4, 1, s);
  expect(s[0]).toBe(-128);
  s[0] = -124;
  u_terminateChars(out, 4, -1, s);
  expect(s[0]).toBe(-124);
});

it("exposes a frozen nonconstructable static namespace", /** The native deleted constructor has no legal instance representation. @returns Nothing. */ () => {
  expect(Object.isFrozen(ByteSinkUtil)).toBe(true);
  expect(Object.keys(ByteSinkUtil)).toEqual(["viaByteSinkToTerminatedChars"]);
  expect(typeof ByteSinkUtil).toBe("object");
});
