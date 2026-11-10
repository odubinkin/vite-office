/** @fileoverview Original ICU vector/cache command traces: native vector rows and exact-live-comparison cache fingerprints, retaining every observed owner/cache field. */
import { assert, expect, it } from "vitest";
import native from "./rbbi_cache.native-observations.json" with { type: "json" };
import { UVector32 } from "./uvectr32.h";
import {
  BreakCache,
  DictionaryCache,
  type RuleBasedBreakIteratorCacheOwner as Owner,
  UpdatePositionValues,
} from "./rbbi_cache.h";
import { handleNext, handleSafePrevious } from "./rbbi";
import { RBBIStateTable } from "./rbbidata.h";
import { ucptrie_openFromBinary } from "./ucptrie";
import { ucstrTextAccess, ucstrTextLength, utext_getNativeIndex } from "./utext";
it("retains every native vector capacity/status/scalar/stack state", /** Uses original native commands/results rather than another vector implementation. @returns Nothing. */ () => {
  const b = new UVector32([0]);
  let a = new UVector32([0]),
    status: [number] = [0];
  for (let i = 0; i < native.vectorCommands.length; ++i) {
    const [op, ...args] = (native.vectorCommands[i] as string).split(" "),
      [x, y] = args.map(Number) as [number, number];
    let result = -2147483648;
    switch (op) {
      case "V":
        status = [y];
        a = new UVector32(x, status);
        break;
      case "W":
        status[0] = x;
        break;
      case "A":
        a.addElement(x, status);
        break;
      case "P":
        result = a.push(x, status);
        break;
      case "O":
        result = a.popi();
        break;
      case "I":
        a.insertElementAt(x, y, status);
        break;
      case "M":
        a.removeElementAt(x);
        break;
      case "Z":
        a.removeAllElements();
        break;
      case "S":
        a.setSize(x);
        break;
      case "L":
        a.setMaxCapacity(x);
        break;
      case "C":
        result = Number(a.ensureCapacity(x, status));
        break;
      case "G":
        result = Number(a.expandCapacity(x, status));
        break;
      case "E":
        result = a.elementAti(x);
        break;
      case "R":
        a.setElementAt(x, y);
        break;
      case "B":
        b.removeAllElements();
        for (const value of args.slice(1)) b.addElement(Number(value), [0]);
        break;
      case "Q":
        a.assign(b, status);
        break;
      case "X":
        result = Number(a.equals(b));
        break;
      case "U":
        result = Number(a.containsAll(b));
        break;
      case "N":
        result = Number(a.containsNone(b));
        break;
      case "D":
        result = Number(a.removeAll(b));
        break;
      case "T":
        result = Number(a.retainAll(b));
        break;
      case "d":
        result = Number(a.removeAll(a));
        break;
      case "t":
        result = Number(a.retainAll(a));
        break;
      case "F":
        a.sortedInsert(x, status);
        break;
      case "K":
        result = a.indexOf(x, y);
        break;
      case "H": {
        const pointer = a.reserveBlock(x, status),
          buffer = a.getBuffer();
        assert(buffer);
        result = pointer ? (pointer.byteOffset - buffer.byteOffset) / 4 : -999;
        for (let j = 0; pointer && j < x; ++j) pointer[j] = 1000 + j;
        break;
      }
      case "J": {
        const buffer = a.getBuffer();
        assert(buffer);
        result = (a.popFrame(x).byteOffset - buffer.byteOffset) / 4;
        break;
      }
    }
    const row = [
      result,
      status[0],
      a.size(),
      a["capacity"],
      a["maxCapacity"],
      Number(a.isEmpty()),
      a.peeki(),
    ];
    for (let j = 0; j < a.size(); ++j) row.push(a.elementAti(j));
    expect(row).toEqual(native.vectorRows[i]);
  }
});
/** Snapshot the actual dictionary fields, including vector capacity. @param d - Actual cache. @returns Native field ordering. */
function dictionaryState(d: DictionaryCache): number[] {
  const v = d.fBreaks,
    result = [
      d.fPositionInCache,
      d.fStart,
      d.fLimit,
      d.fFirstRuleStatusIndex,
      d.fOtherRuleStatusIndex,
      v["capacity"],
      v.size(),
    ];
  for (let i = 0; i < v.size(); ++i) result.push(v.elementAti(i));
  return result;
}
/** Persisted fingerprints supplement the generator's exact live comparison of every value. @param values - Actual complete state. @returns Native witness head/length/hash. */
function summary(values: number[]): number[] {
  let hash = 2166136261;
  for (const value of values) hash = Math.imul(hash ^ value, 16777619) >>> 0;
  return [...values.slice(0, 10), values.length, hash];
}
/** Native-backed trace segment begins with actual iterator/cache initialization. */
interface Segment {
  name: string;
  start: number;
  end: number;
}
const segments: Segment[] = [];
for (let i = 0; i < native.cacheCommands.length; ++i)
  if ((native.cacheCommands[i] as string).startsWith("s ")) {
    const last = segments[segments.length - 1];
    if (last) last.end = i;
    segments.push({
      name: `${native.cacheCommands[i]} at ${i}`,
      start: i,
      end: native.cacheCommands.length,
    });
  }
it.each(segments)(
  "matches all native cache/owner mutations in $name",
  /** Original cache methods run over native prepared rule/text/dictionary fields. Concrete local engine factories are not substituted. @param segment - Independent native initialization/trace. @returns Nothing. */ (
    segment,
  ) => {
    const bytes = new Uint8Array(Buffer.from(native.binary, "base64")),
      header = new Uint32Array(bytes.buffer, 0, 20),
      fForwardTable = new RBBIStateTable(
        bytes.subarray(header[4] as number, (header[4] as number) + (header[5] as number)),
      ),
      fReverseTable = new RBBIStateTable(
        bytes.subarray(header[6] as number, (header[6] as number) + (header[7] as number)),
      ),
      fTrie = ucptrie_openFromBinary(
        0,
        -1,
        bytes.subarray(header[8] as number, (header[8] as number) + (header[9] as number)),
        header[9] as number,
        null,
        [0],
      );
    assert(fTrie);
    let owner: Owner | undefined,
      cache: BreakCache | undefined,
      status: [number] = [0];
    for (let i = segment.start; i < segment.end; ++i) {
      const [op, ...args] = (native.cacheCommands[i] as string).split(" "),
        [x, y, z] = args.map(Number) as [number, number, UpdatePositionValues];
      let result = -2147483648;
      const outputs = [-2147483648, -2147483648];
      if (op === "s") {
        const row = native.initial.find(
          /** Selects the exact source scenario. @param row - Native initial fields. @returns Match. */ (
            row,
          ) => row[0] === x,
        );
        assert(row);
        const fields = row.slice(1),
          input = native.texts[x] as number[],
          units = new Uint16Array(input.length + 1);
        units.set(input);
        owner = {
          fText: {
            chunkNativeStart: fields[0],
            chunkNativeLimit: fields[1],
            chunkOffset: fields[2],
            chunkLength: fields[3],
            nativeIndexingLimit: fields[4],
            providerProperties: fields[5],
            a: fields[6],
            context: units,
            chunkContents: units,
            pFuncs: {
              access: ucstrTextAccess,
              nativeLength: ucstrTextLength,
              mapOffsetToNative: null,
              mapNativeIndexToUTF16: null,
            },
          },
          fData: { fForwardTable, fReverseTable, fTrie },
          fPosition: fields[7],
          fRuleStatusIndex: fields[8],
          fDone: Boolean(fields[9]),
          fDictionaryCharCount: fields[10],
          fIsPhraseBreaking: Boolean(fields[11]),
          fLookAheadMatches: new Int32Array(fForwardTable.fLookAheadResultsSize).fill(-1),
          handleNext,
          handleSafePrevious,
        } as unknown as Owner;
        status = [0];
        const d = (owner.fDictionaryCache = new DictionaryCache(owner, status)),
          v = d.fBreaks;
        if (x === 2) {
          // These are observed outputs of original native engines, not a replacement engine callback.
          d.fPositionInCache = fields[12] as number;
          d.fStart = fields[13] as number;
          d.fLimit = fields[14] as number;
          d.fFirstRuleStatusIndex = fields[15] as number;
          d.fOtherRuleStatusIndex = fields[16] as number;
          v.ensureCapacity(fields[17] as number, status);
          v.setSize(fields[18] as number);
          const storage = v.getBuffer();
          assert(storage);
          storage.set(fields.slice(19));
          expect(v.size()).toBeGreaterThan(0);
        }
        expect(dictionaryState(d)).toEqual(fields.slice(12));
        cache = new BreakCache(owner, status);
        expect(cache["fBoundaries"]).toHaveLength(128);
        expect(cache["fStatuses"]).toHaveLength(128);
      } else {
        assert(owner);
        assert(cache);
        switch (op) {
          case "r":
            cache.reset(x, y);
            break;
          case "a":
            cache.addFollowing(x, y, z);
            break;
          case "b":
            result = Number(cache.addPreceding(x, y, z));
            break;
          case "c":
            result = cache.current();
            break;
          case "n":
            cache.next();
            break;
          case "p":
            cache.previous(status);
            break;
          case "f":
            cache.following(x, status);
            break;
          case "g":
            cache.preceding(x, status);
            break;
          case "k":
            result = Number(cache.seek(x));
            break;
          case "u":
            result = Number(cache.populateNear(x, status));
            break;
          case "v":
            result = Number(cache.populateFollowing());
            break;
          case "w":
            result = Number(cache.populatePreceding(status));
            break;
          case "e":
            status[0] = x;
            break;
          case "d":
            owner.fDone = Boolean(x);
            break;
          case "h":
            owner.fDictionaryCache.populateDictionary(x, y, 17, 29);
            break;
          case "j": {
            const boundary: [number] = [1234],
              ruleStatus: [number] = [5678];
            result = Number(owner.fDictionaryCache.following(x, boundary, ruleStatus));
            outputs[0] = boundary[0];
            outputs[1] = ruleStatus[0];
            break;
          }
          case "l": {
            const boundary: [number] = [1234],
              ruleStatus: [number] = [5678];
            result = Number(owner.fDictionaryCache.preceding(x, boundary, ruleStatus));
            outputs[0] = boundary[0];
            outputs[1] = ruleStatus[0];
            break;
          }
          case "q":
            owner.fDictionaryCache.reset();
            break;
        }
      }
      assert(cache);
      assert(owner);
      const side = cache["fSideBuffer"],
        ring = ((cache["fEndBufIdx"] - cache["fStartBufIdx"]) & 127) + 1,
        state = [
          result,
          status[0],
          owner.fPosition,
          owner.fRuleStatusIndex,
          Number(owner.fDone),
          owner.fDictionaryCharCount,
          cache["fStartBufIdx"],
          cache["fEndBufIdx"],
          cache["fTextIdx"],
          cache["fBufIdx"],
          side["capacity"],
          side.size(),
        ];
      for (let j = 0; j < side.size(); ++j) state.push(side.elementAti(j));
      state.push(ring);
      for (let j = 0; j < ring; ++j) {
        const at = (cache["fStartBufIdx"] + j) & 127;
        state.push(cache["fBoundaries"][at] as number, cache["fStatuses"][at] as number);
      }
      state.push(...dictionaryState(owner.fDictionaryCache));
      const t = owner.fText;
      state.push(
        t.chunkNativeStart,
        t.chunkNativeLimit,
        t.chunkOffset,
        t.chunkLength,
        t.nativeIndexingLimit,
        t.providerProperties,
        t.a,
        utext_getNativeIndex(t),
        ...outputs,
      );
      expect(summary(state)).toEqual(native.cacheRows[i]);
    }
  },
);
