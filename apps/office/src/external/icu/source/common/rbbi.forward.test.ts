/** @fileoverview Original private RBBI forward method and consumed UText provider operations replay native prepared fields, compiled LibreOffice rule data and observed mutations. */
import { assert, expect, it } from "vitest";
import native from "./rbbi.forward.native-observations.json" with { type: "json" };
import { handleNext, type RuleBasedBreakIteratorForwardState } from "./rbbi";
import { RBBIStateTable } from "./rbbidata.h";
import { ucptrie_openFromBinary } from "./ucptrie";
import {
  ucstrTextAccess,
  ucstrTextLength,
  utext_getNativeIndex,
  utext_next32,
  utext_setNativeIndex,
} from "./utext";
import type { UText } from "./unicode/utext";
/** Projects exactly the native fixture's original provider fields and caller-owned UTF16 allocation. No iterator/provider construction is emulated. @param text - Original text. @param fields - Captured native initial fields. @returns Prepared actual field projection. */
function prepared(text: number[], fields: number[]): UText {
  const units = new Uint16Array(text.length + 1);
  units.set(text);
  return {
    chunkNativeStart: fields[0] as number,
    chunkNativeLimit: fields[1] as number,
    chunkOffset: fields[2] as number,
    chunkLength: fields[3] as number,
    nativeIndexingLimit: fields[4] as number,
    providerProperties: fields[5] as number,
    a: fields[6] as number,
    context: units,
    chunkContents: units,
    pFuncs: {
      access: ucstrTextAccess,
      nativeLength: ucstrTextLength,
      mapOffsetToNative: null,
      mapNativeIndexToUTF16: null,
    },
  };
}
it.each(native.fixtures)(
  "matches original forward mutations for compiled $name",
  /** Actual native binary fields and every native observation are consumed without reparsing text. @param fixture - Original compiled rules/observations. @returns Nothing. */ (
    fixture,
  ) => {
    const bytes = new Uint8Array(Buffer.from(fixture.binary, "base64")),
      header = new Uint32Array(bytes.buffer, 0, 20),
      status: [number] = [0],
      forward = new RBBIStateTable(
        bytes.subarray(header[4] as number, (header[4] as number) + (header[5] as number)),
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
    expect(forward.fFlags).toBe(fixture.flags);
    expect(forward.fTableData.buffer).toBe(bytes.buffer);
    for (const observation of fixture.cases) {
      const state: RuleBasedBreakIteratorForwardState = {
        fData: { fForwardTable: forward, fTrie: trie },
        fText: prepared(native.texts[observation.text] as number[], observation.initial),
        fPosition: observation.start,
        fRuleStatusIndex: 777,
        fDictionaryCharCount: 888,
        fDone: false,
        fLookAheadMatches: new Int32Array(forward.fLookAheadResultsSize).fill(-1),
      };
      const result = handleNext.call(state);
      expect([
        result,
        state.fPosition,
        state.fRuleStatusIndex,
        state.fDictionaryCharCount,
        Number(state.fDone),
        utext_getNativeIndex(state.fText),
        state.fText.chunkOffset,
      ]).toEqual(observation.expected);
    }
  },
);
it("retains native explicit/NUL-length chunk access, pinning and surrogate behavior", /** Native observations include deferred32-unit chunks, embedded NUL, lone surrogates, supplementary scalars and direct provider access. @returns Nothing. */ () => {
  for (const observation of native.utextCases) {
    const text = prepared(native.texts[observation.text] as number[], observation.initial);
    if (observation.direct) ucstrTextAccess(text, observation.start, true);
    else utext_setNativeIndex(text, observation.start);
    const before = utext_getNativeIndex(text),
      c = utext_next32(text);
    expect([
      before,
      c,
      utext_getNativeIndex(text),
      text.chunkNativeLimit,
      text.chunkOffset,
      text.chunkLength,
      text.nativeIndexingLimit,
      text.providerProperties,
      text.a,
    ]).toEqual(observation.expected.slice(0, 9));
  }
});
