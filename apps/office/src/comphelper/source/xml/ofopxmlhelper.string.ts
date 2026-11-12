/** @fileoverview Existing package string-returning I/O signatures convert caller containers to actual native StringPair sequences and invoke original OFOP stream/context writers. No XML encoder or default service provider is supplied here. */
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence, type SequenceReference } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import {
  StringPair as NativePair,
  cppu_detail_getUnoType_StringPair as pairType,
} from "../../../udkapi/com/sun/star/beans/StringPair";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { getProcessComponentContext } from "../../inc/processfactory";
import { WriteContentSequence, WriteRelationsInfoSequence } from "./ofopxmlhelper.write";
import { SaxStringOutput } from "./saxstringwriter";
const Pairs = Sequence.specialize<NativePair>(pairType, 16),
  Rows = Sequence.specialize<Sequence<NativePair>>(["Sequence", pairType], 8);
/** Existing caller string fields; these are never passed off as initialized UNO structs. */
export interface StringPair {
  readonly First: string;
  readonly Second: string;
}
/** Actual borrowed context supplied by the already bootstrapped application. @returns Acquired context. */
function context(): Reference<XComponentContext> {
  return new Reference<XComponentContext>(getProcessComponentContext().get());
}
/** Existing UTF16 input boundary. @param value - Caller text. @returns Actual string owner. */
function native(value: string): OUString {
  return new OUString(
    Uint16Array.from(
      value.split(""),
      /** Binds an exact caller code unit. @param unit - UTF16 unit. @returns Numeric code. */ (
        unit,
      ) => unit.charCodeAt(0),
    ),
    value.length,
  );
}
/** Existing string-result content-types boundary through the real native writer. @param defaults - Actual initialized defaults. @param overrides - Actual initialized overrides. @returns Source-produced UTF8 XML decoded for package transport. */
export function writeContentSequenceXml(
  defaults: SequenceReference<NativePair>,
  overrides: SequenceReference<NativePair>,
): string {
  const ctx = context(),
    output = new SaxStringOutput();
  try {
    WriteContentSequence(output.stream, defaults, overrides, ctx);
    return output.getXml();
  } finally {
    output.dispose();
    ctx.dispose();
  }
}
/** Existing relationship caller-container/string-result boundary. @param sequence - Actual caller strings. @returns Source-produced XML. */
export function writeRelationsInfoSequenceXml(
  sequence: readonly (readonly StringPair[])[],
): string {
  const owners: NativePair[] = [],
    rows: Sequence<NativePair>[] = [];
  let all: Sequence<Sequence<NativePair>> | undefined;
  const ctx = context(),
    output = new SaxStringOutput();
  try {
    for (const row of sequence) {
      const entries: NativePair[] = [];
      for (const pair of row) {
        const first = native(pair.First),
          second = native(pair.Second);
        try {
          const value = new NativePair(first, second);
          owners.push(value);
          entries.push(value);
        } finally {
          second.dispose();
          first.dispose();
        }
      }
      rows.push(
        new Pairs(
          {
            /** Borrows the actual initialized compound. @param offset - Byte offset. @returns Native field address. */ get(
              offset: number,
            ) {
              return entries[offset / 16] as NativePair;
            },
          },
          entries.length,
        ),
      );
    }
    all = new Rows(
      {
        /** Borrows initialized Sequence pointer storage. @param offset - Byte offset. @returns Native sequence field. */ get(
          offset: number,
        ) {
          return (rows[offset / 8] as Sequence<NativePair>).getAddress();
        },
      },
      rows.length,
    );
    WriteRelationsInfoSequence(output.stream, all, ctx);
    return output.getXml();
  } finally {
    all?.dispose();
    for (const row of rows) row.dispose();
    for (const pair of owners) pair.dispose();
    output.dispose();
    ctx.dispose();
  }
}
