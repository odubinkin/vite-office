/** @fileoverview Actual provided-input and readonly descriptor precedence over native Any/map/stream owners in main and DOM-free Worker. URL/UCB opening and complete document operations remain unqualified. */
import { SequenceAsHashMap } from "../../apps/office/src/comphelper/source/misc/sequenceashashmap";
import { MemoryInputStream } from "../../apps/office/src/comphelper/source/streaming/seqstream";
import { Reference } from "../../apps/office/src/cppu/inc/com/sun/star/uno/Reference";
import { XInputStream } from "../../apps/office/src/udkapi/com/sun/star/io/XInputStream";
import {
  addInputStream,
  isStreamReadOnly,
  PROP_INPUTSTREAM,
  PROP_POSTDATA,
  PROP_READONLY,
  PROP_STREAM,
} from "../../apps/office/src/unotools/inc/mediadescriptor";
/** Uses only actual source owners and public operations, without replacing services or a document medium. @returns Source observations match. */
export function probeNativeMediaDescriptor(): boolean {
  const descriptor = new SequenceAsHashMap(),
    stream = new Reference<XInputStream>(new MemoryInputStream(Uint8Array.of(11, 22, 33), 3)),
    empty = new Reference<XInputStream>();
  try {
    stream.operatorStar().skipBytes(1);
    descriptor
      .operatorIndex(PROP_INPUTSTREAM)
      .insert(stream.getAddress(), ["Reference", XInputStream.static_type]);
    if (!addInputStream(descriptor) || stream.operatorStar().available() !== 2) return false;
    const extracted = descriptor.getUnpackedValueOrDefault(PROP_INPUTSTREAM, empty, [
      "Reference",
      XInputStream.static_type,
    ]);
    try {
      if (extracted.get() !== stream.get()) return false;
      descriptor.clear();
      stream.clear();
      if (extracted.operatorStar().available() !== 2) return false;
    } finally {
      extracted.dispose();
    }
    descriptor.operatorIndex(PROP_INPUTSTREAM);
    if (!addInputStream(descriptor)) return false;
    descriptor.clear();
    if (addInputStream(descriptor) || isStreamReadOnly(descriptor)) return false;
    descriptor.operatorIndex(PROP_STREAM);
    if (isStreamReadOnly(descriptor)) return false;
    descriptor.operatorIndex(PROP_POSTDATA);
    if (!isStreamReadOnly(descriptor)) return false;
    descriptor.operatorIndex(PROP_READONLY).insert([false], "bool");
    return !isStreamReadOnly(descriptor);
  } finally {
    empty.dispose();
    stream.dispose();
    descriptor.dispose();
  }
}
