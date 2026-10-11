/** @fileoverview Original sequence.cxx zero-count destruction boundary and native signed32 address adaptation, without a second count or sequence factory. */
import type { uno_Sequence } from "../../inc/uno/sequence2";
import type { typelib_TypeDescriptionReference as R } from "../../inc/typelib/typedescription";
import type { uno_ReleaseFunc } from "../../inc/uno/data";
import { idestroySequence } from "./destr";
import { g_emptySeq, emptySequenceCountAddress } from "./data";
/** Native field-address views retain exactly one signed32 count for each actual sequence record. */
const counts = new WeakMap<uno_Sequence, Int32Array>();
/** Adapts address-of the original count; the static empty count reuses its existing owner. No sequence allocation or lifetime operation is performed. @param sequence - Caller-owned native logical record. @returns Actual live signed32 field address. */
export function sequenceCountAddress(sequence: uno_Sequence): Int32Array {
  if (sequence === g_emptySeq) return emptySequenceCountAddress();
  let count = counts.get(sequence);
  if (count === undefined) {
    count = new Int32Array([sequence.nRefCount]);
    const address = count;
    Object.defineProperty(sequence, "nRefCount", {
      enumerable: true,
      /** Reads the same original count field. @returns Current signed32 value. */
      get(): number {
        return Atomics.load(address, 0);
      },
      /** Writes the same original count field. @param value - Source signed32 value. @returns Nothing. */
      set(value: number): void {
        Atomics.store(address, 0, value);
      },
    });
    counts.set(sequence, count);
  }
  return count;
}
/** Original C boundary destroys an already zero-count sequence. @param sequence - Zero-count record. @param type - Real sequence type. @param release - Caller callback. @returns Nothing. */
export function uno_type_sequence_destroy(
  sequence: uno_Sequence,
  type: R,
  release: uno_ReleaseFunc | null,
): void {
  idestroySequence(sequence, type, null, release);
}
