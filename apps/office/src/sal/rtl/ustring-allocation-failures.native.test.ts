/** @fileoverview Original RTL allocation-slot failure events; native assertion termination is distinguished from the existing local checked Error binding. */
import { expect, it, vi } from "vitest";
import * as C from "../inc/rtl/ustring.h";
import type { rtl_uString, rtl_uStringSlot } from "../inc/rtl/ustring.h";
import type { rtl_StringSlot } from "../inc/rtl/string.h";
import * as str from "./strtmpl";
import { rtl_stringAllocation } from "./strimp.hxx";
import captured from "./native-allocation-failures.json";

/** Original isolated native caller observation. */
interface Case {
  operation: "N" | "V" | "B" | "R" | "D" | "X";
  events: string[];
  nativeSignal: "SIGABRT" | null;
  diagnostics: string[];
}
const observations = captured as unknown as { cases: Case[] };

/** Allocates an actual counted Unicode owner before installing the original allocation-failure environment. @param value - Source literal. @returns Owned pointer slot. */
function owner(value: string): rtl_uStringSlot {
  const slot: rtl_uStringSlot = [null],
    units = new Uint16Array(value.length);
  for (let index = 0; index < value.length; ++index) units[index] = value.charCodeAt(index);
  C.rtl_uString_newFromStr_WithLength(slot, units, units.length);
  return slot;
}
/** Borrows an initialized actual caller owner. @param slot - Concrete pointer reference. @returns Data. */
function data(slot: rtl_uStringSlot): rtl_uString {
  const result = slot[0];
  if (!result) throw new Error("Missing initialized original string");
  return result;
}
/** Reads only live initialized data and its terminating zero. @param value - Actual counted allocation. @returns Native initialized snapshot. */
function snapshot(value: rtl_uString): number[] {
  return [value.refCount, value.length, ...value.buffer.subarray(0, value.length + 1)];
}

it.each(observations.cases)(
  "preserves original allocation-failure events for caller $operation",
  /** Original sal/rtl/strimp.hxx exposes these allocation/free function pointers. Only that original environment changes; no core method, source length or counter is replaced. Native pre-abort events are compared, while local Error behavior remains a declared binding rather than a native C++ exception claim. @param row - Compiled native observation. @returns Nothing. */ (
    row,
  ) => {
    const byte = row.operation === "B",
      left = byte ? null : owner("ab"),
      right = byte ? null : owner("c"),
      output: rtl_uStringSlot = byte ? [null] : owner("old"),
      byteOutput: rtl_StringSlot = [null];
    if (byte) str.newFromStr_WithLength(byteOutput, Uint8Array.of(111, 108, 100), 3, 0, Uint8Array);
    const old = byte ? byteOutput[0] : output[0];
    if (!old) throw new Error("Missing actual original destination");
    const allocation = { ...rtl_stringAllocation },
      events: string[] = [],
      diagnostics: string[] = [];
    let oldFreed = false,
      exception: unknown;
    const warning = vi.spyOn(console, "warn").mockImplementation(
      /** Observes the existing nonfatal host diagnostic without changing the source condition or owner behavior. @param args - Actual diagnostic operands. @returns Nothing. */ (
        ...args
      ) => {
        diagnostics.push(args.join(" "));
      },
    );
    rtl_stringAllocation.rtl_allocateString =
      /** Uses the original externally replaceable allocation slot's null failure result. @param bytes - Original requested allocation size. @returns Original failure pointer. */ (
        bytes,
      ) => {
        events.push(`A ${bytes}`);
        return null;
      };
    rtl_stringAllocation.rtl_freeString =
      /** Observes live initialized storage before forwarding to the original free slot. @param value - Actual released owner. @returns Nothing. */ (
        value,
      ) => {
        events.push(
          [
            "F",
            Number(value === old),
            value.refCount,
            value.length,
            ...value.buffer.subarray(0, value.length + 1),
          ].join(" "),
        );
        if (value === old) oldFreed = true;
        allocation.rtl_freeString(value);
      };
    try {
      try {
        if (byte) str.new_WithLength(byteOutput, 3, Uint8Array);
        else {
          if (!left || !right) throw new Error("Missing actual original inputs");
          if (row.operation === "N") C.rtl_uString_newConcat(output, data(left), data(right));
          else if (row.operation === "V")
            C.rtl_uString_newConcatUtf16L(output, data(left), data(right).buffer, 1);
          else if (row.operation === "R")
            C.rtl_uString_newReplaceStrAtUtf16L(output, data(left), 1, 0, data(right).buffer, 1);
          else if (row.operation === "X")
            C.rtl_uString_newFromStr_WithLength(output, Uint16Array.of(109, 111, 114, 101), 4);
          else C.rtl_uString_newReplaceStrAt(output, data(left), 1, 0, data(right));
        }
      } catch (error) {
        exception = error;
      }
      if (row.nativeSignal === "SIGABRT") {
        expect(exception).toBeInstanceOf(Error);
        expect(exception).toHaveProperty("message", "assert(*ppThis != nullptr)");
      } else {
        expect(exception).toBeUndefined();
        if (!left || !right) throw new Error("Missing live original inputs");
        events.push(
          ["S", Number(output[0] === null), ...snapshot(data(left)), ...snapshot(data(right))].join(
            " ",
          ),
        );
        expect(diagnostics).toEqual(row.diagnostics);
      }
      expect(events).toEqual(row.events);
    } finally {
      rtl_stringAllocation.rtl_allocateString = allocation.rtl_allocateString;
      rtl_stringAllocation.rtl_freeString = allocation.rtl_freeString;
      warning.mockRestore();
      if (byte) {
        if (byteOutput[0]) {
          str.release(byteOutput[0]);
          if (byteOutput[0] === old) oldFreed = true;
        }
      } else {
        if (output[0]) {
          C.rtl_uString_release(output[0]);
          if (output[0] === old) oldFreed = true;
        }
        if (left?.[0]) C.rtl_uString_release(left[0]);
        if (right?.[0]) C.rtl_uString_release(right[0]);
      }
      // Original native assertions terminate; this local test retains the caller's unreleased pre-assert owner for checked-Error cleanup only.
      if (!oldFreed) str.release(old);
    }
  },
);
