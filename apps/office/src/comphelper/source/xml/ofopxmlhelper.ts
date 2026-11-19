/** @fileoverview OFOPXML stream readers, writers, and native content-type lookup. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import {
  Sequence,
  type SequenceElements,
  type SequenceReference,
} from "../../../cppu/inc/com/sun/star/uno/Sequence";
import type { uno_Sequence } from "../../../cppu/inc/uno/sequence2";
import {
  cppu_detail_getUnoType_StringPair as pairType,
  StringPair as NativeStringPair,
} from "../../../udkapi/com/sun/star/beans/StringPair";
/** Original compiler specializations with initialized StringPair/Sequence field storage. */
const Pairs = Sequence.specialize<NativeStringPair>(pairType, 16);

/** Original initialized native Defaults/Overrides sequence. */
export type ContentTypeSequence = Sequence<Sequence<NativeStringPair>>;

/** Preserves original extension-first, overrides-before-defaults search with actual native string values. @param contentTypes - Native sequence. @param filename - Package path without leading slash. @returns Owned MIME or empty string. */
export function GetContentTypeByName(
  contentTypes: SequenceReference<Sequence<NativeStringPair>>,
  filename: OUStringConstReference,
): OUString {
  if (contentTypes.getLength() < 2) return new OUString();
  const defaults = Sequence.unacquired(
    Pairs,
    (contentTypes.getConstArray() as SequenceElements).get(0) as [uno_Sequence | null],
  );
  const overrides = Sequence.unacquired(
    Pairs,
    (contentTypes.getConstArray() as SequenceElements).get(8) as [uno_Sequence | null],
  );
  const dot = filename.lastIndexOf(46);
  const extension = dot >= 0 ? filename.copy(dot + 1) : new OUString(filename);
  const slash = new OUString(Uint8Array.of(47, 0));
  const path = new OUString(slash);
  path.append(filename);
  const names = [new OUString(extension), path];
  try {
    for (const name of names) {
      for (const row of [overrides, defaults]) {
        for (let i = 0; i < row.getLength(); ++i) {
          const pair = NativeStringPair.unacquired(
            (row.getConstArray() as SequenceElements).get(i * 16) as SequenceElements,
          );
          if (pair.First.equals(name)) return new OUString(pair.Second);
        }
      }
    }
    return new OUString();
  } finally {
    path.dispose();
    names[0]?.dispose();
    slash.dispose();
    extension.dispose();
  }
}

export { ReadContentTypeSequence, ReadRelationsInfoSequence } from "./ofopxmlhelper.handler";
export { WriteContentSequence, WriteRelationsInfoSequence } from "./ofopxmlhelper.write";
