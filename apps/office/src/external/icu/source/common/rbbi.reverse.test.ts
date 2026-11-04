/** @fileoverview Original safe reverse and cache-consumed UText operations against exact native fields and cursor/provider side effects. */
import { assert, expect, it } from "vitest";
import native from "./rbbi.forward.native-observations.json" with { type: "json" };
import { handleSafePrevious } from "./rbbi";
import { RBBIStateTable } from "./rbbidata.h";
import { ucptrie_openFromBinary } from "./ucptrie";
import {
  ucstrTextAccess,
  ucstrTextLength,
  utext_current32,
  utext_getNativeIndex,
  utext_getPreviousNativeIndex,
  utext_nativeLength,
  utext_next32,
  utext_previous32,
  utext_setNativeIndex,
} from "./utext";
import type { UText } from "./unicode/utext";
/** Projects recorded native fields onto the original UTF16 input and actual source callbacks. @param units - Native input units. @param fields - Native prepared fields. @returns Actual field projection. */
function prepared(units: number[], fields: number[]): UText {
  const text = new Uint16Array(units.length + 1);
  text.set(units);
  return {
    chunkNativeStart: fields[0] as number,
    chunkNativeLimit: fields[1] as number,
    chunkOffset: fields[2] as number,
    chunkLength: fields[3] as number,
    nativeIndexingLimit: fields[4] as number,
    providerProperties: fields[5] as number,
    a: fields[6] as number,
    context: text,
    chunkContents: text,
    pFuncs: {
      access: ucstrTextAccess,
      nativeLength: ucstrTextLength,
      mapOffsetToNative: null,
      mapNativeIndexToUTF16: null,
    },
  };
}
it.each(native.fixtures)(
  "retains native safe reverse state for $name",
  /** Native reverse table rows and every original observation are consumed directly. @param fixture - Native data. @returns Nothing. */ (
    fixture,
  ) => {
    const bytes = new Uint8Array(Buffer.from(fixture.binary, "base64")),
      header = new Uint32Array(bytes.buffer, 0, 20),
      status: [number] = [0],
      table = new RBBIStateTable(
        bytes.subarray(header[6] as number, (header[6] as number) + (header[7] as number)),
      ),
      trie = ucptrie_openFromBinary(
        0,
        -1,
        bytes.subarray(header[8] as number, (header[8] as number) + (header[9] as number)),
        header[9] as number,
        null,
        status,
      );
    assert(trie);
    expect(status[0]).toBe(0);
    expect(table.fFlags).toBe(fixture.reverseFlags);
    expect(table.fTableData.buffer).toBe(bytes.buffer);
    for (const observation of fixture.reverseCases) {
      const start = observation[1] as number,
        state = {
          fText: prepared(
            native.texts[observation[0] as number] as number[],
            observation.slice(2, 9),
          ),
          fData: { fReverseTable: table, fTrie: trie },
          fPosition: start,
          fRuleStatusIndex: 777,
          fDictionaryCharCount: 888,
          fDone: false,
        },
        result = handleSafePrevious.call(state, start);
      expect([
        result,
        state.fPosition,
        state.fRuleStatusIndex,
        state.fDictionaryCharCount,
        Number(state.fDone),
        utext_getNativeIndex(state.fText),
        state.fText.chunkOffset,
      ]).toEqual(observation.slice(9));
    }
  },
);
it("preserves native current/previous queries, cursor restoration and deferred length", /** Full sequences retain all earlier forward assertions plus new backward/current/length effects. @returns Nothing. */ () => {
  for (const observation of native.utextCases) {
    const text = prepared(native.texts[observation.text] as number[], observation.initial);
    if (observation.direct) ucstrTextAccess(text, observation.start, true);
    else utext_setNativeIndex(text, observation.start);
    const before = utext_getNativeIndex(text),
      next = utext_next32(text),
      actual = [
        before,
        next,
        utext_getNativeIndex(text),
        text.chunkNativeLimit,
        text.chunkOffset,
        text.chunkLength,
        text.nativeIndexingLimit,
        text.providerProperties,
        text.a,
      ],
      current = utext_current32(text),
      currentIndex = utext_getNativeIndex(text),
      previousIndex = utext_getPreviousNativeIndex(text),
      restoredIndex = utext_getNativeIndex(text),
      previous = utext_previous32(text),
      previousPosition = utext_getNativeIndex(text),
      length = utext_nativeLength(text);
    actual.push(
      current,
      currentIndex,
      previousIndex,
      restoredIndex,
      previous,
      previousPosition,
      length,
      text.chunkNativeLimit,
      text.chunkOffset,
      text.chunkLength,
      text.nativeIndexingLimit,
      text.providerProperties,
      text.a,
    );
    expect(actual).toEqual(observation.expected);
  }
});
