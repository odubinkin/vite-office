/** @fileoverview Original fast temporary-file copy/switch and native browser UUID in Chromium main and DOM-free Worker realms. */
import { Guid } from "../../apps/office/src/tools/inc/Guid";
import { Reference } from "../../apps/office/src/cppu/inc/com/sun/star/uno/Reference";
import {
  Sequence,
  type SequenceElements,
} from "../../apps/office/src/cppu/inc/com/sun/star/uno/Sequence";
import { SequenceInputStream } from "../../apps/office/src/comphelper/source/streaming/seqstream";
import { SwitchablePersistenceStream } from "../../apps/office/src/package/source/xstor/switchpersistencestream";
import { getFileSystem } from "../../apps/office/src/external/emscripten/runtime";
import type { XStream } from "../../apps/office/src/udkapi/com/sun/star/io/XStream";
/** Uses real temporary storage and source kernel copy rather than a successful stream provider. @returns Public result observations. */
export function probeNativeFastTemp() {
  const owners: { dispose(): void }[] = [];
  /** Retains actual owners until all operations finish. @param value - Actual owner. @returns Same owner. */
  function own<T extends { dispose(): void }>(value: T): T {
    owners.push(value);
    return value;
  }
  try {
    const guid = new Guid(Guid.Generate),
      text = own(guid.getString()),
      uuid = String.fromCharCode(...text.getStr().subarray(0, text.getLength())),
      Bytes = Sequence.specialize<number>("sal_Int8", 1),
      payload = own(new Bytes(64001)),
      fields = payload.getArray() as SequenceElements;
    for (let index = 0; index < payload.getLength(); ++index)
      (fields.get(index) as [number])[0] = (index << 24) >> 24;
    const source = own(new Reference(new SequenceInputStream(payload))),
      wrapper = own(new Reference(new SwitchablePersistenceStream(source, "input"))),
      value = wrapper.operatorStar(),
      before = getFileSystem().readdir("/tmp").length;
    own(value.getInputStream());
    value.seek(31999n);
    value.CopyAndSwitchPersistenceTo(own(new Reference<XStream>()));
    const created = getFileSystem().readdir("/tmp").length === before + 1,
      position = Number(value.getPosition()),
      length = Number(value.getLength()),
      data = own(new Bytes());
    value.readBytes(data, 2);
    const observed = data.getConstArray() as SequenceElements,
      first = [(observed.get(0) as [number])[0], (observed.get(1) as [number])[0]],
      output = own(value.getOutputStream()),
      patch = own(new Bytes(1));
    ((patch.getArray() as SequenceElements).get(0) as [number])[0] = 99;
    output.operatorStar().writeBytes(patch);
    value.seek(32001n);
    value.readBytes(data, 1);
    const changed = ((data.getConstArray() as SequenceElements).get(0) as [number])[0];
    value.closeInput();
    value.closeOutput();
    return {
      uuid: /^\{[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}\}$/u.test(uuid),
      created,
      length,
      position,
      first,
      changed,
      removed: getFileSystem().readdir("/tmp").length === before,
      sourcePosition: Number(source.operatorStar().getPosition()),
    };
  } finally {
    for (const owner of owners.reverse()) owner.dispose();
  }
}
