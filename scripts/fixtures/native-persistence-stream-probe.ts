/** @fileoverview Exercises actual package persistence copy, replacement and closure through native stream wrappers in browser main and Worker realms. */
import { Reference } from "../../apps/office/src/cppu/inc/com/sun/star/uno/Reference";
import {
  Sequence,
  type SequenceElements,
} from "../../apps/office/src/cppu/inc/com/sun/star/uno/Sequence";
import { OStorageHelper } from "../../apps/office/src/comphelper/source/misc/storagehelper";
import { SequenceInputStream } from "../../apps/office/src/comphelper/source/streaming/seqstream";
import { SwitchablePersistenceStream } from "../../apps/office/src/package/source/xstor/switchpersistencestream";
import { SvMemoryStream, StreamMode } from "../../apps/office/src/tools/inc/stream";
import { OStreamWrapper } from "../../apps/office/src/unotools/source/streaming/streamwrap";
import { NotConnectedException } from "../../apps/office/src/cppu/inc/com/sun/star/io/NotConnectedException";

/** Runs source copy/position/open-flag contracts without a replacement storage or private-state patch. @returns Public observations of the actual stream graph. */
export function probeNativePersistenceStream() {
  const owners: { dispose(): void }[] = [],
    streams: SvMemoryStream[] = [];
  /** Retains real UNO/Sequence owners until their borrowers release them. @param value - Actual owner. @returns Same owner. */
  function own<T extends { dispose(): void }>(value: T): T {
    owners.push(value);
    return value;
  }
  /** Keeps borrowed SvStreams alive through all component destruction. @param value - Actual native stream. @returns Same stream. */
  function backing(value: SvMemoryStream): SvMemoryStream {
    streams.push(value);
    return value;
  }
  /** Reads initialized signed-byte cells without changing their source lifetime. @param data - Actual UNO sequence. @returns Unsigned byte observations. */
  function bytes(data: Sequence<number>): number[] {
    const cells = data.getConstArray() as SequenceElements;
    return Array.from(
      { length: data.getLength() },
      /** Projects a real source byte. @param _ - Unused array initializer. @param index - Byte offset. @returns Unsigned source byte. */
      (_, index) => (cells.get(index) as [number])[0] & 255,
    );
  }
  try {
    const Bytes = Sequence.specialize<number>("sal_Int8", 1),
      payload = own(new Bytes(64001)),
      fields = payload.getArray() as SequenceElements;
    for (let index = 0; index < payload.getLength(); ++index)
      (fields.get(index) as [number])[0] = (index << 24) >> 24;
    const original = backing(new SvMemoryStream()),
      originalStream = own(new Reference(new OStreamWrapper(original))),
      wrapper = own(new Reference(new SwitchablePersistenceStream(originalStream, "stream"))),
      component = wrapper.operatorStar(),
      input = own(component.getInputStream()),
      output = own(component.getOutputStream()),
      source = own(new Reference(new SequenceInputStream(payload)));
    OStorageHelper.CopyInputToOutput(source, output);
    output.operatorStar().flush();
    const copiedLength = component.getLength(),
      copy = backing(
        new SvMemoryStream(
          (original.GetData() as Uint8Array).slice(0, Number(copiedLength)),
          Number(copiedLength),
          StreamMode.READWRITE,
        ),
      ),
      replacement = own(new Reference(new OStreamWrapper(copy)));
    component.seek(31999n);
    component.SwitchPersistenceTo(replacement, "stream");
    const switchedPosition = component.getPosition(),
      observed = own(new Bytes());
    output.operatorStar().closeOutput();
    input.operatorStar().readSomeBytes(observed, 4);
    const sequence = bytes(observed),
      raw = new Int8Array(4);
    component.readSomeBytes(raw, raw.length);
    component.seek(copiedLength - 3n);
    input.operatorStar().readBytes(observed, 3);
    const tail = bytes(observed);
    input.operatorStar().closeInput();
    let disconnected = false;
    try {
      component.getLength();
    } catch (error) {
      if (!(error instanceof NotConnectedException)) throw error;
      error.dispose();
      disconnected = true;
    }
    return {
      copiedLength: Number(copiedLength),
      switchedPosition: Number(switchedPosition),
      sequence,
      raw: Array.from(
        raw,
        /** Projects actual signed pointer bytes. @param value - Signed byte. @returns Unsigned byte. */
        (value) => value & 255,
      ),
      tail,
      disconnected,
      originalPosition: Number(original.Tell()),
    };
  } finally {
    for (const owner of owners.reverse()) owner.dispose();
    for (const stream of streams.reverse()) stream.dispose();
  }
}
